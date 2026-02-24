export const version = 11;
export const name = 'tenant_credentials';

export async function up(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS tenant_credentials (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      service TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(tenant_id, service, key)
    )
  `;
}
