import 'dotenv/config'
import express from 'express'
import { BARS } from '../src/data/bars.js'
import { SIGNALS } from './venueSignals.js'
import { fetchSeattleVenues } from './places.js'
import { mergeVenue } from './merge.js'
import { nearestNeighborhood, decorateCurated } from './neighborhoods.js'
import { checkVenue } from './enrich.js'

// Dedicated var (NOT generic PORT, which dev tools often set for the web server).
const PORT = process.env.API_PORT || 3001
const TTL_MS = 6 * 60 * 60 * 1000 // cache live results 6h to limit API cost
let cache = null // { at, venues, source }

const curated = () => decorateCurated(BARS)

async function getVenues() {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return { venues: curated(), source: 'curated', reason: 'no_key' }
  if (cache && Date.now() - cache.at < TTL_MS) return cache
  try {
    const places = await fetchSeattleVenues(key)
    if (!places.length) {
      return { venues: curated(), source: 'curated', reason: 'no_results' }
    }
    const venues = places.map((p) =>
      mergeVenue(p, nearestNeighborhood(p.lat, p.lng), SIGNALS),
    )
    cache = { at: Date.now(), venues, source: 'google', reason: null }
    return cache
  } catch (e) {
    console.error('[venues] falling back to curated:', e.message)
    return { venues: curated(), source: 'curated', reason: 'api_error', detail: e.message }
  }
}

const app = express()
app.use(express.json())

app.get('/api/venues', async (_req, res) => {
  const { venues, source, reason, detail } = await getVenues()
  res.json({ venues, source, reason: reason ?? null, detail: detail ?? null, count: venues.length })
})

// Confirm sports screens / World Cup viewing from venue websites.
const screenCache = new Map() // id -> { at, result }
const SCREEN_TTL = 24 * 60 * 60 * 1000

app.post('/api/venue-screens', async (req, res) => {
  const venues = Array.isArray(req.body?.venues) ? req.body.venues.slice(0, 12) : []
  const checks = {}
  await Promise.all(
    venues.map(async (v) => {
      if (!v || !v.id) return
      const cached = screenCache.get(v.id)
      if (cached && Date.now() - cached.at < SCREEN_TTL) {
        checks[v.id] = cached.result
        return
      }
      const result = await checkVenue(v.website)
      screenCache.set(v.id, { at: Date.now(), result })
      checks[v.id] = result
    }),
  )
  res.json({ checks })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, keyConfigured: !!process.env.GOOGLE_MAPS_API_KEY })
})

app.listen(PORT, () => {
  const keyState = process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'NOT set (using curated data)'
  console.log(`[venues] API listening on :${PORT} — Google key ${keyState}`)
})
