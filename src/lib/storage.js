const KEY = 'wc26_prefs'

// Preferences are now just the user's preferred neighborhoods (in priority
// order). Older fields (venue type, atmosphere, etc.) are no longer used.
export const DEFAULT_PREFS = {
  neighborhoods: [],
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
