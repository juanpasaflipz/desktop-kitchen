/**
 * Financing Scheduler
 *
 * Runs periodic jobs for the financing engine:
 * - Daily at 3:00 AM (Mexico City): recalculate all profiles, expire stale offers
 * - Weekly on Monday at 4:00 AM: refresh offers for all eligible merchants
 *
 * Uses node-cron (same pattern as banking SyncScheduler).
 */

import cron from 'node-cron';
import { calculateAllProfiles } from './scoringEngine.js';
import { expireStaleOffers, refreshOffers } from './offerGenerator.js';

let dailyTask = null;
let weeklyTask = null;

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

  console.log('[Financing Scheduler] Started — daily at 3:00 AM, weekly Monday 4:00 AM (America/Mexico_City)');
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
  console.log('[Financing Scheduler] Stopped');
}
