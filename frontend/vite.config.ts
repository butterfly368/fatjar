import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'https://testnet.opnet.org',
        changeOrigin: true,
      },
    },
  },
})
