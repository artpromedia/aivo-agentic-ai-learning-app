import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaConfig } from './vite-pwa.config';

export default defineConfig({
  plugins: [
    react(),
    VitePWA(pwaConfig),
  ],
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
