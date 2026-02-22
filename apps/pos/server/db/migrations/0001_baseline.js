/**
 * Baseline migration — captures all 23 alterSafe column additions and
 * permission backfills that previously lived in applySchema().
 *
 * Idempotent: uses try-catch so it's safe for both:
 *   - Existing DBs (columns already exist → ALTER throws, caught)
 *   - New DBs (columns already in CREATE TABLE → ALTER throws, caught)
 */

export const version = 1;
export const name = 'baseline';

export function up(db) {
  const alterSafe = (sql) => { try { db.exec(sql); } catch {} };

  // --- order_items ---
  alterSafe(`ALTER TABLE order_items ADD COLUMN was_ai_suggested INTEGER DEFAULT 0`);
  alterSafe(`ALTER TABLE order_items ADD COLUMN combo_instance_id TEXT DEFAULT NULL`);
  alterSafe(`ALTER TABLE order_items ADD COLUMN virtual_brand_id INTEGER DEFAULT NULL`);

  // --- orders ---
  alterSafe(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT NULL`);
  alterSafe(`ALTER TABLE orders ADD COLUMN source TEXT DEFAULT 'pos'`);
  alterSafe(`ALTER TABLE orders ADD COLUMN delivery_order_id INTEGER DEFAULT NULL`);
  alterSafe(`ALTER TABLE orders ADD COLUMN refund_total REAL DEFAULT 0`);
  alterSafe(`ALTER TABLE orders ADD COLUMN crypto_payment_id INTEGER DEFAULT NULL`);
  alterSafe(`ALTER TABLE orders ADD COLUMN loyalty_customer_id INTEGER DEFAULT NULL`);
  alterSafe(`ALTER TABLE orders ADD COLUMN offline_temp_id TEXT`);

  // --- inventory_items ---
  alterSafe(`ALTER TABLE inventory_items ADD COLUMN cost_price REAL DEFAULT 0`);
  alterSafe(`ALTER TABLE inventory_items ADD COLUMN last_counted_at TEXT`);

  // --- menu_categories ---
  alterSafe(`ALTER TABLE menu_categories ADD COLUMN printer_target TEXT DEFAULT 'kitchen'`);

  // --- virtual_brands ---
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN display_type TEXT DEFAULT 'delivery'`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN primary_color TEXT`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN secondary_color TEXT`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN font_family TEXT`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN dark_bg TEXT`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN slug TEXT`);
  alterSafe(`ALTER TABLE virtual_brands ADD COLUMN show_in_pos INTEGER DEFAULT 1`);

  // --- delivery_platforms ---
  alterSafe(`ALTER TABLE delivery_platforms ADD COLUMN default_markup_percent REAL DEFAULT 0`);
  alterSafe(`ALTER TABLE delivery_platforms ADD COLUMN avg_delivery_time_min INTEGER DEFAULT 30`);
  alterSafe(`ALTER TABLE delivery_platforms ADD COLUMN notes TEXT DEFAULT ''`);

  // --- Backfill manage_loyalty permission ---
  try {
    const row = db.prepare("SELECT COUNT(*) as cnt FROM role_permissions WHERE permission = 'manage_loyalty'").get();
    if ((row?.cnt || 0) === 0) {
      const roles = { admin: 1, manager: 1, cashier: 0, kitchen: 0, bar: 0 };
      const stmt = db.prepare(`INSERT OR IGNORE INTO role_permissions (role, permission, granted) VALUES (?, 'manage_loyalty', ?)`);
      for (const [role, granted] of Object.entries(roles)) {
        stmt.run(role, granted);
      }
    }
  } catch {}

  // --- Backfill manage_branding permission ---
  try {
    const row = db.prepare("SELECT COUNT(*) as cnt FROM role_permissions WHERE permission = 'manage_branding'").get();
    if ((row?.cnt || 0) === 0) {
      const roles = { admin: 1, manager: 1, cashier: 0, kitchen: 0, bar: 0 };
      const stmt = db.prepare(`INSERT OR IGNORE INTO role_permissions (role, permission, granted) VALUES (?, 'manage_branding', ?)`);
      for (const [role, granted] of Object.entries(roles)) {
        stmt.run(role, granted);
      }
    }
  } catch {}
}
