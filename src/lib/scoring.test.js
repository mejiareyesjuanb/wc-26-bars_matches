import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, WEIGHTS } from './scoring.js'

const baseBar = {
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'pub',
  rating: 4.0, reviewCount: 500, screens: 4, confirmedViewing: true,
  bigScreenOrProjector: true, soundOnForMatches: true, capacity: 'medium',
  takesReservations: true, fanAffinity: [], atmosphereTags: ['lively'],
  priceLevel: 2, address: '', blurb: '',
}
const match = { id: 'M1', stage: 'Group', homeTeam: 'USA', awayTeam: 'MEX', venueCity: 'Dallas' }
const prefs = { neighborhoods: ['Ballard'] }

describe('scoreBar', () => {
  it('returns a 0..100 score, reasons, and breakdown', () => {
    const r = scoreBar(baseBar, match, prefs)
    expect(r.score).toBeGreaterThan(0)
    expect(r.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(r.reasons)).toBe(true)
    expect(Array.isArray(r.breakdown)).toBe(true)
  })

  it('weights sum to 100', () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100)
  })

  it('makes World Cup the single largest weight', () => {
    const max = Math.max(...Object.values(WEIGHTS))
    expect(WEIGHTS.worldCup).toBe(max)
  })

  it('rewards a neighborhood match', () => {
    const inHood = scoreBar(baseBar, match, prefs).score
    const outHood = scoreBar({ ...baseBar, neighborhood: 'Georgetown' }, match, prefs).score
    expect(inHood).toBeGreaterThan(outHood)
  })

  it('is monotonic in screen count', () => {
    const few = scoreBar({ ...baseBar, screens: 2 }, match, prefs).score
    const many = scoreBar({ ...baseBar, screens: 10 }, match, prefs).score
    expect(many).toBeGreaterThanOrEqual(few)
  })

  it('is monotonic in rating', () => {
    const lo = scoreBar({ ...baseBar, rating: 3.0 }, match, prefs).score
    const hi = scoreBar({ ...baseBar, rating: 5.0 }, match, prefs).score
    expect(hi).toBeGreaterThanOrEqual(lo)
  })

  it('website-confirmed World Cup is the biggest booster', () => {
    const plain = { ...baseBar, confirmedViewing: false }
    const unconfirmed = scoreBar(plain, match, prefs).score
    const confirmed = scoreBar(plain, match, prefs, { worldCup: true, screens: true }).score
    expect(confirmed).toBeGreaterThan(unconfirmed)
    // The boost should be large (≈ the worldCup weight), dwarfing other factors.
    expect(confirmed - unconfirmed).toBeGreaterThanOrEqual(25)
  })

  it('treats a sports bar as having screens + likely World Cup, even unscraped', () => {
    const generic = { ...baseBar, type: 'restaurant', name: 'Generic Eatery', confirmedViewing: false }
    const sportsBar = { ...generic, type: 'sports bar', name: 'Slim Goody Sports Bar' }
    expect(scoreBar(sportsBar, match, prefs).score)
      .toBeGreaterThan(scoreBar(generic, match, prefs).score)
  })

  it('produces a neighborhood reason chip when matched', () => {
    expect(scoreBar(baseBar, match, prefs).reasons.some((x) => x.includes('Ballard'))).toBe(true)
  })

  it('adds a confirmed-World-Cup reason chip from the website check', () => {
    const r = scoreBar(baseBar, match, prefs, { worldCup: true })
    expect(r.reasons).toContain('Confirmed: showing the World Cup')
  })

  it('breakdown has four factors and roughly sums to the score', () => {
    const { score, breakdown } = scoreBar(baseBar, match, prefs)
    expect(breakdown.length).toBe(4)
    const sum = breakdown.reduce((a, r) => a + r.points, 0)
    expect(Math.abs(sum - score)).toBeLessThanOrEqual(4)
  })
})

describe('stadium-proximity ambiance bonus', () => {
  const seattleMatch = { ...match, venueCity: 'Seattle' }
  const awayMatch = { ...match, venueCity: 'Los Angeles' }

  it('boosts a near-stadium bar only when the match is played in Seattle', () => {
    const pioneer = { ...baseBar, neighborhood: 'Pioneer Square' }
    expect(scoreBar(pioneer, seattleMatch, prefs).score)
      .toBeGreaterThan(scoreBar(pioneer, awayMatch, prefs).score)
  })

  it('caps the bonus at 10 points', () => {
    const pioneer = { ...baseBar, neighborhood: 'Pioneer Square', rating: 3.2, reviewCount: 50, confirmedViewing: false }
    const inSeattle = scoreBar(pioneer, seattleMatch, prefs).score
    const elsewhere = scoreBar(pioneer, awayMatch, prefs).score
    expect(inSeattle - elsewhere).toBeLessThanOrEqual(10)
  })

  it('gives no bonus to bars far from the stadium', () => {
    const ballard = { ...baseBar, neighborhood: 'Ballard' }
    expect(scoreBar(ballard, seattleMatch, prefs).score)
      .toBe(scoreBar(ballard, awayMatch, prefs).score)
  })

  it('adds a stadium row to the breakdown for Seattle matches', () => {
    const pioneer = { ...baseBar, neighborhood: 'Pioneer Square' }
    expect(scoreBar(pioneer, seattleMatch, prefs).breakdown.some((r) => r.key === 'stadium')).toBe(true)
  })
})

describe('rankBars', () => {
  it('sorts best-first and assigns rank starting at 1', () => {
    const bars = [
      { ...baseBar, id: 'low', neighborhood: 'Georgetown', rating: 3.0, confirmedViewing: false },
      { ...baseBar, id: 'high', neighborhood: 'Ballard', rating: 5.0 },
    ]
    const ranked = rankBars(bars, match, prefs)
    expect(ranked[0].id).toBe('high')
    expect(ranked[0].rank).toBe(1)
    expect(ranked[1].rank).toBe(2)
  })

  it('lifts a website-confirmed venue above an unconfirmed peer', () => {
    const a = { ...baseBar, id: 'a', confirmedViewing: false }
    const b = { ...baseBar, id: 'b', confirmedViewing: false }
    const ranked = rankBars([a, b], match, prefs, { b: { worldCup: true, screens: true } })
    expect(ranked[0].id).toBe('b')
  })

  it('carries the per-dimension breakdown through to ranked results', () => {
    const ranked = rankBars([baseBar], match, prefs)
    expect(Array.isArray(ranked[0].breakdown)).toBe(true)
    expect(ranked[0].breakdown.length).toBeGreaterThanOrEqual(4)
  })
})
