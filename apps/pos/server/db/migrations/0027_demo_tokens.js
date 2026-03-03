export const version = 27;
export const name = 'demo_tokens';

export async function up(sql) {
  // Platform-level table for single-use demo auto-login tokens
  await sql`
    CREATE TABLE IF NOT EXISTS demo_tokens (
      id SERIAL PRIMARY KEY,
      token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      employee_id INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_demo_tokens_token ON demo_tokens(token)
  `;

  // Add billing_interval column to tenants
  await sql`
    ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'monthly'
  `;
}
