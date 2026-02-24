export const version = 9;
export const name = 'payment_confirmation';

export async function up(sql) {
  // payment_status column already exists (DEFAULT 'unpaid')
  // Add paid_at timestamp for tracking when payment was confirmed
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ DEFAULT NULL`;

  // Index for querying unpaid orders efficiently
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_status
    ON orders (tenant_id, payment_status, paid_at)`;
}
