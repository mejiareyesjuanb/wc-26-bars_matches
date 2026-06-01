// Merge a Google Places venue with the curated World-Cup-signals overlay into
// the venue shape the ranking model consumes. Pure functions — unit tested.

export function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Map Google place types/name to our venue-type vocabulary.
export function mapType(place) {
  const t = (place.types || []).map((x) => String(x).toLowerCase())
  const n = (place.name || '').toLowerCase()
  if (n.includes('brew') || t.includes('brewery')) return 'brewery'
  if (n.includes('beer hall') || n.includes('taproom') || n.includes('biergarten') || n.includes('bier')) return 'beer hall'
  if (t.includes('sports_bar')) return 'sports bar'
  if (t.includes('pub') || n.includes('pub') || n.includes('tavern')) return 'pub'
  if (t.includes('bar') || t.includes('night_club')) return 'sports bar'
  return 'restaurant'
}

const PRICE_ENUM = {
  PRICE_LEVEL_FREE: 1, PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4,
}
export function normalizePrice(p) {
  if (typeof p === 'number') return p
  return PRICE_ENUM[p] ?? 2
}

const DEFAULT_SCREENS = { 'sports bar': 5, pub: 3, brewery: 2, 'beer hall': 4, restaurant: 1 }

// Signals we cannot get from Maps, for venues not in the curated overlay.
export function defaultSignals(type) {
  return {
    screens: DEFAULT_SCREENS[type] ?? 2,
    confirmedViewing: false,
    bigScreenOrProjector: type === 'sports bar',
    soundOnForMatches: type === 'sports bar' || type === 'pub',
    capacity: 'medium',
    fanAffinity: [],
    atmosphereTags: [],
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// place: normalized Places object {id,name,address,lat,lng,rating,userRatingCount,priceLevel,types,reservable,blurb}
// neighborhood: string. signals: map of normalizedName -> curated signals.
export function mergeVenue(place, neighborhood, signals = {}) {
  const type = mapType(place)
  const sig = signals[normalizeName(place.name)] || null
  const s = sig || defaultSignals(type)
  return {
    id: place.id,
    name: place.name,
    neighborhood,
    type,
    rating: typeof place.rating === 'number' ? place.rating : 0,
    reviewCount: place.userRatingCount || 0,
    priceLevel: normalizePrice(place.priceLevel),
    address: place.address || '',
    takesReservations:
      sig && sig.takesReservations != null ? sig.takesReservations : !!place.reservable,
    screens: s.screens,
    confirmedViewing: s.confirmedViewing,
    bigScreenOrProjector: s.bigScreenOrProjector,
    soundOnForMatches: s.soundOnForMatches,
    capacity: s.capacity,
    fanAffinity: s.fanAffinity,
    atmosphereTags: s.atmosphereTags,
    blurb: place.blurb || (sig && sig.blurb) || `${cap(type)} in ${neighborhood}.`,
    unconfirmedSignals: !sig,
  }
}
