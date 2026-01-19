import { test, expect } from '@playwright/test';

test.describe('Contacts API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testCompanyId: string;
  let testContactId: string;

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

    // Create a test company for contacts
    const companyResponse = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: `Contact Test Company ${Date.now()}`,
        legalName: `Contact Test Company S.A.C. ${Date.now()}`,
        taxId: `20${Math.floor(Math.random() * 100000000)}9`,
        email: `contact${Date.now()}@testcompany.com`,
        phone: '+51 999 888 777'
      }
    });

    if (companyResponse.status() === 201) {
      const companyData = await companyResponse.json();
      testCompanyId = companyData.id;
    }
  });

  test('should create a new contact', async ({ request }) => {
    const contactData = {
      firstName: 'María',
      lastName: 'González',
      email: `maria.gonzalez${Date.now()}@example.com`,
      phone: '+51 999 777 666',
      position: 'Gerente de IT',
      companyId: testCompanyId
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/contacts`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: contactData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.firstName).toBe(contactData.firstName);
    expect(body.email).toBe(contactData.email);
    expect(body.companyId).toBe(testCompanyId);
    testContactId = body.id;
  });

  test('should get all contacts', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should get contact by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts/${testContactId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testContactId);
    expect(body).toHaveProperty('firstName');
    expect(body).toHaveProperty('company');
  });

  test('should update contact', async ({ request }) => {
    const updateData = {
      firstName: 'María José',
      position: 'Directora de IT',
      phone: '+51 999 666 555'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/contacts/${testContactId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstName).toBe(updateData.firstName);
    expect(body.position).toBe(updateData.position);
  });

  test('should get contacts by company', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts/company/${testCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].companyId).toBe(testCompanyId);
  });

  test('should filter contacts by status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts/status/ACTIVE`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should search contacts', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts/search?q=María`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should soft delete contact', async ({ request }) => {
    const response = await request.delete(`${baseURL}/${apiPrefix}/contacts/${testContactId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('deletedAt');
  });

  test('should reject contact creation without company', async ({ request }) => {
    const invalidData = {
      firstName: 'Invalid',
      lastName: 'Contact',
      email: 'invalid@example.com'
      // Missing companyId
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/contacts`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
  });

  test('should reject unauthorized access', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/contacts`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });
});