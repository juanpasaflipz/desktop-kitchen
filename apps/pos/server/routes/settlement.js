/**
 * Settlement API Routes
 *
 * Merchant-facing (ownerAuth + tenant middleware):
 *   GET  /api/settlement/summary
 *   GET  /api/settlement/history
 *   GET  /api/settlement/statement/:month
 *   GET  /api/settlement/statement/:month/download
 *
 * Super admin (adminSecret):
 *   GET   /admin/settlement/overview
 *   GET   /admin/settlement/batches
 *   GET   /admin/settlement/batches/:id
 *   GET   /admin/settlement/disbursements
 *   POST  /admin/settlement/disbursements/:lineId/approve
 *   POST  /admin/settlement/disbursements/:lineId/hold
 *   POST  /admin/settlement/disbursements/process
 *   GET   /admin/settlement/ledger
 *   GET   /admin/mca/portfolio
 *   GET   /admin/mca/advances/:id
 *   POST  /admin/mca/advances/:id/pause
 *   POST  /admin/mca/advances/:id/resume
 *   PATCH /admin/mca/advances/:id/holdback
 *   POST  /admin/mca/capital
 *   GET   /admin/mca/capital
 */

import { Router } from 'express';
import { adminSql, getTenantId } from '../db/index.js';
import { requireOwner } from '../middleware/ownerAuth.js';
import { confirmDisbursement, processDisbursements } from '../services/settlement/disbursement.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════
// MERCHANT-FACING ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

// GET /api/settlement/summary
router.get('/summary', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;

    const [pending] = await adminSql`
      SELECT
        COALESCE(SUM(net_disbursement), 0) AS pending_amount,
        COUNT(*)::int AS pending_count
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND disbursement_status IN ('pending', 'processing')
    `;

    const [fees] = await adminSql`
      SELECT
        COALESCE(SUM(platform_fee), 0) AS total_platform_fees,
        COALESCE(SUM(processor_fee), 0) AS total_processor_fees,
        COALESCE(SUM(mca_holdback), 0) AS total_holdback
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND settlement_date >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    const [lastDisbursement] = await adminSql`
      SELECT disbursed_at, net_disbursement
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND disbursement_status = 'completed'
      ORDER BY disbursed_at DESC
      LIMIT 1
    `;

    const [nextPending] = await adminSql`
      SELECT settlement_date, net_disbursement
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND disbursement_status = 'pending'
      ORDER BY settlement_date ASC
      LIMIT 1
    `;

    res.json({
      pending_amount: parseFloat(pending.pending_amount),
      pending_count: pending.pending_count,
      month_fees: {
        platform: parseFloat(fees.total_platform_fees),
        processor: parseFloat(fees.total_processor_fees),
        holdback: parseFloat(fees.total_holdback),
      },
      last_disbursement: lastDisbursement || null,
      next_disbursement: nextPending || null,
    });
  } catch (error) {
    console.error('[Settlement] Summary error:', error.message);
    res.status(500).json({ error: 'Failed to fetch settlement summary' });
  }
});

// GET /api/settlement/history
router.get('/history', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const { limit = '20', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offsetNum = parseInt(offset, 10) || 0;

    const [{ count: total }] = await adminSql`
      SELECT COUNT(*)::int AS count
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND disbursement_status = 'completed'
    `;

    const history = await adminSql`
      SELECT id, settlement_date, gross_amount, processor_fee, platform_fee,
             mca_holdback, net_disbursement, disbursement_status, disbursed_at,
             disbursement_reference
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND disbursement_status = 'completed'
      ORDER BY disbursed_at DESC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    res.json({ history: Array.from(history), total });
  } catch (error) {
    console.error('[Settlement] History error:', error.message);
    res.status(500).json({ error: 'Failed to fetch disbursement history' });
  }
});

// GET /api/settlement/statement/:month (YYYY-MM)
router.get('/statement/:month', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const month = req.params.month;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month format must be YYYY-MM' });
    }

    const startDate = `${month}-01`;

    const lines = await adminSql`
      SELECT id, settlement_date, gross_amount, processor_fee, platform_fee,
             mca_holdback, net_disbursement, disbursement_status, disbursed_at,
             transaction_count
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND settlement_date >= ${startDate}::date
        AND settlement_date < (${startDate}::date + INTERVAL '1 month')
      ORDER BY settlement_date ASC
    `;

    const [totals] = await adminSql`
      SELECT
        COALESCE(SUM(gross_amount), 0) AS total_gross,
        COALESCE(SUM(processor_fee), 0) AS total_processor_fee,
        COALESCE(SUM(platform_fee), 0) AS total_platform_fee,
        COALESCE(SUM(mca_holdback), 0) AS total_holdback,
        COALESCE(SUM(net_disbursement), 0) AS total_net,
        COALESCE(SUM(transaction_count), 0)::int AS total_transactions
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND settlement_date >= ${startDate}::date
        AND settlement_date < (${startDate}::date + INTERVAL '1 month')
    `;

    res.json({
      month,
      lines: Array.from(lines),
      totals: {
        gross: parseFloat(totals.total_gross),
        processor_fee: parseFloat(totals.total_processor_fee),
        platform_fee: parseFloat(totals.total_platform_fee),
        holdback: parseFloat(totals.total_holdback),
        net: parseFloat(totals.total_net),
        transactions: totals.total_transactions,
      },
    });
  } catch (error) {
    console.error('[Settlement] Statement error:', error.message);
    res.status(500).json({ error: 'Failed to fetch settlement statement' });
  }
});

// GET /api/settlement/statement/:month/download (CSV)
router.get('/statement/:month/download', requireOwner, async (req, res) => {
  try {
    const tenantId = req.owner.tenantId;
    const month = req.params.month;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Month format must be YYYY-MM' });
    }

    const startDate = `${month}-01`;

    const lines = await adminSql`
      SELECT settlement_date, gross_amount, processor_fee, platform_fee,
             mca_holdback, net_disbursement, transaction_count, disbursement_status, disbursed_at
      FROM merchant_settlement_lines
      WHERE tenant_id = ${tenantId}
        AND settlement_date >= ${startDate}::date
        AND settlement_date < (${startDate}::date + INTERVAL '1 month')
      ORDER BY settlement_date ASC
    `;

    const header = 'Date,Gross,Processor Fee,Platform Fee,MCA Holdback,Net Disbursement,Transactions,Status,Disbursed At\n';
    const rows = lines.map(l =>
      `${l.settlement_date.toISOString().split('T')[0]},${l.gross_amount},${l.processor_fee},${l.platform_fee},${l.mca_holdback},${l.net_disbursement},${l.transaction_count},${l.disbursement_status},${l.disbursed_at || ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=settlement-${month}.csv`);
    res.send(header + rows);
  } catch (error) {
    console.error('[Settlement] CSV download error:', error.message);
    res.status(500).json({ error: 'Failed to download statement' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// SUPER ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════

export const adminRouter = Router();

function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!process.env.ADMIN_SECRET) return res.status(500).json({ error: 'ADMIN_SECRET not configured' });
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Invalid admin secret' });
  next();
}

adminRouter.use(requireAdmin);

// GET /admin/settlement/overview
adminRouter.get('/overview', async (req, res) => {
  try {
    const [holding] = await adminSql`
      SELECT COALESCE(SUM(credit) - SUM(debit), 0) AS balance
      FROM holding_account_ledger
    `;

    const [pending] = await adminSql`
      SELECT
        COALESCE(SUM(net_disbursement), 0) AS pending_amount,
        COUNT(*)::int AS pending_count
      FROM merchant_settlement_lines
      WHERE disbursement_status IN ('pending', 'processing')
    `;

    const [fees] = await adminSql`
      SELECT
        COALESCE(SUM(platform_fee), 0) AS platform_fees,
        COALESCE(SUM(processor_fee), 0) AS processor_fees
      FROM merchant_settlement_lines
      WHERE settlement_date >= DATE_TRUNC('month', CURRENT_DATE)
    `;

    const [mcaStats] = await adminSql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')::int AS active_advances,
        COALESCE(SUM(remaining_balance) FILTER (WHERE status = 'active'), 0) AS total_outstanding,
        COALESCE(SUM(total_repaid) FILTER (WHERE status IN ('active', 'completed')), 0) AS total_repaid
      FROM merchant_advances
    `;

    const [pool] = await adminSql`
      SELECT * FROM mca_capital_pool WHERE id = 1
    `;

    res.json({
      holding_balance: parseFloat(holding.balance),
      pending_disbursement: parseFloat(pending.pending_amount),
      pending_count: pending.pending_count,
      month_platform_fees: parseFloat(fees.platform_fees),
      month_processor_fees: parseFloat(fees.processor_fees),
      mca: {
        active_advances: mcaStats.active_advances,
        total_outstanding: parseFloat(mcaStats.total_outstanding),
        total_repaid: parseFloat(mcaStats.total_repaid),
      },
      capital_pool: pool ? {
        total: parseFloat(pool.total_capital),
        deployed: parseFloat(pool.deployed),
        available: parseFloat(pool.available),
        returned: parseFloat(pool.total_returned),
      } : null,
    });
  } catch (error) {
    console.error('[Settlement Admin] Overview error:', error.message);
    res.status(500).json({ error: 'Failed to fetch settlement overview' });
  }
});

// GET /admin/settlement/batches
adminRouter.get('/batches', async (req, res) => {
  try {
    const { limit = '20', offset = '0', status } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const offsetNum = parseInt(offset, 10) || 0;

    let batches;
    let total;

    if (status) {
      [{ count: total }] = await adminSql`SELECT COUNT(*)::int AS count FROM getnet_settlement_batches WHERE status = ${status}`;
      batches = await adminSql`
        SELECT * FROM getnet_settlement_batches WHERE status = ${status}
        ORDER BY settlement_date DESC LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
    } else {
      [{ count: total }] = await adminSql`SELECT COUNT(*)::int AS count FROM getnet_settlement_batches`;
      batches = await adminSql`
        SELECT * FROM getnet_settlement_batches
        ORDER BY settlement_date DESC LIMIT ${limitNum} OFFSET ${offsetNum}
      `;
    }

    res.json({ batches: Array.from(batches), total });
  } catch (error) {
    console.error('[Settlement Admin] Batches error:', error.message);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
});

// GET /admin/settlement/batches/:id
adminRouter.get('/batches/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id, 10);

    const [batch] = await adminSql`SELECT * FROM getnet_settlement_batches WHERE id = ${batchId}`;
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const lines = await adminSql`
      SELECT sl.*, t.name AS tenant_name
      FROM merchant_settlement_lines sl
      JOIN tenants t ON t.id = sl.tenant_id
      WHERE sl.batch_id = ${batchId}
      ORDER BY sl.gross_amount DESC
    `;

    res.json({ batch, lines: Array.from(lines) });
  } catch (error) {
    console.error('[Settlement Admin] Batch detail error:', error.message);
    res.status(500).json({ error: 'Failed to fetch batch details' });
  }
});

// GET /admin/settlement/disbursements
adminRouter.get('/disbursements', async (req, res) => {
  try {
    const { status = 'pending', limit = '50', offset = '0' } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 200);
    const offsetNum = parseInt(offset, 10) || 0;

    const [{ count: total }] = await adminSql`
      SELECT COUNT(*)::int AS count FROM merchant_settlement_lines WHERE disbursement_status = ${status}
    `;

    const lines = await adminSql`
      SELECT sl.*, t.name AS tenant_name, ba.bank_name, ba.clabe
      FROM merchant_settlement_lines sl
      JOIN tenants t ON t.id = sl.tenant_id
      LEFT JOIN merchant_bank_accounts ba ON ba.id = sl.disbursement_bank_account_id
      WHERE sl.disbursement_status = ${status}
      ORDER BY sl.settlement_date ASC
      LIMIT ${limitNum} OFFSET ${offsetNum}
    `;

    res.json({ disbursements: Array.from(lines), total });
  } catch (error) {
    console.error('[Settlement Admin] Disbursements error:', error.message);
    res.status(500).json({ error: 'Failed to fetch disbursements' });
  }
});

// POST /admin/settlement/disbursements/:lineId/approve
adminRouter.post('/disbursements/:lineId/approve', async (req, res) => {
  try {
    const lineId = parseInt(req.params.lineId, 10);
    const { bank_reference } = req.body || {};

    const updated = await confirmDisbursement(lineId, bank_reference);
    res.json({ disbursement: updated });
  } catch (error) {
    console.error('[Settlement Admin] Approve error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /admin/settlement/disbursements/:lineId/hold
adminRouter.post('/disbursements/:lineId/hold', async (req, res) => {
  try {
    const lineId = parseInt(req.params.lineId, 10);
    const { reason } = req.body || {};

    const [updated] = await adminSql`
      UPDATE merchant_settlement_lines
      SET disbursement_status = 'held', hold_reason = ${reason || 'Admin hold'}
      WHERE id = ${lineId}
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Settlement line not found' });
    res.json({ disbursement: updated });
  } catch (error) {
    console.error('[Settlement Admin] Hold error:', error.message);
    res.status(500).json({ error: 'Failed to hold disbursement' });
  }
});

// POST /admin/settlement/disbursements/process
adminRouter.post('/disbursements/process', async (req, res) => {
  try {
    const { date } = req.body || {};
    const targetDate = date || new Date().toISOString().split('T')[0];
    const result = await processDisbursements(targetDate);
    res.json(result);
  } catch (error) {
    console.error('[Settlement Admin] Process error:', error.message);
    res.status(500).json({ error: 'Failed to process disbursements' });
  }
});

// GET /admin/settlement/ledger
adminRouter.get('/ledger', async (req, res) => {
  try {
    const { limit = '50', offset = '0', entry_type, tenant_id } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 200);
    const offsetNum = parseInt(offset, 10) || 0;

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (entry_type) { conditions.push(`entry_type = $${paramIdx++}`); params.push(entry_type); }
    if (tenant_id) { conditions.push(`tenant_id = $${paramIdx++}`); params.push(tenant_id); }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [{ count: total }] = await adminSql.unsafe(
      `SELECT COUNT(*)::int AS count FROM holding_account_ledger ${whereClause}`,
      params
    );

    const entries = await adminSql.unsafe(
      `SELECT l.*, t.name AS tenant_name
       FROM holding_account_ledger l
       LEFT JOIN tenants t ON t.id = l.tenant_id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limitNum, offsetNum]
    );

    res.json({ entries: Array.from(entries), total });
  } catch (error) {
    console.error('[Settlement Admin] Ledger error:', error.message);
    res.status(500).json({ error: 'Failed to fetch ledger' });
  }
});

// GET /admin/mca/portfolio
adminRouter.get('/mca/portfolio', async (req, res) => {
  try {
    const advances = await adminSql`
      SELECT a.*, t.name AS tenant_name
      FROM merchant_advances a
      JOIN tenants t ON t.id = a.tenant_id
      WHERE a.status IN ('active', 'paused')
      ORDER BY a.created_at DESC
    `;

    const completed = await adminSql`
      SELECT a.*, t.name AS tenant_name
      FROM merchant_advances a
      JOIN tenants t ON t.id = a.tenant_id
      WHERE a.status = 'completed'
      ORDER BY a.completed_at DESC
      LIMIT 20
    `;

    res.json({
      active: Array.from(advances),
      completed: Array.from(completed),
    });
  } catch (error) {
    console.error('[Settlement Admin] MCA portfolio error:', error.message);
    res.status(500).json({ error: 'Failed to fetch MCA portfolio' });
  }
});

// GET /admin/mca/advances/:id
adminRouter.get('/mca/advances/:id', async (req, res) => {
  try {
    const advanceId = parseInt(req.params.id, 10);

    const [advance] = await adminSql`
      SELECT a.*, t.name AS tenant_name
      FROM merchant_advances a
      JOIN tenants t ON t.id = a.tenant_id
      WHERE a.id = ${advanceId}
    `;
    if (!advance) return res.status(404).json({ error: 'Advance not found' });

    const repayments = await adminSql`
      SELECT * FROM mca_repayment_log
      WHERE advance_id = ${advanceId}
      ORDER BY settlement_date DESC
      LIMIT 60
    `;

    const events = await adminSql`
      SELECT * FROM mca_events
      WHERE advance_id = ${advanceId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json({
      advance,
      repayments: Array.from(repayments),
      events: Array.from(events),
    });
  } catch (error) {
    console.error('[Settlement Admin] Advance detail error:', error.message);
    res.status(500).json({ error: 'Failed to fetch advance details' });
  }
});

// POST /admin/mca/advances/:id/pause
adminRouter.post('/mca/advances/:id/pause', async (req, res) => {
  try {
    const advanceId = parseInt(req.params.id, 10);
    const { reason } = req.body || {};

    const [updated] = await adminSql`
      UPDATE merchant_advances
      SET status = 'paused', paused_at = NOW(), pause_reason = ${reason || 'Admin paused'}, updated_at = NOW()
      WHERE id = ${advanceId} AND status = 'active'
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Advance not found or not active' });

    await adminSql`
      INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
      VALUES (${advanceId}, ${updated.tenant_id}, 'holdback_paused', 'admin', ${JSON.stringify({ reason })})
    `;

    res.json({ advance: updated });
  } catch (error) {
    console.error('[Settlement Admin] Pause error:', error.message);
    res.status(500).json({ error: 'Failed to pause advance' });
  }
});

// POST /admin/mca/advances/:id/resume
adminRouter.post('/mca/advances/:id/resume', async (req, res) => {
  try {
    const advanceId = parseInt(req.params.id, 10);

    const [updated] = await adminSql`
      UPDATE merchant_advances
      SET status = 'active', paused_at = NULL, pause_reason = NULL, updated_at = NOW()
      WHERE id = ${advanceId} AND status = 'paused'
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Advance not found or not paused' });

    await adminSql`
      INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
      VALUES (${advanceId}, ${updated.tenant_id}, 'holdback_resumed', 'admin', '{}')
    `;

    res.json({ advance: updated });
  } catch (error) {
    console.error('[Settlement Admin] Resume error:', error.message);
    res.status(500).json({ error: 'Failed to resume advance' });
  }
});

// PATCH /admin/mca/advances/:id/holdback
adminRouter.patch('/mca/advances/:id/holdback', async (req, res) => {
  try {
    const advanceId = parseInt(req.params.id, 10);
    const { holdback_percent } = req.body;

    if (holdback_percent == null || holdback_percent < 1 || holdback_percent > 50) {
      return res.status(400).json({ error: 'holdback_percent must be between 1 and 50' });
    }

    const [updated] = await adminSql`
      UPDATE merchant_advances
      SET holdback_percent = ${holdback_percent}, updated_at = NOW()
      WHERE id = ${advanceId} AND status IN ('active', 'paused')
      RETURNING *
    `;

    if (!updated) return res.status(404).json({ error: 'Advance not found' });

    await adminSql`
      INSERT INTO mca_events (advance_id, tenant_id, event_type, actor_type, details)
      VALUES (${advanceId}, ${updated.tenant_id}, 'holdback_adjusted', 'admin', ${JSON.stringify({ new_percent: holdback_percent })})
    `;

    res.json({ advance: updated });
  } catch (error) {
    console.error('[Settlement Admin] Holdback adjust error:', error.message);
    res.status(500).json({ error: 'Failed to adjust holdback' });
  }
});

// GET /admin/mca/capital
adminRouter.get('/mca/capital', async (req, res) => {
  try {
    const [pool] = await adminSql`SELECT * FROM mca_capital_pool WHERE id = 1`;
    res.json(pool || { total_capital: 0, deployed: 0, available: 0, total_returned: 0 });
  } catch (error) {
    console.error('[Settlement Admin] Capital pool error:', error.message);
    res.status(500).json({ error: 'Failed to fetch capital pool' });
  }
});

// POST /admin/mca/capital
adminRouter.post('/mca/capital', async (req, res) => {
  try {
    const { action, amount } = req.body;

    if (!['add', 'withdraw'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "add" or "withdraw"' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    if (action === 'add') {
      const [updated] = await adminSql`
        UPDATE mca_capital_pool
        SET total_capital = total_capital + ${amount},
            available = available + ${amount},
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `;

      await adminSql`
        INSERT INTO holding_account_ledger (entry_type, reference_type, credit, debit, balance_after, description)
        VALUES ('capital_injection', 'mca_capital_pool',  ${amount}, 0,
          (SELECT COALESCE(SUM(credit) - SUM(debit), 0) FROM holding_account_ledger) + ${amount},
          'MCA capital injection')
      `;

      res.json(updated);
    } else {
      const [pool] = await adminSql`SELECT available FROM mca_capital_pool WHERE id = 1`;
      if (parseFloat(pool.available) < amount) {
        return res.status(400).json({ error: 'Insufficient available capital' });
      }

      const [updated] = await adminSql`
        UPDATE mca_capital_pool
        SET total_capital = total_capital - ${amount},
            available = available - ${amount},
            updated_at = NOW()
        WHERE id = 1
        RETURNING *
      `;

      await adminSql`
        INSERT INTO holding_account_ledger (entry_type, reference_type, debit, credit, balance_after, description)
        VALUES ('capital_withdrawal', 'mca_capital_pool', ${amount}, 0,
          (SELECT COALESCE(SUM(credit) - SUM(debit), 0) FROM holding_account_ledger) - ${amount},
          'MCA capital withdrawal')
      `;

      res.json(updated);
    }
  } catch (error) {
    console.error('[Settlement Admin] Capital update error:', error.message);
    res.status(500).json({ error: 'Failed to update capital pool' });
  }
});

export default router;
