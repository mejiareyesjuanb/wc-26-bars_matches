import 'dotenv/config'
import express from 'express'
import { BARS } from '../src/data/bars.js'
import { MATCHES } from '../src/data/matches.js'
import { getCityConfig, DEFAULT_CITY } from '../src/data/cities.js'
import { icsForMatches } from '../src/lib/calendar.js'
import { decorateCurated } from './neighborhoods.js'
import { VENUES_SNAPSHOT } from './venuesSnapshot.js'

const curated = (city) => decorateCurated(BARS, city)

// Venues are precomputed (Google Places + baked website "screens / World Cup"
// checks) by scripts/build-venues.mjs and committed to venuesSnapshot.js, so the
// app serves them instantly with no runtime Places/website calls (and no API key).
// Cities without a snapshot fall back to the bundled curated list.
function getVenues(cityId) {
  const city = getCityConfig(cityId)
  const snap = VENUES_SNAPSHOT[city.id]
  if (snap && snap.venues && snap.venues.length) {
    return { venues: snap.venues, source: 'snapshot', reason: null }
  }
  return { venues: curated(city), source: 'curated', reason: 'no_snapshot' }
}

// Build the API as an Express app so it can run standalone (server/index.js)
// or be mounted as Vite dev middleware (vite.config.js) — one source of truth.
export function createApiApp() {
  const app = express()
  app.use(express.json())

  app.get('/api/venues', (req, res) => {
    const cityId = typeof req.query.city === 'string' ? req.query.city : DEFAULT_CITY
    const { venues, source, reason } = getVenues(cityId)
    res.json({ venues, source, reason: reason ?? null, detail: null, count: venues.length, city: getCityConfig(cityId).id })
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
