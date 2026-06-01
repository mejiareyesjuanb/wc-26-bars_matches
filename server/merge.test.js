import { describe, it, expect } from 'vitest'
import { normalizeName, mapType, normalizePrice, mergeVenue } from './merge.js'

describe('normalizeName', () => {
  it('lowercases and strips punctuation', () => {
    expect(normalizeName('The George & Dragon Pub')).toBe('the george dragon pub')
    expect(normalizeName('Targy’s Tavern')).toBe('targy s tavern')
  })
})

describe('mapType', () => {
  it('detects breweries by name', () => {
    expect(mapType({ name: 'Stoup Brewing', types: ['bar'] })).toBe('brewery')
  })
  it('detects sports bars by type', () => {
    expect(mapType({ name: 'Somewhere', types: ['sports_bar'] })).toBe('sports bar')
  })
  it('detects pubs', () => {
    expect(mapType({ name: 'Old Tavern', types: ['restaurant'] })).toBe('pub')
  })
  it('falls back to restaurant', () => {
    expect(mapType({ name: 'Bistro X', types: ['restaurant'] })).toBe('restaurant')
  })
})

describe('normalizePrice', () => {
  it('maps the Places enum to 1-4', () => {
    expect(normalizePrice('PRICE_LEVEL_MODERATE')).toBe(2)
    expect(normalizePrice('PRICE_LEVEL_VERY_EXPENSIVE')).toBe(4)
  })
  it('passes through numbers and defaults unknowns', () => {
    expect(normalizePrice(3)).toBe(3)
    expect(normalizePrice(undefined)).toBe(2)
  })
})

describe('mergeVenue', () => {
  const place = {
    id: 'p1', name: 'Stoup Brewing', address: '1108 NW 52nd St',
    rating: 4.7, userRatingCount: 2100, priceLevel: 'PRICE_LEVEL_MODERATE',
    types: ['bar'], reservable: false,
  }
  const signals = {
    'stoup brewing': {
      screens: 3, confirmedViewing: true, bigScreenOrProjector: true,
      soundOnForMatches: false, capacity: 'large', fanAffinity: ['USA', 'GER'],
      atmosphereTags: ['beer'], takesReservations: false, blurb: 'Big Ballard brewery.',
    },
  }

  it('applies curated signals to a recognized venue and keeps live rating', () => {
    const v = mergeVenue(place, 'Ballard', signals)
    expect(v.rating).toBe(4.7)
    expect(v.reviewCount).toBe(2100)
    expect(v.neighborhood).toBe('Ballard')
    expect(v.confirmedViewing).toBe(true)
    expect(v.fanAffinity).toEqual(['USA', 'GER'])
    expect(v.unconfirmedSignals).toBe(false)
  })

  it('uses safe defaults and flags unconfirmed for an unknown venue', () => {
    const unknown = { ...place, id: 'p2', name: 'Brand New Sports Pub', types: ['sports_bar'] }
    const v = mergeVenue(unknown, 'Belltown', signals)
    expect(v.unconfirmedSignals).toBe(true)
    expect(v.confirmedViewing).toBe(false)
    expect(v.fanAffinity).toEqual([])
    expect(v.type).toBe('sports bar')
    expect(v.rating).toBe(4.7) // live rating still used
  })
})
