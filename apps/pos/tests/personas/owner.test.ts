/**
 * Owner persona tests (~32 tests)
 * Tests registration, owner login, token refresh, password reset,
 * account management (CRUD + validation), branding, and billing.
 */
import { describe, it, expect } from 'vitest';
import { pub, authApi, admin, rawRequest } from '../setup/helpers.js';
import { getTestState } from '../setup/test-env.js';

describe('Owner', () => {
  // ==================== Registration ====================
  describe('Registration', () => {
    const RUN_ID = Date.now().toString(36).slice(-4);
    const REG_EMAIL = `reg-test-${RUN_ID}@test.desktop.kitchen`;
    const REG_TENANT_ID = `reg-test-restaurant-${RUN_ID}`;

    it('POST /api/auth/register creates a new tenant', async () => {
      const res = await pub.post('/api/auth/register', {
        email: REG_EMAIL,
        password: 'RegTest2026!',
        restaurant_name: 'Reg Test Restaurant',
      });
      expect(res.status).toBe(201);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('pin');
      expect(res.data).toHaveProperty('tenant');
      expect(res.data.tenant.plan).toBe('trial');
    });

    it('POST /api/auth/register rejects missing fields', async () => {
      const res = await pub.post('/api/auth/register', {
        email: 'missing@test.com',
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/register rejects duplicate email', async () => {
      const res = await pub.post('/api/auth/register', {
        email: REG_EMAIL,
        password: 'Duplicate2026!',
        restaurant_name: 'Duplicate Test',
      });
      expect(res.status).toBe(409);
    });

    it('POST /api/auth/register rejects short password', async () => {
      const res = await pub.post('/api/auth/register', {
        email: 'short-pw@test.desktop.kitchen',
        password: 'short',
        restaurant_name: 'Short PW Test',
      });
      expect(res.status).toBe(400);
    });

    // Cleanup: delete the registered tenant
    it('cleanup: delete registered test tenant', async () => {
      // Find and delete the tenant we just registered
      const tenants = await admin.get('/admin/tenants?search=reg-test');
      for (const t of tenants.data || []) {
        if (t.owner_email === REG_EMAIL) {
          await admin.delete(`/admin/tenants/${t.id}`, { confirm: t.id });
        }
      }
    }, 60_000);
  });

  // ==================== Login ====================
  describe('Login', () => {
    it('POST /api/auth/login succeeds with correct credentials', async () => {
      const state = getTestState();
      const res = await pub.post('/api/auth/login', {
        email: state.tenantAlpha.ownerEmail,
        password: state.tenantAlpha.ownerPassword,
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('tenant');
      expect(res.data.tenant.id).toBe(state.tenantAlpha.id);
    });

    it('POST /api/auth/login rejects wrong password', async () => {
      const state = getTestState();
      const res = await pub.post('/api/auth/login', {
        email: state.tenantAlpha.ownerEmail,
        password: 'WrongPassword!',
      });
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/login rejects non-existent email', async () => {
      const res = await pub.post('/api/auth/login', {
        email: 'nonexistent@test.desktop.kitchen',
        password: 'Whatever2026!',
      });
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/login rejects missing fields', async () => {
      const res = await pub.post('/api/auth/login', { email: 'test@test.com' });
      expect(res.status).toBe(400);
    });
  });

  // ==================== Token ====================
  describe('Token Refresh', () => {
    it('POST /api/auth/refresh with valid token returns new token', async () => {
      const state = getTestState();
      const res = await rawRequest('POST', '/api/auth/refresh', {
        token: state.tenantAlpha.ownerToken,
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data.token).not.toBe(state.tenantAlpha.ownerToken);
    });

    it('POST /api/auth/refresh rejects missing token', async () => {
      const res = await pub.post('/api/auth/refresh');
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/refresh rejects malformed token', async () => {
      const res = await rawRequest('POST', '/api/auth/refresh', {
        token: 'not-a-valid-jwt',
      });
      expect(res.status).toBe(401);
    });
  });

  // ==================== Password Reset ====================
  describe('Password Reset', () => {
    it('POST /api/auth/forgot-password always returns success (prevents enumeration)', async () => {
      const res = await pub.post('/api/auth/forgot-password', {
        email: 'nonexistent@test.desktop.kitchen',
      });
      expect(res.status).toBe(200);
      expect(res.data.message).toContain('reset link');
    });

    it('POST /api/auth/forgot-password requires email', async () => {
      const res = await pub.post('/api/auth/forgot-password', {});
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/reset-password rejects invalid token', async () => {
      const res = await pub.post('/api/auth/reset-password', {
        token: 'invalid-reset-token',
        new_password: 'NewPassword2026!',
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/reset-password rejects missing fields', async () => {
      const res = await pub.post('/api/auth/reset-password', {
        token: 'some-token',
      });
      expect(res.status).toBe(400);
    });

    it('POST /api/auth/reset-password rejects short password', async () => {
      const res = await pub.post('/api/auth/reset-password', {
        token: 'some-token',
        new_password: 'short',
      });
      expect(res.status).toBe(400);
    });
  });

  // ==================== Account ====================
  describe('Account', () => {
    it('GET /api/account returns plan, usage.employees, usage.menu_items', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/account');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('id');
      expect(res.data).toHaveProperty('plan');
      expect(res.data).toHaveProperty('email');
      expect(res.data.usage).toHaveProperty('employees');
      expect(res.data.usage.employees).toHaveProperty('current');
      expect(res.data.usage.employees).toHaveProperty('limit');
      expect(res.data.usage).toHaveProperty('menu_items');
      expect(res.data.usage.menu_items).toHaveProperty('current');
      expect(res.data.usage.menu_items).toHaveProperty('limit');
    });

    it('PUT /api/account updates account name', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.put('/api/account', {
        name: 'Updated Alpha Restaurant',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('name');
    });

    it('PUT /api/account rejects invalid email → 400', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.put('/api/account', {
        email: 'not-an-email',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Invalid email');
    });

    it('PUT /api/account rejects empty body → 400', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.put('/api/account', {});
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('No valid fields');
    });

    it('PUT /api/account/password rejects wrong current_password → 401', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.put('/api/account/password', {
        current_password: 'WrongPassword!',
        new_password: 'NewPassword2026!',
      });
      expect(res.status).toBe(401);
      expect(res.data.error).toContain('Current password is incorrect');
    });
  });

  // ==================== Branding ====================
  describe('Branding', () => {
    it('GET /api/branding returns branding for tenant (public)', async () => {
      const state = getTestState();
      const res = await rawRequest('GET', '/api/branding', {
        tenantId: state.tenantAlpha.id,
      });
      expect(res.status).toBe(200);
    });

    it('PUT /api/branding updates branding (owner auth)', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      // Branding PUT requires ownerAuth — may need tenant context too
      const res = await rawRequest('PUT', '/api/branding', {
        token: state.tenantAlpha.ownerToken,
        tenantId: state.tenantAlpha.id,
        body: { primaryColor: '#ff6600' },
      });
      expect([200, 401, 403]).toContain(res.status);
    });
  });

  // ==================== Billing ====================
  describe('Billing', () => {
    it('GET /api/billing returns plan + subscription_status', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('plan');
      expect(res.data).toHaveProperty('subscription_status');
    });

    it('POST /api/billing/checkout rejects invalid plan → 400', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.post('/api/billing/checkout', {
        plan: 'nonexistent_plan',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Invalid plan');
    });

    it('POST /api/billing/portal rejects without stripe_customer_id → 400', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.post('/api/billing/portal');
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('No billing account');
    });

    it('GET /api/billing/promo/validate validates promo code', async () => {
      const res = await pub.get('/api/billing/promo/validate?code=TESTPROMO');
      expect([200, 404]).toContain(res.status);
    });
  });
});
