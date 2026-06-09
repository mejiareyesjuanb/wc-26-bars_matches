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
    expect(detectCity({ city: 'new-york' })).toBe('new-york') // now visible
    expect(detectCity({ city: 'boston' })).toBe('boston') // now visible
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
    for (const hidden of ['copenhagen', 'london']) {
      expect(ids).not.toContain(hidden)
    }
    expect(ids).toContain('mexico-city') // re-enabled (P4c)
    expect(ids).toContain('buenos-aires') // re-enabled (P4c)
    expect(ids).toContain('bogota') // re-enabled (P4c)
    expect(ids).toContain('seattle')
    expect(ids).toContain('denver')
    expect(ids).toContain('los-angeles')
    expect(ids).toContain('new-york') // re-enabled
    expect(ids).toContain('boston') // re-enabled
  })
  it('is alphabetical by name', () => {
    const names = CITY_LIST.map((c) => c.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
  it('keeps New York config marked two-level', () => {
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

describe('boroughs (two-level) — count only core (always-shown) venues', () => {
  const nyc = [
    { borough: 'Manhattan', neighborhood: 'SoHo', type: 'sports bar' }, { borough: 'Manhattan', neighborhood: 'SoHo', type: 'pub' },
    { borough: 'Manhattan', neighborhood: 'Midtown', type: 'pub' }, { borough: 'Manhattan', neighborhood: 'Midtown', type: 'brewery' },
    { borough: 'Manhattan', neighborhood: 'Manhattan', type: 'pub' }, // fallback (no fine area)
    { borough: 'Brooklyn', neighborhood: 'Williamsburg', type: 'sports bar' }, { borough: 'Brooklyn', neighborhood: 'Williamsburg', type: 'pub' },
    { borough: 'Queens', neighborhood: 'Astoria', type: 'cocktail bar' }, // no core venue → borough dropped
  ]
  it('lists boroughs with a core bar, sorted by count', () => {
    expect(boroughsFromVenues(nyc)).toEqual(['Manhattan', 'Brooklyn'])
  })
  it('lists fine neighborhoods in a borough (excludes the borough fallback)', () => {
    expect(neighborhoodsInBorough(nyc, 'Manhattan')).toEqual(['SoHo', 'Midtown'])
    expect(neighborhoodsInBorough(nyc, 'Brooklyn')).toEqual(['Williamsburg'])
  })
})

describe('neighborhoodsFromVenues / cityNeighborhoods / isCityLevel', () => {
  // Only "core" venues (sports bar / pub / brewery / bar & grill / curated-confirmed)
  // count toward a neighborhood having bars; generic bars/restaurants/cocktail bars
  // need website signals so they don't count here.
  const venues = [
    { neighborhood: 'SoHo', type: 'pub' }, { neighborhood: 'SoHo', type: 'bar' }, // generic bar: not core
    { neighborhood: 'Midtown', type: 'sports bar' }, { neighborhood: 'Midtown', type: 'pub' }, { neighborhood: 'Midtown', type: 'brewery' },
    { neighborhood: 'Harlem', type: 'pub' }, { neighborhood: 'Harlem', type: 'restaurant' }, // restaurant: not core
    { neighborhood: 'Tribeca', type: 'cocktail bar' }, // no core → dropped
    { neighborhood: null, type: 'pub' },
  ]
  it('keeps neighborhoods with >=1 core bar, sorted by core count', () => {
    expect(neighborhoodsFromVenues(venues)).toEqual(['Midtown', 'SoHo', 'Harlem'])
  })
  it('curated cities keep config order but drop neighborhoods with no core bar', () => {
    const sea = [
      { neighborhood: 'Ballard', type: 'sports bar' },
      { neighborhood: 'Fremont', type: 'pub' },
      { neighborhood: 'Capitol Hill', type: 'brewery' },
      { neighborhood: 'Downtown', type: 'restaurant' }, // not core → Downtown dropped
    ]
    expect(cityNeighborhoods(getCity('seattle'), sea)).toEqual(['Capitol Hill', 'Ballard', 'Fremont'])
  })
  it('curated city falls back to the full config list before venues load', () => {
    expect(cityNeighborhoods(getCity('seattle'), null)).toEqual(getCity('seattle').neighborhoods)
  })
  it('non-curated cities discover from venues (core only)', () => {
    expect(cityNeighborhoods(getCity('mountain-view'), venues)).toEqual(['Midtown', 'SoHo', 'Harlem'])
  })
  it('city-level when <3 neighborhoods', () => {
    expect(isCityLevel([])).toBe(true)
    expect(isCityLevel(['A', 'B'])).toBe(true)
    expect(isCityLevel(['A', 'B', 'C'])).toBe(false)
  })
})
