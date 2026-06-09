import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData, isAdmin } from '@/lib/store';

interface HasEmail { email: string; phone?: string }

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

/** Reúne y deduplica los emails de leads (demos + suscripciones + chat), hasheados. */
function buildEmailHashes(): string[] {
  const demos = readData<HasEmail[]>('data/demos.json', []);
  const subs = readData<HasEmail[]>('data/subscriptions.json', []);
  const chat = readData<HasEmail[]>('data/chat-leads.json', []);
  const set = new Set<string>();
  for (const r of [...demos, ...subs, ...chat]) {
    if (r.email) set.add(sha256(r.email.trim().toLowerCase()));
  }
  return [...set];
}

/* ── Meta Custom Audience (Graph API) ── */
async function syncMeta(hashes: string[]): Promise<{ ok: boolean; received?: number; error?: string }> {
  const token = process.env.META_ACCESS_TOKEN;
  const audienceId = process.env.META_CUSTOM_AUDIENCE_ID;
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

/* ── Google Ads Customer Match (offline user data job) ── */
async function googleAccessToken(): Promise<string | null> {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refresh = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
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

async function syncGoogle(hashes: string[]): Promise<{ ok: boolean; received?: number; error?: string }> {
  const dev = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const cid = (process.env.GOOGLE_ADS_CUSTOMER_ID || '').replace(/-/g, '');
  const listId = process.env.GOOGLE_ADS_USER_LIST_ID;
  if (!dev || !cid || !listId) return { ok: false, error: 'Faltan credenciales de Google Ads (developer token / customer / user list)' };

  const token = await googleAccessToken();
  if (!token) return { ok: false, error: 'No se pudo obtener el access token de Google (OAuth)' };

  const base = `https://googleads.googleapis.com/v18/customers/${cid}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'developer-token': dev,
    'Content-Type': 'application/json',
  };
  if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) headers['login-customer-id'] = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, '');

  // 1) Crear el job
  const createRes = await fetch(`${base}/offlineUserDataJobs:create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ job: { type: 'CUSTOMER_MATCH_USER_LIST', customerMatchUserListMetadata: { userList: `customers/${cid}/userLists/${listId}` } } }),
  });
  const createData = await createRes.json().catch(() => ({}));
  if (!createRes.ok) return { ok: false, error: createData?.error?.message || 'Error al crear el job de Google' };
  const jobName = createData.resourceName;

  // 2) Agregar operaciones (emails hasheados)
  const addRes = await fetch(`${base}/${jobName.split('/').slice(-2).join('/')}:addOperations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ operations: hashes.map((h) => ({ create: { userIdentifiers: [{ hashedEmail: h }] } })), enablePartialFailure: true }),
  });
  if (!addRes.ok) {
    const e = await addRes.json().catch(() => ({}));
    return { ok: false, error: e?.error?.message || 'Error al agregar usuarios' };
  }

  // 3) Ejecutar el job
  await fetch(`${base}/${jobName.split('/').slice(-2).join('/')}:run`, { method: 'POST', headers, body: '{}' });
  return { ok: true, received: hashes.length };
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const platform = (request.nextUrl.searchParams.get('platform') || '').toLowerCase();
  const hashes = buildEmailHashes();
  if (hashes.length === 0) return NextResponse.json({ ok: false, error: 'No hay leads para sincronizar' }, { status: 400 });

  const result = platform === 'meta' ? await syncMeta(hashes) : platform === 'google' ? await syncGoogle(hashes) : { ok: false, error: 'Plataforma no válida' };

  return NextResponse.json({ platform, total: hashes.length, ...result }, { status: result.ok ? 200 : 400 });
}
