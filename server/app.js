import 'dotenv/config'
import express from 'express'
import { BARS } from '../src/data/bars.js'
import { MATCHES } from '../src/data/matches.js'
import { getCityConfig, DEFAULT_CITY } from '../src/data/cities.js'
import { icsForMatches } from '../src/lib/calendar.js'
import { SIGNALS } from './venueSignals.js'
import { fetchCityVenues } from './places.js'
import { mergeVenue } from './merge.js'
import { nearestNeighborhood, decorateCurated } from './neighborhoods.js'
import { checkVenue } from './enrich.js'

const TTL_MS = 24 * 60 * 60 * 1000 // cache live results 24h to limit API cost
const caches = new Map() // cityId -> { at, venues, source, reason, detail }

const curated = (city) => decorateCurated(BARS, city)

async function getVenues(cityId) {
  const city = getCityConfig(cityId)
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return { venues: curated(city), source: 'curated', reason: 'no_key' }
  const cached = caches.get(city.id)
  if (cached && Date.now() - cached.at < TTL_MS) return cached
  try {
    const places = await fetchCityVenues(city, key)
    if (!places.length) {
      return { venues: curated(city), source: 'curated', reason: 'no_results' }
    }
    // Neighborhood per city mode:
    //  - Seattle (curated centroids): nearest named neighborhood.
    //  - Two-level (NYC): borough = sublocality, neighborhood = fine area (fallback borough).
    //  - Other discovered: neighborhood = sublocality (fallback fine area).
    const venues = places.map((p) => {
      let neighborhood
      let borough = null
      if (city.centroids) {
        neighborhood = nearestNeighborhood(p.lat, p.lng, city.centroids)
      } else if (city.twoLevel) {
        borough = p.sublocality || null
        neighborhood = p.fineArea || p.descriptorArea || p.sublocality || null
      } else {
        neighborhood = p.sublocality || p.fineArea || null
      }
      return mergeVenue({ ...p, borough }, neighborhood, SIGNALS)
    })
    const result = { at: Date.now(), venues, source: 'google', reason: null }
    caches.set(city.id, result)
    return result
  } catch (e) {
    console.error('[venues] falling back to curated:', e.message)
    return { venues: curated(city), source: 'curated', reason: 'api_error', detail: e.message }
  }
}

// Website-based confirmation of screens / World Cup viewing.
const screenCache = new Map() // id -> { at, result }
const SCREEN_TTL = 24 * 60 * 60 * 1000

// Run async work with bounded concurrency (avoid opening many sockets at once).
async function mapLimit(items, limit, fn) {
  const results = []
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx])
    }
  })
  await Promise.all(workers)
  return results
}

// Build the API as an Express app so it can run standalone (server/index.js)
// or be mounted as Vite dev middleware (vite.config.js) — one source of truth.
export function createApiApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/venues', async (req, res) => {
    const cityId = typeof req.query.city === 'string' ? req.query.city : DEFAULT_CITY
    const { venues, source, reason, detail } = await getVenues(cityId)
    res.json({ venues, source, reason: reason ?? null, detail: detail ?? null, count: venues.length, city: getCityConfig(cityId).id })
  })

  app.post('/api/venue-screens', async (req, res) => {
    const venues = Array.isArray(req.body?.venues) ? req.body.venues.slice(0, 100) : []
    const checks = {}
    await mapLimit(venues, 10, async (v) => {
      if (!v || !v.id) return
      const cached = screenCache.get(v.id)
      if (cached && Date.now() - cached.at < SCREEN_TTL) {
        checks[v.id] = cached.result
        return
      }
      const result = await checkVenue(v.website)
      screenCache.set(v.id, { at: Date.now(), result })
      checks[v.id] = result
    })
    res.json({ checks })
  })

  // Serve an .ics for all matches (?set=all) or a subset (?ids=M001,M002).
  // Used for the iOS "open as a link" path so Safari hands it to Apple Calendar.
  app.get('/api/calendar.ics', (req, res) => {
    const idsParam = typeof req.query.ids === 'string' ? req.query.ids : ''
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean)
    let matches
    if (ids.length) {
      const wanted = new Set(ids)
      matches = MATCHES.filter((m) => wanted.has(m.id))
    } else {
      matches = MATCHES // default / ?set=all
    }
    if (!matches.length) {
      res.status(400).type('text/plain').send('No matching matches')
      return
    }
    const lang = req.query.lang === 'es' ? 'es' : 'en'
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', 'inline; filename="wc2026-matches.ics"')
    res.send(icsForMatches(matches, lang))
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, keyConfigured: !!process.env.GOOGLE_MAPS_API_KEY })
  })

  return app
}
