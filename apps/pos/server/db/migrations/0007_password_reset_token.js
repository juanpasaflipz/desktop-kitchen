export const version = 7;
export const name = 'password_reset_token';

export async function up(sql) {
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS reset_token TEXT`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ`;

  await sql`CREATE INDEX IF NOT EXISTS idx_tenants_reset_token
    ON tenants(reset_token) WHERE reset_token IS NOT NULL`;
}
