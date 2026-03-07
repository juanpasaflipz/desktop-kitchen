export const version = 31;
export const name = 'getnet_integration';

export async function up(sql) {
  // Getnet merchant configuration per tenant
  await sql`
    CREATE TABLE IF NOT EXISTS getnet_merchant_configs (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      merchant_id TEXT NOT NULL,
      terminal_id TEXT,
      environment TEXT NOT NULL DEFAULT 'sandbox',
      enabled BOOLEAN NOT NULL DEFAULT true,
      tap_on_phone_enabled BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(tenant_id)
    )
  `;

  // Getnet transaction log
  await sql`
    CREATE TABLE IF NOT EXISTS getnet_transactions (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      getnet_payment_id TEXT,
      idempotency_key TEXT NOT NULL,
      amount_centavos BIGINT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'MXN',
      payment_type TEXT NOT NULL DEFAULT 'credit',
      status TEXT NOT NULL DEFAULT 'pending',
      authorization_code TEXT,
      nsu TEXT,
      response_code TEXT,
      response_message TEXT,
      card_brand TEXT,
      card_last_four TEXT,
      is_tap_on_phone BOOLEAN NOT NULL DEFAULT false,
      captured_at TIMESTAMPTZ,
      refunded_at TIMESTAMPTZ,
      raw_response JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Platform fee ledger — tracks fees per transaction
  await sql`
    CREATE TABLE IF NOT EXISTS platform_fee_ledger (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      processor TEXT NOT NULL,
      gross_amount NUMERIC(12,2) NOT NULL,
      processor_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
      platform_fee_rate NUMERIC(5,4) NOT NULL,
      platform_fee_amount NUMERIC(12,2) NOT NULL,
      net_to_merchant NUMERIC(12,2) NOT NULL,
      plan_at_time TEXT NOT NULL DEFAULT 'free',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Daily platform fee summary for reporting
  await sql`
    CREATE TABLE IF NOT EXISTS platform_fee_daily_summary (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      summary_date DATE NOT NULL,
      processor TEXT NOT NULL,
      transaction_count INTEGER NOT NULL DEFAULT 0,
      gross_total NUMERIC(12,2) NOT NULL DEFAULT 0,
      processor_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
      platform_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
      net_to_merchant NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(tenant_id, summary_date, processor)
    )
  `;

  // Add Getnet columns to orders
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS getnet_payment_id TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS getnet_authorization_code TEXT`;

  // Add Getnet refund tracking
  await sql`ALTER TABLE refunds ADD COLUMN IF NOT EXISTS getnet_refund_id TEXT`;

  // Add Getnet on split payments
  await sql`ALTER TABLE order_payments ADD COLUMN IF NOT EXISTS getnet_payment_id TEXT`;

  // Add getnet_enabled flag to tenants
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS getnet_enabled BOOLEAN DEFAULT false`;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_getnet_transactions_tenant ON getnet_transactions (tenant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_getnet_transactions_order ON getnet_transactions (order_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_getnet_transactions_payment_id ON getnet_transactions (getnet_payment_id) WHERE getnet_payment_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_getnet_payment_id ON orders (getnet_payment_id) WHERE getnet_payment_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_fee_ledger_tenant ON platform_fee_ledger (tenant_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_platform_fee_daily_tenant ON platform_fee_daily_summary (tenant_id, summary_date)`;

  // RLS policies for getnet_merchant_configs
  await sql`ALTER TABLE getnet_merchant_configs ENABLE ROW LEVEL SECURITY`;
  await sql`
    DO $$ BEGIN
      CREATE POLICY getnet_merchant_configs_tenant ON getnet_merchant_configs
        FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  // RLS policies for getnet_transactions
  await sql`ALTER TABLE getnet_transactions ENABLE ROW LEVEL SECURITY`;
  await sql`
    DO $$ BEGIN
      CREATE POLICY getnet_transactions_tenant ON getnet_transactions
        FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  // RLS policies for platform_fee_ledger
  await sql`ALTER TABLE platform_fee_ledger ENABLE ROW LEVEL SECURITY`;
  await sql`
    DO $$ BEGIN
      CREATE POLICY platform_fee_ledger_tenant ON platform_fee_ledger
        FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;

  // RLS policies for platform_fee_daily_summary
  await sql`ALTER TABLE platform_fee_daily_summary ENABLE ROW LEVEL SECURITY`;
  await sql`
    DO $$ BEGIN
      CREATE POLICY platform_fee_daily_summary_tenant ON platform_fee_daily_summary
        FOR ALL USING (tenant_id = current_setting('app.tenant_id', true));
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `;
}
