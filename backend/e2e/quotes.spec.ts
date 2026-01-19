import { test, expect } from '@playwright/test';

test.describe('Quotes API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testCompanyId: string;
  let testQuoteId: string;

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

    // Create a test company for quotes
    const companyResponse = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: `Quote Test Company ${Date.now()}`,
        legalName: `Quote Test Company S.A.C. ${Date.now()}`,
        taxId: `20${Math.floor(Math.random() * 100000000)}9`,
        email: `quote${Date.now()}@testcompany.com`,
        phone: '+51 999 888 777'
      }
    });

    if (companyResponse.status() === 201) {
      const companyData = await companyResponse.json();
      testCompanyId = companyData.id;
    }
  });

  test('should create a new quote', async ({ request }) => {
    const quoteData = {
      title: `Desarrollo de Sistema ${Date.now()}`,
      description: 'Implementación completa de sistema personalizado',
      clientId: testCompanyId,
      assignedToId: null, // Will be set if we have a user
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'HIGH',
      items: [
        {
          description: 'Desarrollo backend',
          quantity: 80,
          unitPrice: 150,
          taxRate: 0.18,
          discount: 0
        },
        {
          description: 'Desarrollo frontend',
          quantity: 60,
          unitPrice: 120,
          taxRate: 0.18,
          discount: 0
        }
      ]
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/quotes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: quoteData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.title).toBe(quoteData.title);
    expect(body).toHaveProperty('quoteNumber');
    expect(body).toHaveProperty('totalAmount');
    expect(body.items).toHaveLength(2);
    testQuoteId = body.id;
  });

  test('should get all quotes', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should get quote by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testQuoteId);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('client');
  });

  test('should update quote', async ({ request }) => {
    const updateData = {
      title: `Updated Quote ${Date.now()}`,
      description: 'Updated description',
      priority: 'URGENT'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.title).toBe(updateData.title);
    expect(body.priority).toBe(updateData.priority);
  });

  test('should send quote', async ({ request }) => {
    const response = await request.post(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}/send`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  test('should accept quote', async ({ request }) => {
    const response = await request.patch(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}/status`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        status: 'ACCEPTED'
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ACCEPTED');
  });

  test('should get quotes by client', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes/company/${testCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should filter quotes by status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes/status/ACCEPTED`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should search quotes', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes/search?q=Desarrollo`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should soft delete quote', async ({ request }) => {
    const response = await request.delete(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('deletedAt');
  });

  test('should reject quote creation without client', async ({ request }) => {
    const invalidData = {
      title: 'Invalid Quote',
      description: 'This should fail',
      items: []
      // Missing clientId
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/quotes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
  });

  test('should reject unauthorized access', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/quotes`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });
});