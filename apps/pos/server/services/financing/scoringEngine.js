/**
 * Merchant Financial Scoring Engine
 *
 * Analyzes 90 days of transaction data per tenant, calculates risk scores,
 * determines financing eligibility, and computes max advance amounts.
 *
 * All reads use adminSql (cross-tenant, no RLS).
 */

import { adminSql } from '../../db/index.js';

// ─── Configurable thresholds (env overrides) ────────────────────────

const MIN_DAYS_ELIGIBLE = parseInt(process.env.FINANCING_MIN_DAYS_ELIGIBLE || '90', 10);
const MIN_DAYS_PRE_ELIGIBLE = parseInt(process.env.FINANCING_MIN_DAYS_PRE_ELIGIBLE || '45', 10);
const MIN_REVENUE_ELIGIBLE = parseFloat(process.env.FINANCING_MIN_REVENUE_ELIGIBLE || '30000');
const MIN_REVENUE_PRE_ELIGIBLE = parseFloat(process.env.FINANCING_MIN_REVENUE_PRE_ELIGIBLE || '10000');
const MIN_SCORE_ELIGIBLE = parseFloat(process.env.FINANCING_MIN_SCORE_ELIGIBLE || '65');
const MIN_SCORE_PRE_ELIGIBLE = parseFloat(process.env.FINANCING_MIN_SCORE_PRE_ELIGIBLE || '45');
const MAX_ADVANCE_CAP = parseFloat(process.env.FINANCING_MAX_ADVANCE_CAP || '500000');
const ADVANCE_MULTIPLIER = parseFloat(process.env.FINANCING_ADVANCE_MULTIPLIER || '0.5');

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
 * Calculate standard deviation of an array of numbers.
 */
function stdDev(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sqDiffs = values.map(v => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Score revenue consistency (0-30 points).
 */
function scoreConsistency(volatility) {
  if (volatility < 0.2) return 30;
  if (volatility < 0.35) return 22;
  if (volatility < 0.5) return 15;
  return 8;
}

/**
 * Score revenue volume (0-25 points).
 */
function scoreVolume(monthlyAvg) {
  if (monthlyAvg >= 100_000) return 25;
  if (monthlyAvg >= 60_000) return 20;
  if (monthlyAvg >= 30_000) return 15;
  if (monthlyAvg >= 15_000) return 8;
  return 3;
}

/**
 * Score business maturity (0-15 points).
 */
function scoreMaturity(daysActive) {
  if (daysActive >= 365) return 15;
  if (daysActive >= 180) return 12;
  if (daysActive >= 90) return 8;
  if (daysActive >= 60) return 4;
  return 2;
}

/**
 * Score card payment ratio (0-15 points).
 */
function scoreCardRatio(cardPercent) {
  if (cardPercent >= 70) return 15;
  if (cardPercent >= 50) return 12;
  if (cardPercent >= 30) return 8;
  return 4;
}

/**
 * Score refund rate (0-15 points).
 */
function scoreRefundRate(refundRate) {
  if (refundRate < 0.01) return 15;
  if (refundRate < 0.03) return 12;
  if (refundRate < 0.05) return 8;
  if (refundRate < 0.10) return 4;
  return 1;
}

/**
 * Calculate the full financial profile for a single tenant.
 *
 * @param {number|string} tenantId
 * @returns {object} The upserted profile row
 */
export async function calculateMerchantProfile(tenantId) {
  // 1. Query last 90 days of completed orders
  const dailyData = await adminSql`
    SELECT date_trunc('day', created_at) as day,
           COUNT(*)::int as order_count,
           COALESCE(SUM(total), 0) as daily_revenue,
           COALESCE(SUM(CASE WHEN payment_method IN ('card', 'stripe', 'mercado_pago') THEN total ELSE 0 END), 0) as card_revenue,
           COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END), 0) as cash_revenue,
           COALESCE(AVG(total), 0) as avg_ticket
    FROM orders
    WHERE tenant_id = ${tenantId}
      AND created_at >= NOW() - INTERVAL '90 days'
      AND status IN ('completed', 'paid')
    GROUP BY day
    ORDER BY day
  `;

  // 2. Get refund count
  const [refundData] = await adminSql`
    SELECT COUNT(*)::int as refund_count
    FROM orders
    WHERE tenant_id = ${tenantId}
      AND created_at >= NOW() - INTERVAL '90 days'
      AND payment_status = 'refunded'
  `;

  // 3. Get first order date for days_active
  const [firstOrder] = await adminSql`
    SELECT MIN(created_at) as first_order_at
    FROM orders
    WHERE tenant_id = ${tenantId}
      AND status IN ('completed', 'paid')
  `;

  // Calculate metrics
  const totalRevenue = dailyData.reduce((sum, d) => sum + parseFloat(d.daily_revenue), 0);
  const totalOrders = dailyData.reduce((sum, d) => sum + d.order_count, 0);
  const totalCardRevenue = dailyData.reduce((sum, d) => sum + parseFloat(d.card_revenue), 0);
  const totalCashRevenue = dailyData.reduce((sum, d) => sum + parseFloat(d.cash_revenue), 0);
  const daysWithOrders = dailyData.length;

  const monthlyAvgRevenue = totalRevenue / 3;
  const monthlyAvgOrders = Math.round(totalOrders / 3);
  const avgTicketSize = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue trend: compare month 3 (most recent) vs month 1 (oldest)
  // Split daily data into 3 roughly equal periods
  const third = Math.ceil(dailyData.length / 3);
  const month1Revenue = dailyData.slice(0, third).reduce((s, d) => s + parseFloat(d.daily_revenue), 0);
  const month3Revenue = dailyData.slice(-third).reduce((s, d) => s + parseFloat(d.daily_revenue), 0);

  let revenueTrend = 'stable';
  if (month1Revenue > 0) {
    if (month3Revenue > month1Revenue * 1.1) revenueTrend = 'growing';
    else if (month3Revenue < month1Revenue * 0.9) revenueTrend = 'declining';
  }

  // Revenue volatility (coefficient of variation)
  const dailyRevenues = dailyData.map(d => parseFloat(d.daily_revenue));
  const meanDailyRevenue = dailyRevenues.length > 0
    ? dailyRevenues.reduce((a, b) => a + b, 0) / dailyRevenues.length
    : 0;
  const revenueVolatility = meanDailyRevenue > 0
    ? stdDev(dailyRevenues) / meanDailyRevenue
    : 0;

  // Refund rate
  const refundCount = refundData?.refund_count || 0;
  const refundRate = totalOrders > 0 ? refundCount / totalOrders : 0;

  // Days active
  const daysActive = firstOrder?.first_order_at
    ? Math.floor((Date.now() - new Date(firstOrder.first_order_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Payment mix
  const cardRevenuePercent = totalRevenue > 0 ? (totalCardRevenue / totalRevenue) * 100 : 0;
  const cashRevenuePercent = totalRevenue > 0 ? (totalCashRevenue / totalRevenue) * 100 : 0;

  // Average daily orders (across days with activity)
  const avgDailyOrders = daysWithOrders > 0 ? totalOrders / daysWithOrders : 0;

  // Peak hour concentration (% of revenue in top 3 hours)
  const hourlyRevenue = await adminSql`
    SELECT EXTRACT(HOUR FROM created_at)::int as hour,
           COALESCE(SUM(total), 0) as revenue
    FROM orders
    WHERE tenant_id = ${tenantId}
      AND created_at >= NOW() - INTERVAL '90 days'
      AND status IN ('completed', 'paid')
    GROUP BY hour
    ORDER BY revenue DESC
    LIMIT 3
  `;
  const topHoursRevenue = hourlyRevenue.reduce((s, h) => s + parseFloat(h.revenue), 0);
  const peakHourConcentration = totalRevenue > 0 ? (topHoursRevenue / totalRevenue) * 100 : 0;

  // 3. Composite risk score (0-100)
  const riskScore =
    scoreConsistency(revenueVolatility) +
    scoreVolume(monthlyAvgRevenue) +
    scoreMaturity(daysActive) +
    scoreCardRatio(cardRevenuePercent) +
    scoreRefundRate(refundRate);

  // 4. Eligibility determination
  let eligibilityStatus = 'ineligible';
  if (riskScore >= MIN_SCORE_ELIGIBLE && daysActive >= MIN_DAYS_ELIGIBLE && monthlyAvgRevenue >= MIN_REVENUE_ELIGIBLE) {
    eligibilityStatus = 'eligible';
  } else if (riskScore >= MIN_SCORE_PRE_ELIGIBLE && daysActive >= MIN_DAYS_PRE_ELIGIBLE && monthlyAvgRevenue >= MIN_REVENUE_PRE_ELIGIBLE) {
    eligibilityStatus = 'pre_eligible';
  }

  // 5. Max advance and holdback
  const maxAdvanceAmount = Math.min(monthlyAvgRevenue * ADVANCE_MULTIPLIER, MAX_ADVANCE_CAP);
  let suggestedHoldbackPercent = 15;
  if (riskScore >= 80) suggestedHoldbackPercent = 10;
  else if (riskScore >= 65) suggestedHoldbackPercent = 12;

  // 6. Upsert profile
  const [profile] = await adminSql`
    INSERT INTO merchant_financial_profiles (
      tenant_id, monthly_avg_revenue, monthly_avg_orders, avg_ticket_size,
      revenue_trend, revenue_volatility, refund_rate, days_active,
      card_revenue_percent, cash_revenue_percent, peak_hour_concentration,
      avg_daily_orders, risk_score, eligibility_status,
      max_advance_amount, suggested_holdback_percent, last_calculated_at, updated_at
    ) VALUES (
      ${tenantId}, ${monthlyAvgRevenue}, ${monthlyAvgOrders}, ${avgTicketSize},
      ${revenueTrend}, ${revenueVolatility}, ${refundRate}, ${daysActive},
      ${cardRevenuePercent}, ${cashRevenuePercent}, ${peakHourConcentration},
      ${avgDailyOrders}, ${riskScore}, ${eligibilityStatus},
      ${maxAdvanceAmount}, ${suggestedHoldbackPercent}, NOW(), NOW()
    )
    ON CONFLICT (tenant_id) DO UPDATE SET
      monthly_avg_revenue = EXCLUDED.monthly_avg_revenue,
      monthly_avg_orders = EXCLUDED.monthly_avg_orders,
      avg_ticket_size = EXCLUDED.avg_ticket_size,
      revenue_trend = EXCLUDED.revenue_trend,
      revenue_volatility = EXCLUDED.revenue_volatility,
      refund_rate = EXCLUDED.refund_rate,
      days_active = EXCLUDED.days_active,
      card_revenue_percent = EXCLUDED.card_revenue_percent,
      cash_revenue_percent = EXCLUDED.cash_revenue_percent,
      peak_hour_concentration = EXCLUDED.peak_hour_concentration,
      avg_daily_orders = EXCLUDED.avg_daily_orders,
      risk_score = EXCLUDED.risk_score,
      eligibility_status = EXCLUDED.eligibility_status,
      max_advance_amount = EXCLUDED.max_advance_amount,
      suggested_holdback_percent = EXCLUDED.suggested_holdback_percent,
      last_calculated_at = NOW(),
      updated_at = NOW()
    RETURNING *
  `;

  // 7. Log event
  logEvent(tenantId, 'profile_calculated', {
    risk_score: riskScore,
    eligibility_status: eligibilityStatus,
    monthly_avg_revenue: monthlyAvgRevenue,
    days_active: daysActive,
  });

  return profile;
}

/**
 * Batch-calculate profiles for all tenants that have given financing consent.
 */
export async function calculateAllProfiles() {
  const tenants = await adminSql`
    SELECT id FROM tenants
    WHERE active = true
      AND financing_consent_at IS NOT NULL
  `;

  console.log(`[Financing] Calculating profiles for ${tenants.length} consented tenant(s)...`);

  let success = 0;
  let failed = 0;

  for (const tenant of tenants) {
    try {
      await calculateMerchantProfile(tenant.id);
      success++;
    } catch (err) {
      console.error(`[Financing] Profile calculation failed for tenant ${tenant.id}:`, err.message);
      failed++;
    }
  }

  console.log(`[Financing] Profile calculation complete: ${success} success, ${failed} failed`);
  return { success, failed };
}
