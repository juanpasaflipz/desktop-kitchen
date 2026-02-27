/**
 * Migration 0021 — Add unique constraint on tenants.owner_email.
 *
 * Prevents duplicate tenant accounts with the same email address.
 */

export const version = 21;
export const name = 'owner_email_unique';

export async function up(sql) {
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_owner_email
    ON tenants(owner_email)`;
}
