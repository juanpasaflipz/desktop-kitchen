export const version = 17;
export const name = '0017_board_settings';

export async function up(sql) {
  await sql`ALTER TABLE virtual_brands ADD COLUMN IF NOT EXISTS board_settings JSONB DEFAULT '{}'::jsonb`;
}
