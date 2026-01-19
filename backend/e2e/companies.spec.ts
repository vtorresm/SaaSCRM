import { test, expect } from '@playwright/test';

test.describe('Companies API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testCompanyId: string;

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

  test('should create a new company', async ({ request }) => {
    const companyData = {
      name: `Test Company ${Date.now()}`,
      legalName: `Test Company S.A.C. ${Date.now()}`,
      taxId: `20${Math.floor(Math.random() * 100000000)}9`,
      email: `contact${Date.now()}@testcompany.com`,
      phone: '+51 999 888 777',
      address: 'Av. Test 123',
      city: 'Lima',
      country: 'Perú',
      paymentTerms: 30,
      currency: 'PEN'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: companyData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.name).toBe(companyData.name);
    expect(body.email).toBe(companyData.email);
    testCompanyId = body.id;
  });

  test('should get all companies', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should get company by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/companies/${testCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testCompanyId);
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('email');
  });

  test('should update company', async ({ request }) => {
    const updateData = {
      name: `Updated Company ${Date.now()}`,
      phone: '+51 999 777 666',
      address: 'Updated Address 456'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/companies/${testCompanyId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe(updateData.name);
    expect(body.phone).toBe(updateData.phone);
  });

  test('should filter companies by status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/companies/status/ACTIVE`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should search companies', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/companies/search?q=Test`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should soft delete company', async ({ request }) => {
    const response = await request.delete(`${baseURL}/${apiPrefix}/companies/${testCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('deletedAt');
  });

  test('should reject unauthorized access', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should validate required fields on creation', async ({ request }) => {
    const invalidData = {
      // Missing required fields like name
      email: 'test@example.com'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
  });
});