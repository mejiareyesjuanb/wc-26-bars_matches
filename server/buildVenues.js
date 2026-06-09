// Build a city's fully-baked venue list: fetch from Google Places, assign each
// venue a neighborhood, and bake in the website "screens / World Cup" check.
// Used by scripts/build-venues.mjs to precompute the committed snapshot — the app
// then serves that snapshot instantly with no runtime Places/website calls.
import { fetchCityVenues } from './places.js'
import { mergeVenue } from './merge.js'
import { nearestNeighborhood } from './neighborhoods.js'
import { checkVenue } from './enrich.js'
import { SIGNALS } from './venueSignals.js'

// Bounded-concurrency map (avoid opening too many sockets at once).
async function mapLimit(items, limit, fn) {
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      await fn(items[idx])
    }
  })
  await Promise.all(workers)
}

// Assign a neighborhood (and borough for two-level cities) to a normalized place,
// mirroring the rules the live server used. Pure.
function placeToVenue(city, p) {
  let neighborhood
  let borough = null
  if (city.centroids) {
    neighborhood = nearestNeighborhood(p.lat, p.lng, city.centroids, 3)
    if (city.twoLevel && city.boroughOf) borough = city.boroughOf[neighborhood] || null
  } else if (city.twoLevel) {
    borough = p.sublocality || null
    neighborhood = p.fineArea || p.descriptorArea || p.sublocality || null
  } else {
    neighborhood = p.descriptorArea || p.sublocality || p.fineArea || null
  }
  return mergeVenue({ ...p, borough }, neighborhood, SIGNALS)
}

// Fetch + map + enrich one city. Returns { venues, source, reason }.
export async function buildCityVenues(city, key) {
  const places = await fetchCityVenues(city, key)
  if (!places.length) return { venues: [], source: 'curated', reason: 'no_results' }
  const venues = places.map((p) => placeToVenue(city, p))

  // Bake the website check into EVERY venue that has a site (one-time build, so we
  // enrich them all — a sports-tagged restaurant like Kangaroo & Kiwi or a
  // WC-confirmed venue must get its check to be included/badged). Only attach a
  // `check` when it carries a positive signal (keeps the snapshot lean; a missing
  // check reads as "not confirmed / no screens", same as an all-null result).
  const candidates = venues.filter((v) => v.website)
  await mapLimit(candidates, 24, async (v) => {
    const check = await checkVenue(v.website)
    if (check && (check.screens === true || check.worldCup === true)) {
      v.check = { screens: check.screens, worldCup: check.worldCup, evidence: check.evidence || null }
    }
  })
  return { venues, source: 'google', reason: null }
}
