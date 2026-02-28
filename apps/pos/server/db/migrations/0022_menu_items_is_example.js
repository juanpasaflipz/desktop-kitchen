export const version = 22;
export const name = 'menu_items_is_example';

export async function up(sql) {
  await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_example BOOLEAN DEFAULT false`;
}
