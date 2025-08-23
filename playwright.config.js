import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"]],
  use: {
    baseURL: process.env.BASE_URL || "https://www.citygross.se",
    trace: "off",
    screenshot: "off",
  },
  projects: [
    {
      name: "api-tests",
      testMatch: /.*\.api\.spec\.js/,
    },
  ],
  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});
