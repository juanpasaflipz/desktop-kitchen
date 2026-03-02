/**
 * Billing Webhook integration tests (~10 tests)
 *
 * Tests webhook endpoint security, subscription lifecycle effects via admin API,
 * and billing endpoint validation.
 */
import { describe, it, expect } from 'vitest';
import { admin, pub, rawRequest, authApi } from '../setup/helpers.js';
import { getTestState } from '../setup/test-env.js';

describe('Billing Webhook & Subscription Lifecycle', () => {
  // Use alpha tenant for subscription status tests — restore state at end

  // ==================== Webhook Security ====================

  describe('Webhook Security', () => {
    it('POST /api/billing/webhook without stripe-signature header → 400', async () => {
      const res = await rawRequest('POST', '/api/billing/webhook', {
        headers: { 'Content-Type': 'application/json' },
        body: { type: 'test.event' },
      });
      // Without STRIPE_WEBHOOK_SECRET configured, returns 400 "Webhook secret not configured"
      // With it configured but no sig, returns 400 "Invalid signature"
      expect(res.status).toBe(400);
    });

    it('POST /api/billing/webhook with empty body → 400', async () => {
      const res = await rawRequest('POST', '/api/billing/webhook', {
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid-sig',
        },
      });
      expect(res.status).toBe(400);
    });
  });

  // ==================== Subscription Lifecycle via Admin API ====================

  describe('Subscription Lifecycle (admin-driven)', () => {
    let originalStatus: string | null;

    it('GET /api/billing returns plan + subscription_status for owner', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('plan');
      expect(res.data).toHaveProperty('subscription_status');
      originalStatus = res.data.subscription_status;
    });

    it('admin patches subscription_status to active → owner sees active', async () => {
      const state = getTestState();
      await admin.patch(`/admin/tenants/${state.tenantAlpha.id}`, {
        subscription_status: 'active',
      });

      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(200);
      expect(res.data.subscription_status).toBe('active');
    });

    it('admin patches subscription_status to past_due → owner still allowed (grace period)', async () => {
      const state = getTestState();
      await admin.patch(`/admin/tenants/${state.tenantAlpha.id}`, {
        subscription_status: 'past_due',
      });

      // past_due is allowed through ownerAuth (grace period)
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(200);
      expect(res.data.subscription_status).toBe('past_due');
    });

    it('admin patches subscription_status to cancelled → owner blocked with 403', async () => {
      const state = getTestState();
      await admin.patch(`/admin/tenants/${state.tenantAlpha.id}`, {
        subscription_status: 'cancelled',
      });

      // cancelled is blocked by ownerAuth middleware (line 30-33)
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(403);
      expect(res.data.error).toContain('Subscription expired');
    });

    it('admin restores to active → owner access restored', async () => {
      const state = getTestState();
      await admin.patch(`/admin/tenants/${state.tenantAlpha.id}`, {
        subscription_status: 'active',
      });

      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.get('/api/billing');
      expect(res.status).toBe(200);
      expect(res.data.subscription_status).toBe('active');
    });

    it('cleanup: restore original subscription_status', async () => {
      const state = getTestState();
      // Restore to original (likely null for test tenant)
      await admin.patch(`/admin/tenants/${state.tenantAlpha.id}`, {
        subscription_status: originalStatus || null,
      });
    });
  });

  // ==================== Billing Endpoint Validation ====================

  describe('Billing Endpoint Validation', () => {
    it('POST /api/billing/checkout with invalid plan → 400', async () => {
      const state = getTestState();
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.post('/api/billing/checkout', {
        plan: 'nonexistent_plan',
      });
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('Invalid plan');
    });

    it('POST /api/billing/portal without stripe_customer_id → 400', async () => {
      const state = getTestState();
      // Alpha tenant has no Stripe customer ID in test env
      const api = authApi(state.tenantAlpha.ownerToken);
      const res = await api.post('/api/billing/portal');
      expect(res.status).toBe(400);
      expect(res.data.error).toContain('No billing account');
    });
  });
});
