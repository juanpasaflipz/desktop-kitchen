/**
 * Demo Provision & Demo Login tests
 *
 * Tests the demo tenant provisioning flow and token exchange.
 */
import { describe, it, expect } from 'vitest';
import { pub } from '../setup/helpers.js';

describe('Module: Demo Provision', () => {
  const uniqueEmail = () => `demo-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.desktop.kitchen`;

  it('POST /api/demo/provision creates a demo tenant', async () => {
    const email = uniqueEmail();
    const res = await pub.post('/api/demo/provision', {
      name: 'Test User',
      email,
      restaurant_name: 'Test Taqueria',
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.subdomain).toBeTruthy();
    expect(res.data.demo_token).toBeTruthy();
    expect(res.data.demo_token_expires_at).toBeTruthy();
  });

  it('POST /api/demo/provision rejects missing required fields', async () => {
    const res = await pub.post('/api/demo/provision', {
      name: 'Test User',
      // missing email and restaurant_name
    });
    expect(res.status).toBe(400);
    expect(res.data.error).toBeTruthy();
  });

  it('POST /api/demo/provision rejects invalid email', async () => {
    const res = await pub.post('/api/demo/provision', {
      name: 'Test User',
      email: 'not-an-email',
      restaurant_name: 'Bad Email Taqueria',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/demo/provision returns 409 for duplicate email', async () => {
    const email = uniqueEmail();
    // First provision
    const res1 = await pub.post('/api/demo/provision', {
      name: 'User One',
      email,
      restaurant_name: 'Taqueria Uno',
    });
    expect(res1.status).toBe(201);

    // Second provision with same email
    const res2 = await pub.post('/api/demo/provision', {
      name: 'User Two',
      email,
      restaurant_name: 'Taqueria Dos',
    });
    expect(res2.status).toBe(409);
    expect(res2.data.existing).toBe(true);
  });

  describe('Demo Login (token exchange)', () => {
    it('POST /api/auth/demo-login exchanges token for JWTs', async () => {
      const email = uniqueEmail();
      const provision = await pub.post('/api/demo/provision', {
        name: 'Demo Prospect',
        email,
        restaurant_name: 'Token Test Taqueria',
      });
      expect(provision.status).toBe(201);

      const res = await pub.post('/api/auth/demo-login', {
        demo_token: provision.data.demo_token,
      });
      expect(res.status).toBe(200);
      expect(res.data.owner_token).toBeTruthy();
      expect(res.data.employee_token).toBeTruthy();
      expect(res.data.tenant).toBeTruthy();
      expect(res.data.tenant.plan).toBe('free');
      expect(res.data.employee).toBeTruthy();
      expect(res.data.employee.role).toBe('admin');
    });

    it('POST /api/auth/demo-login rejects missing token', async () => {
      const res = await pub.post('/api/auth/demo-login', {});
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/demo-login rejects invalid token', async () => {
      const res = await pub.post('/api/auth/demo-login', {
        demo_token: '00000000-0000-0000-0000-000000000000',
      });
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/demo-login token is single-use', async () => {
      const email = uniqueEmail();
      const provision = await pub.post('/api/demo/provision', {
        name: 'Single Use Test',
        email,
        restaurant_name: 'Single Use Taqueria',
      });
      expect(provision.status).toBe(201);

      // First use — succeeds
      const res1 = await pub.post('/api/auth/demo-login', {
        demo_token: provision.data.demo_token,
      });
      expect(res1.status).toBe(200);

      // Second use — fails (token consumed)
      const res2 = await pub.post('/api/auth/demo-login', {
        demo_token: provision.data.demo_token,
      });
      expect(res2.status).toBe(401);
    });

    it('demo-login returns tenant id matching provision subdomain', async () => {
      const email = uniqueEmail();
      const provision = await pub.post('/api/demo/provision', {
        name: 'Subdomain Check',
        email,
        restaurant_name: 'Subdomain Taqueria',
      });
      expect(provision.status).toBe(201);

      const res = await pub.post('/api/auth/demo-login', {
        demo_token: provision.data.demo_token,
      });
      expect(res.status).toBe(200);
      expect(res.data.tenant.id).toBe(provision.data.subdomain);
      expect(res.data.employee.name).toBe('Subdomain Check');
    });
  });
});
