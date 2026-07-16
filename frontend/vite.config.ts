import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      'Content-Security-Policy':
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.twitter.com https://cdn.syndication.twimg.com; " +
        "frame-src https://platform.twitter.com https://syndication.twitter.com https://twitter.com https://x.com; " +
        "connect-src 'self' http://localhost:4000 https://api.twitter.com https://syndication.twitter.com; " +
        "img-src 'self' data: blob: http://localhost:4000 https: ; " +
        "style-src 'self' 'unsafe-inline' https://platform.twitter.com; " +
        "font-src 'self' data: https:;",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation': ['framer-motion'],
        },
      },
    },
  },
});
