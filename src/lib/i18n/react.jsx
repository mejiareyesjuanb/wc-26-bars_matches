import { createContext, useContext, useMemo } from 'react'
import { translate, setCurrentLang, stageLabel } from './index.js'

const I18nContext = createContext(null)

// Provider owns nothing persistent — App passes the current `lang` (from prefs)
// and a `setLang` that persists it. We sync the module-level language during
// render so non-React helpers (time.js, calendar.js, stakes.js) translate in the
// active language on this same render.
export function I18nProvider({ lang, setLang, children }) {
  setCurrentLang(lang)
  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      stage: (s) => stageLabel(s, lang),
    }),
    [lang, setLang],
  )
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>')
  return ctx
}
