import 'dotenv/config'
import express from 'express'
import { createApiApp } from './app.js'

// Standalone / production server: API + (if built) the static front-end.
// In dev, the API is mounted directly into Vite (see vite.config.js), so you
// normally just run `npm run dev`.
const PORT = process.env.API_PORT || 3001

const app = createApiApp()
app.use(express.static('dist')) // serve `npm run build` output in production

app.listen(PORT, () => {
  const keyState = process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'NOT set (using curated data)'
  console.log(`[venues] API listening on :${PORT} — Google key ${keyState}`)
})
