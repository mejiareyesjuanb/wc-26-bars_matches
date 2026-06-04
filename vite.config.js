import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createApiApp } from './server/app.js'

// Mount the API as middleware inside the Vite dev server, so a single `vite`
// process serves both the app and /api — no separate server or proxy to desync.
function apiMiddleware() {
  return {
    name: 'wc26-api-middleware',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(createApiApp())
    },
  }
}

export default defineConfig({
  plugins: [react(), apiMiddleware()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' },
})
