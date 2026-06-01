const KEY = 'wc26_prefs'

export const DEFAULT_PREFS = {
  city: 'Seattle',
  neighborhoods: [],
  venueTypes: [],
  wantsReservations: false,
  wantsBigScreen: false,
  atmosphere: null,
  onboarded: false,
}

export function loadPrefs() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePrefs(prefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs))
}
