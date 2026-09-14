import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Em produção a Vercel serve /camisas via `cleanUrls` (vercel.json).
// Este plugin reproduz o mesmo comportamento no servidor de desenvolvimento.
function cleanUrls() {
  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const [path, query = ''] = req.url.split('?')
        if (path === '/camisas' || path === '/camisas/') {
          req.url = '/camisas.html' + (query ? `?${query}` : '')
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), cleanUrls()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        camisas: resolve(__dirname, 'camisas.html'),
      },
    },
  },
})
