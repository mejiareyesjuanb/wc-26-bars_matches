// Shared geo helpers — used by the server (to place live Google venues) and by
// the client-side fallback (to place bundled curated venues on the map). Geo
// data now lives in cities.js; these helpers default to the default city
// (Seattle) and accept a city/centroids override for multi-city use.
import { getCityConfig, DEFAULT_CITY } from './cities.js'

const defaultCity = () => getCityConfig(DEFAULT_CITY)

// Back-compat export (= the default city's centroids).
export const NEIGHBORHOOD_CENTROIDS = defaultCity().centroids

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Nearest neighborhood centroid. `maxKm` (optional) drops venues that aren't
// actually near any centroid (a far city-wide-query result) → returns null.
export function nearestNeighborhood(lat, lng, centroids = NEIGHBORHOOD_CENTROIDS, maxKm = Infinity) {
  let best = null
  let bestD = Infinity
  let bestCoord = null
  for (const [name, [clat, clng]] of Object.entries(centroids)) {
    const d = (lat - clat) ** 2 + (lng - clng) ** 2
    if (d < bestD) {
      bestD = d
      best = name
      bestCoord = [clat, clng]
    }
  }
  if (best && maxKm !== Infinity && haversineKm(lat, lng, bestCoord[0], bestCoord[1]) > maxKm) {
    return null
  }
  return best
}

export function gmapsSearch(name, address, region = defaultCity().mapsRegion) {
  const q = encodeURIComponent([name, address, region].filter(Boolean).join(' '))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

// Give curated venues approximate map positions (neighborhood centroid plus a
// deterministic offset so they don't all stack) and a Google Maps link.
export function decorateCurated(bars, city = defaultCity()) {
  const centroids = city.centroids
  const [dlat, dlng] = city.center
  return bars.map((b, i) => {
    const [clat, clng] = centroids[b.neighborhood] || [dlat, dlng]
    return {
      ...b,
      placeId: b.placeId ?? null,
      lat: b.lat ?? clat + (((i % 5) - 2) * 0.004),
      lng: b.lng ?? clng + ((((i * 7) % 5) - 2) * 0.004),
      website: b.website,
      googleMapsUri: b.googleMapsUri || gmapsSearch(b.name, b.address, city.mapsRegion),
    }
  })
}
