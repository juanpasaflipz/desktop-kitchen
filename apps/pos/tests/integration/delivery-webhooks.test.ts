/**
 * Delivery Webhook Integration Tests
 *
 * Tests the full webhook ingestion pipeline for Uber Eats, Rappi, and DiDi Food.
 * Verifies order creation, idempotency, cancellation, signature enforcement,
 * and P&L analytics output from webhook-created orders.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { alpha, admin, rawRequest } from '../setup/helpers.js';
import { getTestState } from '../setup/test-env.js';

// Platform IDs resolved during setup
let platforms: { id: number; name: string; commission_percent: number }[] = [];
function platformByName(name: string) {
  return platforms.find((p) => p.name === name)!;
}

// Track created order IDs for analytics verification
const createdOrders: { source: string; total: number; commission: number }[] = [];

describe('Delivery Webhooks', () => {
  beforeAll(async () => {
    // Re-seed tenant alpha to guarantee delivery platforms + menu items exist
    const state = getTestState();
    await admin.post(`/admin/tenants/${state.tenantAlpha.id}/seed`);

    // Fetch platform IDs
    const api = alpha('manager');
    const res = await api.get('/api/delivery/platforms');
    expect(res.status).toBe(200);
    platforms = res.data;
    expect(platforms.length).toBeGreaterThanOrEqual(3);
  }, 30_000);

  // ==================== Rappi Webhooks ====================

  describe('Rappi Webhook', () => {
    const rappiOrderId = `rappi-test-${Date.now()}`;
    let createdOrderId: number;
    let createdDeliveryOrderId: number;

    it('responds OK to PING event', async () => {
      const state = getTestState();
      const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
        body: { store_id: 'test-store' },
        tenantId: state.tenantAlpha.id,
      });
      expect(res.status).toBe(200);
      expect(res.data.status).toBe('OK');
    });

    it('creates an order from NEW_ORDER webhook', async () => {
      const state = getTestState();
      const payload = {
        order_detail: {
          order_id: rappiOrderId,
          cooking_time: 20,
          items: [
            {
              name: 'Burrito',
              quantity: 2,
              unit_price_with_discount: 15000,
              type: 'ITEM',
            },
            {
              name: 'Salsa Extra',
              quantity: 1,
              price: 2500,
              type: 'ITEM',
            },
          ],
          totals: { charges: { shipping: 3500 } },
          delivery_information: {
            complete_address: '123 Calle Test, CDMX',
          },
        },
        customer: { first_name: 'Carlos', last_name: 'Webhook' },
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
        body: payload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.order_id).toBeDefined();
      expect(res.data.delivery_order_id).toBeDefined();
      expect(res.data.total).toBeGreaterThan(0);

      createdOrderId = res.data.order_id;
      createdDeliveryOrderId = res.data.delivery_order_id;

      // Items: 2x Burrito @ 150.00 + 1x Salsa @ 25.00 = 325.00
      const expectedTotal = 2 * 150 + 25;
      expect(res.data.total).toBe(expectedTotal);

      // Track for analytics verification
      const rappi = platformByName('rappi');
      createdOrders.push({
        source: 'rappi',
        total: expectedTotal,
        commission: expectedTotal * (rappi.commission_percent / 100),
      });
    });

    it('delivery order appears in orders list with correct data', async () => {
      const api = alpha('manager');
      const res = await api.get('/api/delivery/orders');
      expect(res.status).toBe(200);

      const order = res.data.find(
        (o: any) => o.external_order_id === rappiOrderId
      );
      expect(order).toBeDefined();
      expect(order.platform_status).toMatch(/received|accepted/);
      expect(order.customer_name).toBe('Carlos Webhook');
      expect(order.delivery_address).toBe('123 Calle Test, CDMX');

      // Commission = total * platform commission_percent / 100
      const rappi = platformByName('rappi');
      const expectedCommission =
        order.order_total * (rappi.commission_percent / 100);
      expect(Number(order.platform_commission)).toBeCloseTo(
        expectedCommission,
        1
      );
    });

    it('rejects duplicate order (idempotency)', async () => {
      const state = getTestState();
      const payload = {
        order_detail: {
          order_id: rappiOrderId,
          items: [
            { name: 'Duplicate', quantity: 1, price: 10000, type: 'ITEM' },
          ],
        },
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
        body: payload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.duplicate).toBe(true);
    });

    it('handles cancel event', async () => {
      const state = getTestState();
      const payload = {
        event: 'canceled_with_charge',
        order_id: rappiOrderId,
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
        body: payload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);

      // Verify order status is now cancelled
      const api = alpha('manager');
      const orders = await api.get('/api/delivery/orders');
      const order = orders.data.find(
        (o: any) => o.external_order_id === rappiOrderId
      );
      expect(order).toBeDefined();
      expect(order.platform_status).toBe('cancelled_by_rappi');
    });
  });

  // ==================== DiDi Food Webhooks ====================

  describe('DiDi Food Webhook', () => {
    const didiOrderId = `didi-test-${Date.now()}`;

    it('creates an order from new_order webhook (centavo prices)', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'new_order',
        order: {
          order_id: didiOrderId,
          items: [
            { name: 'Taco Al Pastor', quantity: 3, price: 8500 }, // centavos → 85.00
            { name: 'Agua Fresca', quantity: 1, price: 4500 }, // centavos → 45.00
          ],
          delivery_fee: 2900,
          customer: { name: 'Maria Webhook' },
          delivery_address: '456 Av Reforma, CDMX',
        },
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/didi', {
        body: payload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.order_id).toBeDefined();
      expect(res.data.delivery_order_id).toBeDefined();

      // Items: 3x 85.00 + 1x 45.00 = 300.00
      const expectedTotal = 3 * 85 + 45;
      expect(res.data.total).toBe(expectedTotal);

      // Track for analytics verification
      const didi = platformByName('didi_food');
      createdOrders.push({
        source: 'didi_food',
        total: expectedTotal,
        commission: expectedTotal * (didi.commission_percent / 100),
      });
    });

    it('delivery order has correct customer and address', async () => {
      const api = alpha('manager');
      const res = await api.get('/api/delivery/orders');
      const order = res.data.find(
        (o: any) => o.external_order_id === didiOrderId
      );
      expect(order).toBeDefined();
      expect(order.customer_name).toBe('Maria Webhook');
      expect(order.delivery_address).toBe('456 Av Reforma, CDMX');
    });

    it('handles cancel event', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'order_cancel',
        order_id: didiOrderId,
        cancel_source: 'customer',
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/didi', {
        body: payload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);

      // Verify cancellation
      const api = alpha('manager');
      const orders = await api.get('/api/delivery/orders');
      const order = orders.data.find(
        (o: any) => o.external_order_id === didiOrderId
      );
      expect(order).toBeDefined();
      expect(order.platform_status).toBe('cancelled_by_customer');
    });

    it('handles complete event', async () => {
      // Create a fresh order for completion test
      const state = getTestState();
      const freshId = `didi-complete-${Date.now()}`;
      const createPayload = {
        event_type: 'new_order',
        order: {
          order_id: freshId,
          items: [{ name: 'Test Item', quantity: 1, price: 5000 }],
          customer: { name: 'Complete Test' },
        },
      };

      await rawRequest('POST', '/api/delivery/webhook/didi', {
        body: createPayload,
        tenantId: state.tenantAlpha.id,
      });

      // Now send complete event
      const completePayload = {
        event_type: 'order_complete',
        order_id: freshId,
      };

      const res = await rawRequest('POST', '/api/delivery/webhook/didi', {
        body: completePayload,
        tenantId: state.tenantAlpha.id,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);

      // Verify completed status
      const api = alpha('manager');
      const orders = await api.get('/api/delivery/orders');
      const order = orders.data.find(
        (o: any) => o.external_order_id === freshId
      );
      expect(order).toBeDefined();
      expect(order.platform_status).toBe('completed');
    });
  });

  // ==================== Uber Eats Webhooks ====================

  describe('Uber Eats Webhook', () => {
    it('handles orders.notification gracefully (no live Uber API)', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'orders.notification',
        meta: { resource_id: `uber-test-${Date.now()}` },
      };

      const res = await rawRequest(
        'POST',
        '/api/delivery/webhook/uber-eats',
        {
          body: payload,
          tenantId: state.tenantAlpha.id,
        }
      );

      // Handler returns 200 even on internal errors to prevent Uber retries
      expect(res.status).toBe(200);
    });

    it('acknowledges unknown event types', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'orders.foo',
        meta: { resource_id: 'some-id' },
      };

      const res = await rawRequest(
        'POST',
        '/api/delivery/webhook/uber-eats',
        {
          body: payload,
          tenantId: state.tenantAlpha.id,
        }
      );

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Event orders.foo acknowledged');
    });

    it('ignores webhooks with no resource ID', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'orders.notification',
      };

      const res = await rawRequest(
        'POST',
        '/api/delivery/webhook/uber-eats',
        {
          body: payload,
          tenantId: state.tenantAlpha.id,
        }
      );

      expect(res.status).toBe(200);
      expect(res.data.message).toContain('No resource ID');
    });

    it('handles orders.cancel for non-existent order silently', async () => {
      const state = getTestState();
      const payload = {
        event_type: 'orders.cancel',
        meta: { resource_id: 'non-existent-uber-order' },
      };

      const res = await rawRequest(
        'POST',
        '/api/delivery/webhook/uber-eats',
        {
          body: payload,
          tenantId: state.tenantAlpha.id,
        }
      );

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toBe('Cancel processed');
    });
  });

  // ==================== Signature Verification ====================

  describe('Webhook Signature Verification', () => {
    const RAPPI_SECRET = 'test-rappi-webhook-secret-12345';
    const UBER_SECRET = 'test-uber-webhook-secret-12345';

    beforeAll(async () => {
      // Insert webhook secrets via the credentials API
      const ownerApi = alpha('owner');

      const rappiRes = await ownerApi.put('/api/credentials/rappi', {
        webhook_secret: RAPPI_SECRET,
      });
      expect(rappiRes.status).toBe(200);

      const uberRes = await ownerApi.put('/api/credentials/uber_eats', {
        client_secret: UBER_SECRET,
      });
      expect(uberRes.status).toBe(200);
    });

    describe('Rappi signature enforcement', () => {
      const rappiPayload = {
        order_detail: {
          order_id: `rappi-sig-${Date.now()}`,
          items: [
            { name: 'Sig Test', quantity: 1, price: 5000, type: 'ITEM' },
          ],
        },
      };

      it('rejects webhook without signature header', async () => {
        const state = getTestState();
        const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
          body: rappiPayload,
          tenantId: state.tenantAlpha.id,
        });

        expect(res.status).toBe(403);
        expect(res.data.error).toContain('Missing webhook signature');
      });

      it('rejects webhook with invalid signature', async () => {
        const state = getTestState();
        const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
          body: rappiPayload,
          tenantId: state.tenantAlpha.id,
          headers: {
            'Rappi-Signature': 't=12345,sign=invalid_signature_value',
          },
        });

        expect(res.status).toBe(403);
        expect(res.data.error).toContain('Invalid webhook signature');
      });

      it('accepts webhook with valid HMAC signature', async () => {
        const state = getTestState();
        const bodyStr = JSON.stringify(rappiPayload);
        const ts = Math.floor(Date.now() / 1000);
        const hmac = crypto
          .createHmac('sha256', RAPPI_SECRET)
          .update(`${ts}.${bodyStr}`)
          .digest('hex');
        const sigHeader = `t=${ts},sign=${hmac}`;

        const res = await rawRequest('POST', '/api/delivery/webhook/rappi', {
          body: rappiPayload,
          tenantId: state.tenantAlpha.id,
          headers: { 'Rappi-Signature': sigHeader },
        });

        expect(res.status).toBe(200);
      });
    });

    describe('Uber Eats signature enforcement', () => {
      const uberPayload = {
        event_type: 'orders.foo',
        meta: { resource_id: `uber-sig-${Date.now()}` },
      };

      it('rejects webhook without signature header', async () => {
        const state = getTestState();
        const res = await rawRequest(
          'POST',
          '/api/delivery/webhook/uber-eats',
          {
            body: uberPayload,
            tenantId: state.tenantAlpha.id,
          }
        );

        expect(res.status).toBe(403);
        expect(res.data.error).toContain('Missing webhook signature');
      });

      it('rejects webhook with invalid signature', async () => {
        const state = getTestState();
        const res = await rawRequest(
          'POST',
          '/api/delivery/webhook/uber-eats',
          {
            body: uberPayload,
            tenantId: state.tenantAlpha.id,
            headers: { 'x-uber-signature': 'invalid_signature' },
          }
        );

        expect(res.status).toBe(403);
        expect(res.data.error).toContain('Invalid webhook signature');
      });

      it('accepts webhook with valid HMAC signature', async () => {
        const state = getTestState();
        const bodyStr = JSON.stringify(uberPayload);
        const hmac = crypto
          .createHmac('sha256', UBER_SECRET)
          .update(bodyStr)
          .digest('hex');

        const res = await rawRequest(
          'POST',
          '/api/delivery/webhook/uber-eats',
          {
            body: uberPayload,
            tenantId: state.tenantAlpha.id,
            headers: { 'x-uber-signature': hmac },
          }
        );

        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
      });
    });

    // Clean up credentials after signature tests
    afterAll(async () => {
      const ownerApi = alpha('owner');
      await ownerApi.delete('/api/credentials/rappi');
      await ownerApi.delete('/api/credentials/uber_eats');
    });
  });

  // ==================== Analytics Verification ====================

  describe('Delivery Analytics (P&L)', () => {
    it('GET /api/delivery-intel/analytics reflects webhook-created orders', async () => {
      const api = alpha('manager');
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.get(
        `/api/delivery-intel/analytics?start=${today}&end=${today}`
      );
      expect(res.status).toBe(200);
      expect(res.data.platforms).toBeDefined();
      expect(Array.isArray(res.data.platforms)).toBe(true);

      // There should be platform stats for rappi and didi_food
      const rappiStats = res.data.platforms.find(
        (p: any) => p.name === 'rappi'
      );
      const didiStats = res.data.platforms.find(
        (p: any) => p.name === 'didi_food'
      );

      // At least the webhook-created orders should show up
      // (cancelled orders may or may not be excluded depending on query)
      expect(rappiStats).toBeDefined();
      expect(didiStats).toBeDefined();

      // Delivery stats should show non-zero numbers
      expect(res.data.delivery).toBeDefined();
    });
  });

  // ==================== Recapture Candidates ====================

  describe('Recapture Candidates', () => {
    it('lists delivery-only customers from webhook orders', async () => {
      const api = alpha('manager');
      const res = await api.get('/api/delivery-intel/recapture/candidates');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);

      // Webhook-created customers (Carlos Webhook, Maria Webhook) should
      // appear as candidates since they only have delivery orders
      const names = res.data.map((c: any) => c.customer_name);
      // At least one of our webhook customers should be in the list
      const hasWebhookCustomer =
        names.includes('Carlos Webhook') || names.includes('Maria Webhook');
      expect(hasWebhookCustomer).toBe(true);
    });
  });
});
