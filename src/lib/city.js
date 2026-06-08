// Active-city module (pure JS, no React) — mirrors the i18n core so non-React
// code (time.js, venues.js) can read the active city without a hook. The app
// keeps this in sync during render; components re-render via prefs/state.
import { CITIES, DEFAULT_CITY, getCityConfig } from '../data/cities.js'

export { DEFAULT_CITY, getCityConfig }
export const CITY_IDS = Object.keys(CITIES)

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
