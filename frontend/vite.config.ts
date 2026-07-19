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
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://platform.twitter.com; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' http://localhost:4000 https://zetalent-media.com https://api.twitter.com https://syndication.twitter.com https://drjhesyheyywwrtzhfrt.supabase.co; " +
        "img-src 'self' data: blob: http://localhost:4000 https:; " +
        "frame-src https://platform.twitter.com https://syndication.twitter.com https://twitter.com https://x.com;",
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
