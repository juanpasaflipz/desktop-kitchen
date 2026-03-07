/**
 * MCA Holdback Engine
 *
 * Calculates and applies daily holdback deductions from merchant settlements
 * to repay active merchant cash advances.
 */

import { adminSql } from '../../db/index.js';

/**
 * Calculate holdback amount for a merchant's daily settlement.
 * @param {string} tenantId
 * @param {number} dailyCardVolume - Total card volume for the day
 * @param {string} settlementDate - ISO date string
 * @returns {{ advanceId: number|null, holdbackAmount: number, holdbackPercent: number, remainingBalance: number }|null}
 */
export async function calculateHoldback(tenantId, dailyCardVolume, settlementDate) {
  // Find active advance for this tenant
  const [advance] = await adminSql`
    SELECT id, holdback_percent, remaining_balance, status
    FROM merchant_advances
    WHERE tenant_id = ${tenantId}
      AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!advance) return null;

  const holdbackPercent = parseFloat(advance.holdback_percent);
  let holdbackAmount = dailyCardVolume * (holdbackPercent / 100);

  // Cap at remaining balance
  const remaining = parseFloat(advance.remaining_balance);
  if (holdbackAmount > remaining) {
    holdbackAmount = remaining;
  }

  // Round to 2 decimals
  holdbackAmount = Math.round(holdbackAmount * 100) / 100;

  return {
    advanceId: advance.id,
    holdbackAmount,
    holdbackPercent,
    remainingBalance: remaining,
  };
}

/**
 * Apply holdback deduction to an active advance.
 * @param {string} tenantId
 * @param {number} advanceId
 * @param {number} amount
 * @param {number|null} settlementLineId
 * @param {string} settlementDate
 * @returns {{ advance: object, completed: boolean }}
 */
export async function applyHoldback(tenantId, advanceId, amount, settlementLineId, settlementDate) {
  // Update advance balances
  const [updated] = await adminSql`
    UPDATE merchant_advances
    SET total_repaid = total_repaid + ${amount},
        remaining_balance = remaining_balance - ${amount},
        updated_at = NOW()
    WHERE id = ${advanceId}
      AND tenant_id = ${tenantId}
      AND status = 'active'
    RETURNING *
  `;

  if (!updated) {
    throw new Error(`Advance ${advanceId} not found or not active for tenant ${tenantId}`);
  }

  const cumulativeRepaid = parseFloat(updated.total_repaid);
  const remainingAfter = parseFloat(updated.remaining_balance);

  // Log repayment
  await adminSql`
    INSERT INTO mca_repayment_log (
      advance_id, tenant_id, settlement_line_id, settlement_date,
      daily_card_volume, holdback_percent, holdback_amount,
      cumulative_repaid, remaining_after
    ) VALUES (
      ${advanceId}, ${tenantId}, ${settlementLineId}, ${settlementDate},
      0, ${parseFloat(updated.holdback_percent)}, ${amount},
      ${cumulativeRepaid}, ${remainingAfter}
    )
  `;

  // Check if fully repaid
  let completed = false;
  if (remainingAfter <= 0.01) {
    await adminSql`
      UPDATE merchant_advances
      SET status = 'completed', completed_at = NOW(), remaining_balance = 0, updated_at = NOW()
      WHERE id = ${advanceId}
    `;

    // Return capital to pool
    await adminSql`
      UPDATE mca_capital_pool
      SET deployed = deployed - ${parseFloat(updated.advance_amount)},
          total_returned = total_returned + ${cumulativeRepaid},
          available = available + ${parseFloat(updated.advance_amount)},
          updated_at = NOW()
      WHERE id = 1
    `;

    // Log event
    await adminSql`
      INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
      VALUES (${advanceId}, ${tenantId}, 'advance_completed', 'system', ${JSON.stringify({
        total_repaid: cumulativeRepaid,
        advance_amount: parseFloat(updated.advance_amount),
      })})
    `;

    completed = true;
  }

  // Log holdback event
  await adminSql`
    INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
    VALUES (${advanceId}, ${tenantId}, 'holdback_applied', 'system', ${JSON.stringify({
      amount,
      settlement_date: settlementDate,
      cumulative_repaid: cumulativeRepaid,
      remaining: remainingAfter,
    })})
  `;

  return { advance: updated, completed };
}

/**
 * Recalculate estimated completion date for an advance based on trailing 30-day average.
 * @param {number} advanceId
 */
export async function recalculateEstimatedCompletion(advanceId) {
  const [advance] = await adminSql`
    SELECT * FROM merchant_advances WHERE id = ${advanceId} AND status = 'active'
  `;

  if (!advance) return;

  // Get trailing 30-day average holdback
  const [avg] = await adminSql`
    SELECT COALESCE(AVG(holdback_amount), 0) AS avg_daily_holdback
    FROM mca_repayment_log
    WHERE advance_id = ${advanceId}
      AND settlement_date >= CURRENT_DATE - INTERVAL '30 days'
  `;

  const avgDailyHoldback = parseFloat(avg.avg_daily_holdback);
  const remaining = parseFloat(advance.remaining_balance);

  if (avgDailyHoldback <= 0) return;

  const daysRemaining = Math.ceil(remaining / avgDailyHoldback);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);

  await adminSql`
    UPDATE merchant_advances
    SET estimated_completion_date = ${estimatedDate.toISOString().split('T')[0]},
        updated_at = NOW()
    WHERE id = ${advanceId}
  `;
}
