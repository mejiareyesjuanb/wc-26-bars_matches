import { describe, it, expect } from 'vitest'
import { getActiveCity, setCurrentCity, getCity, detectCity, DEFAULT_CITY, CITY_IDS } from './city.js'
import { NEIGHBORHOODS } from '../data/neighborhoods.js'

// The exact Seattle/Eastside list the app shipped with — guards the parity gate.
const SEATTLE_NEIGHBORHOODS = [
  'Capitol Hill', 'Ballard', 'Fremont', 'Belltown', 'U-District',
  'Georgetown', 'Pioneer Square', 'South Lake Union', 'Queen Anne',
  'Wallingford', 'Downtown', 'West Seattle',
  'Bellevue', 'Kirkland', 'Redmond', 'Mercer Island', 'Issaquah', 'Woodinville',
]

describe('city config', () => {
  it('defaults to Seattle with the PT timezone label', () => {
    expect(DEFAULT_CITY).toBe('seattle')
    expect(getActiveCity().id).toBe('seattle')
    expect(getActiveCity().tzShort).toBe('PT')
    expect(getActiveCity().tzLong).toBe('Pacific')
  })

  it('Seattle neighborhoods + centroids match the shipped list (parity)', () => {
    const seattle = getCity('seattle')
    expect(seattle.neighborhoods).toEqual(SEATTLE_NEIGHBORHOODS)
    expect(Object.keys(seattle.centroids)).toEqual(SEATTLE_NEIGHBORHOODS)
    expect(NEIGHBORHOODS).toEqual(SEATTLE_NEIGHBORHOODS)
  })
})

describe('setCurrentCity / detectCity', () => {
  it('ignores unknown ids (falls back to default)', () => {
    setCurrentCity('atlantis')
    expect(getActiveCity().id).toBe('seattle')
    setCurrentCity('seattle')
  })
  it('detectCity prefers a saved valid city, else default', () => {
    expect(detectCity({ city: 'seattle' })).toBe('seattle')
    expect(detectCity({ city: null })).toBe('seattle')
    expect(detectCity({ city: 'nope' })).toBe('seattle')
    expect(detectCity({})).toBe('seattle')
  })
  it('exposes the configured city ids', () => {
    expect(CITY_IDS).toContain('seattle')
  })
})
