// Active-city module (pure JS, no React) — mirrors the i18n core so non-React
// code (time.js, venues.js) can read the active city without a hook. The app
// keeps this in sync during render; components re-render via prefs/state.
import { CITIES, DEFAULT_CITY, getCityConfig } from '../data/cities.js'

export { DEFAULT_CITY, getCityConfig }
export const CITY_IDS = Object.keys(CITIES)
// All configs for the picker, alphabetical by display name.
export const CITY_LIST = Object.values(CITIES).sort((a, b) => a.name.localeCompare(b.name))

function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Nearest configured city to a coordinate (haversine to each city center).
export function nearestCity(lat, lng) {
  let best = DEFAULT_CITY
  let bestD = Infinity
  for (const c of Object.values(CITIES)) {
    const d = haversineKm([lat, lng], c.center)
    if (d < bestD) { bestD = d; best = c.id }
  }
  return best
}

// Resolve the nearest city from the browser's geolocation. Resolves null on
// denial / unavailable / timeout (never rejects) so callers stay simple.
export function geolocateCity() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(nearestCity(pos.coords.latitude, pos.coords.longitude)),
      () => resolve(null),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  })
}

// Neighborhoods present in a discovered city's venues — sorted by venue count,
// kept if ≥2 venues. (Seattle uses its curated config list instead.)
export function neighborhoodsFromVenues(venues) {
  const counts = new Map()
  for (const v of venues || []) {
    if (v.neighborhood) counts.set(v.neighborhood, (counts.get(v.neighborhood) || 0) + 1)
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
}

// The neighborhood option list for a city given its loaded venues.
export function cityNeighborhoods(city, venues) {
  return city.neighborhoods && city.neighborhoods.length
    ? city.neighborhoods
    : neighborhoodsFromVenues(venues)
}

// City-level mode = too few usable neighborhoods to bother with a picker.
export function isCityLevel(list) {
  return !list || list.length < 3
}

let currentCityId = DEFAULT_CITY

export function setCurrentCity(id) {
  currentCityId = CITIES[id] ? id : DEFAULT_CITY
}
export function getActiveCity() {
  return getCityConfig(currentCityId)
}
export function getCity(id) {
  return getCityConfig(id)
}

// Which city to show: a saved valid preference wins; otherwise the default.
// P3 adds geolocation → nearest curated city here.
export function detectCity(prefs) {
  return prefs && CITIES[prefs.city] ? prefs.city : DEFAULT_CITY
}
