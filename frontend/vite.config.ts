import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: "/",
  plugins: [react({ babel: { compact: true } }), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    target: ['es2020'],
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 8192,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/react-dom')) return 'react-dom-vendor';
          if (id.includes('node_modules/react-router-dom')) return 'router-vendor';
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion-vendor';
          if (id.includes('node_modules/lucide')) return 'icons-vendor';
          if (id.includes('node_modules/swr')) return 'swr-vendor';
        },
      },
    },
  },
  server: {
    port: 3000,
    hmr: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
