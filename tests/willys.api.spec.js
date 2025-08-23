import { test, expect } from '@playwright/test';

const WILLYS_API_URL = 'https://www.willys.se/search/campaigns/offline';
const API_PARAMS = {
  q: '2258', // Stockholm Fridhemsplan store
  type: 'PERSONAL_GENERAL',
  page: 0,
  size: 50
};

test.describe('Willys API Tests', () => {
  test('should return campaign offers successfully', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

    const url = new URL(WILLYS_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.get(url.toString(), { 
      headers,
      timeout: 30000
    });
    
    expect(response.status()).toBeLessThan(500);
  });

  test('should return response within reasonable time', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json'
    };

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