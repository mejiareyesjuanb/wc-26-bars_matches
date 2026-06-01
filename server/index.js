import 'dotenv/config'
import express from 'express'
import { BARS } from '../src/data/bars.js'
import { SIGNALS } from './venueSignals.js'
import { fetchSeattleVenues } from './places.js'
import { mergeVenue } from './merge.js'
import { nearestNeighborhood } from './neighborhoods.js'

// Dedicated var (NOT generic PORT, which dev tools often set for the web server).
const PORT = process.env.API_PORT || 3001
const TTL_MS = 6 * 60 * 60 * 1000 // cache live results 6h to limit API cost
let cache = null // { at, venues, source }

async function getVenues() {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return { venues: BARS, source: 'curated' }
  if (cache && Date.now() - cache.at < TTL_MS) return cache
  try {
    const places = await fetchSeattleVenues(key)
    if (!places.length) throw new Error('no places returned')
    const venues = places.map((p) =>
      mergeVenue(p, nearestNeighborhood(p.lat, p.lng), SIGNALS),
    )
    cache = { at: Date.now(), venues, source: 'google' }
    return cache
  } catch (e) {
    console.error('[venues] falling back to curated:', e.message)
    return { venues: BARS, source: 'curated' }
  }
}

const app = express()

app.get('/api/venues', async (_req, res) => {
  const { venues, source } = await getVenues()
  res.json({ venues, source, count: venues.length })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, keyConfigured: !!process.env.GOOGLE_MAPS_API_KEY })
})

app.listen(PORT, () => {
  const keyState = process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'NOT set (using curated data)'
  console.log(`[venues] API listening on :${PORT} — Google key ${keyState}`)
})
