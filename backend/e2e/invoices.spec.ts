import { test, expect } from '@playwright/test';

test.describe('Invoices API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testCompanyId: string;
  let testQuoteId: string;
  let testInvoiceId: string;

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

    // Create a test company
    const companyResponse = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: `Invoice Test Company ${Date.now()}`,
        legalName: `Invoice Test Company S.A.C. ${Date.now()}`,
        taxId: `20${Math.floor(Math.random() * 100000000)}9`,
        email: `invoice${Date.now()}@testcompany.com`,
        phone: '+51 999 888 777'
      }
    });

    if (companyResponse.status() === 201) {
      const companyData = await companyResponse.json();
      testCompanyId = companyData.id;

      // Create an accepted quote for invoice creation
      const quoteResponse = await request.post(`${baseURL}/${apiPrefix}/quotes`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        data: {
          title: `Invoice Test Quote ${Date.now()}`,
          description: 'Quote for invoice testing',
          clientId: testCompanyId,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          priority: 'HIGH',
          items: [
            {
              description: 'Service 1',
              quantity: 10,
              unitPrice: 100,
              taxRate: 0.18,
              discount: 0
            }
          ]
        }
      });

      if (quoteResponse.status() === 201) {
        const quoteData = await quoteResponse.json();
        testQuoteId = quoteData.id;

        // Accept the quote
        await request.patch(`${baseURL}/${apiPrefix}/quotes/${testQuoteId}/status`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          data: { status: 'ACCEPTED' }
        });
      }
    }
  });

  test('should create invoice from quote', async ({ request }) => {
    const invoiceData = {
      quoteId: testQuoteId,
      createdById: null, // Will be set from token
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/invoices/from-quote`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invoiceData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('invoiceNumber');
    expect(body.quoteId).toBe(testQuoteId);
    testInvoiceId = body.id;
  });

  test('should create manual invoice', async ({ request }) => {
    const invoiceData = {
      clientId: testCompanyId,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      taxRate: 0.18,
      items: [
        {
          description: 'Manual service',
          quantity: 5,
          unitPrice: 200,
          taxRate: 0.18,
          taxType: 'IVA_18'
        }
      ]
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/invoices`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invoiceData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('invoiceNumber');
    expect(body.clientId).toBe(testCompanyId);
  });

  test('should get all invoices', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should get invoice by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testInvoiceId);
    expect(body).toHaveProperty('items');
    expect(body).toHaveProperty('client');
  });

  test('should update invoice', async ({ request }) => {
    const updateData = {
      notes: 'Updated invoice notes'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
  });

  test('should send invoice', async ({ request }) => {
    const response = await request.post(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}/send`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('message');
  });

  test('should add payment to invoice', async ({ request }) => {
    const paymentData = {
      amount: 100,
      paymentMethod: 'bank_transfer',
      transactionId: `TXN${Date.now()}`,
      notes: 'Test payment'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}/payments`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: paymentData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.amount).toBe(paymentData.amount);
  });

  test('should get invoice payments', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}/payments`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should get invoices by client', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/company/${testCompanyId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should filter invoices by status', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/status/SENT`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should get overdue invoices', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/overdue`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should search invoices', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/search?q=INV`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should get invoice statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices/stats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('totalInvoices');
    expect(body).toHaveProperty('paidInvoices');
    expect(body).toHaveProperty('outstandingAmount');
  });

  test('should soft delete invoice', async ({ request }) => {
    const response = await request.delete(`${baseURL}/${apiPrefix}/invoices/${testInvoiceId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('deletedAt');
  });

  test('should reject invoice creation without required fields', async ({ request }) => {
    const invalidData = {
      // Missing required fields
      taxRate: 0.18
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/invoices`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
  });

  test('should reject unauthorized access', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/invoices`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });
});