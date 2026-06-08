import { describe, it, expect } from 'vitest'
import {
  getActiveCity, setCurrentCity, getCity, detectCity, DEFAULT_CITY, CITY_IDS,
  CITY_LIST, nearestCity, neighborhoodsFromVenues, cityNeighborhoods, isCityLevel,
} from './city.js'
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

describe('city list (20 cities incl. Boston/Denver/LA)', () => {
  it('includes the new cities with correct timezones', () => {
    expect(getCity('boston').tzShort).toBe('ET')
    expect(getCity('denver').tzShort).toBe('MT')
    expect(getCity('los-angeles').tzShort).toBe('PT')
    expect(CITY_LIST).toHaveLength(20)
  })
})

describe('nearestCity (haversine to city centers)', () => {
  it('snaps a coordinate to the closest configured city', () => {
    expect(nearestCity(42.36, -71.06)).toBe('boston')
    expect(nearestCity(34.05, -118.24)).toBe('los-angeles')
    expect(nearestCity(47.61, -122.33)).toBe('seattle')
    expect(nearestCity(51.5, -0.13)).toBe('london')
  })
})

describe('neighborhoodsFromVenues / cityNeighborhoods / isCityLevel', () => {
  const venues = [
    { neighborhood: 'SoHo' }, { neighborhood: 'SoHo' },
    { neighborhood: 'Midtown' }, { neighborhood: 'Midtown' }, { neighborhood: 'Midtown' },
    { neighborhood: 'Harlem' }, { neighborhood: 'Harlem' },
    { neighborhood: 'Tribeca' }, // only 1 → dropped
    { neighborhood: null },
  ]
  it('keeps neighborhoods with >=2 venues, sorted by count', () => {
    expect(neighborhoodsFromVenues(venues)).toEqual(['Midtown', 'SoHo', 'Harlem'])
  })
  it('Seattle uses its config list; discovered cities use venues', () => {
    expect(cityNeighborhoods(getCity('seattle'), venues)).toEqual(getCity('seattle').neighborhoods)
    expect(cityNeighborhoods(getCity('new-york'), venues)).toEqual(['Midtown', 'SoHo', 'Harlem'])
  })
  it('city-level when <3 neighborhoods', () => {
    expect(isCityLevel([])).toBe(true)
    expect(isCityLevel(['A', 'B'])).toBe(true)
    expect(isCityLevel(['A', 'B', 'C'])).toBe(false)
  })
})
