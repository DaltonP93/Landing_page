import crypto from 'crypto';
import { getSecret } from './secrets';
import { getDemos, getSubscriptions, getChatLeads } from './repo';

interface HasEmail { email: string; phone?: string }

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** Reúne y deduplica los emails de leads (demos + suscripciones + chat), hasheados SHA256. */
export async function buildEmailHashes(): Promise<string[]> {
  const demos = await getDemos<HasEmail[]>([]);
  const subs = await getSubscriptions<HasEmail[]>([]);
  const chat = await getChatLeads<HasEmail[]>([]);
  const set = new Set<string>();
  for (const r of [...demos, ...subs, ...chat]) {
    if (r.email) set.add(sha256(r.email.trim().toLowerCase()));
  }
  return [...set];
}

export interface SyncResult { ok: boolean; received?: number; error?: string }

/** Meta Custom Audience (Graph API). */
export async function syncMeta(hashes: string[]): Promise<SyncResult> {
  const token = getSecret('META_ACCESS_TOKEN');
  const audienceId = getSecret('META_CUSTOM_AUDIENCE_ID');
  if (!token || !audienceId) return { ok: false, error: 'Falta META_ACCESS_TOKEN o META_CUSTOM_AUDIENCE_ID' };

  const payload = { schema: 'EMAIL', data: hashes.map((h) => [h]) };
  const res = await fetch(`https://graph.facebook.com/v19.0/${audienceId}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ payload: JSON.stringify(payload), access_token: token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.error?.message || 'Error de Meta' };
  return { ok: true, received: data?.num_received ?? hashes.length };
}

async function googleAccessToken(): Promise<string | null> {
  const id = getSecret('GOOGLE_OAUTH_CLIENT_ID');
  const secret = getSecret('GOOGLE_OAUTH_CLIENT_SECRET');
  const refresh = getSecret('GOOGLE_OAUTH_REFRESH_TOKEN');
  if (!id || !secret || !refresh) return null;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: id, client_secret: secret, refresh_token: refresh, grant_type: 'refresh_token' }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

/** Google Ads Customer Match (offline user data job). */
export async function syncGoogle(hashes: string[]): Promise<SyncResult> {
  const dev = getSecret('GOOGLE_ADS_DEVELOPER_TOKEN');
  const cid = (getSecret('GOOGLE_ADS_CUSTOMER_ID') || '').replace(/-/g, '');
  const listId = getSecret('GOOGLE_ADS_USER_LIST_ID');
  if (!dev || !cid || !listId) return { ok: false, error: 'Faltan credenciales de Google Ads' };

  const token = await googleAccessToken();
  if (!token) return { ok: false, error: 'No se pudo obtener el access token de Google (OAuth)' };

  const base = `https://googleads.googleapis.com/v18/customers/${cid}`;
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, 'developer-token': dev, 'Content-Type': 'application/json' };
  const loginCid = getSecret('GOOGLE_ADS_LOGIN_CUSTOMER_ID');
  if (loginCid) headers['login-customer-id'] = loginCid.replace(/-/g, '');

  const createRes = await fetch(`${base}/offlineUserDataJobs:create`, {
    method: 'POST', headers,
    body: JSON.stringify({ job: { type: 'CUSTOMER_MATCH_USER_LIST', customerMatchUserListMetadata: { userList: `customers/${cid}/userLists/${listId}` } } }),
  });
  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok) return { ok: false, error: createData?.error?.message || 'Error al crear el job de Google' };
  const jobName: string = createData.resourceName;
  const jobPath = jobName.split('/').slice(-2).join('/');

  const addRes = await fetch(`${base}/${jobPath}:addOperations`, {
    method: 'POST', headers,
    body: JSON.stringify({ operations: hashes.map((h) => ({ create: { userIdentifiers: [{ hashedEmail: h }] } })), enablePartialFailure: true }),
  });
  if (!addRes.ok) {
    const e = await addRes.json().catch(() => ({}));
    return { ok: false, error: e?.error?.message || 'Error al agregar usuarios' };
  }
  await fetch(`${base}/${jobPath}:run`, { method: 'POST', headers, body: '{}' });
  return { ok: true, received: hashes.length };
}
