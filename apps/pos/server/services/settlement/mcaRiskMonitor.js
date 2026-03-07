/**
 * MCA Risk Monitor
 *
 * Monitors active merchant advances for risk indicators:
 * - Revenue decline (30-day vs 60-day)
 * - Repayment pace (projected vs actual)
 * - Zero-revenue days in last 7 days
 * - Low holdback amounts
 */

import { adminSql } from '../../db/index.js';

/**
 * Run risk checks on all active advances.
 */
export async function runMCARiskCheck() {
  const advances = await adminSql`
    SELECT a.*, t.name AS tenant_name
    FROM merchant_advances a
    JOIN tenants t ON t.id = a.tenant_id
    WHERE a.status = 'active'
  `;

  console.log(`[MCA Risk] Checking ${advances.length} active advances`);

  for (const advance of advances) {
    const flags = [];
    let riskLevel = 'healthy';

    // 1. Revenue decline check
    const [recent] = await adminSql`
      SELECT COALESCE(SUM(holdback_amount), 0) AS total
      FROM mca_repayment_log
      WHERE advance_id = ${advance.id}
        AND settlement_date >= CURRENT_DATE - INTERVAL '30 days'
    `;
    const [prior] = await adminSql`
      SELECT COALESCE(SUM(holdback_amount), 0) AS total
      FROM mca_repayment_log
      WHERE advance_id = ${advance.id}
        AND settlement_date >= CURRENT_DATE - INTERVAL '60 days'
        AND settlement_date < CURRENT_DATE - INTERVAL '30 days'
    `;

    const recentTotal = parseFloat(recent.total);
    const priorTotal = parseFloat(prior.total);
    if (priorTotal > 0 && recentTotal < priorTotal * 0.7) {
      flags.push({ type: 'revenue_decline', detail: `30-day repayment $${recentTotal.toFixed(2)} vs prior 30-day $${priorTotal.toFixed(2)} (${((recentTotal / priorTotal) * 100).toFixed(0)}%)` });
      riskLevel = 'watch';
    }

    // 2. Repayment pace check
    const daysSinceStart = Math.max(1, Math.ceil((Date.now() - new Date(advance.created_at).getTime()) / (86400000)));
    const expectedDailyRepayment = parseFloat(advance.total_repayment) / (advance.estimated_repayment_days || 180);
    const actualDailyRepayment = parseFloat(advance.total_repaid) / daysSinceStart;

    if (expectedDailyRepayment > 0 && actualDailyRepayment < expectedDailyRepayment * 0.5) {
      flags.push({ type: 'slow_repayment', detail: `Actual $${actualDailyRepayment.toFixed(2)}/day vs expected $${expectedDailyRepayment.toFixed(2)}/day` });
      riskLevel = riskLevel === 'watch' ? 'warning' : 'watch';
    }

    // 3. Zero-revenue days in last 7 days
    const [zeroCheck] = await adminSql`
      SELECT COUNT(DISTINCT settlement_date)::int AS days_with_repayment
      FROM mca_repayment_log
      WHERE advance_id = ${advance.id}
        AND settlement_date >= CURRENT_DATE - INTERVAL '7 days'
    `;
    const zeroDays = 7 - zeroCheck.days_with_repayment;
    if (zeroDays >= 3) {
      flags.push({ type: 'zero_revenue_days', detail: `${zeroDays} of last 7 days with no repayment` });
      riskLevel = riskLevel === 'warning' ? 'critical' : 'warning';
    }

    // 4. Low holdback check (average < 50% of expected)
    const [avgHoldback] = await adminSql`
      SELECT COALESCE(AVG(holdback_amount), 0) AS avg_holdback
      FROM mca_repayment_log
      WHERE advance_id = ${advance.id}
        AND settlement_date >= CURRENT_DATE - INTERVAL '14 days'
    `;
    const avgAmount = parseFloat(avgHoldback.avg_holdback);
    if (expectedDailyRepayment > 0 && avgAmount > 0 && avgAmount < expectedDailyRepayment * 0.5) {
      flags.push({ type: 'low_holdback', detail: `Avg holdback $${avgAmount.toFixed(2)} vs expected $${expectedDailyRepayment.toFixed(2)}` });
    }

    // Update advance risk status
    await adminSql`
      UPDATE merchant_advances
      SET risk_status = ${riskLevel},
          risk_flags = ${JSON.stringify(flags)},
          last_risk_check_at = NOW(),
          updated_at = NOW()
      WHERE id = ${advance.id}
    `;

    // Log event if risk level changed
    if (riskLevel !== advance.risk_status) {
      await adminSql`
        INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
        VALUES (${advance.id}, ${advance.tenant_id}, 'risk_status_changed', 'system', ${JSON.stringify({
          previous: advance.risk_status,
          current: riskLevel,
          flags,
        })})
      `;
      console.log(`[MCA Risk] Advance ${advance.id} (${advance.tenant_name}): ${advance.risk_status} → ${riskLevel}`);
    }
  }

  console.log(`[MCA Risk] Risk check complete`);
}
