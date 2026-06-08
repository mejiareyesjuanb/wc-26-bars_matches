// Merge a Google Places venue with the curated World-Cup-signals overlay into
// the venue shape the ranking model consumes. Pure functions — unit tested.

export function normalizeName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

// Venue category from Google's primaryType — the SOURCE OF TRUTH — so a
// Mexican restaurant tagged with a secondary `sports_bar` type is still a
// restaurant. Falls back to the types array only when primaryType is absent.
export function categoryOf(place) {
  const pt = (place.primaryType || '').toLowerCase()
  if (pt) return pt.replace(/_/g, ' ') // e.g. mexican_restaurant -> "mexican restaurant"
  const t = (place.types || []).map((x) => String(x).toLowerCase())
  if (t.includes('sports_bar')) return 'sports bar'
  if (t.includes('pub')) return 'pub'
  if (t.includes('brewery')) return 'brewery'
  if (t.includes('bar')) return 'bar'
  if (t.some((x) => x.includes('restaurant'))) return 'restaurant'
  return 'venue'
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
// Strong bar signals in the raw Google `types` array (NOT plain 'bar', which many
// restaurants carry). Used to recognize gastropubs typed as a restaurant (e.g.
// Kangaroo & Kiwi → australian_restaurant + sports_bar/pub) while excluding
// fine-dining restaurants that merely have a 'bar'.
const STRONG_BAR_TYPES = ['sports_bar', 'pub', 'brewery', 'bar_and_grill']

export function mergeVenue(place, neighborhood, signals = {}) {
  const type = categoryOf(place) // category from Places primaryType (source of truth)
  const sig = signals[normalizeName(place.name)] || null
  const s = sig || defaultSignals(type)
  const rawTypes = place.types || []
  return {
    id: place.id,
    placeId: place.id,
    name: place.name,
    neighborhood,
    borough: place.borough ?? null,
    type,
    barType: STRONG_BAR_TYPES.some((t) => rawTypes.includes(t)), // strong bar signal in types[]
    sportsType: rawTypes.includes('sports_bar'),
    fineDining: rawTypes.includes('fine_dining_restaurant'),
    primaryType: place.primaryType || null,
    googleSportsBar: !!place.sportsBarMatch, // appeared in a "sports bars in …" query
    lat: place.lat,
    lng: place.lng,
    website: place.website,
    googleMapsUri: place.googleMapsUri,
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
    blurb: place.blurb || (sig && sig.blurb) || (neighborhood ? `${cap(type)} in ${neighborhood}.` : `${cap(type)}.`),
    unconfirmedSignals: !sig,
  }
}
