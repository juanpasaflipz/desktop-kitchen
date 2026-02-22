/**
 * Lightweight migration runner for better-sqlite3.
 *
 * - No external dependencies, no CLI, no down migrations.
 * - Migrations are loaded once at startup via initMigrations() (async import).
 * - runMigrationsSync(db, label) is called after applySchema() for every DB
 *   (default + every tenant). It uses the cached migration list so there is
 *   zero disk overhead per tenant open.
 * - Each migration runs inside a SQLite transaction — if up() throws the
 *   version is not recorded and it will retry on next startup.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

/** In-memory cache of migration modules, sorted by version. */
let migrationCache = null;

/**
 * Load all migration files from disk (async dynamic import).
 * Must be called once at startup before any runMigrationsSync() call.
 */
export async function initMigrations() {
  if (migrationCache) return;

  const files = fs.existsSync(migrationsDir)
    ? fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js')).sort()
    : [];

  const modules = [];
  for (const file of files) {
    const mod = await import(path.join(migrationsDir, file));
    if (typeof mod.version !== 'number' || typeof mod.up !== 'function') {
      console.warn(`[Migrate] Skipping ${file}: missing version or up()`);
      continue;
    }
    modules.push({ version: mod.version, name: mod.name || file, up: mod.up });
  }

  modules.sort((a, b) => a.version - b.version);
  migrationCache = modules;
  console.log(`[Migrate] Loaded ${modules.length} migration(s)`);
}

/**
 * Ensure the schema_version table exists.
 */
function ensureVersionTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);
}

/**
 * Run all pending migrations on the given database (synchronous).
 * Safe to call on every DB open — skips already-applied versions.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {string} [label='db'] — label for log messages (e.g. tenant id)
 */
export function runMigrationsSync(db, label = 'db') {
  if (!migrationCache) {
    throw new Error('[Migrate] initMigrations() must be called before runMigrationsSync()');
  }

  ensureVersionTable(db);

  const currentVersion = db.prepare(
    'SELECT COALESCE(MAX(version), 0) AS v FROM schema_version'
  ).get().v;

  const pending = migrationCache.filter(m => m.version > currentVersion);

  if (pending.length === 0) return;

  console.log(`[Migrate] ${label}: ${pending.length} pending migration(s) from v${currentVersion}`);

  for (const migration of pending) {
    const runInTransaction = db.transaction(() => {
      migration.up(db);
      db.prepare(
        'INSERT INTO schema_version (version, name) VALUES (?, ?)'
      ).run(migration.version, migration.name);
    });

    try {
      runInTransaction();
      console.log(`[Migrate] ${label}: applied v${migration.version} (${migration.name})`);
    } catch (err) {
      console.error(`[Migrate] ${label}: FAILED v${migration.version} (${migration.name}):`, err.message);
      throw err; // stop — don't skip broken migrations
    }
  }
}
