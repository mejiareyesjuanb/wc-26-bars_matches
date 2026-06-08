import { describe, it, expect } from 'vitest'
import { scoreBar, rankBars, isSportsBar, isConfirmedWorldCup, venueClass, isCoreVenue } from './scoring.js'

const venue = (over) => ({
  id: 'x', name: 'X', neighborhood: 'Ballard', type: 'restaurant',
  rating: 4.2, reviewCount: 500, confirmedViewing: false, ...over,
})

describe('venueClass (category sets the band)', () => {
  it('sports_bar primaryType → sports', () => {
    expect(venueClass(venue({ type: 'sports bar' }))).toBe('sports')
  })
  it('a bar with sports_bar in types[] (sportsType) → sports', () => {
    expect(venueClass(venue({ type: 'bar', sportsType: true }))).toBe('sports')
  })
  it('"sports bar" in the name → sports (even when miscategorized)', () => {
    expect(venueClass(venue({ type: 'restaurant', name: 'Slim Goody Sports Bar' }))).toBe('sports')
  })
  it('pub / irish pub → pub', () => {
    expect(venueClass(venue({ type: 'pub' }))).toBe('pub')
    expect(venueClass(venue({ type: 'irish pub' }))).toBe('pub')
  })
  it('bar and grill → barGrill', () => {
    expect(venueClass(venue({ type: 'bar and grill' }))).toBe('barGrill')
  })
  it('brewery / brewpub → brewery', () => {
    expect(venueClass(venue({ type: 'brewery' }))).toBe('brewery')
    expect(venueClass(venue({ type: 'brewpub' }))).toBe('brewery')
  })
  it('plain bar → bar', () => {
    expect(venueClass(venue({ type: 'bar' }))).toBe('bar')
  })
  it('a restaurant with no sports signal → other', () => {
    expect(venueClass(venue({ type: 'mexican restaurant' }))).toBe('other')
  })
})

describe('isSportsBar (category/name only — the "sports bars in {area}" tag is ignored)', () => {
  it('a mexican restaurant is not a sports bar', () => {
    expect(isSportsBar(venue({ type: 'mexican restaurant', name: 'Matador Ballard' }))).toBe(false)
  })
  it('a sports_bar category is', () => {
    expect(isSportsBar(venue({ type: 'sports bar' }))).toBe(true)
  })
  it('"sports bar" in the name is', () => {
    expect(isSportsBar(venue({ type: 'restaurant', name: 'Slim Goody Sports Bar' }))).toBe(true)
  })
  it('a bar whose types[] include sports_bar (sportsType) is', () => {
    expect(isSportsBar(venue({ type: 'bar', name: "Bad Albert's Tap & Grill", sportsType: true }))).toBe(true)
  })
  it('googleSportsBar (the text-search tag) alone is NOT a sports bar', () => {
    expect(isSportsBar(venue({ type: 'bar', name: 'Roam', googleSportsBar: true }))).toBe(false)
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

describe('inclusion gates', () => {
  it('excludes a plain restaurant with no signal (Matador)', () => {
    const r = scoreBar(venue({ type: 'mexican restaurant', name: 'Matador', rating: 4.4, reviewCount: 2576 }), undefined)
    expect(r.included).toBe(false)
    expect(r.score).toBe(0)
  })
  it('excludes fine dining even if its site confirms a watch party (Canlis)', () => {
    const r = scoreBar(venue({ type: 'american restaurant', name: 'Canlis', fineDining: true }), { worldCup: true, screens: true })
    expect(r.included).toBe(false)
    expect(r.score).toBe(0)
  })
  it('excludes a restaurant with a stray sports_bar type but no screens/WC (Giddy Up Burgers)', () => {
    const r = scoreBar(venue({ type: 'hamburger restaurant', name: 'Giddy Up Burgers', sportsType: true }), { screens: false, worldCup: false })
    expect(r.included).toBe(false)
  })
  it('includes a restaurant with sports_bar type AND screens, as sports (Kangaroo & Kiwi)', () => {
    const r = scoreBar(venue({ type: 'australian restaurant', name: 'Kangaroo & Kiwi', sportsType: true }), { screens: true, worldCup: true })
    expect(r.included).toBe(true)
    expect(r.breakdown.tierKey).toBe('tierSports')
  })
  it('includes a restaurant whose name says "sports bar" (Slim Goody)', () => {
    const r = scoreBar(venue({ type: 'restaurant', name: 'Slim Goody Sports Bar' }), undefined)
    expect(r.included).toBe(true)
    expect(r.breakdown.tierKey).toBe('tierSports')
  })
  it('EXCLUDES a generic bar with no screens/WC (Roam)', () => {
    const r = scoreBar(venue({ type: 'bar', name: 'Roam', googleSportsBar: true }), { screens: false, worldCup: false })
    expect(r.included).toBe(false)
  })
  it('INCLUDES a generic bar WITH screens, in the bar band', () => {
    const r = scoreBar(venue({ type: 'bar', name: 'Some Tavern', rating: 4.5, reviewCount: 700 }), { screens: true })
    expect(r.included).toBe(true)
    expect(r.breakdown.tierKey).toBe('tierBar')
    expect(r.score).toBeGreaterThanOrEqual(16)
    expect(r.score).toBeLessThan(32)
  })
  it('always includes a pub / brewery / bar&grill regardless of website coverage', () => {
    expect(scoreBar(venue({ type: 'pub', name: 'A Pub' }), undefined).included).toBe(true)
    expect(scoreBar(venue({ type: 'brewery', name: 'A Brewery' }), undefined).included).toBe(true)
    expect(scoreBar(venue({ type: 'bar and grill', name: 'A B&G' }), undefined).included).toBe(true)
  })
})

describe('band scoring (category dominates; signals + reviews order within a band)', () => {
  it('places each class in its band range', () => {
    const inBand = (type, lo, hi, over) => {
      const s = scoreBar(venue({ type, ...over }), undefined).score
      expect(s, type).toBeGreaterThanOrEqual(lo)
      expect(s, type).toBeLessThan(hi)
    }
    inBand('sports bar', 80, 94)
    inBand('pub', 64, 78)
    inBand('bar and grill', 48, 62)
    inBand('brewery', 32, 46)
  })
  it('googleSportsBar has NO effect on score', () => {
    const a = scoreBar(venue({ type: 'sports bar', googleSportsBar: true }), undefined).score
    const b = scoreBar(venue({ type: 'sports bar', googleSportsBar: false }), undefined).score
    expect(a).toBe(b)
  })
  it('a confirmed brewery still ranks below an unconfirmed sports bar (within-band only)', () => {
    const brewery = scoreBar(venue({ type: 'brewery', rating: 5, reviewCount: 5000 }), { worldCup: true }).score
    const sportsbar = scoreBar(venue({ type: 'sports bar', rating: 3.0, reviewCount: 0 }), undefined).score
    expect(sportsbar).toBeGreaterThan(brewery)
  })
  it('within a band, confirmed > screens-only > neither', () => {
    const conf = scoreBar(venue({ type: 'brewery' }), { worldCup: true }).score
    const scr = scoreBar(venue({ type: 'brewery' }), { screens: true }).score
    const none = scoreBar(venue({ type: 'brewery' }), undefined).score
    expect(conf).toBeGreaterThan(scr)
    expect(scr).toBeGreaterThan(none)
  })
  it('reviews only break ties within a band, never across', () => {
    const highRevPub = scoreBar(venue({ type: 'pub', rating: 5, reviewCount: 5000 }), undefined).score
    const lowRevSports = scoreBar(venue({ type: 'sports bar', rating: 3, reviewCount: 0 }), undefined).score
    expect(lowRevSports).toBeGreaterThan(highRevPub)
  })
})

describe('isCoreVenue (always-shown set, no website checks needed)', () => {
  it('true for sports bars / pubs / breweries / bar & grills', () => {
    expect(isCoreVenue(venue({ type: 'sports bar' }))).toBe(true)
    expect(isCoreVenue(venue({ type: 'pub' }))).toBe(true)
    expect(isCoreVenue(venue({ type: 'brewery' }))).toBe(true)
    expect(isCoreVenue(venue({ type: 'bar and grill' }))).toBe(true)
  })
  it('false for generic bars, restaurants, and cocktail bars (need a website signal)', () => {
    expect(isCoreVenue(venue({ type: 'bar' }))).toBe(false)
    expect(isCoreVenue(venue({ type: 'mexican restaurant' }))).toBe(false)
    expect(isCoreVenue(venue({ type: 'cocktail bar' }))).toBe(false)
  })
  it('true for a curated-confirmed venue regardless of category', () => {
    expect(isCoreVenue(venue({ type: 'bar', confirmedViewing: true }))).toBe(true)
  })
})

describe('ranking order (Ballard-like mix)', () => {
  it('sports > pub > bar&grill > brewery; restaurant + generic no-signal bar excluded', () => {
    const bars = [
      venue({ id: 'matador', type: 'mexican restaurant', name: 'Matador', rating: 4.4, reviewCount: 2576 }),
      venue({ id: 'roam', type: 'bar', name: 'Roam', googleSportsBar: true, rating: 4.8, reviewCount: 63 }),
      venue({ id: 'brewery', type: 'brewery', name: 'Stoup', rating: 4.7, reviewCount: 796 }),
      venue({ id: 'bg', type: 'bar and grill', name: 'Sloop', rating: 4.5, reviewCount: 648 }),
      venue({ id: 'pub', type: 'pub', name: 'Old Pequliar', rating: 4.4, reviewCount: 562 }),
      venue({ id: 'sb', type: 'sports bar', name: 'Old County Bar', rating: 4.7, reviewCount: 164 }),
    ]
    const ranked = rankBars(bars)
    const included = ranked.filter((b) => b.included).map((b) => b.id)
    expect(included).toEqual(['sb', 'pub', 'bg', 'brewery'])
    expect(ranked.find((b) => b.id === 'matador').included).toBe(false)
    expect(ranked.find((b) => b.id === 'roam').included).toBe(false)
  })
})
