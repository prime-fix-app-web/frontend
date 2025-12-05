import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
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
})


