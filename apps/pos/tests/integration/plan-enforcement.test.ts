/**
 * Plan Enforcement integration tests (~15 tests)
 *
 * Creates its own free tenant, exercises all plan limits and feature gates,
 * upgrades to pro, verifies unlock, then cleans up.
 */
import { describe, it, expect } from 'vitest';
import { admin, tenantApi, rawRequest } from '../setup/helpers.js';
import { getTestState } from '../setup/test-env.js';

describe('Plan Enforcement', () => {
  const RUN_ID = Date.now().toString(36).slice(-4);
  const TENANT_ID = `plan-test-${RUN_ID}`;
  const OWNER_EMAIL = `plan-test-${RUN_ID}@test.desktop.kitchen`;
  const OWNER_PASSWORD = 'PlanTest2026!';
  const MANAGER_PIN = '1234';

  let managerToken: string;
  let ownerToken: string;
  let categoryId: number;

  // ==================== Setup ====================

  describe('Setup', () => {
    it('creates a free tenant', async () => {
      const res = await admin.post('/admin/tenants', {
        id: TENANT_ID,
        name: 'Plan Enforcement Test',
        owner_email: OWNER_EMAIL,
        owner_password: OWNER_PASSWORD,
        plan: 'free',
      });
      expect(res.status).toBe(201);
      expect(res.data.plan).toBe('free');
    });

    it('seeds the free tenant', async () => {
      const res = await admin.post(`/admin/tenants/${TENANT_ID}/seed`);
      expect(res.status).toBe(200);
    });

    it('creates a manager employee with known PIN', async () => {
      // Seed skips employees when ≥1 already exists (from tenant creation).
      // Explicitly create a manager with a known PIN.
      const state = getTestState();
      const res = await rawRequest('POST', '/api/employees', {
        headers: {
          'X-Tenant-ID': TENANT_ID,
          'X-Admin-Secret': state.adminSecret,
          'Content-Type': 'application/json',
        },
        body: { name: 'Plan Test Manager', pin: MANAGER_PIN, role: 'admin' },
      });
      // Accept 201 (created) or 403 (plan limit — free allows 3)
      expect([201, 403]).toContain(res.status);
    });

    it('logs in as free manager (PIN 1234)', async () => {
      const state = getTestState();
      const res = await rawRequest('POST', '/api/employees/login', {
        headers: {
          'X-Tenant-ID': TENANT_ID,
          'X-Admin-Secret': state.adminSecret,
          'Content-Type': 'application/json',
        },
        body: { pin: MANAGER_PIN },
      });
      expect(res.status).toBe(200);
      managerToken = res.data.token;
    });

    it('logs in as owner', async () => {
      const res = await rawRequest('POST', '/api/auth/login', {
        body: {
          email: OWNER_EMAIL,
          password: OWNER_PASSWORD,
        },
      });
      expect(res.status).toBe(200);
      ownerToken = res.data.token;
    });

    it('fetches a category ID for item creation tests', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.get('/api/menu/categories');
      expect(res.status).toBe(200);
      expect(res.data.length).toBeGreaterThan(0);
      categoryId = res.data[0].id;
    });
  });

  // ==================== Numeric Limits (checkLimit) ====================

  describe('Numeric Limits', () => {
    it('menu items: free limit 50 → allowed (seed creates 20, under limit)', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Seed creates 20 items (under the free limit of 50)
      const res = await api.post('/api/menu/items', {
        category_id: categoryId,
        name: 'Under Limit Item',
        price: 50,
      });
      // Should succeed since 20 < 50
      expect([201, 200]).toContain(res.status);
    });

    it('employees: free limit 3 → 403 with upgrade info', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Tenant creation = 1 employee, our explicit create = 2 total.
      // First, fill the limit (create a 3rd employee).
      const fill = await api.post('/api/employees', {
        name: 'Fill Limit Employee',
        pin: '8888',
        role: 'cashier',
      });
      expect([201, 403]).toContain(fill.status);

      // Now try creating a 4th — should fail at the limit of 3.
      const res = await api.post('/api/employees', {
        name: 'Over Limit Employee',
        pin: '9999',
        role: 'cashier',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.limit).toBe(3);
    });

    it('modifier groups: free plan has unlimited → succeeds', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Free plan has Infinity modifier groups
      const res = await api.post('/api/modifiers/groups', {
        name: 'Free Plan Group',
        selection_type: 'single',
      });
      expect([201, 200]).toContain(res.status);
    });

    it('combos: free plan has unlimited → succeeds', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Free plan has Infinity combos
      const res = await api.post('/api/combos', {
        name: 'Free Plan Combo',
        combo_price: 100,
      });
      expect([201, 200]).toContain(res.status);
    });
  });

  // ==================== Feature Gates (requirePlanFeature) ====================

  describe('Feature Gates', () => {
    it('delivery: free → 403 with PLAN_UPGRADE_REQUIRED', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // PUT /api/delivery/platforms/:id uses requirePlanFeature('delivery')
      const res = await api.put('/api/delivery/platforms/1', {
        display_name: 'Test',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.feature).toBe('delivery');
      expect(res.data.requiredPlan).toBe('pro');
      expect(res.data.currentPlan).toBe('free');
    });

    it('printers: free allows 1 printer → succeeds', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/printers', {
        name: 'Test Printer',
        ip_address: '192.168.1.100',
        type: 'thermal',
      });
      // Free plan allows 1 printer (printers.functional: true, max: 1)
      expect([201, 200]).toContain(res.status);
    });

    it('loyalty: free allows basic loyalty → succeeds', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/loyalty/customers', {
        phone: '5551234567',
        name: 'Test Customer',
      });
      // Free plan has loyalty.locked: false (no SMS though)
      expect([201, 200]).toContain(res.status);
    });

    it('stress test: free → blocked (403 or 404 if chaos routes disabled)', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/stress-test/run', {
        template: 'light',
      });
      // Route is only mounted when ENABLE_CHAOS=true; otherwise 404.
      // Either way, free tenants cannot access it.
      expect([403, 404]).toContain(res.status);
    });
  });

  // ==================== Banking Custom Gate ====================

  describe('Banking Gate', () => {
    it('banking widget token: free → 403 with PLAN_UPGRADE_REQUIRED', async () => {
      const state = getTestState();
      // Banking requires ownerAuth + tenant middleware
      const res = await rawRequest('POST', '/api/banking/widget-token', {
        token: ownerToken,
        tenantId: TENANT_ID,
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
    });
  });

  // ==================== Upgrade Flow ====================

  describe('Upgrade Flow', () => {
    it('admin upgrades free → pro', async () => {
      const res = await admin.patch(`/admin/tenants/${TENANT_ID}`, {
        plan: 'pro',
      });
      expect(res.status).toBe(200);

      // Verify the plan changed
      const tenant = await admin.get(`/admin/tenants/${TENANT_ID}`);
      expect(tenant.data.plan).toBe('pro');
    });

    it('previously-blocked delivery endpoint now succeeds (not 403)', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Delivery is locked on free, unlocked on pro
      const res = await api.put('/api/delivery/platforms/1', {
        display_name: 'Test Platform',
      });
      // Should not be 403 PLAN_UPGRADE_REQUIRED anymore (may 404 if no platform exists)
      expect(res.status).not.toBe(403);
    });
  });

  // ==================== Cleanup ====================

  describe('Cleanup', () => {
    it('deletes the plan enforcement test tenant', async () => {
      const res = await admin.delete(`/admin/tenants/${TENANT_ID}`, {
        confirm: TENANT_ID,
      });
      expect(res.status).toBe(200);
    }, 60_000);
  });
});
