/**
 * Financing Offer Generator
 *
 * Generates MCA-style working capital offers for eligible merchants,
 * manages offer lifecycle (expiry, refresh), and logs events.
 *
 * All operations use adminSql (platform-level, no RLS).
 */

import { adminSql } from '../../db/index.js';

// ─── Configurable factor rates (env overrides) ──────────────────────

const FACTOR_RATE_TIER1 = parseFloat(process.env.FINANCING_FACTOR_RATE_TIER1 || '1.12'); // score >= 80
const FACTOR_RATE_TIER2 = parseFloat(process.env.FINANCING_FACTOR_RATE_TIER2 || '1.15'); // score >= 70
const FACTOR_RATE_TIER3 = parseFloat(process.env.FINANCING_FACTOR_RATE_TIER3 || '1.20'); // score >= 65
const OFFER_VALIDITY_DAYS = parseInt(process.env.FINANCING_OFFER_VALIDITY_DAYS || '30', 10);

/**
 * Log a financing event (fire-and-forget).
 */
function logEvent(tenantId, eventType, details = {}) {
  adminSql`
    INSERT INTO merchant_financing_events (tenant_id, event_type, details)
    VALUES (${tenantId}, ${eventType}, ${JSON.stringify(details)}::jsonb)
  `.catch(err => {
    console.error('[Financing] Failed to log event:', err.message);
  });
}

/**
 * Generate a financing offer for an eligible merchant.
 *
 * @param {number|string} tenantId
 * @returns {object|null} The created offer, or null if not eligible / already has active offer
 */
export async function generateOffer(tenantId) {
  // 1. Read merchant profile
  const [profile] = await adminSql`
    SELECT * FROM merchant_financial_profiles
    WHERE tenant_id = ${tenantId}
  `;

  if (!profile) {
    console.log(`[Financing] No profile found for tenant ${tenantId} — skipping offer`);
    return null;
  }

  // 2. Only generate for eligible merchants
  if (profile.eligibility_status !== 'eligible') {
    console.log(`[Financing] Tenant ${tenantId} is ${profile.eligibility_status} — skipping offer`);
    return null;
  }

  // 3. Check for existing active offer
  const [existingOffer] = await adminSql`
    SELECT id FROM merchant_financing_offers
    WHERE tenant_id = ${tenantId}
      AND status IN ('available', 'viewed')
    LIMIT 1
  `;

  if (existingOffer) {
    console.log(`[Financing] Tenant ${tenantId} already has active offer #${existingOffer.id} — skipping`);
    return null;
  }

  // 4. Calculate offer terms
  const riskScore = parseFloat(profile.risk_score);
  const offerAmount = parseFloat(profile.max_advance_amount);
  const holdbackPercent = parseFloat(profile.suggested_holdback_percent);

  let factorRate = FACTOR_RATE_TIER3;
  if (riskScore >= 80) factorRate = FACTOR_RATE_TIER1;
  else if (riskScore >= 70) factorRate = FACTOR_RATE_TIER2;

  const totalRepayment = offerAmount * factorRate;

  // Estimate repayment days based on avg daily card revenue × holdback %
  const monthlyAvgRevenue = parseFloat(profile.monthly_avg_revenue);
  const cardPercent = parseFloat(profile.card_revenue_percent) / 100;
  const avgDailyCardRevenue = (monthlyAvgRevenue / 30) * cardPercent;
  const dailyHoldback = avgDailyCardRevenue * (holdbackPercent / 100);
  const estimatedRepaymentDays = dailyHoldback > 0
    ? Math.ceil(totalRepayment / dailyHoldback)
    : 365; // fallback cap

  const expiresAt = new Date(Date.now() + OFFER_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  // 5. Insert offer
  const [offer] = await adminSql`
    INSERT INTO merchant_financing_offers (
      tenant_id, offer_amount, holdback_percent, factor_rate,
      total_repayment, estimated_repayment_days, expires_at
    ) VALUES (
      ${tenantId}, ${offerAmount}, ${holdbackPercent}, ${factorRate},
      ${totalRepayment}, ${estimatedRepaymentDays}, ${expiresAt}
    )
    RETURNING *
  `;

  // 6. Log event
  logEvent(tenantId, 'offer_generated', {
    offer_id: offer.id,
    offer_amount: offerAmount,
    factor_rate: factorRate,
    estimated_repayment_days: estimatedRepaymentDays,
  });

  console.log(`[Financing] Generated offer #${offer.id} for tenant ${tenantId}: $${offerAmount} MXN at ${factorRate}x`);
  return offer;
}

/**
 * Expire all offers past their expires_at date.
 */
export async function expireStaleOffers() {
  const expired = await adminSql`
    UPDATE merchant_financing_offers
    SET status = 'expired'
    WHERE status IN ('available', 'viewed')
      AND expires_at < NOW()
    RETURNING id, tenant_id
  `;

  for (const offer of expired) {
    logEvent(offer.tenant_id, 'offer_expired', { offer_id: offer.id });
  }

  if (expired.length > 0) {
    console.log(`[Financing] Expired ${expired.length} stale offer(s)`);
  }

  return expired.length;
}

/**
 * Refresh offers for all eligible merchants.
 * Expires old offers first, then generates fresh ones where needed.
 */
export async function refreshOffers() {
  await expireStaleOffers();

  const eligibleTenants = await adminSql`
    SELECT tenant_id FROM merchant_financial_profiles
    WHERE eligibility_status = 'eligible'
  `;

  console.log(`[Financing] Refreshing offers for ${eligibleTenants.length} eligible tenant(s)...`);

  let generated = 0;
  let skipped = 0;

  for (const { tenant_id } of eligibleTenants) {
    try {
      const offer = await generateOffer(tenant_id);
      if (offer) generated++;
      else skipped++;
    } catch (err) {
      console.error(`[Financing] Offer generation failed for tenant ${tenant_id}:`, err.message);
      skipped++;
    }
  }

  console.log(`[Financing] Offer refresh complete: ${generated} generated, ${skipped} skipped`);
  return { generated, skipped };
}
