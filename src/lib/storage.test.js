import { describe, it, expect, beforeEach } from 'vitest'
import { loadPrefs, savePrefs, DEFAULT_PREFS } from './storage.js'

beforeEach(() => localStorage.clear())

describe('prefs storage', () => {
  it('returns defaults when nothing stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
  it('round-trips saved prefs', () => {
    const p = { ...DEFAULT_PREFS, neighborhoods: ['Ballard'], atmosphere: 'lively' }
    savePrefs(p)
    expect(loadPrefs()).toEqual(p)
  })
  it('survives corrupt storage by returning defaults', () => {
    localStorage.setItem('wc26_prefs', '{not json')
    expect(loadPrefs()).toEqual(DEFAULT_PREFS)
  })
})
