export const version = 6;
export const name = 'cfdi';

export async function up(sql) {
  // ==================== cfdi_config ====================
  await sql`
    CREATE TABLE IF NOT EXISTS cfdi_config (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL UNIQUE,
      facturapi_org_id TEXT,
      rfc TEXT,
      legal_name TEXT,
      tax_regime TEXT,
      postal_code TEXT,
      csd_uploaded BOOLEAN DEFAULT false,
      csd_valid_until TIMESTAMPTZ,
      default_uso_cfdi TEXT DEFAULT 'G03',
      invoice_series TEXT DEFAULT 'DK',
      invoice_link_expiry_hours INTEGER DEFAULT 72,
      active BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE cfdi_config ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE cfdi_config FORCE ROW LEVEL SECURITY`;
  await sql`DROP POLICY IF EXISTS tenant_isolation ON cfdi_config`;
  await sql`
    CREATE POLICY tenant_isolation ON cfdi_config
      USING (tenant_id = current_setting('app.tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true))
  `;

  await sql`GRANT SELECT, INSERT, UPDATE ON cfdi_config TO app_user`;
  await sql`GRANT USAGE, SELECT ON cfdi_config_id_seq TO app_user`;

  // ==================== cfdi_invoices ====================
  await sql`
    CREATE TABLE IF NOT EXISTS cfdi_invoices (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL DEFAULT current_setting('app.tenant_id', true),
      order_id INTEGER NOT NULL,
      facturapi_invoice_id TEXT NOT NULL UNIQUE,
      uuid_fiscal TEXT,
      series TEXT,
      folio TEXT,
      cfdi_type TEXT DEFAULT 'I',
      receptor_rfc TEXT NOT NULL,
      receptor_name TEXT NOT NULL,
      receptor_tax_regime TEXT,
      receptor_postal_code TEXT,
      receptor_uso_cfdi TEXT DEFAULT 'G03',
      subtotal NUMERIC(12,2),
      tax_total NUMERIC(12,2),
      total NUMERIC(12,2),
      forma_pago TEXT,
      metodo_pago TEXT DEFAULT 'PUE',
      xml_url TEXT,
      pdf_url TEXT,
      status TEXT DEFAULT 'valid',
      cancellation_reason TEXT,
      cancelled_at TIMESTAMPTZ,
      substitute_invoice_id INTEGER,
      requested_by TEXT DEFAULT 'staff',
      issued_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE cfdi_invoices ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE cfdi_invoices FORCE ROW LEVEL SECURITY`;
  await sql`DROP POLICY IF EXISTS tenant_isolation ON cfdi_invoices`;
  await sql`
    CREATE POLICY tenant_isolation ON cfdi_invoices
      USING (tenant_id = current_setting('app.tenant_id', true))
      WITH CHECK (tenant_id = current_setting('app.tenant_id', true))
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_cfdi_invoices_tenant_date
    ON cfdi_invoices(tenant_id, issued_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cfdi_invoices_tenant_order
    ON cfdi_invoices(tenant_id, order_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_cfdi_invoices_uuid
    ON cfdi_invoices(uuid_fiscal)`;

  await sql`GRANT SELECT, INSERT, UPDATE ON cfdi_invoices TO app_user`;
  await sql`GRANT USAGE, SELECT ON cfdi_invoices_id_seq TO app_user`;

  // ==================== cfdi_invoice_tokens (NO RLS) ====================
  await sql`
    CREATE TABLE IF NOT EXISTS cfdi_invoice_tokens (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      tenant_id TEXT NOT NULL,
      order_id INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      used_at TIMESTAMPTZ,
      cfdi_invoice_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_cfdi_invoice_tokens_token
    ON cfdi_invoice_tokens(token)`;

  await sql`GRANT SELECT, INSERT, UPDATE ON cfdi_invoice_tokens TO app_user`;
  await sql`GRANT USAGE, SELECT ON cfdi_invoice_tokens_id_seq TO app_user`;

  // ==================== Add columns to orders ====================
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cfdi_invoice_id INTEGER`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_token TEXT`;

  // ==================== Seed manage_invoicing permission ====================
  await sql`
    INSERT INTO role_permissions (tenant_id, role, permission, granted)
    SELECT t.id, 'admin', 'manage_invoicing', true FROM tenants t
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO role_permissions (tenant_id, role, permission, granted)
    SELECT t.id, 'manager', 'manage_invoicing', true FROM tenants t
    ON CONFLICT DO NOTHING
  `;
  // Non-granted entries for other roles
  await sql`
    INSERT INTO role_permissions (tenant_id, role, permission, granted)
    SELECT t.id, r.role, 'manage_invoicing', false
    FROM tenants t, (VALUES ('cashier'), ('kitchen'), ('bar')) AS r(role)
    ON CONFLICT DO NOTHING
  `;
}
