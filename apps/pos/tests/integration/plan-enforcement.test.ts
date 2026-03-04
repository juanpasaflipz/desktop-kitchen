/**
 * Plan Enforcement integration tests (~15 tests)
 *
 * Creates its own trial tenant, exercises all plan limits and feature gates,
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
    it('creates a trial tenant', async () => {
      const res = await admin.post('/admin/tenants', {
        id: TENANT_ID,
        name: 'Plan Enforcement Test',
        owner_email: OWNER_EMAIL,
        owner_password: OWNER_PASSWORD,
        plan: 'trial',
      });
      expect(res.status).toBe(201);
      expect(res.data.plan).toBe('trial');
    });

    it('seeds the trial tenant', async () => {
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
      // Accept 201 (created) or 403 (plan limit — trial allows 3)
      expect([201, 403]).toContain(res.status);
    });

    it('logs in as trial manager (PIN 1234)', async () => {
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
    it('menu items: trial limit 10 → 403 with upgrade info', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Seed creates 20 items (already over the limit of 10)
      const res = await api.post('/api/menu/items', {
        category_id: categoryId,
        name: 'Over Limit Item',
        price: 50,
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.limit).toBe(10);
    });

    it('employees: trial limit 3 → 403 with upgrade info', async () => {
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

    it('modifier groups: trial limit 2 → 403 with upgrade info', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Seed creates 2 modifier groups (at the limit)
      const res = await api.post('/api/modifiers/groups', {
        name: 'Over Limit Group',
        selection_type: 'single',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.limit).toBe(2);
    });

    it('combos: trial limit 1 → 403 with upgrade info', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // Seed creates 2 combos (already over the limit of 1)
      const res = await api.post('/api/combos', {
        name: 'Over Limit Combo',
        combo_price: 100,
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.limit).toBe(1);
    });
  });

  // ==================== Feature Gates (requirePlanFeature) ====================

  describe('Feature Gates', () => {
    it('delivery: trial → 403 with PLAN_UPGRADE_REQUIRED', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      // PUT /api/delivery/platforms/:id uses requirePlanFeature('delivery')
      const res = await api.put('/api/delivery/platforms/1', {
        display_name: 'Test',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.feature).toBe('delivery');
      expect(res.data.requiredPlan).toBe('starter');
      expect(res.data.currentPlan).toBe('trial');
    });

    it('printers: trial → 403 with PLAN_UPGRADE_REQUIRED', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/printers', {
        name: 'Test Printer',
        ip_address: '192.168.1.100',
        type: 'thermal',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.feature).toBe('printers');
      expect(res.data.requiredPlan).toBe('starter');
    });

    it('loyalty: trial → 403 with PLAN_UPGRADE_REQUIRED', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/loyalty/customers', {
        phone: '5551234567',
        name: 'Test Customer',
      });
      expect(res.status).toBe(403);
      expect(res.data.error).toBe('PLAN_UPGRADE_REQUIRED');
      expect(res.data.feature).toBe('loyalty');
      expect(res.data.requiredPlan).toBe('starter');
    });

    it('stress test: trial → blocked (403 or 404 if chaos routes disabled)', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/stress-test/run', {
        template: 'light',
      });
      // Route is only mounted when ENABLE_CHAOS=true; otherwise 404.
      // Either way, trial tenants cannot access it.
      expect([403, 404]).toContain(res.status);
    });
  });

  // ==================== Banking Custom Gate ====================

  describe('Banking Gate', () => {
    it('banking widget token: trial → 403 with PLAN_UPGRADE_REQUIRED', async () => {
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
    it('admin upgrades trial → pro', async () => {
      const res = await admin.patch(`/admin/tenants/${TENANT_ID}`, {
        plan: 'pro',
      });
      expect(res.status).toBe(200);

      // Verify the plan changed
      const tenant = await admin.get(`/admin/tenants/${TENANT_ID}`);
      expect(tenant.data.plan).toBe('pro');
    });

    it('previously-blocked loyalty endpoint now succeeds (not 403)', async () => {
      const api = tenantApi(TENANT_ID, managerToken);
      const res = await api.post('/api/loyalty/customers', {
        phone: '5559876543',
        name: 'Pro Customer',
      });
      // Should succeed — loyalty unlocked on pro
      expect([200, 201]).toContain(res.status);
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
