import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, WEIGHTS } from './scoring.js'

const baseBar = {
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'pub',
  rating: 4.0, reviewCount: 500, screens: 4, confirmedViewing: true,
  bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
  takesReservations: true, fanAffinity: [], atmosphereTags: ['lively'],
  priceLevel: 2, address: '', blurb: '',
}
const match = { id: 'M1', stage: 'Group', homeTeam: 'USA', awayTeam: 'MEX' }
const prefs = {
  neighborhoods: ['Ballard'], venueTypes: ['pub'], wantsReservations: true,
  wantsBigScreen: true, atmosphere: 'lively',
}

describe('scoreBar', () => {
  it('returns a 0..100 score and reasons array', () => {
    const r = scoreBar(baseBar, match, prefs)
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(r.reasons)).toBe(true)
  })

  it('rewards a neighborhood match', () => {
    const inHood = scoreBar(baseBar, match, prefs).score
    const outHood = scoreBar({ ...baseBar, neighborhood: 'Georgetown' }, match, prefs).score
    expect(inHood).toBeGreaterThan(outHood)
  })

  it('rewards fan affinity to a team in this match', () => {
    const affine = scoreBar({ ...baseBar, fanAffinity: ['MEX'] }, match, prefs).score
    const none = scoreBar({ ...baseBar, fanAffinity: ['JPN'] }, match, prefs).score
    expect(affine).toBeGreaterThan(none)
  })

  it('is monotonic in screen count (more screens never scores lower)', () => {
    const few = scoreBar({ ...baseBar, screens: 2 }, match, prefs).score
    const many = scoreBar({ ...baseBar, screens: 12 }, match, prefs).score
    expect(many).toBeGreaterThanOrEqual(few)
  })

  it('is monotonic in rating', () => {
    const lo = scoreBar({ ...baseBar, rating: 3.0 }, match, prefs).score
    const hi = scoreBar({ ...baseBar, rating: 5.0 }, match, prefs).score
    expect(hi).toBeGreaterThanOrEqual(lo)
  })

  it('produces a neighborhood reason chip when matched', () => {
    const r = scoreBar(baseBar, match, prefs)
    expect(r.reasons.some((x) => x.includes('Ballard'))).toBe(true)
  })

  it('weights sum to 100', () => {
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
    expect(total).toBe(100)
  })
})

describe('rankBars', () => {
  it('sorts best-first and assigns rank starting at 1', () => {
    const bars = [
      { ...baseBar, id: 'low', neighborhood: 'Georgetown', fanAffinity: [], rating: 3.0 },
      { ...baseBar, id: 'high', neighborhood: 'Ballard', fanAffinity: ['MEX'], rating: 5.0 },
    ]
    const ranked = rankBars(bars, match, prefs)
    expect(ranked[0].id).toBe('high')
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].rank).toBe(2)
  })

  it('breaks ties by rating then reviewCount', () => {
    const a = { ...baseBar, id: 'a', rating: 4.0, reviewCount: 100 }
    const b = { ...baseBar, id: 'b', rating: 4.0, reviewCount: 900 }
    const ranked = rankBars([a, b], match, { neighborhoods: [], venueTypes: [], wantsReservations: false, wantsBigScreen: false, atmosphere: null })
    expect(ranked[0].id).toBe('b')
  })
})
