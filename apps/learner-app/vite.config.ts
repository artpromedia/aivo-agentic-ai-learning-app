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
