export const version = 36;
export const name = 'expense_payee';

export async function up(sql) {
  await sql`ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payee TEXT`;
}
