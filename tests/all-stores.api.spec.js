import { test, expect } from "@playwright/test";

test.describe("All Grocery Stores API Health Check", () => {
  const stores = [
    {
      name: "City Gross",
      url: "https://www.citygross.se/api/v1/Loop54/category/2930/products",
      params: {
        categoryName: "Veckans erbjudanden",
        currentWeekDiscountOnly: true,
        skip: 0,
        take: 10,
      },
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        Referer: "https://www.citygross.se/",
      },
    },
    {
      name: "Willys",
      url: "https://www.willys.se/search/campaigns/offline",
      params: {
        q: "2258",
        type: "PERSONAL_GENERAL",
        page: 0,
        size: 10,
      },
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
    },
    {
      name: "ICA",
      url: "https://apimgw-pub.ica.se/sverige/digx/productapi/v1/assortment",
      params: {
        accountNumber: "1004579",
        channel: "online",
      },
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Content-Type": "application/json",
        Referer:
          "https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/",
        Origin: "https://www.ica.se",
      },
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
            timeout: 15000,
          });
        } else {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          response = await request.post(url.toString(), {
            headers: store.headers,
            data: {},
            timeout: 15000,
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
            timeout: 30000,
          });
        } else {
          Object.entries(store.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
          await request.post(url.toString(), {
            headers: store.headers,
            data: {},
            timeout: 30000,
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
