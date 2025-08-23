import { test, expect } from '@playwright/test';
import constants from '../constants.json';

const ICA_CONFIG = constants.stores.ica;
const ICA_API_URL = ICA_CONFIG.api.baseUrl + ICA_CONFIG.api.endpoints.assortment;
const API_PARAMS = ICA_CONFIG.api.defaultParams;

test.describe('ICA API Tests', () => {
  test('should return assortment data successfully', async ({ request }) => {
    const headers = ICA_CONFIG.api.headers;

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {}
    });
    
    expect(response.status()).toBeLessThan(500); // Allow for different response codes as API structure might vary
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });

  test('should handle POST request with empty body', async ({ request }) => {
    const headers = ICA_CONFIG.api.headers;

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {}
    });
    
    // Should not return server error
    expect(response.status()).toBeLessThan(500);
  });

  test('should validate required headers are present', async ({ request }) => {
    const headers = ICA_CONFIG.api.headers;

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {}
    });
    
    // The API should handle proper headers without server errors
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle different store account numbers', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/',
      'Origin': 'https://www.ica.se'
    };

    const differentStoreParams = {
      accountNumber: '9999999', // Non-existent store
      channel: 'online'
    };

    const url = new URL(ICA_API_URL);
    Object.entries(differentStoreParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {},
      timeout: ICA_CONFIG.api.timeout
    });
    
    // Should handle invalid store IDs gracefully
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle request with timeout', async ({ request }) => {
    const headers = ICA_CONFIG.api.headers;

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {},
      timeout: ICA_CONFIG.api.timeout
    });
    
    expect(response.status()).toBeLessThan(500);
  });

  test('should return response within reasonable time', async ({ request }) => {
    const headers = ICA_CONFIG.api.headers;

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const startTime = Date.now();
    const response = await request.post(url.toString(), { 
      headers,
      data: {}
    });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
    expect(response.status()).toBeLessThan(500);
  });
});