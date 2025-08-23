import { defineConfig } from "@playwright/test";
import constants from './constants.json';

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html"]],
  use: {
    baseURL: process.env.BASE_URL || constants.stores.cityGross.api.baseUrl,
    trace: "off",
    screenshot: "off",
  },
  projects: [
    {
      name: "api-tests",
      testMatch: /.*\.api\.spec\.js/,
    },
  ],
  timeout: constants.common.defaultTimeout,
  expect: {
    timeout: 10000,
  },
});
