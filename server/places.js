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
  'places.addressComponents', 'places.addressDescriptor',
].join(',')

// Extract area names from Google address components. `sublocality` is the broad
// area (a NYC borough; a district elsewhere); `fineArea` is the finer
// neighborhood (e.g. SoHo, Williamsburg) when Google provides one.
function componentText(components, ...types) {
  if (!Array.isArray(components)) return null
  for (const t of types) {
    const c = components.find((x) => (x.types || []).includes(t))
    if (c) return c.longText || c.shortText || null
  }
  return null
}

// Some cities (e.g. Manhattan) carry no `neighborhood` address component — the
// fine neighborhood lives in addressDescriptor.areas instead. Pick the first
// area the venue is WITHIN (most specific first) that isn't the broad sublocality
// itself; fall back to the first listed area. Pure — unit tested.
export function descriptorArea(addressDescriptor, sublocality) {
  const areas = addressDescriptor?.areas || []
  if (!areas.length) return null
  const name = (a) => a?.displayName?.text || null
  const within = areas.filter((a) => a.containment === 'WITHIN')
  const pick = within.find((a) => name(a) && name(a) !== sublocality) || within[0] || areas[0]
  return name(pick)
}

function normalizePlace(p) {
  const sublocality = componentText(p.addressComponents, 'sublocality', 'sublocality_level_1')
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
    sublocality,
    fineArea: componentText(p.addressComponents, 'neighborhood'),
    descriptorArea: descriptorArea(p.addressDescriptor, sublocality),
    state: componentText(p.addressComponents, 'administrative_area_level_1'),
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

async function googlePlacesRaw(endpoint, body, apiKey, fieldMask = FIELD_MASK) {
  const res = await fetch(`https://places.googleapis.com/v1/places:${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places ${endpoint} ${res.status}: ${await res.text()}`)
  return res.json()
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Text search, optionally across multiple pages (Places New returns up to 20 per
// page, 60 max). `sportsBar` tags results (so they qualify as sports bars).
async function searchText(query, apiKey, center, { sportsBar = false, pages = 1 } = {}) {
  const out = []
  let pageToken
  for (let i = 0; i < pages; i++) {
    const body = { textQuery: query, locationBias: { circle: { center, radius: 16000 } }, maxResultCount: 20 }
    if (pageToken) body.pageToken = pageToken
    // nextPageToken is valid for searchText only (not searchNearby).
    const data = await googlePlacesRaw('searchText', body, apiKey, FIELD_MASK + ',nextPageToken')
    for (const p of data.places || []) out.push(normalizePlace(p))
    pageToken = data.nextPageToken
    if (!pageToken) break
    await sleep(1600) // pageToken needs a moment to become valid
  }
  return sportsBar ? out.map((p) => ({ ...p, sportsBarMatch: true })) : out
}

async function searchNearby(center, radius, apiKey) {
  const data = await googlePlacesRaw('searchNearby', {
    includedTypes: BAR_TYPES,
    maxResultCount: 20,
    rankPreference: 'POPULARITY', // most popular bars in the circle (vs nearest 20)
    locationRestriction: {
      circle: { center: { latitude: center[0], longitude: center[1] }, radius },
    },
  }, apiKey)
  return (data.places || []).map(normalizePlace)
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
  // Tiles: Seattle's curated centroids → an explicit per-city tile set (e.g. NYC's
  // 5 boroughs) → else a generic grid around the center.
  const tiles = curated ? Object.values(city.centroids) : city.tiles || gridTiles(city.center)
  const tileRadius = curated ? 2000 : 4000

  // Google's own "sports bars in …" answer — catches sports bars typed as a
  // generic bar/pub/grill. Per-neighborhood for curated cities; city-wide otherwise.
  const sportsBarQueries = curated
    ? city.neighborhoods.map((n) => `sports bars in ${n}, ${city.nearbyRegion}`)
    : [`sports bars in ${city.name}`]
  // Broad per-neighborhood recall (catches edge bars the 20-cap nearby misses,
  // e.g. The Dray). Paginated to ~40 results. Curated cities only.
  const barQueries = curated ? city.neighborhoods.map((n) => `bars in ${n}, ${city.nearbyRegion}`) : []

  const batches = await Promise.all([
    // Geographic coverage: most popular bars near each tile.
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
    ...barQueries.map((q) =>
      searchText(q, apiKey, center, { pages: 2 }).catch((e) => {
        console.error('[places] bars query failed:', q, '-', e.message)
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
    (p) =>
      p.lat != null &&
      p.businessStatus !== 'CLOSED_PERMANENTLY' &&
      // Drop out-of-state venues (e.g. Jersey City leaking into the NYC tiles).
      (!city.stateFilter || !p.state || p.state === city.stateFilter),
  )
}
