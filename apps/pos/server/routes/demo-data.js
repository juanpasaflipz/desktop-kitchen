import { Router } from 'express';
import { adminSql } from '../db/index.js';
import { generateDemoData } from '../lib/demoDataGenerator.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const DEMO_SOURCE = 'demo_generator';

// All endpoints require authenticated employee
router.use(requireAuth());

// GET /api/demo-data/status — check demo data counts for current tenant
router.get('/status', async (req, res) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return res.status(400).json({ error: 'No tenant context' });

    // Safety: only allow on trial tenants
    const [tenant] = await adminSql`SELECT plan FROM tenants WHERE id = ${tenantId}`;
    if (!tenant || tenant.plan !== 'trial') {
      return res.json({ allowed: false, reason: 'Demo data is only available for trial accounts' });
    }

    const [[orderCount], [customerCount], [deliveryCount], [snapshotCount], [financialCount]] = await Promise.all([
      adminSql`SELECT COUNT(*)::int AS c FROM orders WHERE tenant_id = ${tenantId} AND source = ${DEMO_SOURCE}`,
      adminSql`SELECT COUNT(*)::int AS c FROM loyalty_customers WHERE tenant_id = ${tenantId} AND demo_batch_id IS NOT NULL`,
      adminSql`SELECT COUNT(*)::int AS c FROM delivery_orders WHERE tenant_id = ${tenantId} AND order_id IN (SELECT id FROM orders WHERE tenant_id = ${tenantId} AND source = ${DEMO_SOURCE})`,
      adminSql`SELECT COUNT(*)::int AS c FROM ai_hourly_snapshots WHERE tenant_id = ${tenantId} AND demo_batch_id IS NOT NULL`,
      adminSql`SELECT COUNT(*)::int AS c FROM financial_actuals WHERE tenant_id = ${tenantId} AND demo_batch_id IS NOT NULL`,
    ]);

    res.json({
      allowed: true,
      hasDemo: orderCount.c > 0 || customerCount.c > 0,
      counts: {
        orders: orderCount.c,
        customers: customerCount.c,
        delivery_orders: deliveryCount.c,
        ai_snapshots: snapshotCount.c,
        financial_actuals: financialCount.c,
      },
    });
  } catch (error) {
    console.error('[DemoData] Status error:', error);
    res.status(500).json({ error: 'Failed to fetch demo data status' });
  }
});

// POST /api/demo-data/generate — generate demo data for current tenant
router.post('/generate', async (req, res) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return res.status(400).json({ error: 'No tenant context' });

    // Safety: only allow on trial tenants
    const [tenant] = await adminSql`SELECT plan FROM tenants WHERE id = ${tenantId}`;
    if (!tenant || tenant.plan !== 'trial') {
      return res.status(403).json({ error: 'Demo data is only available for trial accounts' });
    }

    // Check for existing demo data
    const [existing] = await adminSql`
      SELECT COUNT(*)::int AS c FROM orders
      WHERE tenant_id = ${tenantId} AND source = ${DEMO_SOURCE}
    `;
    if (existing.c > 0) {
      return res.status(409).json({ error: 'Demo data already exists. Clear it first.' });
    }

    const [run] = await adminSql`
      INSERT INTO stress_test_runs (tenant_id, config)
      VALUES (${tenantId}, ${JSON.stringify({ volume: 'medium', date_range_days: 30, source: 'pos_admin' })})
      RETURNING id
    `;

    const summary = await generateDemoData(adminSql, {
      tenantId,
      batchId: run.id,
      volume: 'medium',
      dateRangeDays: 30,
      includeDelivery: true,
      includeLoyalty: true,
      includeAi: true,
      includeFinancials: true,
    });

    await adminSql`UPDATE stress_test_runs SET summary = ${JSON.stringify(summary)} WHERE id = ${run.id}`;

    res.json({ run_id: run.id, summary });
  } catch (error) {
    console.error('[DemoData] Generate error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate demo data' });
  }
});

// DELETE /api/demo-data — clear all demo data for current tenant
router.delete('/', async (req, res) => {
  try {
    const tenantId = req.tenant?.id;
    if (!tenantId) return res.status(400).json({ error: 'No tenant context' });

    const deleted = {};

    await adminSql.begin(async (sql) => {
      const r1 = await sql.unsafe(`
        DELETE FROM order_item_modifiers WHERE tenant_id = $1
          AND order_item_id IN (
            SELECT oi.id FROM order_items oi
            JOIN orders o ON o.id = oi.order_id
            WHERE o.tenant_id = $1 AND o.source = $2
          )
      `, [tenantId, DEMO_SOURCE]);
      deleted.order_item_modifiers = r1.count;

      const r2 = await sql.unsafe(`DELETE FROM stamp_events WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.stamp_events = r2.count;

      const r3 = await sql.unsafe(`DELETE FROM referral_events WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.referral_events = r3.count;

      const r4 = await sql.unsafe(`DELETE FROM order_items WHERE tenant_id = $1 AND order_id IN (SELECT id FROM orders WHERE tenant_id = $1 AND source = $2)`, [tenantId, DEMO_SOURCE]);
      deleted.order_items = r4.count;

      const r5 = await sql.unsafe(`DELETE FROM order_payments WHERE tenant_id = $1 AND order_id IN (SELECT id FROM orders WHERE tenant_id = $1 AND source = $2)`, [tenantId, DEMO_SOURCE]);
      deleted.order_payments = r5.count;

      const r6 = await sql.unsafe(`DELETE FROM delivery_orders WHERE tenant_id = $1 AND order_id IN (SELECT id FROM orders WHERE tenant_id = $1 AND source = $2)`, [tenantId, DEMO_SOURCE]);
      deleted.delivery_orders = r6.count;

      const r7 = await sql.unsafe(`DELETE FROM stamp_cards WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.stamp_cards = r7.count;

      const r8 = await sql.unsafe(`DELETE FROM ai_suggestion_cache WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.ai_suggestion_cache = r8.count;

      const r9 = await sql.unsafe(`DELETE FROM ai_item_pairs WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.ai_item_pairs = r9.count;

      const r10 = await sql.unsafe(`DELETE FROM ai_inventory_velocity WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.ai_inventory_velocity = r10.count;

      const r11 = await sql.unsafe(`DELETE FROM ai_hourly_snapshots WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.ai_hourly_snapshots = r11.count;

      const r12 = await sql.unsafe(`DELETE FROM financial_actuals WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.financial_actuals = r12.count;

      const r13 = await sql.unsafe(`DELETE FROM loyalty_customers WHERE tenant_id = $1 AND demo_batch_id IS NOT NULL`, [tenantId]);
      deleted.loyalty_customers = r13.count;

      const r14 = await sql.unsafe(`DELETE FROM orders WHERE tenant_id = $1 AND source = $2`, [tenantId, DEMO_SOURCE]);
      deleted.orders = r14.count;

      const r15 = await sql.unsafe(`DELETE FROM stress_test_runs WHERE tenant_id = $1`, [tenantId]);
      deleted.stress_test_runs = r15.count;
    });

    res.json({ deleted });
  } catch (error) {
    console.error('[DemoData] Delete error:', error);
    res.status(500).json({ error: 'Failed to clear demo data' });
  }
});

export default router;
