import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for PRODUCTION testing
 * Does not start local dev servers - tests against deployed site
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run sequentially for production tests
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'test-results/html' }], ['list']],
  use: {
    baseURL: 'https://whitepine-tech.com',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  // NO webServer - we're testing production!
});
