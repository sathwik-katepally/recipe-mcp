import { test, expect } from '@playwright/test';

const CITY_GROSS_API_URL = 'https://www.citygross.se/api/v1/Loop54/category/2930/products';
const API_PARAMS = {
  categoryName: 'Veckans erbjudanden',
  currentWeekDiscountOnly: true,
  skip: 0,
  take: 50
};

test.describe('City Gross API Tests', () => {
  test('should return weekly offers successfully', async ({ request }) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.citygross.se/'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.citygross.se/'
    };

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
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.citygross.se/'
    };

    const url = new URL(CITY_GROSS_API_URL);
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
      'Accept': 'application/json',
      'Referer': 'https://www.citygross.se/'
    };

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