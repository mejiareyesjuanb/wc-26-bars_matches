// Google Places API (New) client. Finds Seattle venues to watch matches.
// Requires a server-side API key; never exposed to the browser.
//
// Coverage strategy: a single city-wide Text Search is capped at 20 results and
// biased to the city center, so it under-samples neighborhoods (Ballard, West
// Seattle, …). Instead we TILE `searchNearby` across each neighborhood centroid,
// selecting by bar `includedTypes` — this gives geographic coverage and uses the
// venue categorization directly. A few Text Searches are added on top to catch
// prominent / explicitly "World Cup viewing" spots. Results are deduped by id.

// Bar-focused place types. Deliberately excludes the broad `restaurant` type,
// which floods each tile with non-sports restaurants and pushes pubs past the
// 20-result cap. Sports-showing restaurants (e.g. Kangaroo & Kiwi, an
// "australian_restaurant") still appear because Google also tags them bar/pub/
// sports_bar.
const BAR_TYPES = ['sports_bar', 'pub', 'bar', 'brewery', 'bar_and_grill']

const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.location',
  'places.rating', 'places.userRatingCount', 'places.priceLevel', 'places.types',
  'places.primaryType', 'places.reservable', 'places.editorialSummary',
  'places.businessStatus', 'places.websiteUri', 'places.googleMapsUri',
  'places.addressComponents',
].join(',')

// Derive a neighborhood name from Google address components (sublocality →
// neighborhood). Used for cities without curated centroids.
function neighborhoodFromComponents(components) {
  if (!Array.isArray(components)) return null
  const byType = (t) => components.find((c) => (c.types || []).includes(t))
  const c = byType('sublocality') || byType('sublocality_level_1') || byType('neighborhood')
  return c ? c.longText || c.shortText || null : null
}

function normalizePlace(p) {
  return {
    id: p.id,
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    lat: p.location?.latitude,
    lng: p.location?.longitude,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    priceLevel: p.priceLevel,
    types: p.types || [],
    primaryType: p.primaryType,
    reservable: p.reservable,
    blurb: p.editorialSummary?.text,
    businessStatus: p.businessStatus,
    website: p.websiteUri,
    googleMapsUri: p.googleMapsUri,
    neighborhood: neighborhoodFromComponents(p.addressComponents),
  }
}

// A 3×3 grid of tile centers around a city center — geographic coverage for
// cities without curated neighborhood centroids (beats the 20-result cap and
// downtown bias of a single city-wide search).
function gridTiles([lat, lng]) {
  const dLat = 0.05
  const dLng = 0.06
  const out = []
  for (const i of [-1, 0, 1]) for (const j of [-1, 0, 1]) out.push([lat + i * dLat, lng + j * dLng])
  return out
}

async function googlePlaces(endpoint, body, apiKey) {
  const res = await fetch(`https://places.googleapis.com/v1/places:${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places ${endpoint} ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return (data.places || []).map(normalizePlace)
}

async function searchText(query, apiKey, center, { sportsBar = false } = {}) {
  const places = await googlePlaces('searchText', {
    textQuery: query,
    locationBias: { circle: { center, radius: 14000 } },
    maxResultCount: 20,
  }, apiKey)
  // Tag venues that Google itself returns for a "sports bars in …" query, even
  // when their primaryType is a generic bar/pub/grill.
  return sportsBar ? places.map((p) => ({ ...p, sportsBarMatch: true })) : places
}

function searchNearby(center, radius, apiKey) {
  return googlePlaces('searchNearby', {
    includedTypes: BAR_TYPES,
    maxResultCount: 20,
    rankPreference: 'DISTANCE',
    locationRestriction: {
      circle: { center: { latitude: center[0], longitude: center[1] }, radius },
    },
  }, apiKey)
}

// Dedupe a list of normalized places by id (pure — unit tested). Merges the
// sportsBarMatch flag so a venue keeps it if ANY source query flagged it.
export function dedupeById(places) {
  const byId = new Map()
  for (const p of places) {
    if (!p.id) continue
    const existing = byId.get(p.id)
    if (existing) {
      if (p.sportsBarMatch) existing.sportsBarMatch = true
    } else {
      byId.set(p.id, { ...p })
    }
  }
  return [...byId.values()]
}

// Discover venues for a city config. Seattle (curated centroids) reproduces the
// previous Seattle-only queries exactly (parity). Other cities tile a grid around
// the center and discover neighborhoods from each venue's sublocality.
export async function fetchCityVenues(city, apiKey) {
  const center = { latitude: city.center[0], longitude: city.center[1] }
  const curated = !!city.centroids
  const tiles = curated ? Object.values(city.centroids) : gridTiles(city.center)
  const tileRadius = curated ? 2000 : 4000

  // Google's own "sports bars in …" answer — catches sports bars typed as a
  // generic bar/pub/grill. Per-neighborhood for Seattle; city-wide otherwise.
  const sportsBarQueries = curated
    ? city.neighborhoods.map((n) => `sports bars in ${n}, ${city.nearbyRegion}`)
    : [`sports bars in ${city.name}`]

  const batches = await Promise.all([
    // Geographic coverage: nearest bars to each tile.
    ...tiles.map((c) =>
      searchNearby(c, tileRadius, apiKey).catch((e) => {
        console.error('[places] nearby failed:', e.message)
        return []
      }),
    ),
    ...sportsBarQueries.map((q) =>
      searchText(q, apiKey, center, { sportsBar: true }).catch((e) => {
        console.error('[places] sports-bar query failed:', q, '-', e.message)
        return []
      }),
    ),
    // Prominence + explicit viewing-experience discovery.
    ...city.textQueries.map((q) =>
      searchText(q, apiKey, center).catch((e) => {
        console.error('[places] text query failed:', q, '-', e.message)
        return []
      }),
    ),
  ])

  return dedupeById(batches.flat()).filter(
    (p) => p.lat != null && p.businessStatus !== 'CLOSED_PERMANENTLY',
  )
}
