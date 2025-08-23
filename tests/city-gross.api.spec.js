import { test, expect } from '@playwright/test';
import constants from '../constants.json';

const CITY_GROSS_CONFIG = constants.stores.cityGross;
const CITY_GROSS_API_URL = CITY_GROSS_CONFIG.api.baseUrl + CITY_GROSS_CONFIG.api.endpoints.weeklyOffers;
const API_PARAMS = CITY_GROSS_CONFIG.api.defaultParams;

test.describe('City Gross API Tests', () => {
  test('should return weekly offers successfully', async ({ request }) => {
    const headers = CITY_GROSS_CONFIG.api.headers;

    const url = new URL(CITY_GROSS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { headers });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('should return valid product structure', async ({ request }) => {
    const headers = CITY_GROSS_CONFIG.api.headers;

    const url = new URL(CITY_GROSS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { headers });
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const firstProduct = data.items[0];
      
      // Check for expected product properties
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('productStoreDetails');
      
      if (firstProduct.productStoreDetails) {
        expect(firstProduct.productStoreDetails).toHaveProperty('prices');
      }
    }
  });

  test('should handle request with timeout', async ({ request }) => {
    const headers = CITY_GROSS_CONFIG.api.headers;

    const url = new URL(CITY_GROSS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { 
      headers,
      timeout: CITY_GROSS_CONFIG.api.timeout
    });
    
    expect(response.status()).toBeLessThan(500);
  });

  test('should return response within reasonable time', async ({ request }) => {
    const headers = CITY_GROSS_CONFIG.api.headers;

    const url = new URL(CITY_GROSS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const startTime = Date.now();
    const response = await request.get(url.toString(), { headers });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
    expect(response.status()).toBeLessThan(500);
  });
});