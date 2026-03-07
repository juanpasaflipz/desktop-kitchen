export const version = 32;
export const name = 'settlement_mca_engine';

export async function up(sql) {
  // ─── Getnet Settlement Batches (platform-level, NO RLS) ───────────
  await sql`
    CREATE TABLE IF NOT EXISTS getnet_settlement_batches (
      id SERIAL PRIMARY KEY,
      batch_reference TEXT NOT NULL UNIQUE,
      settlement_date DATE NOT NULL,
      total_gross NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_fees NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_net NUMERIC(14,2) NOT NULL DEFAULT 0,
      transaction_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'received',
      raw_data JSONB,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── Merchant Settlement Lines (per-merchant breakdown) ───────────
  await sql`
    CREATE TABLE IF NOT EXISTS merchant_settlement_lines (
      id SERIAL PRIMARY KEY,
      batch_id INTEGER NOT NULL REFERENCES getnet_settlement_batches(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL,
      settlement_date DATE NOT NULL,
      gross_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      processor_fee NUMERIC(14,2) NOT NULL DEFAULT 0,
      platform_fee NUMERIC(14,2) NOT NULL DEFAULT 0,
      mca_holdback NUMERIC(14,2) NOT NULL DEFAULT 0,
      net_disbursement NUMERIC(14,2) NOT NULL DEFAULT 0,
      transaction_count INTEGER NOT NULL DEFAULT 0,
      disbursement_status TEXT NOT NULL DEFAULT 'pending',
      disbursement_reference TEXT,
      disbursement_bank_account_id INTEGER,
      disbursed_at TIMESTAMPTZ,
      hold_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── Merchant Bank Accounts (CLABE for SPEI) ──────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS merchant_bank_accounts (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      clabe TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      bank_code TEXT NOT NULL,
      beneficiary_name TEXT NOT NULL,
      alias TEXT,
      is_primary BOOLEAN NOT NULL DEFAULT false,
      verified BOOLEAN NOT NULL DEFAULT false,
      verified_at TIMESTAMPTZ,
      verified_by TEXT,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── Merchant Advances (MCA lifecycle) ─────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS merchant_advances (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      offer_id INTEGER REFERENCES merchant_financing_offers(id),
      advance_amount NUMERIC(14,2) NOT NULL,
      factor_rate NUMERIC(5,4) NOT NULL,
      total_repayment NUMERIC(14,2) NOT NULL,
      holdback_percent NUMERIC(5,2) NOT NULL,
      total_repaid NUMERIC(14,2) NOT NULL DEFAULT 0,
      remaining_balance NUMERIC(14,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_disbursement',
      disbursement_reference TEXT,
      disbursement_bank_account_id INTEGER REFERENCES merchant_bank_accounts(id),
      disbursed_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      paused_at TIMESTAMPTZ,
      pause_reason TEXT,
      estimated_completion_date DATE,
      risk_status TEXT NOT NULL DEFAULT 'healthy',
      risk_flags JSONB DEFAULT '[]'::jsonb,
      last_risk_check_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── MCA Repayment Log ─────────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS mca_repayment_log (
      id SERIAL PRIMARY KEY,
      advance_id INTEGER NOT NULL REFERENCES merchant_advances(id) ON DELETE CASCADE,
      tenant_id TEXT NOT NULL,
      settlement_line_id INTEGER REFERENCES merchant_settlement_lines(id),
      settlement_date DATE NOT NULL,
      daily_card_volume NUMERIC(14,2) NOT NULL DEFAULT 0,
      holdback_percent NUMERIC(5,2) NOT NULL,
      holdback_amount NUMERIC(14,2) NOT NULL,
      cumulative_repaid NUMERIC(14,2) NOT NULL,
      remaining_after NUMERIC(14,2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── MCA Events (audit trail) ─────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS mca_events (
      id SERIAL PRIMARY KEY,
      advance_id INTEGER REFERENCES merchant_advances(id),
      tenant_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      actor_type TEXT NOT NULL DEFAULT 'system',
      actor_id TEXT,
      details JSONB DEFAULT '{}'::jsonb,
      ip_address TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── Holding Account Ledger ────────────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS holding_account_ledger (
      id SERIAL PRIMARY KEY,
      entry_type TEXT NOT NULL,
      tenant_id TEXT,
      reference_type TEXT,
      reference_id INTEGER,
      debit NUMERIC(14,2) NOT NULL DEFAULT 0,
      credit NUMERIC(14,2) NOT NULL DEFAULT 0,
      balance_after NUMERIC(14,2) NOT NULL,
      description TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // ─── MCA Capital Pool (single row) ─────────────────────────────────
  await sql`
    CREATE TABLE IF NOT EXISTS mca_capital_pool (
      id SERIAL PRIMARY KEY,
      total_capital NUMERIC(14,2) NOT NULL DEFAULT 0,
      deployed NUMERIC(14,2) NOT NULL DEFAULT 0,
      available NUMERIC(14,2) NOT NULL DEFAULT 0,
      total_returned NUMERIC(14,2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Insert initial capital pool row if not exists
  await sql`
    INSERT INTO mca_capital_pool (id, total_capital, deployed, available, total_returned)
    VALUES (1, 0, 0, 0, 0)
    ON CONFLICT (id) DO NOTHING
  `;

  // ─── ALTER tenants table ───────────────────────────────────────────
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS disbursement_schedule TEXT DEFAULT 'T+2'`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS disbursement_hold BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS disbursement_hold_reason TEXT`;

  // ─── Indexes ───────────────────────────────────────────────────────
  await sql`CREATE INDEX IF NOT EXISTS idx_settlement_batches_date ON getnet_settlement_batches (settlement_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_settlement_batches_status ON getnet_settlement_batches (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_settlement_lines_tenant ON merchant_settlement_lines (tenant_id, settlement_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_settlement_lines_batch ON merchant_settlement_lines (batch_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_settlement_lines_status ON merchant_settlement_lines (disbursement_status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_merchant_bank_accounts_tenant ON merchant_bank_accounts (tenant_id) WHERE deleted_at IS NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_merchant_advances_tenant ON merchant_advances (tenant_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_merchant_advances_status ON merchant_advances (status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mca_repayment_advance ON mca_repayment_log (advance_id, settlement_date)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mca_events_advance ON mca_events (advance_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_mca_events_tenant ON mca_events (tenant_id, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_holding_ledger_type ON holding_account_ledger (entry_type, created_at)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_holding_ledger_tenant ON holding_account_ledger (tenant_id, created_at) WHERE tenant_id IS NOT NULL`;

  // No RLS on these tables — they are platform-level, accessed via adminSql
}
