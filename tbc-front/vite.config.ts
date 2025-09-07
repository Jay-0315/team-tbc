import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.219.70:8080',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://192.168.219.70:8080',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://192.168.219.70:8080',
        changeOrigin: true,
      },
    },
  },
})
