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
  it('a generic bar Google lists under "sports bars in …" counts (googleSportsBar)', () => {
    // e.g. Bad Albert's Tap & Grill — primaryType "bar", but in the sports-bar query
    expect(isSportsBar(venue({ type: 'bar', name: "Bad Albert's Tap & Grill", googleSportsBar: true }))).toBe(true)
    expect(isSportsBar(venue({ type: 'bar', name: 'Some Cocktail Lounge' }))).toBe(false)
  })
  it('googleSportsBar on a NON-bar (restaurant) is NOT a sports bar', () => {
    // Google's "sports bars in {area}" text search loosely returns prominent non-bars.
    expect(isSportsBar(venue({ type: 'american restaurant', name: 'Fancy Place', googleSportsBar: true }))).toBe(false)
  })
  it('a restaurant whose types[] include sports_bar (sportsType) counts', () => {
    expect(isSportsBar(venue({ type: 'australian restaurant', name: 'Kangaroo & Kiwi', sportsType: true }))).toBe(true)
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

describe('scoreBar inclusion (broadened: bars/pubs/breweries eligible)', () => {
  it('excludes a plain restaurant entirely (Matador)', () => {
    const r = scoreBar(venue({ type: 'mexican restaurant', name: 'Matador Ballard', rating: 4.4, reviewCount: 2572 }), undefined)
    expect(r.included).toBe(false)
    expect(r.score).toBe(0)
  })
  it('includes a sports bar (not confirmed) in the 30–60 band', () => {
    const r = scoreBar(venue({ type: 'sports bar' }), undefined)
    expect(r.included).toBe(true)
    expect(r.confirmed).toBe(false)
    expect(r.score).toBeGreaterThanOrEqual(30)
    expect(r.score).toBeLessThanOrEqual(60)
  })
  it('includes a generic bar/pub/brewery in the 0–30 band (below sports bars)', () => {
    const r = scoreBar(venue({ type: 'pub', name: 'The Local', rating: 4.6, reviewCount: 800 }), undefined)
    expect(r.included).toBe(true)
    expect(r.sports).toBe(false)
    expect(r.score).toBeLessThanOrEqual(30)
  })
  it('includes a confirmed gastropub typed as a restaurant (KK has bar/sports_bar types)', () => {
    const r = scoreBar(venue({ type: 'australian restaurant', name: 'Kangaroo & Kiwi', barType: true, sportsType: true }), { worldCup: true })
    expect(r.included).toBe(true)
    expect(r.confirmed).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(60)
  })
  it('does NOT include a fine-dining restaurant even if its site confirms a watch party (Canlis)', () => {
    // Canlis: american_restaurant + fine_dining; website mentions a one-off watch party.
    const r = scoreBar(venue({ type: 'american restaurant', name: 'Canlis', fineDining: true }), { worldCup: true, screens: true })
    expect(r.included).toBe(false)
    expect(r.score).toBe(0)
  })
})

describe('ranking order', () => {
  it('confirmed > sports bar > other drinking venue > excluded restaurant', () => {
    const bars = [
      venue({ id: 'matador', type: 'mexican restaurant', name: 'Matador', rating: 4.4, reviewCount: 2572 }),
      venue({ id: 'pub', type: 'pub', name: 'Corner Pub', rating: 4.6, reviewCount: 900 }),
      venue({ id: 'plainSB', type: 'sports bar', name: 'Plain SB', rating: 4.0, reviewCount: 100 }),
      venue({ id: 'kk', type: 'australian restaurant', name: 'Kangaroo & Kiwi', sportsType: true, rating: 4.2, reviewCount: 1223 }),
    ]
    const ranked = rankBars(bars, { kk: { worldCup: true } })
    const included = ranked.filter((b) => b.included).map((b) => b.id)
    // confirmed (kk) → sports bar (plainSB) → other drinking venue (pub); restaurant excluded.
    expect(included).toEqual(['kk', 'plainSB', 'pub'])
    expect(ranked.find((b) => b.id === 'matador').included).toBe(false)
  })
})
