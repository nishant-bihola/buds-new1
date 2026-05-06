import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    target: ['es2020', 'chrome80', 'safari14', 'firefox78', 'edge88'],
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    assetsInlineLimit: 4096,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'motion-vendor';
          }
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/unified')) {
            return 'markdown-vendor';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/lucide')) {
            return 'icons-vendor';
          }
        },
      },
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
