import { test, expect } from '@playwright/test';

test.describe('Health Checks API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';

  test('should return healthy status for complete health check', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/health`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Check that all health indicators are present
    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');

    expect(body).toHaveProperty('info');
    expect(body.info).toHaveProperty('database');
    expect(body.info).toHaveProperty('memory_heap');
    expect(body.info).toHaveProperty('memory_rss');
    expect(body.info).toHaveProperty('storage');

    expect(body).toHaveProperty('details');
  });

  test('should return database health status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/health/database`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('info');
    expect(body.info).toHaveProperty('database');
  });

  test('should return memory health status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/health/memory`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('info');
    expect(body.info).toHaveProperty('memory_heap');
    expect(body.info).toHaveProperty('memory_rss');
  });

  test('should return disk health status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/health/disk`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
    expect(body).toHaveProperty('info');
    expect(body.info).toHaveProperty('storage');
  });
});