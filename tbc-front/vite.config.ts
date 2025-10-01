// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const API_TARGET = process.env.VITE_API_TARGET || "http://127.0.0.1:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        ws: false,
        // 모든 헤더를 백엔드로 전달
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 모든 헤더를 백엔드로 전달
            Object.keys(req.headers).forEach(key => {
              const value = req.headers[key];
              if (value && typeof value === 'string') {
                proxyReq.setHeader(key, value);
              }
            });
            
            // Authorization 헤더 특별 처리
            if (req.headers.authorization) {
              console.log('🔑 Forwarding Authorization header:', req.headers.authorization.substring(0, 30) + '...');
            }
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log(`📡 ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
          
          proxy.on('error', (err, req, _res) => {
            console.error('❌ Proxy error:', err.message, 'for', req.url);
          });
        },
      },
      "/ws": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      global: "globalthis",
    },
  },
  define: { global: "globalThis" },
});
