import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, isSportsBar, isConfirmedWorldCup } from './scoring.js'

const venue = (over) => ({
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'restaurant',
  rating: 4.2, reviewCount: 500, confirmedViewing: false, ...over,
})

describe('isSportsBar (category is source of truth, name is a fallback)', () => {
  it('a mexican restaurant is not a sports bar', () => {
    expect(isSportsBar(venue({ type: 'mexican restaurant', name: 'Matador Ballard' }))).toBe(false)
  })
  it('a sports_bar category is', () => {
    expect(isSportsBar(venue({ type: 'sports bar' }))).toBe(true)
  })
  it('"sports bar" in the name is, even when miscategorized', () => {
    expect(isSportsBar(venue({ type: 'restaurant', name: 'Slim Goody Sports Bar' }))).toBe(true)
  })
})

describe('isConfirmedWorldCup', () => {
  it('true when the website check confirms it', () => {
    expect(isConfirmedWorldCup(venue(), { worldCup: true })).toBe(true)
  })
  it('true when curated data confirms it', () => {
    expect(isConfirmedWorldCup(venue({ confirmedViewing: true }), undefined)).toBe(true)
  })
  it('false otherwise', () => {
    expect(isConfirmedWorldCup(venue(), { worldCup: false })).toBe(false)
  })
})

describe('scoreBar inclusion', () => {
  it('excludes a plain restaurant entirely (Matador)', () => {
    const r = scoreBar(venue({ type: 'mexican restaurant', name: 'Matador Ballard', rating: 4.4, reviewCount: 2572 }), undefined)
    expect(r.included).toBe(false)
    expect(r.score).toBe(0)
  })
  it('includes a sports bar (not confirmed) in the 0–55 band', () => {
    const r = scoreBar(venue({ type: 'sports bar' }), undefined)
    expect(r.included).toBe(true)
    expect(r.confirmed).toBe(false)
    expect(r.score).toBeLessThanOrEqual(55)
  })
  it('includes a confirmed venue in the 60–100 band, even a restaurant by category (KK)', () => {
    const r = scoreBar(venue({ type: 'australian restaurant', name: 'Kangaroo & Kiwi' }), { worldCup: true })
    expect(r.included).toBe(true)
    expect(r.confirmed).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(60)
  })
})

describe('ranking order', () => {
  it('confirmed > unconfirmed sports bar > excluded; reviews tune within confirmed', () => {
    const bars = [
      venue({ id: 'matador', type: 'mexican restaurant', name: 'Matador', rating: 4.4, reviewCount: 2572 }),
      venue({ id: 'plainSB', type: 'sports bar', name: 'Plain SB', rating: 4.0, reviewCount: 100 }),
      venue({ id: 'kk', type: 'australian restaurant', name: 'Kangaroo & Kiwi', rating: 4.2, reviewCount: 1223 }),
      venue({ id: 'sg', type: 'restaurant', name: 'Slim Goody Sports Bar', rating: 4.5, reviewCount: 169 }),
    ]
    const ranked = rankBars(bars, { kk: { worldCup: true }, sg: { worldCup: true } })
    const included = ranked.filter((b) => b.included).map((b) => b.id)
    // both confirmed (kk, sg) first — kk edges sg on review confidence — then the plain sports bar
    expect(included).toEqual(['kk', 'sg', 'plainSB'])
    expect(ranked.find((b) => b.id === 'matador').included).toBe(false)
  })
})
