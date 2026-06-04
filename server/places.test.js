import { describe, it, expect } from 'vitest'
import { dedupeById } from './places.js'

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
