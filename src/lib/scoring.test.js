import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, tierOf, isSportsBar } from './scoring.js'

const venue = (over) => ({
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'restaurant',
  rating: 4.2, reviewCount: 500, confirmedViewing: false, ...over,
})

describe('tierOf', () => {
  it('A = confirmed World Cup (website or curated)', () => {
    expect(tierOf(venue(), { worldCup: true })).toBe('A')
    expect(tierOf(venue({ confirmedViewing: true }), undefined)).toBe('A')
  })
  it('B = sports bar or screens confirmed', () => {
    expect(tierOf(venue({ type: 'sports bar' }), undefined)).toBe('B')
    expect(tierOf(venue(), { screens: true })).toBe('B')
  })
  it('C = plain venue with no confirmation', () => {
    expect(tierOf(venue({ type: 'mexican restaurant' }), undefined)).toBe('C')
    expect(tierOf(venue({ type: 'mexican restaurant' }), { worldCup: false, screens: false })).toBe('C')
  })
})

describe('isSportsBar uses the category (primaryType) as source of truth', () => {
  it('a mexican restaurant is NOT a sports bar', () => {
    expect(isSportsBar(venue({ type: 'mexican restaurant' }))).toBe(false)
  })
  it('a sports bar is', () => {
    expect(isSportsBar(venue({ type: 'sports bar' }))).toBe(true)
  })
})

describe('scoreBar tier bands never overlap', () => {
  const a = scoreBar(venue(), { worldCup: true }).score
  const b = scoreBar(venue({ type: 'sports bar' }), undefined).score
  const c = scoreBar(venue({ type: 'mexican restaurant' }), undefined).score

  it('A (75-100) > B (45-70) > C (0-40)', () => {
    expect(a).toBeGreaterThanOrEqual(75)
    expect(b).toBeGreaterThanOrEqual(45)
    expect(b).toBeLessThanOrEqual(70)
    expect(c).toBeLessThanOrEqual(40)
    expect(a).toBeGreaterThan(b)
    expect(b).toBeGreaterThan(c)
  })
})

describe('reviews only tune within a tier', () => {
  it('higher reviews rank higher among confirmed venues', () => {
    const hi = scoreBar(venue({ rating: 4.8, reviewCount: 2000 }), { worldCup: true }).score
    const lo = scoreBar(venue({ rating: 3.6, reviewCount: 30 }), { worldCup: true }).score
    expect(hi).toBeGreaterThan(lo)
    expect(lo).toBeGreaterThanOrEqual(75) // still tier A despite weak reviews
  })

  it('a great-reviewed plain restaurant never beats a confirmed venue', () => {
    const greatRestaurant = scoreBar(venue({ type: 'italian restaurant', rating: 4.9, reviewCount: 5000 }), undefined).score
    const weakConfirmed = scoreBar(venue({ rating: 3.4, reviewCount: 10 }), { worldCup: true }).score
    expect(weakConfirmed).toBeGreaterThan(greatRestaurant)
  })
})

describe('rankBars', () => {
  it('orders confirmed > sports bar > plain restaurant, with breakdown + rank', () => {
    const bars = [
      venue({ id: 'matador', type: 'mexican restaurant', rating: 4.4, reviewCount: 2572 }),
      venue({ id: 'kk', type: 'australian restaurant', rating: 4.2, reviewCount: 1223 }),
      venue({ id: 'sportsbar', type: 'sports bar', rating: 4.0, reviewCount: 100 }),
    ]
    const ranked = rankBars(bars, { kk: { worldCup: true } })
    expect(ranked.map((b) => b.id)).toEqual(['kk', 'sportsbar', 'matador'])
    expect(ranked[0].rank).toBe(1)
    expect(ranked[0].tier).toBe('A')
    expect(ranked[0].breakdown.tier).toBe('A')
  })
})
