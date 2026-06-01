import { describe, it, expect } from 'vitest'
import { timeOfDay, formatKickoff } from './time.js'

describe('timeOfDay', () => {
  it('classifies before noon as morning', () => {
    expect(timeOfDay('2026-06-15T09:00:00-07:00')).toBe('morning')
  })
  it('classifies noon-to-5pm as afternoon', () => {
    expect(timeOfDay('2026-06-15T12:00:00-07:00')).toBe('afternoon')
    expect(timeOfDay('2026-06-15T16:59:00-07:00')).toBe('afternoon')
  })
  it('classifies 5pm and later as evening', () => {
    expect(timeOfDay('2026-06-15T17:00:00-07:00')).toBe('evening')
    expect(timeOfDay('2026-06-15T20:00:00-07:00')).toBe('evening')
  })
})

describe('formatKickoff', () => {
  it('formats a readable Pacific time string', () => {
    const out = formatKickoff('2026-06-15T15:00:00-07:00')
    expect(out).toContain('Jun')
    expect(out).toMatch(/3:00/)
  })
})
