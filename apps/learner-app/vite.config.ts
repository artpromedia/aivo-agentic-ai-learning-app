import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfig } from './vite-pwa.config';
import path from 'path';

export default defineConfig({
  plugins: [
    // @ts-expect-error - Vite version mismatch in TS cache (false positive)
    react(),
    // @ts-expect-error - Vite version mismatch in TS cache (false positive)
    VitePWA(pwaConfig),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // UI/Animation libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/react-confetti')) {
            return 'ui-vendor';
          }
          
          // PDF generation
          if (id.includes('node_modules/jspdf')) {
            return 'pdf-vendor';
          }
          
          // Other large vendor libraries
          if (id.includes('node_modules') && !id.includes('node_modules/@aivo')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 3003,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
