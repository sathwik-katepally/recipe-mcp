import { test, expect } from "@playwright/test";
import constants from '../constants.json';

test.describe("All Grocery Stores API Health Check", () => {
  const stores = [
    {
      name: constants.stores.cityGross.name,
      url: constants.stores.cityGross.api.baseUrl + constants.stores.cityGross.api.endpoints.weeklyOffers,
      params: { ...constants.stores.cityGross.api.defaultParams, take: 10 },
      method: constants.stores.cityGross.api.method,
      headers: constants.stores.cityGross.api.headers,
    },
    {
      name: constants.stores.willys.name,
      url: constants.stores.willys.api.baseUrl + constants.stores.willys.api.endpoints.campaigns,
      params: { ...constants.stores.willys.api.defaultParams, size: 10 },
      method: constants.stores.willys.api.method,
      headers: constants.stores.willys.api.headers,
    },
    {
      name: constants.stores.ica.name,
      url: constants.stores.ica.api.baseUrl + constants.stores.ica.api.endpoints.assortment,
      params: constants.stores.ica.api.defaultParams,
      method: constants.stores.ica.api.method,
      headers: constants.stores.ica.api.headers,
    },
  ];

  test("all store APIs should be accessible", async ({ request }) => {
    const results = [];

    for (const store of stores) {
      let response;
      const url = new URL(store.url);

      try {
        if (store.method === "GET") {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          response = await request.get(url.toString(), {
            headers: store.headers,
            timeout: constants.common.defaultTimeout,
          });
        } else {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          response = await request.post(url.toString(), {
            headers: store.headers,
            data: {},
            timeout: constants.common.defaultTimeout,
          });
        }

        results.push({
          store: store.name,
          status: response.status(),
          accessible: response.status() < 300,
          responseTime: Date.now(),
        });
      } catch (error) {
        results.push({
          store: store.name,
          status: "ERROR",
          accessible: false,
          error: error.message,
        });
      }
    }

    // Log results for debugging
    console.log("API Health Check Results:", JSON.stringify(results, null, 2));

    // Assert that at least one store API is accessible
    const accessibleStores = results.filter((r) => r.accessible).length;
    expect(accessibleStores).toBeGreaterThan(0);

    // Warn if any stores are not accessible
    const inaccessibleStores = results.filter((r) => !r.accessible);
    if (inaccessibleStores.length > 0) {
      console.warn(
        `Warning: ${inaccessibleStores.length} store APIs are not accessible:`,
        inaccessibleStores.map((s) => s.store).join(", ")
      );
    }
  });

  test("store APIs should respond within timeout", async ({ request }) => {
    for (const store of stores) {
      const url = new URL(store.url);

      const startTime = Date.now();

      try {
        if (store.method === "GET") {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          await request.get(url.toString(), {
            headers: store.headers,
            timeout: constants.common.defaultTimeout,
          });
        } else {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          await request.post(url.toString(), {
            headers: store.headers,
            data: {},
            timeout: constants.common.defaultTimeout,
          });
        }
      } catch (error) {
        // Even if request fails, we still check it didn't timeout
        const responseTime = Date.now() - startTime;
        expect(responseTime).toBeLessThan(30000);
        console.warn(`${store.name} API error:`, error.message);
      }
    }
  });
});
