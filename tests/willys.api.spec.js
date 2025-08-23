import { test, expect } from '@playwright/test';
import constants from '../constants.json';

const WILLYS_CONFIG = constants.stores.willys;
const WILLYS_API_URL = WILLYS_CONFIG.api.baseUrl + WILLYS_CONFIG.api.endpoints.campaigns;
const API_PARAMS = WILLYS_CONFIG.api.defaultParams;

test.describe('Willys API Tests', () => {
  test('should return campaign offers successfully', async ({ request }) => {
    const headers = WILLYS_CONFIG.api.headers;

    const url = new URL(WILLYS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { headers });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('results');
    expect(Array.isArray(data.results)).toBe(true);
  });

  test('should return valid product structure', async ({ request }) => {
    const headers = WILLYS_CONFIG.api.headers;

    const url = new URL(WILLYS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { headers });
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const firstProduct = data.results[0];
      
      // Check for expected product properties
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('priceNoUnit');
      
      // These are optional but commonly present
      if (firstProduct.potentialPromotions) {
        expect(Array.isArray(firstProduct.potentialPromotions)).toBe(true);
      }
    }
  });

  test('should handle different store IDs', async ({ request }) => {
    const headers = WILLYS_CONFIG.api.headers;

    const differentStoreParams = {
      ...API_PARAMS,
      q: '1234' // Different store ID
    };

    const url = new URL(WILLYS_API_URL);
    Object.entries(differentStoreParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { headers });
    
    // Should still return 200 even for different store IDs
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle request with timeout', async ({ request }) => {
    const headers = WILLYS_CONFIG.api.headers;

    const url = new URL(WILLYS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { 
      headers,
      timeout: WILLYS_CONFIG.api.timeout
    });
    
    expect(response.status()).toBeLessThan(500);
  });

  test('should return response within reasonable time', async ({ request }) => {
    const headers = WILLYS_CONFIG.api.headers;

    const url = new URL(WILLYS_API_URL);
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