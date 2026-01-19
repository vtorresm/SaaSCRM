import { test, expect } from '@playwright/test';

test.describe('Reports API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    // Login as admin to get token
    const loginResponse = await request.post(`${baseURL}/${apiPrefix}/auth/login`, {
      data: {
        email: 'admin@example.com',
        password: 'Admin123!'
      }
    });

    if (loginResponse.status() === 200) {
      const loginData = await loginResponse.json();
      adminToken = loginData.access_token;
    } else {
      // If admin doesn't exist, register one
      const registerResponse = await request.post(`${baseURL}/${apiPrefix}/auth/register`, {
        data: {
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: 'Admin123!',
          role: 'SUPER_ADMIN'
        }
      });
      const registerData = await registerResponse.json();
      adminToken = registerData.access_token;
    }
  });

  test('should generate financial report', async ({ request }) => {
    const response = await request.post(`${baseURL}/${apiPrefix}/reports/financial`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('summary');
    expect(body).toHaveProperty('generatedAt');
  });

  test('should generate revenue report', async ({ request }) => {
    const reportData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/reports/revenue`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: reportData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('period');
    expect(body).toHaveProperty('totalRevenue');
  });

  test('should generate fiscal report', async ({ request }) => {
    const reportData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/reports/fiscal`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: reportData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('title');
    expect(body).toHaveProperty('totalTaxCollected');
    expect(body).toHaveProperty('taxBreakdown');
  });

  test('should get dashboard data', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/reports/dashboard`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('invoiceStats');
    expect(body).toHaveProperty('userStats');
    expect(body).toHaveProperty('quoteStats');
    expect(body).toHaveProperty('revenueStats');
  });

  test('should generate user activity report', async ({ request }) => {
    // First create a user to get activity for
    const userResponse = await request.post(`${baseURL}/${apiPrefix}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        firstName: 'Report',
        lastName: 'User',
        email: `report${Date.now()}@example.com`,
        password: 'Test123!',
        role: 'SALES_REP'
      }
    });

    if (userResponse.status() === 201) {
      const userData = await userResponse.json();

      const response = await request.get(`${baseURL}/${apiPrefix}/users/${userData.id}/activity`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('activity');
    }
  });

  test('should reject unauthorized access to reports', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/reports/dashboard`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should validate date range for revenue report', async ({ request }) => {
    const invalidData = {
      startDate: '2024-12-31', // Start date after end date
      endDate: '2024-01-01'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/reports/revenue`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
  });
});