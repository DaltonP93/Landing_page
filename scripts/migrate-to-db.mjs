// Migra los datos transaccionales desde archivos JSON a PostgreSQL.
//   Uso:  DATABASE_URL=postgres://... node scripts/migrate-to-db.mjs
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error('Falta DATABASE_URL. Ej: DATABASE_URL=postgres://user:pass@host:5432/db node scripts/migrate-to-db.mjs');
  process.exit(1);
}

const COLLECTIONS = [
  ['demos', 'data/demos.json'],
  ['subscriptions', 'data/subscriptions.json'],
  ['chat_leads', 'data/chat-leads.json'],
  ['users', 'data/users.json'],
  ['cron_log', 'data/cron-log.json'],
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

function readJson(file, fallback) {
  const full = join(process.cwd(), file);
  if (!existsSync(full)) return fallback;
  try { return JSON.parse(readFileSync(full, 'utf-8')); } catch { return fallback; }
}

async function main() {
  // Asegura la tabla
  await pool.query(`CREATE TABLE IF NOT EXISTS app_documents (
    key TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '[]'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())`);

  for (const [key, file] of COLLECTIONS) {
    const data = readJson(file, key === 'cron_log' ? {} : []);
    await pool.query(
      `INSERT INTO app_documents (key, data, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET data = $2::jsonb, updated_at = now()`,
      [key, JSON.stringify(data)]
    );
    const n = Array.isArray(data) ? data.length : 1;
    console.log(`✓ ${key}: ${n} registro(s) migrado(s)`);
  }

  await pool.end();
  console.log('\nMigración completada. Configurá DATABASE_URL en el servidor para activar Postgres.');
}

main().catch((e) => { console.error('Error en la migración:', e.message); process.exit(1); });
