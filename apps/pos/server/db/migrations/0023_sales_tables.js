export const version = 23;
export const name = 'sales_tables';

export async function up(sql) {
  // Sales reps — platform-level (not tenant-scoped, no RLS)
  await sql`
    CREATE TABLE IF NOT EXISTS sales_reps (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      is_manager BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Prospects tracked by sales reps
  await sql`
    CREATE TABLE IF NOT EXISTS prospects (
      id SERIAL PRIMARY KEY,
      sales_rep_id INTEGER NOT NULL REFERENCES sales_reps(id),
      business_name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      neighborhood TEXT,
      notes TEXT,
      status TEXT DEFAULT 'visited',
      converted_tenant_id TEXT,
      converted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Commissions earned when a prospect converts
  await sql`
    CREATE TABLE IF NOT EXISTS commissions (
      id SERIAL PRIMARY KEY,
      sales_rep_id INTEGER NOT NULL REFERENCES sales_reps(id),
      prospect_id INTEGER NOT NULL REFERENCES prospects(id),
      tenant_id TEXT,
      plan_name TEXT,
      plan_price_usd NUMERIC DEFAULT 0,
      commission_amount_usd NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'pending',
      approved_by INTEGER REFERENCES sales_reps(id),
      approved_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Indexes for common query patterns
  await sql`CREATE INDEX IF NOT EXISTS idx_prospects_sales_rep_id ON prospects(sales_rep_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_commissions_sales_rep_id ON commissions(sales_rep_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status)`;
}
