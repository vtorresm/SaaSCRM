import { test, expect } from '@playwright/test';

test.describe('QR Payment API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testCompanyId: string;
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

    // Create test data for QR testing
    const companyResponse = await request.post(`${baseURL}/${apiPrefix}/companies`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: `QR Test Company ${Date.now()}`,
        legalName: `QR Test Company S.A.C. ${Date.now()}`,
        taxId: `20${Math.floor(Math.random() * 100000000)}9`,
        email: `qr${Date.now()}@testcompany.com`,
        phone: '+51 999 888 777'
      }
    });

    if (companyResponse.status() === 201) {
      const companyData = await companyResponse.json();
      testCompanyId = companyData.id;

      // Create an invoice for QR testing
      const invoiceResponse = await request.post(`${baseURL}/${apiPrefix}/invoices`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        data: {
          clientId: testCompanyId,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          taxRate: 0.18,
          items: [
            {
              description: 'QR Test Service',
              quantity: 1,
              unitPrice: 100,
              taxRate: 0.18,
              taxType: 'IVA_18'
            }
          ]
        }
      });

      if (invoiceResponse.status() === 201) {
        const invoiceData = await invoiceResponse.json();
        testInvoiceId = invoiceData.id;
      }
    }
  });

  test('should generate QR code for payment', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/qr/payment/${testInvoiceId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('qrCode');
    expect(body).toHaveProperty('paymentUrl');
    expect(body).toHaveProperty('amount');
    expect(body).toHaveProperty('invoiceId');
  });

  test('should reject QR generation for non-existent invoice', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/qr/payment/non-existent-id`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(404);
  });

  test('should reject unauthorized access to QR generation', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/qr/payment/${testInvoiceId}`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should validate QR payment data structure', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/qr/payment/${testInvoiceId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validate QR data structure
    expect(body).toHaveProperty('qrCode');
    expect(typeof body.qrCode).toBe('string');

    expect(body).toHaveProperty('paymentUrl');
    expect(typeof body.paymentUrl).toBe('string');

    expect(body).toHaveProperty('amount');
    expect(typeof body.amount).toBe('number');
    expect(body.amount).toBeGreaterThan(0);

    expect(body).toHaveProperty('invoiceId');
    expect(body.invoiceId).toBe(testInvoiceId);

    expect(body).toHaveProperty('clientName');
    expect(body).toHaveProperty('invoiceNumber');
  });
});