import { describe, it, expect } from 'vitest'
import { dedupeById, descriptorArea } from './places.js'

const area = (text, containment) => ({ displayName: { text }, containment })

describe('descriptorArea', () => {
  it('picks the first WITHIN area that is not the borough', () => {
    // Hoops Cabaret (Manhattan): Koreatown is OUTSKIRTS; Midtown South is WITHIN.
    const ad = { areas: [area('Koreatown', 'OUTSKIRTS'), area('Midtown South', 'WITHIN'), area('Midtown Manhattan', 'WITHIN')] }
    expect(descriptorArea(ad, 'Manhattan')).toBe('Midtown South')
  })
  it('skips a WITHIN area equal to the borough', () => {
    const ad = { areas: [area('Manhattan', 'WITHIN'), area('Chelsea', 'WITHIN')] }
    expect(descriptorArea(ad, 'Manhattan')).toBe('Chelsea')
  })
  it('falls back to the first WITHIN, then the first area', () => {
    expect(descriptorArea({ areas: [area('Queens', 'WITHIN')] }, 'Queens')).toBe('Queens')
    expect(descriptorArea({ areas: [area('Somewhere', 'NEAR')] }, 'Bronx')).toBe('Somewhere')
  })
  it('returns null when there are no areas', () => {
    expect(descriptorArea(undefined, 'Manhattan')).toBeNull()
    expect(descriptorArea({ areas: [] }, 'Manhattan')).toBeNull()
  })
})

describe('dedupeById', () => {
  it('keeps the first occurrence of each id and drops repeats', () => {
    const out = dedupeById([
      { id: 'a', name: 'A1' },
      { id: 'b', name: 'B' },
      { id: 'a', name: 'A2' },
    ])
    expect(out.map((p) => p.id)).toEqual(['a', 'b'])
    expect(out.find((p) => p.id === 'a').name).toBe('A1')
  })

  it('ignores entries without an id', () => {
    const out = dedupeById([{ name: 'no id' }, { id: 'x', name: 'X' }])
    expect(out.map((p) => p.id)).toEqual(['x'])
  })

  it('returns empty for empty input', () => {
    expect(dedupeById([])).toEqual([])
  })
})
