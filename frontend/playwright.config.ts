import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build of the site talking to
 * tests/e2e/mock-api.mjs. No network, no Supabase, no Stripe.
 *
 *   npm run build && npm run test:e2e
 */
const PORT = 3100;
const MOCK = 8787;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `node tests/e2e/mock-api.mjs`,
      url: `http://127.0.0.1:${MOCK}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_API_PORT: String(MOCK) },
    },
    {
      // A cold `next start` on this repo takes well over a minute to answer
      // its first request; give it time rather than failing the whole run.
      command: `npx next start -p ${PORT}`,
      url: `http://127.0.0.1:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
    },
  ],
});
