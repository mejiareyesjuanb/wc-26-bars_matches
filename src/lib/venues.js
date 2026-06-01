import { BARS } from '../data/bars.js'

// Load the venue list from the backend (live Google Places when a key is
// configured server-side). Falls back to the bundled curated list if the API
// is unreachable or returns nothing, so the app always works.
export async function loadVenues() {
  try {
    const res = await fetch('/api/venues')
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data.venues) && data.venues.length) {
      return { venues: data.venues, source: data.source || 'google' }
    }
    throw new Error('empty venue list')
  } catch {
    return { venues: BARS, source: 'curated' }
  }
}
