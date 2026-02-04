import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000/play/',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
