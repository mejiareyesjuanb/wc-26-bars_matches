import { describe, it, expect } from 'vitest'
import { isGroupDecider, stakesFor } from './stakes.js'
import { MATCHES } from '../data/matches.js'

// Group A across three matchdays (latest date = decider).
const groupA = [
  { id: 'a1', stage: 'Group', group: 'A', datetime: '2026-06-11T12:00:00-07:00' },
  { id: 'a2', stage: 'Group', group: 'A', datetime: '2026-06-19T12:00:00-07:00' },
  { id: 'a3', stage: 'Group', group: 'A', datetime: '2026-06-25T12:00:00-07:00' }, // decider
]

describe('isGroupDecider', () => {
  it('is true only for the final-matchday group game', () => {
    expect(isGroupDecider(groupA[0], groupA)).toBe(false)
    expect(isGroupDecider(groupA[1], groupA)).toBe(false)
    expect(isGroupDecider(groupA[2], groupA)).toBe(true)
  })
  it('is false for non-group matches', () => {
    expect(isGroupDecider({ stage: 'Final', group: null, datetime: '2026-07-19T12:00:00-07:00' }, groupA)).toBe(false)
  })
})

describe('stakesFor', () => {
  it('returns null for a non-decider group match', () => {
    expect(stakesFor(groupA[0], groupA)).toBeNull()
  })
  it('returns a decider line for the final group game', () => {
    expect(stakesFor(groupA[2], groupA)).toMatch(/decides who advances/i)
  })
  it('returns a stage-specific line for each knockout stage', () => {
    for (const stage of ['Round of 32', 'Round of 16', 'Quarter-final', 'Semi-final', 'Third place', 'Final']) {
      expect(typeof stakesFor({ stage, group: null, datetime: '2026-07-01T12:00:00-07:00' }, [])).toBe('string')
    }
  })

  it('on real data: the Final has a line; every group has at least one decider', () => {
    const final = MATCHES.find((m) => m.stage === 'Final')
    expect(stakesFor(final, MATCHES)).toMatch(/final/i)
    const groups = [...new Set(MATCHES.filter((m) => m.stage === 'Group').map((m) => m.group))]
    for (const g of groups) {
      const deciders = MATCHES.filter((m) => m.stage === 'Group' && m.group === g && isGroupDecider(m, MATCHES))
      expect(deciders.length).toBeGreaterThanOrEqual(1)
    }
  })
})
