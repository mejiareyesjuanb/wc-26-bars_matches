// Google Places API (New) client. Searches for Seattle venues to watch matches.
// Requires a server-side API key; never exposed to the browser.

const SEATTLE = { latitude: 47.6062, longitude: -122.3321 }

const QUERIES = [
  'sports bars in Seattle',
  'pubs showing soccer in Seattle',
  'breweries with TVs in Seattle',
  'World Cup viewing party bars Seattle',
  'restaurants showing football matches Seattle',
  'beer halls in Seattle',
]

const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.location',
  'places.rating', 'places.userRatingCount', 'places.priceLevel', 'places.types',
  'places.primaryType', 'places.reservable', 'places.editorialSummary',
  'places.businessStatus',
].join(',')

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
  }
}

async function searchText(query, apiKey) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: query,
      locationBias: { circle: { center: SEATTLE, radius: 14000 } },
      maxResultCount: 20,
    }),
  })
  if (!res.ok) {
    throw new Error(`Places ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  return (data.places || []).map(normalizePlace)
}

export async function fetchSeattleVenues(apiKey) {
  const byId = new Map()
  for (const q of QUERIES) {
    try {
      for (const place of await searchText(q, apiKey)) {
        if (place.id && !byId.has(place.id)) byId.set(place.id, place)
      }
    } catch (e) {
      console.error('[places] query failed:', q, '-', e.message)
    }
  }
  return [...byId.values()].filter(
    (p) => p.lat != null && p.businessStatus !== 'CLOSED_PERMANENTLY',
  )
}
