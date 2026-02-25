export const version = 16;
export const name = '0016_virtual_brand_item_show_image';

export async function up(sql) {
  await sql`ALTER TABLE virtual_brand_items ADD COLUMN IF NOT EXISTS show_image BOOLEAN DEFAULT true`;
}
