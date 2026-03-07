export const version = 30;
export const name = 'conekta';

export async function up(sql) {
  // Conekta tracking columns on orders
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS conekta_order_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS conekta_charge_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS oxxo_reference TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS oxxo_barcode_url TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS spei_clabe TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS async_payment_expires_at TIMESTAMPTZ`;

  // Conekta refund tracking
  await sql`ALTER TABLE refunds ADD COLUMN IF NOT EXISTS conekta_refund_id TEXT`;

  // Conekta charge tracking on split payments
  await sql`ALTER TABLE order_payments ADD COLUMN IF NOT EXISTS conekta_charge_id TEXT`;

  // Indexes for webhook lookups
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_conekta_order_id ON orders (conekta_order_id) WHERE conekta_order_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_conekta_charge_id ON orders (conekta_charge_id) WHERE conekta_charge_id IS NOT NULL`;
}
