import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createApiApp } from './app.js'

// Standalone / production server: API + the built front-end (dist/).
// In dev the API is mounted into Vite (see vite.config.js), so you run
// `npm run dev`. In production: `npm run build && npm start`.
// Hosts (Render, etc.) provide PORT; fall back to API_PORT/3001 locally.
const PORT = process.env.PORT || process.env.API_PORT || 3001

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')

const app = createApiApp()
app.use(express.static(distPath))

// Serve the SPA for any non-API GET that didn't match a static file.
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(PORT, () => {
  const keyState = process.env.GOOGLE_MAPS_API_KEY ? 'configured' : 'NOT set (using curated data)'
  console.log(`[wc26] listening on :${PORT} — Google key ${keyState}`)
})
