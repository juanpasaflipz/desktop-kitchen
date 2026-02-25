export const version = 18;
export const name = 'order_prep_time';

export async function up(sql) {
  // Add prep_time_minutes to menu_items (default 5 min for most items)
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time_minutes INTEGER DEFAULT 5`;

  // Add ready_at timestamp and estimated_ready_minutes to orders
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS ready_at TIMESTAMPTZ`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_ready_minutes INTEGER`;

  // Grant column access to app_user
  await sql`GRANT SELECT, UPDATE ON orders TO app_user`.catch(() => {});
}
