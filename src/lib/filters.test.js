import { describe, it, expect } from 'vitest'
import { filterMatches, facetValues } from './filters.js'

const MATCHES = [
  { id: 'M1', stage: 'Group', group: 'A', venueCity: 'Seattle', datetime: '2026-06-15T09:00:00-07:00', homeTeam: 'USA', awayTeam: 'MEX' },
  { id: 'M2', stage: 'Group', group: 'B', venueCity: 'Dallas', datetime: '2026-06-15T18:00:00-07:00', homeTeam: 'ENG', awayTeam: 'BRA' },
  { id: 'M3', stage: 'R16', group: null, venueCity: 'Seattle', datetime: '2026-07-06T14:00:00-07:00', homeTeam: 'USA', awayTeam: 'GER' },
]

describe('filterMatches', () => {
  it('returns all when no filters set', () => {
    expect(filterMatches(MATCHES, {}).length).toBe(3)
  })
  it('filters by team (home or away)', () => {
    const r = filterMatches(MATCHES, { team: 'USA' })
    expect(r.map((m) => m.id)).toEqual(['M1', 'M3'])
  })
  it('filters by stage', () => {
    expect(filterMatches(MATCHES, { stage: 'R16' }).map((m) => m.id)).toEqual(['M3'])
  })
  it('filters by group (group-stage only)', () => {
    expect(filterMatches(MATCHES, { group: 'A' }).map((m) => m.id)).toEqual(['M1'])
    expect(filterMatches(MATCHES, { group: 'B' }).map((m) => m.id)).toEqual(['M2'])
  })
  it('filters by date', () => {
    expect(filterMatches(MATCHES, { date: '2026-06-15' }).length).toBe(2)
  })
  it('filters by city', () => {
    expect(filterMatches(MATCHES, { city: 'Seattle' }).map((m) => m.id)).toEqual(['M1', 'M3'])
    expect(filterMatches(MATCHES, { city: 'Dallas' }).map((m) => m.id)).toEqual(['M2'])
  })
  it('filters by time of day', () => {
    expect(filterMatches(MATCHES, { timeOfDay: 'morning' }).map((m) => m.id)).toEqual(['M1'])
    expect(filterMatches(MATCHES, { timeOfDay: 'evening' }).map((m) => m.id)).toEqual(['M2'])
  })
  it('combines filters with AND', () => {
    const r = filterMatches(MATCHES, { team: 'USA', stage: 'Group' })
    expect(r.map((m) => m.id)).toEqual(['M1'])
  })
})

describe('facetValues (dependent filter options)', () => {
  const set = (matches, filters, key) => [...facetValues(matches, filters, key)].sort()
  it('narrows other fields to those co-occurring with a chosen team', () => {
    // USA plays M1 (Group A, Seattle, 2026-06-15) and M3 (R16, Seattle).
    expect(set(MATCHES, { team: 'USA' }, 'group')).toEqual(['A']) // M3 has no group
    expect(set(MATCHES, { team: 'USA' }, 'city')).toEqual(['Seattle'])
    expect(set(MATCHES, { team: 'USA' }, 'stage')).toEqual(['Group', 'R16'])
  })
  it('does not narrow a field by its own value (exclude-self → all teams)', () => {
    expect(set(MATCHES, { team: 'USA' }, 'team').sort()).toEqual(['BRA', 'ENG', 'GER', 'MEX', 'USA'])
  })
  it('a knockout stage yields no group options (knockouts have no group)', () => {
    expect(set(MATCHES, { stage: 'R16' }, 'group')).toEqual([])
  })
  it('narrows teams to those playing on a chosen date', () => {
    // 2026-06-15 = M1 (USA, MEX) + M2 (ENG, BRA).
    expect(set(MATCHES, { date: '2026-06-15' }, 'team')).toEqual(['BRA', 'ENG', 'MEX', 'USA'])
  })
})
