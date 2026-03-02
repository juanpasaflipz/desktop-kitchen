/**
 * CFDI (Mexican invoicing) module deep tests
 *
 * Tests config CRUD, invoice validation (no Facturapi key needed),
 * invoice token generation, and public CFDI routes.
 */
import { describe, it, expect } from 'vitest';
import { alpha, pub } from '../setup/helpers.js';
import { getTestState } from '../setup/test-env.js';

describe('Module: CFDI', () => {
  // ==================== SAT Catalogs ====================

  it('GET /api/cfdi/catalogs returns tax catalogs', async () => {
    const api = alpha('manager');
    const res = await api.get('/api/cfdi/catalogs');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('taxRegimes');
    expect(res.data).toHaveProperty('usoCfdi');
    expect(res.data).toHaveProperty('formaPago');
    expect(res.data).toHaveProperty('cancellationMotives');
  });

  // ==================== Config CRUD ====================

  describe('Config CRUD', () => {
    const FISCAL_DATA = {
      rfc: 'XAXX010101000',
      legal_name: 'TEST BUSINESS SA DE CV',
      tax_regime: '601',
      postal_code: '06600',
    };

    it('POST /api/cfdi/config saves fiscal data', async () => {
      const api = alpha('manager');
      const res = await api.post('/api/cfdi/config', FISCAL_DATA);
      expect(res.status).toBe(200);
      expect(res.data.config).toBeTruthy();
      expect(res.data.config.rfc).toBe(FISCAL_DATA.rfc);
      expect(res.data.config.legal_name).toBe(FISCAL_DATA.legal_name);
      expect(res.data.config.tax_regime).toBe(FISCAL_DATA.tax_regime);
      expect(res.data.config.postal_code).toBe(FISCAL_DATA.postal_code);
    });

    it('POST /api/cfdi/config updates on second call', async () => {
      const api = alpha('manager');
      const updated = {
        ...FISCAL_DATA,
        legal_name: 'UPDATED BUSINESS SA DE CV',
        postal_code: '01000',
      };
      const res = await api.post('/api/cfdi/config', updated);
      expect(res.status).toBe(200);
      expect(res.data.config.legal_name).toBe('UPDATED BUSINESS SA DE CV');
      expect(res.data.config.postal_code).toBe('01000');
    });

    it('POST /api/cfdi/config rejects missing required fields (omit rfc)', async () => {
      const api = alpha('manager');
      const res = await api.post('/api/cfdi/config', {
        legal_name: 'NO RFC',
        tax_regime: '601',
        postal_code: '06600',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('required');
    });

    it('GET /api/cfdi/config returns saved config', async () => {
      const api = alpha('manager');
      const res = await api.get('/api/cfdi/config');
      expect(res.status).toBe(200);
      expect(res.data.config).toBeTruthy();
      expect(res.data.config.rfc).toBeDefined();
      expect(res.data.config.legal_name).toBeDefined();
      expect(res.data.config.tax_regime).toBeDefined();
      expect(res.data.config.postal_code).toBeDefined();
      expect(res.data).toHaveProperty('facturapi_configured');
    });
  });

  // ==================== Invoice Validation (no Facturapi key) ====================

  describe('Invoice Validation', () => {
    it('POST /api/cfdi/invoices rejects missing order_id', async () => {
      const api = alpha('manager');
      const res = await api.post('/api/cfdi/invoices', {});
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('order_id');
    });

    it('POST /api/cfdi/invoices rejects when CFDI not active (no CSD uploaded)', async () => {
      const api = alpha('manager');
      // Config is saved but CSD not uploaded → active = false
      const res = await api.post('/api/cfdi/invoices', { order_id: 1 });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('not configured or active');
    });

    it('POST /api/cfdi/invoices/:id/cancel rejects missing motive', async () => {
      const api = alpha('manager');
      const res = await api.post('/api/cfdi/invoices/99999/cancel', {});
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('motive');
    });

    it('POST /api/cfdi/invoices/:id/cancel rejects motive 01 without substitute UUID', async () => {
      const api = alpha('manager');
      const res = await api.post('/api/cfdi/invoices/99999/cancel', {
        motive: '01',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Substitute UUID');
    });
  });

  // ==================== Invoice Tokens ====================

  describe('Invoice Tokens', () => {
    let paidOrderId: number;

    it('setup: creates and pays an order for token tests', async () => {
      const state = getTestState();
      const api = alpha('manager');
      const itemId = Object.values(state.tenantAlpha.menuItemIds)[0];

      // Create order
      const order = await api.post('/api/orders', {
        employee_id: state.tenantAlpha.managerEmployeeId,
        items: [{ menu_item_id: itemId, quantity: 1 }],
        source: 'pos',
      });
      expect(order.status).toBe(201);
      paidOrderId = order.data.id;

      // Pay via cash
      const pay = await api.post('/api/payments/cash', {
        order_id: paidOrderId,
        amount_received: order.data.total,
      });
      expect([200, 201]).toContain(pay.status);
    });

    it('GET /api/cfdi/orders/:orderId/token generates token for paid order', async () => {
      const api = alpha('manager');
      const res = await api.get(`/api/cfdi/orders/${paidOrderId}/token`);
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('token');
      expect(res.data).toHaveProperty('url');
      expect(typeof res.data.token).toBe('string');
      expect(res.data.url).toContain(res.data.token);
    });

    it('GET /api/cfdi/orders/:orderId/token returns 404 for non-existent order', async () => {
      const api = alpha('manager');
      const res = await api.get('/api/cfdi/orders/999999/token');
      expect(res.status).toBe(404);
      expect(res.data.error).toContain('Order not found');
    });
  });

  // ==================== Public CFDI Routes ====================

  describe('Public CFDI Routes', () => {
    it('GET /api/cfdi-public/:token returns 404 for invalid token', async () => {
      const res = await pub.get('/api/cfdi-public/invalid-token-abc123');
      expect(res.status).toBe(404);
      expect(res.data.error).toContain('Invalid invoice link');
    });

    it('POST /api/cfdi-public/:token/issue returns 404 for invalid token', async () => {
      const res = await pub.post('/api/cfdi-public/invalid-token-abc123/issue', {
        rfc: 'XAXX010101000',
        name: 'TEST',
        tax_regime: '601',
        postal_code: '06600',
      });
      expect(res.status).toBe(404);
      expect(res.data.error).toContain('Invalid invoice link');
    });
  });

  // ==================== Invoice List ====================

  it('GET /api/cfdi/invoices lists invoices', async () => {
    const api = alpha('manager');
    const res = await api.get('/api/cfdi/invoices');
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('invoices');
    expect(res.data).toHaveProperty('total');
    expect(res.data).toHaveProperty('page');
    expect(Array.isArray(res.data.invoices)).toBe(true);
  });
});
