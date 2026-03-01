export const version = 24;
export const name = 'sales_reps_password_hash';

export async function up(sql) {
  await sql`ALTER TABLE sales_reps ADD COLUMN IF NOT EXISTS password_hash TEXT`;
}
