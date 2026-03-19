import { adminSql, tenantContext } from '../db/index.js';

const jobs = [];
let isRunning = false;
let loopTimer = null;

/**
 * Mutex — ensures only one job runs at a time so we never
 * exhaust the admin connection pool (max 10) with concurrent
 * scheduler jobs all iterating over tenants.
 */
let jobRunning = false;

/**
 * Register a scheduled job.
 * @param {string} name
 * @param {Function} fn
 * @param {number} intervalMs
 * @param {{ activeOnly?: boolean }} opts  — if activeOnly, only run for tenants with recent orders (24h)
 */
export function registerJob(name, fn, intervalMs, opts = {}) {
  jobs.push({
    name,
    fn,
    intervalMs,
    activeOnly: opts.activeOnly || false,
    lastRun: null,
    nextRunAt: Date.now(), // run immediately on first tick
    lastError: null,
    runCount: 0,
    running: false,
  });
}

/**
 * Start the scheduler — single loop checks all jobs every 30s.
 * Jobs are serialized: only one runs at a time to prevent
 * admin pool exhaustion when multiple jobs fire simultaneously.
 */
export function startScheduler() {
  if (isRunning) return;
  isRunning = true;

  console.log(`[AI Scheduler] Starting ${jobs.length} jobs (serialized)...`);
  for (const job of jobs) {
    console.log(`[AI Scheduler]   - ${job.name}: every ${Math.round(job.intervalMs / 1000)}s`);
  }

  // Check for due jobs every 30 seconds
  tick();
  loopTimer = setInterval(tick, 30_000);
}

/**
 * Scheduler tick — find the next due job and run it (one at a time).
 */
async function tick() {
  if (!isRunning || jobRunning) return;

  const now = Date.now();
  // Find the most overdue job
  const due = jobs
    .filter(j => !j.running && now >= j.nextRunAt)
    .sort((a, b) => a.nextRunAt - b.nextRunAt);

  if (due.length === 0) return;

  const job = due[0];
  jobRunning = true;
  job.running = true;

  try {
    await runJob(job);
  } finally {
    job.running = false;
    jobRunning = false;
    // Schedule next run from now (not from when it was due, to prevent catch-up storms)
    job.nextRunAt = Date.now() + job.intervalMs;
  }
}

/**
 * Stop all jobs
 */
export function stopScheduler() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
  isRunning = false;
  console.log('[AI Scheduler] Stopped');
}

/**
 * Get status of all jobs
 */
export function getSchedulerStatus() {
  return {
    running: isRunning,
    jobs: jobs.map(j => ({
      name: j.name,
      intervalMs: j.intervalMs,
      lastRun: j.lastRun,
      lastError: j.lastError,
      runCount: j.runCount,
    })),
  };
}

/**
 * Run a job for each active tenant.
 * Uses a transaction with set_config(..., true) for transaction-scoped tenant context,
 * and wraps the call in tenantContext so getConn() returns the transaction connection.
 * This prevents tenant context leaks between loop iterations or on error.
 */
async function runJob(job) {
  try {
    let tenants;
    if (job.activeOnly) {
      // Only run for tenants with orders in the last 24 hours
      tenants = await adminSql`
        SELECT DISTINCT t.id FROM tenants t
        JOIN orders o ON o.tenant_id = t.id
        WHERE t.active = true
          AND o.created_at >= NOW() - INTERVAL '24 hours'
      `;
      if (tenants.length === 0) return; // nothing to do — skip silently
    } else {
      tenants = await adminSql`SELECT id FROM tenants WHERE active = true`;
    }

    for (const tenant of tenants) {
      // Bail out early if scheduler was stopped during iteration
      if (!isRunning) break;

      try {
        await adminSql.begin(async (tx) => {
          await tx`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;
          await new Promise((resolve, reject) => {
            tenantContext.run({ conn: tx }, async () => {
              try { await job.fn(); resolve(); }
              catch (e) { reject(e); }
            });
          });
        });
      } catch (err) {
        console.error(`[AI Scheduler] Job "${job.name}" failed for tenant ${tenant.id}:`, err.message);
      }
    }

    job.lastRun = new Date().toISOString();
    job.runCount++;
    job.lastError = null;
  } catch (error) {
    job.lastError = error.message;
    console.error(`[AI Scheduler] Job "${job.name}" failed:`, error.message);
  }
}
