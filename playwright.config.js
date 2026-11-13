import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.APP_URL || 'http://127.0.0.1:18123',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 440, height: 956 } } },
    { name: 'webkit', use: { ...devices['iPhone 13 Pro Max'], defaultBrowserType: 'webkit', viewport: { width: 440, height: 956 } } },
  ],
  webServer: process.env.APP_URL ? undefined : {
    command: 'npm run preview',
    url: 'http://127.0.0.1:18123',
    reuseExistingServer: !process.env.CI,
  },
});
