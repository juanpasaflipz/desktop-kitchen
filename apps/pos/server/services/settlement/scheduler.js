/**
 * Settlement Scheduler
 *
 * Runs periodic jobs for the settlement and MCA engine.
 * Uses node-cron (same pattern as financing/scheduler.js).
 */

import cron from 'node-cron';
import { reconcileDaily } from './reconciliation.js';
import { processDisbursements, confirmPendingDisbursements } from './disbursement.js';
import { recalculateEstimatedCompletion } from './mcaHoldback.js';
import { runMCARiskCheck } from './mcaRiskMonitor.js';
import { adminSql } from '../../db/index.js';

let reconcileTask = null;
let disburseTask = null;
let confirmTask = null;
let mcaEstimateTask = null;
let riskCheckTask = null;
let weeklySummaryTask = null;

/**
 * Generate weekly settlement summary for admin review.
 */
async function generateWeeklySettlementSummary() {
  const [summary] = await adminSql`
    SELECT
      COUNT(DISTINCT batch_id)::int AS batches,
      COUNT(*)::int AS lines,
      COALESCE(SUM(gross_amount), 0) AS total_gross,
      COALESCE(SUM(platform_fee), 0) AS total_platform_fees,
      COALESCE(SUM(mca_holdback), 0) AS total_holdback,
      COALESCE(SUM(net_disbursement), 0) AS total_disbursed,
      COUNT(*) FILTER (WHERE disbursement_status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE disbursement_status = 'held')::int AS held
    FROM merchant_settlement_lines
    WHERE settlement_date >= CURRENT_DATE - INTERVAL '7 days'
  `;

  console.log(`[Settlement Summary] Weekly report:`);
  console.log(`  Batches: ${summary.batches}, Lines: ${summary.lines}`);
  console.log(`  Gross: $${parseFloat(summary.total_gross).toFixed(2)}`);
  console.log(`  Platform Fees: $${parseFloat(summary.total_platform_fees).toFixed(2)}`);
  console.log(`  MCA Holdback: $${parseFloat(summary.total_holdback).toFixed(2)}`);
  console.log(`  Disbursed: $${parseFloat(summary.total_disbursed).toFixed(2)}`);
  console.log(`  Completed: ${summary.completed}, Held: ${summary.held}`);
}

/**
 * Recalculate estimated completion for all active advances.
 */
async function recalculateAllMCAEstimates() {
  const advances = await adminSql`
    SELECT id FROM merchant_advances WHERE status = 'active'
  `;

  for (const advance of advances) {
    try {
      await recalculateEstimatedCompletion(advance.id);
    } catch (err) {
      console.error(`[Settlement Scheduler] MCA estimate recalc failed for advance ${advance.id}:`, err.message);
    }
  }

  console.log(`[Settlement Scheduler] Recalculated estimates for ${advances.length} active advances`);
}

/**
 * Start the settlement scheduler.
 */
export function startSettlementScheduler() {
  if (reconcileTask) {
    console.log('[Settlement Scheduler] Already running');
    return;
  }

  // 6:00 AM Mexico City — reconcile previous day's settlement
  reconcileTask = cron.schedule('0 6 * * *', async () => {
    try {
      console.log('[Settlement Scheduler] Starting daily reconciliation...');
      await reconcileDaily();
      console.log('[Settlement Scheduler] Daily reconciliation complete');
    } catch (err) {
      console.error('[Settlement Scheduler] Reconciliation failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  // 8:00 AM Mexico City — process disbursements
  disburseTask = cron.schedule('0 8 * * *', async () => {
    try {
      console.log('[Settlement Scheduler] Processing disbursements...');
      const today = new Date().toISOString().split('T')[0];
      await processDisbursements(today);
      console.log('[Settlement Scheduler] Disbursements complete');
    } catch (err) {
      console.error('[Settlement Scheduler] Disbursement failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  // 9:00 AM Mexico City — confirm pending SPEI transfers
  confirmTask = cron.schedule('0 9 * * *', async () => {
    try {
      console.log('[Settlement Scheduler] Confirming pending disbursements...');
      await confirmPendingDisbursements();
      console.log('[Settlement Scheduler] Confirmation complete');
    } catch (err) {
      console.error('[Settlement Scheduler] Confirmation failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  // 3:00 AM Mexico City — recalculate MCA estimates
  mcaEstimateTask = cron.schedule('0 3 * * *', async () => {
    try {
      console.log('[Settlement Scheduler] Recalculating MCA estimates...');
      await recalculateAllMCAEstimates();
    } catch (err) {
      console.error('[Settlement Scheduler] MCA estimate recalc failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  // 4:00 AM Mexico City — MCA risk check
  riskCheckTask = cron.schedule('0 4 * * *', async () => {
    try {
      console.log('[Settlement Scheduler] Running MCA risk check...');
      await runMCARiskCheck();
    } catch (err) {
      console.error('[Settlement Scheduler] Risk check failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  // Monday 7:00 AM Mexico City — weekly settlement summary
  weeklySummaryTask = cron.schedule('0 7 * * 1', async () => {
    try {
      console.log('[Settlement Scheduler] Generating weekly summary...');
      await generateWeeklySettlementSummary();
    } catch (err) {
      console.error('[Settlement Scheduler] Weekly summary failed:', err.message);
    }
  }, { timezone: 'America/Mexico_City' });

  console.log('[Settlement Scheduler] Started — reconcile 6AM, disburse 8AM, confirm 9AM, MCA estimates 3AM, risk 4AM, weekly Mon 7AM (America/Mexico_City)');
}

/**
 * Stop the settlement scheduler.
 */
export function stopSettlementScheduler() {
  const tasks = [reconcileTask, disburseTask, confirmTask, mcaEstimateTask, riskCheckTask, weeklySummaryTask];
  for (const task of tasks) {
    if (task) task.stop();
  }
  reconcileTask = null;
  disburseTask = null;
  confirmTask = null;
  mcaEstimateTask = null;
  riskCheckTask = null;
  weeklySummaryTask = null;
  console.log('[Settlement Scheduler] Stopped');
}
