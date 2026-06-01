import { describe, it, expect } from 'vitest'
import { nearestNeighborhood } from './neighborhoods.js'

describe('nearestNeighborhood', () => {
  it('assigns a near-stadium point to Pioneer Square', () => {
    // ~Lumen Field / Pioneer Square
    expect(nearestNeighborhood(47.5952, -122.3316)).toBe('Pioneer Square')
  })
  it('assigns a Ballard point to Ballard', () => {
    expect(nearestNeighborhood(47.6680, -122.3845)).toBe('Ballard')
  })
  it('assigns a West Seattle point to West Seattle', () => {
    expect(nearestNeighborhood(47.5700, -122.3870)).toBe('West Seattle')
  })
})
