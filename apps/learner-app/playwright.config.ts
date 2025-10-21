import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3003',
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.E2E_WEB_SERVER_CMD || 'pnpm dev',
    port: Number(process.env.E2E_PORT || 3003),
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
