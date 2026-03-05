export const version = 28;
export const name = 'free_pro_plans';

export async function up(sql) {
  // Migrate trial/starter → free
  await sql`UPDATE tenants SET plan = 'free' WHERE plan IN ('trial', 'starter')`;

  // Migrate pro/ghost_kitchen → pro
  await sql`UPDATE tenants SET plan = 'pro' WHERE plan IN ('ghost_kitchen')`;

  // Clear trial_ends_at (no longer used)
  await sql`UPDATE tenants SET trial_ends_at = NULL`;

  // AI daily suggestion counter for AI Lite (free plan)
  await sql`
    CREATE TABLE IF NOT EXISTS ai_daily_suggestions (
      tenant_id TEXT NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (tenant_id, date)
    )
  `;

  // Upgrade trigger events for analytics
  await sql`
    CREATE TABLE IF NOT EXISTS upgrade_trigger_events (
      id SERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      feature TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // RLS policies
  await sql`ALTER TABLE ai_daily_suggestions ENABLE ROW LEVEL SECURITY`;
  await sql`
    CREATE POLICY ai_daily_suggestions_tenant ON ai_daily_suggestions
    FOR ALL USING (tenant_id = current_setting('app.tenant_id'))
  `;

  await sql`ALTER TABLE upgrade_trigger_events ENABLE ROW LEVEL SECURITY`;
  await sql`
    CREATE POLICY upgrade_trigger_events_tenant ON upgrade_trigger_events
    FOR ALL USING (tenant_id = current_setting('app.tenant_id'))
  `;

  // Grant app_user access
  await sql`GRANT ALL ON ai_daily_suggestions TO app_user`;
  await sql`GRANT ALL ON upgrade_trigger_events TO app_user`;
  await sql`GRANT USAGE, SELECT ON SEQUENCE upgrade_trigger_events_id_seq TO app_user`;
}
