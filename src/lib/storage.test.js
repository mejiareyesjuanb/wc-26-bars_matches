import { describe, it, expect, beforeEach } from 'vitest'
import { loadPrefs, savePrefs, DEFAULT_PREFS } from './storage.js'

beforeEach(() => localStorage.clear())

describe('prefs storage', () => {
  it('returns defaults when nothing stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
  it('round-trips per-city neighborhood prefs', () => {
    const p = { language: 'es', city: 'new-york', neighborhoodsByCity: { 'new-york': ['SoHo'] } }
    savePrefs(p)
    expect(loadPrefs()).toEqual(p)
  })
  it('migrates the legacy single neighborhoods list to Seattle', () => {
    savePrefs({ language: 'en', neighborhoods: ['Ballard', 'Fremont'] })
    const loaded = loadPrefs()
    expect(loaded.neighborhoodsByCity).toEqual({ seattle: ['Ballard', 'Fremont'] })
    expect(loaded.neighborhoods).toBeUndefined()
  })
  it('survives corrupt storage by returning defaults', () => {
    localStorage.setItem('wc26_prefs', '{not json')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
})
