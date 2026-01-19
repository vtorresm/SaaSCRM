import { test, expect } from '@playwright/test';

test.describe('Users API', () => {
  const baseURL = process.env.BASE_URL || 'http://localhost:3001';
  const apiPrefix = 'api/v1';
  let adminToken: string;
  let testUserId: string;

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

  test('should create a new user', async ({ request }) => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `testuser${Date.now()}@example.com`,
      password: 'Test123!',
      role: 'SALES_REP'
    };

    const response = await request.post(`${baseURL}/${apiPrefix}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: userData
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.firstName).toBe(userData.firstName);
    expect(body.email).toBe(userData.email);
    testUserId = body.id;
  });

  test('should get all users', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  test('should get user by ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/users/${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(testUserId);
    expect(body).toHaveProperty('firstName');
    expect(body).toHaveProperty('email');
  });

  test('should update user profile', async ({ request }) => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+51 999 888 777'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/users/${testUserId}/profile`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: updateData
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.firstName).toBe(updateData.firstName);
    expect(body.lastName).toBe(updateData.lastName);
  });

  test('should update user password', async ({ request }) => {
    const passwordData = {
      currentPassword: 'Test123!',
      newPassword: 'NewTest123!',
      confirmPassword: 'NewTest123!'
    };

    const response = await request.put(`${baseURL}/${apiPrefix}/users/${testUserId}/password`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: passwordData
    });

    expect(response.status()).toBe(200);
  });

  test('should find user by email', async ({ request }) => {
    const testEmail = `testuser${Date.now()}@example.com`;

    // Create user first
    await request.post(`${baseURL}/${apiPrefix}/users`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        firstName: 'Email',
        lastName: 'Test',
        email: testEmail,
        password: 'Test123!',
        role: 'SALES_REP'
      }
    });

    const response = await request.get(`${baseURL}/${apiPrefix}/users/email/${testEmail}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.email).toBe(testEmail);
  });

  test('should search users', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/users/search?q=Test`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('should get user statistics', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/users/stats`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('totalUsers');
    expect(body).toHaveProperty('activeUsers');
    expect(body).toHaveProperty('usersByRole');
  });

  test('should soft delete user', async ({ request }) => {
    const response = await request.delete(`${baseURL}/${apiPrefix}/users/${testUserId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('deletedAt');
  });

  test('should reject unauthorized access', async ({ request }) => {
    const response = await request.get(`${baseURL}/${apiPrefix}/users`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });
});