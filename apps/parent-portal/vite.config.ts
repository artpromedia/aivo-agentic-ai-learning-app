import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
