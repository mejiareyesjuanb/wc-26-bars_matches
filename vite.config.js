import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mount the API as middleware inside the Vite dev server, loaded through Vite's
// SSR module graph so edits to server code (merge.js, places.js, app.js, …)
// hot-reload too — no need to restart `npm run dev` after backend changes.
function apiMiddleware() {
  return {
    name: 'wc26-api-middleware',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api')) return next()
        try {
          const { createApiApp } = await server.ssrLoadModule('/server/app.js')
          createApiApp()(req, res, next)
        } catch (e) {
          next(e)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiMiddleware()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' },
})
