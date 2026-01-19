import { test, expect } from '@playwright/test';

test.describe('Authentication API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';

  test('should register a new user', async ({ request }) => {
    const response = await request.post(`${baseURL}/${apiPrefix}/auth/register`, {
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: `test${Date.now()}@example.com`,
        password: 'Test123!',
        role: 'SALES_REP'
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('firstName');
  });

  test('should login with valid credentials', async ({ request }) => {
    // First register a user
    const email = `login${Date.now()}@example.com`;
    await request.post(`${baseURL}/${apiPrefix}/auth/register`, {
      data: {
        firstName: 'Login',
        lastName: 'Test',
        email,
        password: 'Login123!',
        role: 'SALES_REP'
      }
    });

    // Then login
    const response = await request.post(`${baseURL}/${apiPrefix}/auth/login`, {
      data: {
        email,
        password: 'Login123!'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
    expect(body).toHaveProperty('user');
  });

  test('should reject invalid login', async ({ request }) => {
    const response = await request.post(`${baseURL}/${apiPrefix}/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
  });
});