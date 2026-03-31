/**
 * Onboarding Status tests
 *
 * Tests the onboarding checklist status endpoint.
 */
import { describe, it, expect } from 'vitest';
import { alpha } from '../setup/helpers.js';

describe('Module: Onboarding', () => {
  it('GET /api/onboarding/status returns checklist flags', async () => {
    const api = alpha('manager');
    const res = await api.get('/api/onboarding/status');
    expect(res.status).toBe(200);
    expect(typeof res.data.has_menu_items).toBe('boolean');
    expect(typeof res.data.has_extra_staff).toBe('boolean');
    expect(typeof res.data.has_branding).toBe('boolean');
    expect(typeof res.data.has_delivery).toBe('boolean');
    expect(typeof res.data.real_order_count).toBe('number');
  });

  it('GET /api/onboarding/status reflects seeded test data', async () => {
    // The alpha tenant has seeded menu items and employees
    const api = alpha('manager');
    const res = await api.get('/api/onboarding/status');
    expect(res.status).toBe(200);
    // Alpha tenant has menu items seeded during global setup
    expect(res.data.has_menu_items).toBe(true);
    // Alpha tenant has multiple employees (manager, cashier, kitchen)
    expect(res.data.has_extra_staff).toBe(true);
  });
});
