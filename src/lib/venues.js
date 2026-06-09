import { BARS } from '../data/bars.js'
import { decorateCurated } from '../data/geo.js'
import { getActiveCity, getCity } from './city.js'

// Load the venue list from the backend for a city (live Google Places when a key
// is configured server-side). Falls back to the bundled curated list if the API
// is unreachable, so the app always works. `reason` explains any fallback.
export async function loadVenues(cityId) {
  const city = cityId ? getCity(cityId) : getActiveCity()
  try {
    const res = await fetch(`/api/venues?city=${city.id}`)
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    if (Array.isArray(data.venues) && data.venues.length) {
      return {
        city: data.city || city.id,
        venues: data.venues,
        source: data.source || 'google',
        reason: data.reason ?? null,
        detail: data.detail ?? null,
      }
    }
    throw new Error('empty venue list')
  } catch {
    return { city: city.id, venues: decorateCurated(BARS, city), source: 'curated', reason: 'unreachable', detail: null }
  }
}

// Best "open in Google Maps" URL for a venue.
export function mapsUrl(v) {
  if (v.googleMapsUri) return v.googleMapsUri
  const q = encodeURIComponent([v.name, v.address, getActiveCity().mapsRegion].filter(Boolean).join(' '))
  const base = `https://www.google.com/maps/search/?api=1&query=${q}`
  return v.placeId ? `${base}&query_place_id=${v.placeId}` : base
}
