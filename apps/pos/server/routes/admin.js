import { Router } from 'express';
import { createTenant, getTenant, listTenants, updateTenant } from '../tenants.js';
import { run, adminSql } from '../db/index.js';
import os from 'os';

const router = Router();

/**
 * Admin auth middleware — protects all admin routes with ADMIN_SECRET env var.
 */
function requireAdmin(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.headers['authorization']?.replace('Bearer ', '');
  if (!process.env.ADMIN_SECRET) {
    return res.status(500).json({ error: 'ADMIN_SECRET not configured' });
  }
  if (secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }
  next();
}

router.use(requireAdmin);

// ==================== Analytics Endpoints ====================

const PLAN_PRICES = { starter: 29, pro: 79 };

// GET /admin/analytics/overview — KPIs: total tenants, plan breakdown, MRR, total orders/revenue
router.get('/analytics/overview', async (req, res) => {
  try {
    const [tenantStats] = await adminSql`
      SELECT
        COUNT(*) AS total_tenants,
        COUNT(*) FILTER (WHERE active = true) AS active_tenants,
        COUNT(*) FILTER (WHERE plan = 'trial') AS trial_count,
        COUNT(*) FILTER (WHERE plan = 'starter') AS starter_count,
        COUNT(*) FILTER (WHERE plan = 'pro') AS pro_count
      FROM tenants
    `;

    const [orderStats] = await adminSql`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total), 0) AS total_revenue
      FROM orders
    `;

    const mrr = (tenantStats.starter_count * PLAN_PRICES.starter)
              + (tenantStats.pro_count * PLAN_PRICES.pro);

    res.json({
      total_tenants: Number(tenantStats.total_tenants),
      active_tenants: Number(tenantStats.active_tenants),
      plan_breakdown: {
        trial: Number(tenantStats.trial_count),
        starter: Number(tenantStats.starter_count),
        pro: Number(tenantStats.pro_count),
      },
      mrr,
      total_orders: Number(orderStats.total_orders),
      total_revenue: Number(orderStats.total_revenue),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// GET /admin/analytics/signups?months=12 — Monthly signup trend
router.get('/analytics/signups', async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 36);
    const rows = await adminSql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM tenants
      WHERE created_at >= NOW() - MAKE_INTERVAL(months => ${months})
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `;
    res.json(rows.map(r => ({ month: r.month, count: Number(r.count) })));
  } catch (error) {
    console.error('Analytics signups error:', error);
    res.status(500).json({ error: 'Failed to fetch signup analytics' });
  }
});

// GET /admin/analytics/revenue?months=12 — Monthly platform revenue + order counts
router.get('/analytics/revenue', async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 36);
    const rows = await adminSql`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS order_count,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at >= NOW() - MAKE_INTERVAL(months => ${months})
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month
    `;
    res.json(rows.map(r => ({
      month: r.month,
      order_count: Number(r.order_count),
      revenue: Number(r.revenue),
    })));
  } catch (error) {
    console.error('Analytics revenue error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

// GET /admin/analytics/churn?months=12 — Monthly cancellation counts
router.get('/analytics/churn', async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 12, 36);
    const rows = await adminSql`
      SELECT
        TO_CHAR(subscription_cancelled_at, 'YYYY-MM') AS month,
        COUNT(*) AS count
      FROM tenants
      WHERE subscription_cancelled_at IS NOT NULL
        AND subscription_cancelled_at >= NOW() - MAKE_INTERVAL(months => ${months})
      GROUP BY TO_CHAR(subscription_cancelled_at, 'YYYY-MM')
      ORDER BY month
    `;
    res.json(rows.map(r => ({ month: r.month, count: Number(r.count) })));
  } catch (error) {
    console.error('Analytics churn error:', error);
    res.status(500).json({ error: 'Failed to fetch churn analytics' });
  }
});

// GET /admin/analytics/health — System health info
router.get('/analytics/health', async (req, res) => {
  try {
    const mem = process.memoryUsage();
    const [pgVersion] = await adminSql`SELECT version() AS v`;
    res.json({
      uptime_seconds: Math.floor(process.uptime()),
      node_version: process.version,
      platform: process.platform,
      memory: {
        rss_mb: Math.round(mem.rss / 1048576),
        heap_used_mb: Math.round(mem.heapUsed / 1048576),
        heap_total_mb: Math.round(mem.heapTotal / 1048576),
      },
      os: {
        total_mem_mb: Math.round(os.totalmem() / 1048576),
        free_mem_mb: Math.round(os.freemem() / 1048576),
        cpus: os.cpus().length,
      },
      postgres_version: pgVersion?.v || 'unknown',
    });
  } catch (error) {
    console.error('Analytics health error:', error);
    res.status(500).json({ error: 'Failed to fetch health data' });
  }
});

// GET /admin/analytics/activity — Top 10 most/least active tenants (last 30 days)
router.get('/analytics/activity', async (req, res) => {
  try {
    const mostActive = await adminSql`
      SELECT t.id, t.name, t.plan, COUNT(o.id) AS order_count,
             COALESCE(SUM(o.total), 0) AS revenue
      FROM tenants t
      LEFT JOIN orders o ON o.tenant_id = t.id
        AND o.created_at >= NOW() - INTERVAL '30 days'
      WHERE t.active = true
      GROUP BY t.id, t.name, t.plan
      ORDER BY order_count DESC
      LIMIT 10
    `;

    const leastActive = await adminSql`
      SELECT t.id, t.name, t.plan, COUNT(o.id) AS order_count,
             COALESCE(SUM(o.total), 0) AS revenue
      FROM tenants t
      LEFT JOIN orders o ON o.tenant_id = t.id
        AND o.created_at >= NOW() - INTERVAL '30 days'
      WHERE t.active = true
      GROUP BY t.id, t.name, t.plan
      ORDER BY order_count ASC
      LIMIT 10
    `;

    res.json({
      most_active: mostActive.map(r => ({ ...r, order_count: Number(r.order_count), revenue: Number(r.revenue) })),
      least_active: leastActive.map(r => ({ ...r, order_count: Number(r.order_count), revenue: Number(r.revenue) })),
    });
  } catch (error) {
    console.error('Analytics activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity analytics' });
  }
});

// GET /admin/tenants/:id/deep-dive — Per-tenant detailed stats
router.get('/tenants/:id/deep-dive', async (req, res) => {
  try {
    const tenant = await getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const [stats] = await adminSql`
      SELECT
        (SELECT COUNT(*) FROM orders WHERE tenant_id = ${tenant.id}) AS total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE tenant_id = ${tenant.id}) AS total_revenue,
        (SELECT COUNT(*) FROM orders WHERE tenant_id = ${tenant.id}
          AND created_at >= NOW() - INTERVAL '30 days') AS orders_30d,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE tenant_id = ${tenant.id}
          AND created_at >= NOW() - INTERVAL '30 days') AS revenue_30d,
        (SELECT COUNT(*) FROM employees WHERE tenant_id = ${tenant.id}) AS employee_count,
        (SELECT COUNT(*) FROM menu_items WHERE tenant_id = ${tenant.id}) AS menu_item_count,
        (SELECT COUNT(*) FROM menu_categories WHERE tenant_id = ${tenant.id}) AS category_count,
        (SELECT COUNT(*) FROM loyalty_customers WHERE tenant_id = ${tenant.id}) AS customer_count,
        (SELECT MAX(created_at) FROM orders WHERE tenant_id = ${tenant.id}) AS last_order_at
    `;

    res.json({
      tenant,
      stats: {
        total_orders: Number(stats.total_orders),
        total_revenue: Number(stats.total_revenue),
        orders_30d: Number(stats.orders_30d),
        revenue_30d: Number(stats.revenue_30d),
        employee_count: Number(stats.employee_count),
        menu_item_count: Number(stats.menu_item_count),
        category_count: Number(stats.category_count),
        customer_count: Number(stats.customer_count),
        last_order_at: stats.last_order_at,
      },
    });
  } catch (error) {
    console.error('Tenant deep-dive error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant deep-dive' });
  }
});

// ==================== Tenant CRUD ====================

// POST /admin/tenants — create new tenant
router.post('/tenants', async (req, res) => {
  try {
    const { id, name, owner_email, owner_password_hash, subdomain, plan, branding_json } = req.body;

    if (!id || !name || !owner_email || !owner_password_hash) {
      return res.status(400).json({ error: 'Required: id, name, owner_email, owner_password_hash' });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(id)) {
      return res.status(400).json({ error: 'Tenant ID must be lowercase alphanumeric with hyphens' });
    }

    // Check uniqueness
    if (await getTenant(id)) {
      return res.status(409).json({ error: `Tenant '${id}' already exists` });
    }

    const tenant = await createTenant({
      id,
      name,
      subdomain: subdomain || id,
      owner_email,
      owner_password_hash,
      plan,
      branding_json: branding_json ? JSON.stringify(branding_json) : null,
    });

    res.status(201).json(tenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// GET /admin/tenants — list all tenants with stats, search/filter/sort
router.get('/tenants', async (req, res) => {
  try {
    const { search, plan, status, sort, order } = req.query;

    let tenants = await listTenants();

    // Filter by search term (name, id, email)
    if (search) {
      const q = search.toLowerCase();
      tenants = tenants.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.owner_email || '').toLowerCase().includes(q)
      );
    }

    // Filter by plan
    if (plan) {
      tenants = tenants.filter(t => t.plan === plan);
    }

    // Filter by status (active/inactive)
    if (status === 'active') {
      tenants = tenants.filter(t => t.active);
    } else if (status === 'inactive') {
      tenants = tenants.filter(t => !t.active);
    }

    // Sort
    if (sort) {
      const dir = order === 'asc' ? 1 : -1;
      tenants.sort((a, b) => {
        const av = a[sort] ?? '';
        const bv = b[sort] ?? '';
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }

    res.json(tenants);
  } catch (error) {
    console.error('Error listing tenants:', error);
    res.status(500).json({ error: 'Failed to list tenants' });
  }
});

// GET /admin/tenants/:id — get single tenant
router.get('/tenants/:id', async (req, res) => {
  try {
    const tenant = await getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tenant' });
  }
});

// PATCH /admin/tenants/:id — update plan/status/branding
router.patch('/tenants/:id', async (req, res) => {
  try {
    const tenant = await getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    const allowed = ['name', 'plan', 'active', 'subscription_status', 'stripe_customer_id',
      'stripe_subscription_id', 'branding_json'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'branding_json' && typeof req.body[key] === 'object'
          ? JSON.stringify(req.body[key])
          : req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await updateTenant(req.params.id, updates);
    res.json(await getTenant(req.params.id));
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  }
});

// POST /admin/tenants/:id/seed — seed demo data for a tenant
router.post('/tenants/:id/seed', async (req, res) => {
  try {
    const tenant = await getTenant(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

    // Seed a default admin employee (uses adminSql since we need to specify tenant_id)
    await adminSql`
      INSERT INTO employees (tenant_id, name, pin, role, active)
      VALUES (${tenant.id}, 'Manager', '1234', 'admin', true)
      ON CONFLICT DO NOTHING
    `;

    // Seed basic menu categories
    const categories = ['Main Dishes', 'Sides', 'Drinks'];
    for (let i = 0; i < categories.length; i++) {
      await adminSql`
        INSERT INTO menu_categories (tenant_id, name, sort_order, active)
        VALUES (${tenant.id}, ${categories[i]}, ${i + 1}, true)
        ON CONFLICT DO NOTHING
      `;
    }

    res.json({ message: `Seeded demo data for tenant '${tenant.id}'` });
  } catch (error) {
    console.error('Error seeding tenant:', error);
    res.status(500).json({ error: 'Failed to seed tenant' });
  }
});

export default router;
