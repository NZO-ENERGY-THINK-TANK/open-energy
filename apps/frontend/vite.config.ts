import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv, type Plugin, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { isPublicApiRequest } from './config/public-api.ts'

const frontendRoot = fileURLToPath(new URL('.', import.meta.url))
const backendRoot = fileURLToPath(new URL('../backend', import.meta.url))

export default defineConfig(({ mode }) => {
  // These unprefixed variables are read only by Node, never exposed through VITE_*.
  const env = loadEnv(mode, frontendRoot, ['UPSTREAM_ORIGIN', 'OPEN_ENERGY_API_KEY'])
  const backendEnv = loadEnv(mode, backendRoot, 'INTERNAL_API_KEY')
  const apiKey = env.OPEN_ENERGY_API_KEY || backendEnv.INTERNAL_API_KEY
  const target = env.UPSTREAM_ORIGIN || 'http://127.0.0.1:8000'
  const upstream = new URL(target)
  if (!['http:', 'https:'].includes(upstream.protocol) || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash) {
    throw new Error('UPSTREAM_ORIGIN must be an HTTP(S) origin without credentials, path, query, or fragment.')
  }

  const formPaths = new Set(['/api/submit-contact', '/api/newsletter-track'])
  const apiBoundary: Plugin = {
    name: 'website-api-boundary',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (!path.startsWith('/api/')) return next()
        let status: number | undefined
        if (path.startsWith('/api/backend/')) {
          if (!isPublicApiRequest(req.method, req.url)) status = 404
          else if (!apiKey) status = 503
        } else if (formPaths.has(path)) {
          if (req.method !== 'POST') status = 405
        } else status = 404
        if (!status) return next()
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: status === 503 ? 'Backend API key is not configured on the development server.' : 'API request is not allowed.' }))
      })
    },
  }

  const proxyOptions = (withKey: boolean): ProxyOptions => ({
    target: upstream.origin,
    changeOrigin: true,
    followRedirects: false,
    timeout: 120_000,
    proxyTimeout: 120_000,
    configure(proxy) {
      proxy.on('proxyReq', (request) => {
        request.removeHeader('authorization')
        request.removeHeader('cookie')
        request.removeHeader('x-api-key')
        if (withKey && apiKey) request.setHeader('x-api-key', apiKey)
      })
      proxy.on('proxyRes', (response) => {
        delete response.headers['x-api-key']
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400) {
          response.statusCode = 502
          delete response.headers.location
          delete response.headers.refresh
        }
      })
    },
  })

  return {
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api/backend/': {
          ...proxyOptions(true),
          rewrite: (path) => path.slice('/api/backend'.length),
        },
        '^/api/(submit-contact|newsletter-track)(\\?.*)?$': proxyOptions(false),
      },
    },
    // Preview serves static output only. Never inherit the key-bearing dev proxy.
    preview: { proxy: {} },
    plugins: [
      apiBoundary,
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {

        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
