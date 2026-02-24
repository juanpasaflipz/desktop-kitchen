export const version = 13;
export const name = 'signup_promo_code';

export async function up(sql) {
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS signup_promo_code TEXT DEFAULT NULL`;
}
