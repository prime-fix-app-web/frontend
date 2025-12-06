import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => ({
  plugins: [
    vue(),
    // Only enable Vue DevTools in development to avoid Node localStorage errors
    ...(mode === 'development' ? [(await import('vite-plugin-vue-devtools')).default()] : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      // Proxy para el backend AWS (evita CORS en desarrollo)
      '/api/v1': {
        target: 'https://ftye3mrjt4.us-east-2.awsapprunner.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
}))


