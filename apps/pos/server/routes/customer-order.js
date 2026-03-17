import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { all, get, run, getConn, getTenantId } from '../db/index.js';
import { insertOrderWithNumber, estimatePrepTime } from './orders.js';
import { audit } from '../lib/auditLog.js';
import { cleanBoardSettings } from '../lib/boardSettings.js';

const router = Router();

const TAX_RATE = 0.16; // 16% IVA (Mexico) — prices already include tax

// Rate limiting: 5 orders per IP per 15 minutes
const customerOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many orders. Please try again later.' },
});

/**
 * Find a system employee to attribute QR orders to.
 * Picks first active admin, or any active employee as fallback.
 */
async function findSystemEmployee() {
  return (
    await get("SELECT id FROM employees WHERE role = 'admin' AND active = true ORDER BY id LIMIT 1") ||
    await get("SELECT id FROM employees WHERE active = true ORDER BY id LIMIT 1")
  );
}

// GET /api/customer-order/settings — public, returns payment requirement
router.get('/settings', async (_req, res) => {
  try {
    const brand = await get(`
      SELECT board_settings FROM virtual_brands WHERE active = true ORDER BY id LIMIT 1
    `);

    const settings = cleanBoardSettings(brand?.board_settings);
    const requirePayment = !!settings.qrRequirePayment;

    res.json({ requirePayment });
  } catch (error) {
    console.error('Error fetching customer order settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST /api/customer-order — public, rate-limited, creates an order
router.post('/', customerOrderLimiter, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (items.length > 50) {
      return res.status(400).json({ error: 'Too many items in order' });
    }

    // Find system employee for FK
    const employee = await findSystemEmployee();
    if (!employee) {
      return res.status(503).json({ error: 'Restaurant is not accepting orders at this time' });
    }

    // Validate items and calculate totals
    let itemsTotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (!item.menu_item_id || !item.quantity || item.quantity <= 0 || item.quantity > 99) {
        return res.status(400).json({ error: `Invalid item: menu_item_id and quantity (1-99) required` });
      }

      const menuItem = await get('SELECT id, name, price FROM menu_items WHERE id = $1', [item.menu_item_id]);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item ${item.menu_item_id} not found` });
      }

      // Resolve modifiers
      let modifierTotal = 0;
      const resolvedModifiers = [];
      if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
        if (item.modifiers.length > 20) {
          return res.status(400).json({ error: 'Too many modifiers per item' });
        }
        for (const modId of item.modifiers) {
          const mod = await get('SELECT id, name, price_adjustment FROM modifiers WHERE id = $1', [modId]);
          if (mod) {
            modifierTotal += Number(mod.price_adjustment);
            resolvedModifiers.push(mod);
          }
        }
      }

      const unitPrice = Number(menuItem.price) + modifierTotal;
      const itemTotal = unitPrice * item.quantity;
      itemsTotal += itemTotal;

      orderItems.push({
        menu_item_id: item.menu_item_id,
        item_name: menuItem.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        notes: typeof item.notes === 'string' ? item.notes.slice(0, 500) : null,
        combo_instance_id: null,
        modifiers: resolvedModifiers,
      });
    }

    // Prices already include IVA — extract tax from the total
    const total = itemsTotal;
    const tax = Math.round((total - total / (1 + TAX_RATE)) * 100) / 100;
    const subtotal = Math.round((total - tax) * 100) / 100;

    const tenantId = getTenantId();
    const conn = getConn();

    // Insert order with source = 'qr_order'
    const { orderId, orderNumber } = await insertOrderWithNumber(conn, {
      employee_id: employee.id,
      subtotal,
      tax,
      total,
      tenantId,
    });

    // Set source to qr_order
    await conn.unsafe(
      `UPDATE orders SET source = 'qr_order' WHERE id = $1`,
      [orderId]
    );

    // Calculate estimated prep time
    const itemMenuIds = orderItems.map(i => i.menu_item_id);
    const prepEstimate = await estimatePrepTime(conn, itemMenuIds, tenantId);
    await conn.unsafe(
      `UPDATE orders SET estimated_ready_minutes = $1 WHERE id = $2`,
      [prepEstimate.estimate, orderId]
    );

    // Batch insert order items
    const itemColCount = 8;
    const itemValues = orderItems.map((_, i) => {
      const o = i * itemColCount;
      return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5},$${o+6},$${o+7},$${o+8})`;
    }).join(',');
    const itemParams = orderItems.flatMap(item => [
      tenantId, orderId, item.menu_item_id, item.item_name,
      item.quantity, item.unit_price, item.notes, item.combo_instance_id,
    ]);

    const insertedItems = await conn.unsafe(`
      INSERT INTO order_items (tenant_id, order_id, menu_item_id, item_name, quantity, unit_price, notes, combo_instance_id)
      VALUES ${itemValues}
      RETURNING id
    `, itemParams);

    // Correlate by index
    for (let i = 0; i < orderItems.length; i++) {
      orderItems[i]._orderItemId = insertedItems[i].id;
    }

    // Batch insert modifiers
    const allMods = orderItems.flatMap(item =>
      (item.modifiers || []).map(mod => ({
        orderItemId: item._orderItemId,
        id: mod.id,
        name: mod.name,
        price_adjustment: mod.price_adjustment,
      }))
    );

    if (allMods.length > 0) {
      const modColCount = 5;
      const modValues = allMods.map((_, i) => {
        const o = i * modColCount;
        return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5})`;
      }).join(',');
      const modParams = allMods.flatMap(m => [
        tenantId, m.orderItemId, m.id, m.name, m.price_adjustment,
      ]);
      await conn.unsafe(`
        INSERT INTO order_item_modifiers (tenant_id, order_item_id, modifier_id, modifier_name, price_adjustment)
        VALUES ${modValues}
      `, modParams);
    }

    audit({
      tenantId: tenantId || 'default',
      actorType: 'customer',
      actorId: 'qr_order',
      action: 'create',
      resource: 'order',
      resourceId: String(orderId),
      ip: req.ip,
    });

    res.status(201).json({
      order_number: orderNumber,
      estimated_ready_minutes: prepEstimate.estimate,
      estimated_ready_range: { low: prepEstimate.low, high: prepEstimate.high },
    });
  } catch (error) {
    console.error('Error creating customer order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
