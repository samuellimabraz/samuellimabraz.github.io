import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative path for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'framer-motion'
          ]
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // The machine is at the inotify watch limit (ENOSPC). Polling avoids that.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
