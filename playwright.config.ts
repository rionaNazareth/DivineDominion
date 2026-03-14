// =============================================================================
// DIVINE DOMINION — Playwright Configuration
// Runs visual tests in src/playtest/__tests__/visual.spec.ts
// =============================================================================

import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: 'src/playtest/__tests__',
  testMatch: '**/*.spec.ts',

  // Global timeout per test (180s to cover FTUE_COMPLETES pass condition)
  timeout: 180_000,

  // Allow retries on CI for flaky visual checks
  retries: process.env.CI ? 2 : 0,

  // Run tests in parallel (each test is independent)
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ['list'],
    ['json', { outputFile: 'playtest-results/_visual-results.json' }],
  ],

  use: {
    baseURL: BASE_URL,
    // Capture screenshots and traces on failure
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // Target iPhone 12 (primary design target per §12)
    ...devices['iPhone 12'],
    // Use headless by default; set PWDEBUG=1 to run headed
    headless: process.env.PWDEBUG !== '1',
  },

  projects: [
    {
      name: 'mobile-primary',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Expect the dev server to already be running.
  // If you want Playwright to auto-start it, uncomment webServer below:
  // webServer: {
  //   command: 'npm run dev',
  //   url: BASE_URL,
  //   reuseExistingServer: true,
  //   timeout: 30_000,
  // },
});
