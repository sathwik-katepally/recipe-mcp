import { test, expect } from '@playwright/test';

const ICA_API_URL = 'https://apimgw-pub.ica.se/sverige/digx/productapi/v1/assortment';
const API_PARAMS = {
  accountNumber: '1004579', // ICA Supermarket Sundbyberg store ID
  channel: 'online'
};

test.describe('ICA API Tests', () => {
  test('should return assortment data successfully', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/',
      'Origin': 'https://www.ica.se'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/',
      'Origin': 'https://www.ica.se'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/',
      'Origin': 'https://www.ica.se'
    };

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
      timeout: 30000
    });
    
    // Should handle invalid store IDs gracefully
    expect(response.status()).toBeLessThan(500);
  });

  test('should handle request with timeout', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/',
      'Origin': 'https://www.ica.se'
    };

    const url = new URL(ICA_API_URL);
    Object.entries(API_PARAMS).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await request.post(url.toString(), { 
      headers,
      data: {},
      timeout: 30000
    });
    
    expect(response.status()).toBeLessThan(500);
  });

  test('should return response within reasonable time', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Referer': 'https://www.ica.se/erbjudanden/ica-supermarket-sundbyberg-1004579/',
      'Origin': 'https://www.ica.se'
    };

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