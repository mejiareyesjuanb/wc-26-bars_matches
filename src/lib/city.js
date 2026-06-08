// Active-city module (pure JS, no React) — mirrors the i18n core so non-React
// code (time.js, venues.js) can read the active city without a hook. The app
// keeps this in sync during render; components re-render via prefs/state.
import { CITIES, DEFAULT_CITY, getCityConfig } from '../data/cities.js'
import { isCoreVenue } from './scoring.js'

export { DEFAULT_CITY, getCityConfig }
export const CITY_IDS = Object.keys(CITIES)
// Visible (non-hidden) configs for the picker, alphabetical by display name.
export const CITY_LIST = Object.values(CITIES)
  .filter((c) => !c.hidden)
  .sort((a, b) => a.name.localeCompare(b.name))

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

// Nearest visible city to a coordinate (haversine to each city center).
export function nearestCity(lat, lng) {
  let best = DEFAULT_CITY
  let bestD = Infinity
  for (const c of Object.values(CITIES)) {
    if (c.hidden) continue
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

// Count "core" (always-shown, check-independent) venues per neighborhood. A
// neighborhood is worth showing only if it actually has bars in the list.
function coreCountsByNeighborhood(venues) {
  const counts = new Map()
  for (const v of venues || []) {
    if (v.neighborhood && isCoreVenue(v)) counts.set(v.neighborhood, (counts.get(v.neighborhood) || 0) + 1)
  }
  return counts
}

// Neighborhoods present in a discovered city's venues that have ≥1 core (always-shown)
// bar, sorted by core-bar count. (Seattle uses its curated config list instead.)
export function neighborhoodsFromVenues(venues) {
  return [...coreCountsByNeighborhood(venues).entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
}

// The neighborhood option list for a city given its loaded venues. Curated cities
// keep their config order but drop neighborhoods with no core bars; discovered cities
// derive the list from venues. Before venues load, fall back to the full config list
// so the picker is never momentarily empty.
export function cityNeighborhoods(city, venues) {
  if (city.neighborhoods && city.neighborhoods.length) {
    if (!venues) return city.neighborhoods
    const counts = coreCountsByNeighborhood(venues)
    return city.neighborhoods.filter((n) => counts.get(n) > 0)
  }
  return neighborhoodsFromVenues(venues)
}

// City-level mode = too few usable neighborhoods to bother with a picker.
export function isCityLevel(list) {
  return !list || list.length < 3
}

// --- Two-level (borough → neighborhood) cities, e.g. New York ---

// Boroughs that have ≥1 core (always-shown) bar, sorted by count.
export function boroughsFromVenues(venues) {
  const counts = new Map()
  for (const v of venues || []) {
    if (v.borough && isCoreVenue(v)) counts.set(v.borough, (counts.get(v.borough) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
}

// Fine neighborhoods within a borough that have ≥1 core bar (excludes the borough
// itself, i.e. venues that had no finer area).
export function neighborhoodsInBorough(venues, borough) {
  const counts = new Map()
  for (const v of venues || []) {
    if (v.borough === borough && v.neighborhood && v.neighborhood !== borough && isCoreVenue(v)) {
      counts.set(v.neighborhood, (counts.get(v.neighborhood) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)
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

// Which city to show: a saved, valid, non-hidden preference wins; otherwise the
// default (so a now-hidden saved city falls back instead of rendering).
export function detectCity(prefs) {
  const saved = prefs && prefs.city && CITIES[prefs.city]
  return saved && !saved.hidden ? prefs.city : DEFAULT_CITY
}
