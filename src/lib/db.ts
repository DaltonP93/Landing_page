import { Pool } from 'pg';

let pool: Pool | null = null;

/** Hay base de datos configurada si existe DATABASE_URL. */
export function dbEnabled(): boolean {
  return !!process.env.DATABASE_URL;
}

/** Pool de conexiones perezoso (singleton). */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Para conexiones gestionadas (Supabase, RDS, etc.) que requieren SSL
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX || 10),
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}
