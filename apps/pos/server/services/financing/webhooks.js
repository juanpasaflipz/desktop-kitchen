/**
 * Financing Webhooks
 *
 * Webhook-ready architecture for lending partner integration.
 * Currently logs events; will POST to partner webhook when configured.
 *
 * Env: FINANCING_WEBHOOK_URL — if not set, webhook calls are skipped.
 */

import { audit } from '../../lib/auditLog.js';

const WEBHOOK_URL = process.env.FINANCING_WEBHOOK_URL || null;

/**
 * POST a payload to the configured webhook URL.
 * Returns silently on failure (fire-and-forget).
 */
async function sendWebhook(event, payload) {
  if (!WEBHOOK_URL) return;

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
      },
      body: JSON.stringify({ event, timestamp: new Date().toISOString(), ...payload }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error(`[Financing Webhook] ${event} failed: ${res.status}`);
    }
  } catch (err) {
    console.error(`[Financing Webhook] ${event} error:`, err.message);
  }
}

/**
 * Notify that a merchant has accepted a financing offer.
 * In the future, this will POST to a lending partner webhook.
 */
export async function notifyOfferAccepted(offer, profile, tenant) {
  const payload = {
    tenant_id: tenant.id,
    tenant_name: tenant.name,
    offer_id: offer.id,
    offer_amount: parseFloat(offer.offer_amount),
    factor_rate: parseFloat(offer.factor_rate),
    total_repayment: parseFloat(offer.total_repayment),
    holdback_percent: parseFloat(offer.holdback_percent),
    risk_score: profile?.risk_score || null,
    monthly_avg_revenue: profile ? parseFloat(profile.monthly_avg_revenue) : null,
  };

  console.log(`[Financing Webhook] offer_accepted — tenant=${tenant.id}, offer=${offer.id}, amount=${payload.offer_amount}`);

  audit({
    tenantId: tenant.id,
    actorType: 'system',
    actorId: 'webhook_dispatcher',
    action: 'create',
    resource: 'financing_webhook',
    details: { event: 'offer_accepted', webhook_url: WEBHOOK_URL ? '(configured)' : '(not configured)', ...payload },
  });

  await sendWebhook('offer_accepted', payload);
}

/**
 * Notify that a merchant's eligibility status has changed.
 * In the future, this will POST to a lending partner webhook.
 */
export async function notifyEligibilityChanged(tenantId, oldStatus, newStatus) {
  const payload = {
    tenant_id: tenantId,
    old_status: oldStatus,
    new_status: newStatus,
  };

  console.log(`[Financing Webhook] eligibility_changed — tenant=${tenantId}, ${oldStatus} -> ${newStatus}`);

  audit({
    tenantId,
    actorType: 'system',
    actorId: 'webhook_dispatcher',
    action: 'update',
    resource: 'financing_webhook',
    details: { event: 'eligibility_changed', webhook_url: WEBHOOK_URL ? '(configured)' : '(not configured)', ...payload },
  });

  await sendWebhook('eligibility_changed', payload);
}
