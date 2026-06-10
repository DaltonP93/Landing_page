import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { dbEnabled, query } from './db';

/**
 * Almacén de documentos: usa la tabla Postgres `app_documents` (JSONB) cuando
 * hay DATABASE_URL; si no, usa el archivo JSON local. Mantiene la misma forma
 * de datos (arreglos/objetos) para que la lógica de las rutas no cambie.
 */
async function loadDoc<T>(key: string, file: string, fallback: T): Promise<T> {
  if (dbEnabled()) {
    const rows = await query<{ data: T }>('SELECT data FROM app_documents WHERE key = $1', [key]);
    return rows.length ? rows[0].data : fallback;
  }
  const full = join(process.cwd(), file);
  if (!existsSync(full)) return fallback;
  try {
    return JSON.parse(readFileSync(full, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

async function saveDoc(key: string, file: string, data: unknown): Promise<void> {
  if (dbEnabled()) {
    await query(
      `INSERT INTO app_documents (key, data, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (key) DO UPDATE SET data = $2::jsonb, updated_at = now()`,
      [key, JSON.stringify(data)]
    );
    return;
  }
  const full = join(process.cwd(), file);
  const dir = dirname(full);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2), 'utf-8');
}

/* ── Colecciones transaccionales (clientes) ── */
export const getDemos = <T>(fb: T = [] as unknown as T) => loadDoc('demos', 'data/demos.json', fb);
export const saveDemos = (data: unknown) => saveDoc('demos', 'data/demos.json', data);

export const getSubscriptions = <T>(fb: T = [] as unknown as T) => loadDoc('subscriptions', 'data/subscriptions.json', fb);
export const saveSubscriptions = (data: unknown) => saveDoc('subscriptions', 'data/subscriptions.json', data);

export const getChatLeads = <T>(fb: T = [] as unknown as T) => loadDoc('chat_leads', 'data/chat-leads.json', fb);
export const saveChatLeads = (data: unknown) => saveDoc('chat_leads', 'data/chat-leads.json', data);

export const getUsersDoc = <T>(fb: T = [] as unknown as T) => loadDoc('users', 'data/users.json', fb);
export const saveUsersDoc = (data: unknown) => saveDoc('users', 'data/users.json', data);

export const saveCronLog = (data: unknown) => saveDoc('cron_log', 'data/cron-log.json', data);
