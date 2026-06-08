import { describe, it, expect } from 'vitest'
import {
  getActiveCity, setCurrentCity, getCity, detectCity, DEFAULT_CITY, CITY_IDS,
  CITY_LIST, nearestCity, neighborhoodsFromVenues, cityNeighborhoods, isCityLevel,
  boroughsFromVenues, neighborhoodsInBorough,
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
  it('detectCity falls back to default for a hidden saved city', () => {
    expect(detectCity({ city: 'london' })).toBe('seattle')
    expect(detectCity({ city: 'new-york' })).toBe('seattle') // hidden
    expect(detectCity({ city: 'denver' })).toBe('denver') // visible
  })
  it('exposes the configured city ids', () => {
    expect(CITY_IDS).toContain('seattle')
  })
})

describe('city list (hidden cities excluded; configs retained)', () => {
  it('keeps configs/timezones even for hidden cities', () => {
    expect(getCity('boston').tzShort).toBe('ET')
    expect(getCity('denver').tzShort).toBe('MT')
    expect(getCity('los-angeles').tzShort).toBe('PT')
  })
  it('excludes all hidden cities from the picker', () => {
    const ids = CITY_LIST.map((c) => c.id)
    for (const hidden of ['mexico-city', 'bogota', 'copenhagen', 'london', 'new-york', 'boston', 'buenos-aires']) {
      expect(ids).not.toContain(hidden)
    }
    expect(ids).toContain('seattle')
    expect(ids).toContain('denver')
    expect(ids).toContain('los-angeles')
  })
  it('is alphabetical by name', () => {
    const names = CITY_LIST.map((c) => c.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
  it('keeps New York config marked two-level (for re-enable)', () => {
    expect(getCity('new-york').twoLevel).toBe(true)
  })
})

describe('nearestCity (haversine, visible only)', () => {
  it('snaps a coordinate to the closest visible city', () => {
    expect(nearestCity(39.74, -104.99)).toBe('denver')
    expect(nearestCity(34.05, -118.24)).toBe('los-angeles')
    expect(nearestCity(47.61, -122.33)).toBe('seattle')
    expect(nearestCity(56.34, -2.80)).toBe('st-andrews')
  })
})

describe('boroughs (two-level)', () => {
  const nyc = [
    { borough: 'Manhattan', neighborhood: 'SoHo' }, { borough: 'Manhattan', neighborhood: 'SoHo' },
    { borough: 'Manhattan', neighborhood: 'Midtown' }, { borough: 'Manhattan', neighborhood: 'Midtown' },
    { borough: 'Manhattan', neighborhood: 'Manhattan' }, // fallback (no fine area)
    { borough: 'Brooklyn', neighborhood: 'Williamsburg' }, { borough: 'Brooklyn', neighborhood: 'Williamsburg' },
  ]
  it('lists boroughs with >=2 venues', () => {
    expect(boroughsFromVenues(nyc)).toEqual(['Manhattan', 'Brooklyn'])
  })
  it('lists fine neighborhoods in a borough (excludes the borough fallback)', () => {
    expect(neighborhoodsInBorough(nyc, 'Manhattan')).toEqual(['SoHo', 'Midtown'])
    expect(neighborhoodsInBorough(nyc, 'Brooklyn')).toEqual(['Williamsburg'])
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
