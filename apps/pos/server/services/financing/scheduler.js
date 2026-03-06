/**
 * Financing Scheduler
 *
 * Runs periodic jobs for the financing engine:
 * - Daily at 3:00 AM (Mexico City): recalculate all profiles, expire stale offers
 * - Weekly on Monday at 4:00 AM: refresh offers for all eligible merchants
 * - Monthly 1st at 2:00 AM: data retention cleanup (archive old events)
 *
 * Uses node-cron (same pattern as banking SyncScheduler).
 */

import cron from 'node-cron';
import { calculateAllProfiles } from './scoringEngine.js';
import { expireStaleOffers, refreshOffers } from './offerGenerator.js';
import { adminSql } from '../../db/index.js';
import { auditFinancing } from '../../lib/auditLog.js';

let dailyTask = null;
let weeklyTask = null;
let monthlyTask = null;

/**
 * Archive financing events older than 2 years.
 * Does NOT delete profiles or consent records (regulatory requirement).
 */
async function runDataRetentionCleanup() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 2);
  const cutoffISO = cutoff.toISOString();

  // Mark old events as archived by setting a flag in details
  const result = await adminSql`
    UPDATE merchant_financing_events
    SET details = details || '{"archived": true}'::jsonb
    WHERE created_at < ${cutoffISO}
      AND (details->>'archived') IS DISTINCT FROM 'true'
  `;

  const archivedCount = result.count || 0;

  console.log(`[Financing Scheduler] Data retention: archived ${archivedCount} events older than ${cutoffISO}`);

  // Log the cleanup action
  auditFinancing({
    tenantId: 'system',
    actorType: 'system',
    actorId: 'cron_scheduler',
    eventType: 'data_retention_cleanup',
    resource: 'financing_consent',
    details: {
      archived_events: archivedCount,
      cutoff_date: cutoffISO,
      note: 'Profiles and consent records retained indefinitely per regulatory requirement',
    },
  });
}

/**
 * Start the financing scheduler.
 */
export function startFinancingScheduler() {
  if (dailyTask) {
    console.log('[Financing Scheduler] Already running');
    return;
  }

  // Daily at 3:00 AM Mexico City — recalculate profiles + expire offers
  dailyTask = cron.schedule('0 3 * * *', async () => {
    try {
      console.log('[Financing Scheduler] Starting daily profile recalculation...');
      await calculateAllProfiles();
      await expireStaleOffers();
      console.log('[Financing Scheduler] Daily run complete');
    } catch (err) {
      console.error('[Financing Scheduler] Daily run failed:', err.message);
    }
  }, {
    timezone: 'America/Mexico_City',
  });

  // Weekly on Monday at 4:00 AM Mexico City — refresh offers
  weeklyTask = cron.schedule('0 4 * * 1', async () => {
    try {
      console.log('[Financing Scheduler] Starting weekly offer refresh...');
      await refreshOffers();
      console.log('[Financing Scheduler] Weekly run complete');
    } catch (err) {
      console.error('[Financing Scheduler] Weekly run failed:', err.message);
    }
  }, {
    timezone: 'America/Mexico_City',
  });

  // Monthly 1st at 2:00 AM Mexico City — data retention cleanup
  monthlyTask = cron.schedule('0 2 1 * *', async () => {
    try {
      console.log('[Financing Scheduler] Starting monthly data retention cleanup...');
      await runDataRetentionCleanup();
      console.log('[Financing Scheduler] Monthly cleanup complete');
    } catch (err) {
      console.error('[Financing Scheduler] Monthly cleanup failed:', err.message);
    }
  }, {
    timezone: 'America/Mexico_City',
  });

  console.log('[Financing Scheduler] Started — daily 3:00 AM, weekly Mon 4:00 AM, monthly 1st 2:00 AM (America/Mexico_City)');
}

/**
 * Stop the financing scheduler.
 */
export function stopFinancingScheduler() {
  if (dailyTask) {
    dailyTask.stop();
    dailyTask = null;
  }
  if (weeklyTask) {
    weeklyTask.stop();
    weeklyTask = null;
  }
  if (monthlyTask) {
    monthlyTask.stop();
    monthlyTask = null;
  }
  console.log('[Financing Scheduler] Stopped');
}
