import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 백엔드 서버 주소
        changeOrigin: true,
      },
      '/payments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/dev': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
