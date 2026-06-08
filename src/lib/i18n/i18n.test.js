import { describe, it, expect } from 'vitest'
import { translate, detectLang, stageLabel } from './index.js'
import { formatKickoff, formatDay, formatClock } from '../time.js'

const ISO = '2026-06-15T15:00:00-07:00' // Mon Jun 15, 3:00 PM PT

describe('translate', () => {
  it('returns the string for a known key per language', () => {
    expect(translate('en', 'matches.title')).toBe('World Cup 2026 matches')
    expect(translate('es', 'matches.title')).toBe('Partidos del Mundial 2026')
  })
  it('interpolates {vars}', () => {
    expect(translate('en', 'matches.count', { n: 5 })).toBe('5 matches')
    expect(translate('es', 'matches.count', { n: 5 })).toBe('5 partidos')
  })
  it('falls back to English for an unknown language', () => {
    expect(translate('xx', 'matches.title')).toBe('World Cup 2026 matches')
  })
  it('returns the raw key when missing entirely', () => {
    expect(translate('en', 'nope.missing')).toBe('nope.missing')
  })
})

describe('detectLang', () => {
  it('prefers a saved language', () => {
    expect(detectLang({ language: 'es' }, 'en-US')).toBe('es')
    expect(detectLang({ language: 'en' }, 'es-ES')).toBe('en')
  })
  it('auto-detects Spanish browsers when no preference', () => {
    expect(detectLang({ language: null }, 'es-ES')).toBe('es')
    expect(detectLang({}, 'es-419')).toBe('es')
  })
  it('defaults to English', () => {
    expect(detectLang({}, 'en-US')).toBe('en')
    expect(detectLang({}, '')).toBe('en')
  })
})

describe('stageLabel', () => {
  it('translates knockout stages', () => {
    expect(stageLabel('Round of 16', 'es')).toBe('Octavos')
    expect(stageLabel('Final', 'es')).toBe('Final')
    expect(stageLabel('Group', 'en')).toBe('Group')
  })
  it('falls back to the raw stage when unknown', () => {
    expect(stageLabel('Mystery round', 'es')).toBe('Mystery round')
  })
})

describe('locale-aware date/time (12-hour both)', () => {
  it('English keeps month-day order and AM/PM', () => {
    expect(formatKickoff(ISO, 'en')).toBe('Jun 15, 3:00 PM PT')
    expect(formatDay(ISO, 'en')).toBe('Mon Jun 15')
    expect(formatClock(ISO, 'en')).toBe('3:00 PM')
  })
  it('Spanish uses day-month order, translated names, and "p. m."', () => {
    expect(formatKickoff(ISO, 'es')).toBe('15 jun, 3:00 p. m. PT')
    expect(formatDay(ISO, 'es')).toBe('lun 15 jun')
    expect(formatClock(ISO, 'es')).toBe('3:00 p. m.')
  })
})
