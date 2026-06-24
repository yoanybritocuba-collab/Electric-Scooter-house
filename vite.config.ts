import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // 🔥 PROXY: Redirige /api/chat al servidor local en puerto 3001
    proxy: {
      '/api/chat': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    hmr: {
      overlay: false,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Security-Policy': [
        "default-src 'self'",
        "connect-src 'self' http://localhost:3001 ws://localhost:3001 https://*.firebaseapp.com https://*.googleapis.com https://*.firebasestorage.app https://identitytoolkit.googleapis.com https://firestore.googleapis.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https://* http://*",
        "font-src 'self' data: https://fonts.gstatic.com",
        "frame-src 'self'"
      ].join('; ')
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));