// Pure-JS i18n core (no React/JSX) so it's safe to import from server-side
// modules (e.g. calendar.js, imported by the Express server in production).
// The React provider/hook lives in ./react.jsx.
import en from './en.js'
import es from './es.js'

export const DICTS = { en, es }
export const LANGS = ['en', 'es']

// Module-level active language, so non-React code (calendar.js, stakes.js,
// time.js) can translate without the React hook. The provider keeps this in
// sync with the UI language; components re-render via context.
let currentLang = 'en'
export function setCurrentLang(lang) {
  currentLang = LANGS.includes(lang) ? lang : 'en'
}
export function getCurrentLang() {
  return currentLang
}

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), dict)
}

function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))
}

// Translate a dotted key with {var} interpolation. Falls back to English, then
// to the raw key, so a missing string is visible rather than crashing.
export function translate(lang, key, vars) {
  const dict = DICTS[lang] || DICTS.en
  let val = lookup(dict, key)
  if (val == null) val = lookup(DICTS.en, key)
  if (typeof val !== 'string') return key
  return interpolate(val, vars)
}

// t() using the active module language — for non-React callers (and a default).
export function t(key, vars) {
  return translate(currentLang, key, vars)
}

// Knockout/group stage label (the stage strings carry spaces/dashes, so they
// live in a flat `stages` map rather than dotted keys).
export function stageLabel(stage, lang = currentLang) {
  const dict = DICTS[lang] || DICTS.en
  return (dict.stages && dict.stages[stage]) || (DICTS.en.stages && DICTS.en.stages[stage]) || stage
}

// Initial language: a saved preference wins; otherwise auto-detect Spanish
// browsers; default English.
export function detectLang(prefs, navLang) {
  if (prefs && LANGS.includes(prefs.language)) return prefs.language
  const nav = navLang ?? (typeof navigator !== 'undefined' ? navigator.language : '')
  return nav && nav.toLowerCase().startsWith('es') ? 'es' : 'en'
}
