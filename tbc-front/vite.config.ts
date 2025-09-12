// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",   // 백엔드 주소
        changeOrigin: true,
      },
      "/ws":  { target: "http://localhost:8080", changeOrigin: true, ws: true },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      global: "globalthis",
    },
  },
  define: {
    global: "globalThis",
  },
});
