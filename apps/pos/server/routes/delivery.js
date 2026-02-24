import { Router } from 'express';
import crypto from 'crypto';
import { all, get, run, getConn } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { getPlanLimits, requirePlanFeature } from '../planLimits.js';
import { getServiceCredentials } from '../helpers/tenantCredentials.js';
import {
  verifyWebhookSignature,
  getAccessToken,
  fetchOrder,
  acceptOrder,
  denyOrder,
  cancelUberOrder,
} from '../services/uber-eats.js';

const router = Router();
const TAX_RATE = 0.16; // 16% IVA (Mexico) — prices include tax

// ==================== Platform & Order CRUD ====================

// GET /api/delivery/platforms - list delivery platforms
router.get('/platforms', async (req, res) => {
  try {
    const platforms = await all('SELECT * FROM delivery_platforms ORDER BY display_name');
    res.json(platforms);
  } catch (error) {
    console.error('Error fetching delivery platforms:', error);
    res.status(500).json({ error: 'Failed to fetch delivery platforms' });
  }
});

// PUT /api/delivery/platforms/:id - update delivery platform
router.put('/platforms/:id', requireAuth('manage_delivery'), requirePlanFeature('delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const { display_name, commission_percent, active, webhook_secret } = req.body;

    const platform = await get('SELECT * FROM delivery_platforms WHERE id = $1', [id]);
    if (!platform) return res.status(404).json({ error: 'Platform not found' });

    await run(
      'UPDATE delivery_platforms SET display_name = $1, commission_percent = $2, active = $3, webhook_secret = $4 WHERE id = $5',
      [
        display_name ?? platform.display_name,
        commission_percent ?? platform.commission_percent,
        active !== undefined ? active : platform.active,
        webhook_secret ?? platform.webhook_secret,
        id,
      ]
    );

    res.json({ id, success: true });
  } catch (error) {
    console.error('Error updating delivery platform:', error);
    res.status(500).json({ error: 'Failed to update delivery platform' });
  }
});

// GET /api/delivery/orders - list delivery orders
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT do2.*, dp.display_name as platform_name, o.order_number, o.status as order_status, o.total
      FROM delivery_orders do2
      JOIN delivery_platforms dp ON do2.platform_id = dp.id
      JOIN orders o ON do2.order_id = o.id
    `;
    const params = [];
    let paramIdx = 1;

    if (status) {
      query += ` WHERE do2.platform_status = $${paramIdx++}`;
      params.push(status);
    }

    query += ' ORDER BY do2.id DESC LIMIT 50';

    const orders = await all(query, params);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

// PUT /api/delivery/orders/:id/status - update delivery order status
router.put('/orders/:id/status', requireAuth('manage_delivery'), requirePlanFeature('delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await get('SELECT * FROM delivery_orders WHERE id = $1', [id]);
    if (!order) return res.status(404).json({ error: 'Delivery order not found' });

    await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', [status, id]);
    res.json({ id, status, success: true });
  } catch (error) {
    console.error('Error updating delivery order status:', error);
    res.status(500).json({ error: 'Failed to update delivery order status' });
  }
});

// ==================== Accept / Deny / Cancel endpoints ====================

// POST /api/delivery/orders/:id/accept - accept a delivery order on the platform
router.post('/orders/:id/accept', requireAuth('manage_delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryOrder = await get(
      `SELECT do2.*, dp.name as platform_name
       FROM delivery_orders do2
       JOIN delivery_platforms dp ON do2.platform_id = dp.id
       WHERE do2.id = $1`,
      [id]
    );
    if (!deliveryOrder) return res.status(404).json({ error: 'Delivery order not found' });

    const tenantId = req.tenant?.id;
    if (deliveryOrder.platform_name === 'uber_eats' && tenantId) {
      const token = await getAccessToken(tenantId);
      await acceptOrder(token, deliveryOrder.external_order_id, {
        reason: req.body.reason || 'Accepted by POS',
      });
    }

    await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', ['accepted', id]);
    await run('UPDATE orders SET status = $1 WHERE id = $2', ['confirmed', deliveryOrder.order_id]);

    res.json({ id, status: 'accepted', success: true });
  } catch (error) {
    console.error('Error accepting delivery order:', error);
    res.status(500).json({ error: 'Failed to accept delivery order' });
  }
});

// POST /api/delivery/orders/:id/deny - deny a delivery order on the platform
router.post('/orders/:id/deny', requireAuth('manage_delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const { explanation, code } = req.body;

    const deliveryOrder = await get(
      `SELECT do2.*, dp.name as platform_name
       FROM delivery_orders do2
       JOIN delivery_platforms dp ON do2.platform_id = dp.id
       WHERE do2.id = $1`,
      [id]
    );
    if (!deliveryOrder) return res.status(404).json({ error: 'Delivery order not found' });

    const tenantId = req.tenant?.id;
    if (deliveryOrder.platform_name === 'uber_eats' && tenantId) {
      const token = await getAccessToken(tenantId);
      await denyOrder(token, deliveryOrder.external_order_id, { explanation, code });
    }

    await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', ['denied', id]);
    await run('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', deliveryOrder.order_id]);

    res.json({ id, status: 'denied', success: true });
  } catch (error) {
    console.error('Error denying delivery order:', error);
    res.status(500).json({ error: 'Failed to deny delivery order' });
  }
});

// POST /api/delivery/orders/:id/cancel - cancel an accepted delivery order
router.post('/orders/:id/cancel', requireAuth('manage_delivery'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const deliveryOrder = await get(
      `SELECT do2.*, dp.name as platform_name
       FROM delivery_orders do2
       JOIN delivery_platforms dp ON do2.platform_id = dp.id
       WHERE do2.id = $1`,
      [id]
    );
    if (!deliveryOrder) return res.status(404).json({ error: 'Delivery order not found' });

    const tenantId = req.tenant?.id;
    if (deliveryOrder.platform_name === 'uber_eats' && tenantId) {
      const token = await getAccessToken(tenantId);
      await cancelUberOrder(token, deliveryOrder.external_order_id, reason);
    }

    await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', ['cancelled', id]);
    await run('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', deliveryOrder.order_id]);

    res.json({ id, status: 'cancelled', success: true });
  } catch (error) {
    console.error('Error cancelling delivery order:', error);
    res.status(500).json({ error: 'Failed to cancel delivery order' });
  }
});

// ==================== Order number generator ====================

async function generateOrderNumber() {
  const conn = getConn();
  const dateStr = new Date().toISOString().split('T')[0];
  const dateNum = parseInt(dateStr.replace(/-/g, '')) * 1000;

  const [row] = await conn.unsafe(`
    SELECT pg_advisory_xact_lock(hashtext($1::text)),
           COALESCE(MAX(order_number), $2::int) + 1 AS order_number
    FROM orders
    WHERE created_at::date = $1::date
  `, [dateStr, dateNum]);

  return row.order_number;
}

// ==================== Uber Eats Webhook ====================

/**
 * Find or create the delivery_platforms row for uber_eats.
 */
async function ensureUberPlatform() {
  let platform = await get(
    "SELECT * FROM delivery_platforms WHERE name = 'uber_eats'"
  );
  if (!platform) {
    const result = await run(
      `INSERT INTO delivery_platforms (name, display_name, commission_percent, active)
       VALUES ('uber_eats', 'Uber Eats', 30, true)`
    );
    platform = await get('SELECT * FROM delivery_platforms WHERE id = $1', [result.lastInsertRowid]);
  }
  return platform;
}

/**
 * Find a system/delivery employee to attribute the order to.
 * Tries 'delivery' role first, then 'admin', then any employee.
 */
async function findSystemEmployee() {
  return (
    await get("SELECT id FROM employees WHERE role = 'admin' AND active = true ORDER BY id LIMIT 1") ||
    await get("SELECT id FROM employees WHERE active = true ORDER BY id LIMIT 1")
  );
}

/**
 * Try to match an Uber Eats item to a local menu item.
 * Matches by name (case-insensitive).
 */
async function matchMenuItem(title) {
  if (!title) return null;
  return get(
    "SELECT id, name, price FROM menu_items WHERE LOWER(name) = LOWER($1) LIMIT 1",
    [title.trim()]
  );
}

/**
 * Process an Uber Eats order: fetch full details, create internal order + delivery_order,
 * and auto-accept on Uber.
 */
async function processUberOrder(tenantId, externalOrderId, rawWebhookData) {
  // Check for duplicate (idempotent)
  const existing = await get(
    "SELECT id FROM delivery_orders WHERE external_order_id = $1",
    [externalOrderId]
  );
  if (existing) {
    console.log(`[Uber Eats] Order ${externalOrderId} already processed (delivery_order ${existing.id})`);
    return { duplicate: true, delivery_order_id: existing.id };
  }

  // Fetch full order from Uber
  const token = await getAccessToken(tenantId);
  const uberOrder = await fetchOrder(token, externalOrderId);

  const platform = await ensureUberPlatform();
  const employee = await findSystemEmployee();
  if (!employee) {
    throw new Error('No active employee found to attribute delivery order');
  }

  // Parse cart items from Uber order
  // Uber Eats format: uberOrder.cart.items[] with { title, quantity, price { unit_price { amount_e5 } }, special_instructions }
  // price amounts are in e5 format (100000 = $1.00) or cents depending on API version
  const cart = uberOrder.cart || uberOrder.order || {};
  const uberItems = cart.items || [];

  const orderItems = [];
  let itemsTotal = 0;

  for (const uberItem of uberItems) {
    const quantity = uberItem.quantity || 1;

    // Price resolution: Uber uses various formats
    // - price.unit_price.amount_e5 (e5 = amount * 100000)
    // - price.unit_price.amount (cents)
    // - price.base_unit_price.amount_e5
    // - selected_modifier_groups[].selected_items[].price
    let unitPrice = 0;
    const priceObj = uberItem.price || uberItem.selected_price || {};
    if (priceObj.unit_price?.amount_e5) {
      unitPrice = priceObj.unit_price.amount_e5 / 100000;
    } else if (priceObj.unit_price?.amount) {
      unitPrice = priceObj.unit_price.amount / 100;
    } else if (priceObj.base_unit_price?.amount_e5) {
      unitPrice = priceObj.base_unit_price.amount_e5 / 100000;
    } else if (priceObj.base_unit_price?.amount) {
      unitPrice = priceObj.base_unit_price.amount / 100;
    } else if (typeof uberItem.price === 'number') {
      unitPrice = uberItem.price / 100; // cents
    }

    // Add modifier prices
    const modifierGroups = uberItem.selected_modifier_groups || [];
    for (const group of modifierGroups) {
      for (const mod of (group.selected_items || [])) {
        const modPrice = mod.price?.unit_price?.amount_e5
          ? mod.price.unit_price.amount_e5 / 100000
          : mod.price?.unit_price?.amount
            ? mod.price.unit_price.amount / 100
            : 0;
        unitPrice += modPrice;
      }
    }

    const title = uberItem.title || uberItem.name || 'Uber Eats Item';
    const notes = uberItem.special_instructions || uberItem.special_request || null;

    // Try to match to local menu item
    const localItem = await matchMenuItem(title);

    orderItems.push({
      menu_item_id: localItem?.id || null,
      item_name: localItem?.name || title,
      quantity,
      unit_price: unitPrice > 0 ? unitPrice : (localItem?.price || 0),
      notes,
    });

    itemsTotal += (unitPrice > 0 ? unitPrice : (localItem?.price || 0)) * quantity;
  }

  // Calculate tax (prices include IVA)
  const total = itemsTotal;
  const tax = Math.round((total - total / (1 + TAX_RATE)) * 100) / 100;
  const subtotal = Math.round((total - tax) * 100) / 100;
  const orderNumber = await generateOrderNumber();

  // Create internal order
  const orderResult = await run(`
    INSERT INTO orders (order_number, employee_id, status, subtotal, tax, total, payment_status, payment_method, source)
    VALUES ($1, $2, 'confirmed', $3, $4, $5, 'paid', 'uber_eats', 'uber_eats')
  `, [orderNumber, employee.id, subtotal, tax, total]);

  const orderId = orderResult.lastInsertRowid;

  // Insert order items
  for (const item of orderItems) {
    await run(`
      INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, unit_price, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [orderId, item.menu_item_id, item.item_name, item.quantity, item.unit_price, item.notes]);
  }

  // Parse delivery fee and commission from Uber
  const charges = uberOrder.charges || {};
  const deliveryFee = charges.delivery_fee?.amount_e5
    ? charges.delivery_fee.amount_e5 / 100000
    : charges.delivery_fee?.amount
      ? charges.delivery_fee.amount / 100
      : 0;
  const commission = total * (platform.commission_percent / 100);

  // Parse customer info
  const eater = uberOrder.eater || uberOrder.customer || {};
  const customerName = [eater.first_name, eater.last_name].filter(Boolean).join(' ') || null;
  const deliveryAddress = uberOrder.delivery_address?.formatted_address
    || uberOrder.dropoff?.address
    || null;

  // Create delivery_order record
  const deliveryResult = await run(`
    INSERT INTO delivery_orders (order_id, platform_id, external_order_id, platform_status, delivery_fee, platform_commission, customer_name, delivery_address, raw_webhook_data)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    orderId,
    platform.id,
    externalOrderId,
    'received',
    deliveryFee,
    commission,
    customerName,
    deliveryAddress,
    rawWebhookData,
  ]);

  // Link delivery order to the internal order
  await run('UPDATE orders SET delivery_order_id = $1 WHERE id = $2', [
    deliveryResult.lastInsertRowid, orderId,
  ]);

  // Auto-accept on Uber Eats
  try {
    await acceptOrder(token, externalOrderId, {
      reason: 'Auto-accepted by POS',
      externalRef: String(orderId),
    });
    await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', [
      'accepted', deliveryResult.lastInsertRowid,
    ]);
    console.log(`[Uber Eats] Order ${externalOrderId} auto-accepted (internal order ${orderId})`);
  } catch (acceptErr) {
    console.error(`[Uber Eats] Auto-accept failed for ${externalOrderId}:`, acceptErr.message);
    // Order is still created locally — can be accepted manually from POS
  }

  return {
    order_id: orderId,
    order_number: orderNumber,
    delivery_order_id: deliveryResult.lastInsertRowid,
    items_count: orderItems.length,
    total,
  };
}

// POST /api/delivery/webhook/uber-eats - Uber Eats webhook
router.post('/webhook/uber-eats', async (req, res) => {
  try {
    const payload = req.body;
    const tenantId = req.tenant?.id;

    // Validate webhook signature using raw body
    if (tenantId) {
      const creds = await getServiceCredentials(tenantId, 'uber_eats', {
        client_secret: '',
      });
      if (creds.client_secret && req.rawBody) {
        const signature = req.headers['x-uber-signature'];
        if (!signature) {
          console.warn('[Uber Eats] Webhook missing x-uber-signature header');
          return res.status(403).json({ error: 'Missing webhook signature' });
        }
        if (!verifyWebhookSignature(req.rawBody, signature, creds.client_secret)) {
          console.warn('[Uber Eats] Webhook signature verification failed');
          return res.status(403).json({ error: 'Invalid webhook signature' });
        }
      }
    }

    // Respond quickly to Uber — they expect 200 within 10 seconds
    const eventType = payload.event_type || payload.type || '';
    const resourceId = payload.meta?.resource_id || payload.order_id || payload.resource_href?.split('/').pop();

    console.log(`[Uber Eats] Webhook: ${eventType}, resource: ${resourceId}`);

    if (!resourceId) {
      console.warn('[Uber Eats] Webhook missing resource_id');
      return res.json({ success: true, message: 'No resource ID — ignored' });
    }

    // Handle different event types
    switch (eventType) {
      case 'orders.notification': {
        // New order notification — fetch, create, and accept
        if (!tenantId) {
          console.warn('[Uber Eats] No tenant context for order processing');
          return res.status(400).json({ error: 'Tenant context required' });
        }

        const result = await processUberOrder(tenantId, resourceId, JSON.stringify(payload));
        console.log('[Uber Eats] Order processed:', result);
        return res.json({ success: true, ...result });
      }

      case 'orders.cancel': {
        // Uber/customer cancelled the order
        const deliveryOrder = await get(
          "SELECT id, order_id FROM delivery_orders WHERE external_order_id = $1",
          [resourceId]
        );
        if (deliveryOrder) {
          await run('UPDATE delivery_orders SET platform_status = $1 WHERE id = $2', [
            'cancelled_by_uber', deliveryOrder.id,
          ]);
          await run('UPDATE orders SET status = $1 WHERE id = $2', [
            'cancelled', deliveryOrder.order_id,
          ]);
          console.log(`[Uber Eats] Order ${resourceId} cancelled by Uber`);
        }
        return res.json({ success: true, message: 'Cancel processed' });
      }

      case 'orders.scheduled': {
        // Scheduled order — process like a new order
        if (tenantId) {
          const result = await processUberOrder(tenantId, resourceId, JSON.stringify(payload));
          console.log('[Uber Eats] Scheduled order processed:', result);
          return res.json({ success: true, ...result });
        }
        return res.json({ success: true, message: 'Scheduled order — no tenant context' });
      }

      default: {
        console.log(`[Uber Eats] Unhandled event type: ${eventType}`);
        return res.json({ success: true, message: `Event ${eventType} acknowledged` });
      }
    }
  } catch (error) {
    console.error('[Uber Eats] Webhook error:', error);
    // Return 200 even on error to prevent Uber from retrying indefinitely
    // The error is logged for debugging
    res.status(200).json({ success: false, error: error.message });
  }
});

// ==================== Rappi / DiDi Webhooks (stubs) ====================

// POST /api/delivery/webhook/rappi - Rappi webhook
router.post('/webhook/rappi', async (req, res) => {
  try {
    const payload = req.body;
    const tenantId = req.tenant?.id;

    if (tenantId) {
      const creds = await getServiceCredentials(tenantId, 'rappi', {
        webhook_secret: '',
      });
      if (creds.webhook_secret && req.rawBody) {
        const signature = req.headers['x-rappi-signature'] || req.headers['x-webhook-signature'];
        if (!signature) {
          console.warn('[Rappi] Webhook missing signature header');
          return res.status(403).json({ error: 'Missing webhook signature' });
        }
        const expected = crypto.createHmac('sha256', creds.webhook_secret)
          .update(req.rawBody)
          .digest('hex');
        if (expected !== signature) {
          console.warn('[Rappi] Webhook signature verification failed');
          return res.status(403).json({ error: 'Invalid webhook signature' });
        }
      }
    }

    console.log('Rappi webhook received:', JSON.stringify(payload).slice(0, 200));
    res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('Rappi webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// POST /api/delivery/webhook/didi - DiDi Food webhook
router.post('/webhook/didi', async (req, res) => {
  try {
    const payload = req.body;
    const tenantId = req.tenant?.id;

    if (tenantId) {
      const creds = await getServiceCredentials(tenantId, 'didi_food', {
        webhook_secret: '',
      });
      if (creds.webhook_secret && req.rawBody) {
        const signature = req.headers['x-didi-signature'] || req.headers['x-webhook-signature'];
        if (!signature) {
          console.warn('[DiDi Food] Webhook missing signature header');
          return res.status(403).json({ error: 'Missing webhook signature' });
        }
        const expected = crypto.createHmac('sha256', creds.webhook_secret)
          .update(req.rawBody)
          .digest('hex');
        if (expected !== signature) {
          console.warn('[DiDi Food] Webhook signature verification failed');
          return res.status(403).json({ error: 'Invalid webhook signature' });
        }
      }
    }

    console.log('DiDi Food webhook received:', JSON.stringify(payload).slice(0, 200));
    res.json({ success: true, message: 'Webhook received' });
  } catch (error) {
    console.error('DiDi Food webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
