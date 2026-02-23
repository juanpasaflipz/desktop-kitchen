/**
 * Add subscription_cancelled_at column to tenants table for churn tracking.
 */

export const version = 2;
export const name = 'add_subscription_cancelled_at';

export async function up(sql) {
  await sql`
    ALTER TABLE tenants
    ADD COLUMN IF NOT EXISTS subscription_cancelled_at TIMESTAMPTZ
  `;
}
