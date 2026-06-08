const KEY = 'wc26_prefs'

export const DEFAULT_PREFS = {
  language: null, // null = auto-detect (Spanish browser → es, else en); set on toggle
  city: null, // null = default city (Seattle today); set via geolocation/picker
  neighborhoodsByCity: {}, // { [cityId]: string[] } — selections kept per city
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    const parsed = JSON.parse(raw)
    const prefs = { ...DEFAULT_PREFS, ...parsed, neighborhoodsByCity: { ...(parsed.neighborhoodsByCity || {}) } }
    // Migrate the legacy single neighborhoods list (Seattle) → per-city map.
    if (Array.isArray(parsed.neighborhoods) && parsed.neighborhoods.length && prefs.neighborhoodsByCity.seattle === undefined) {
      prefs.neighborhoodsByCity.seattle = parsed.neighborhoods
    }
    delete prefs.neighborhoods
    return prefs
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
