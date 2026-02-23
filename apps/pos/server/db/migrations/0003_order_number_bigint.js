export const version = 3;
export const name = 'order_number_bigint';

export async function up(sql) {
  await sql`ALTER TABLE orders ALTER COLUMN order_number TYPE BIGINT`;
}
