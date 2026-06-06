import { describe, it, expect } from 'vitest'
import { TEAMS } from './teams.js'
import { TEAM_INFO, TEAM_INFO_META, teamInfo } from './teamInfo.js'

describe('teamInfo dataset (generated from Wikipedia sources)', () => {
  it('has a complete, well-formed entry for every one of the 48 teams', () => {
    for (const code of Object.keys(TEAMS)) {
      const t = TEAM_INFO[code]
      expect(t, `missing TEAM_INFO[${code}]`).toBeTruthy()
      expect(typeof t.fifaRank, `${code} fifaRank`).toBe('number')
      expect(t.fifaRank).toBeGreaterThan(0)
      expect(typeof t.bestFinish, `${code} bestFinish`).toBe('string')
      expect(t.bestFinish.length).toBeGreaterThan(0)
      expect(Array.isArray(t.playersToWatch)).toBe(true)
      expect(t.playersToWatch.length, `${code} players`).toBeGreaterThanOrEqual(1)
      expect(t.playersToWatch.length).toBeLessThanOrEqual(3)
      for (const p of t.playersToWatch) {
        expect(p.name && p.club, `${code} player fields`).toBeTruthy()
      }
    }
  })

  it('records provenance (asOf + sources)', () => {
    expect(TEAM_INFO_META.asOf).toBeTruthy()
    expect(TEAM_INFO_META.rankAsOf).toBeTruthy()
    expect(TEAM_INFO_META.sources.squads).toMatch(/wikipedia/i)
  })

  it('teamInfo() returns data for known codes and null for unknown', () => {
    expect(teamInfo('MEX')).toBeTruthy()
    expect(teamInfo('ZZZ')).toBeNull()
  })
})
