import { NextRequest, NextResponse } from 'next/server';
import { writeData } from '@/lib/store';
import { getSecret } from '@/lib/secrets';
import { buildEmailHashes, syncMeta, syncGoogle } from '@/lib/audiences';

/**
 * Cron diario de sincronización de audiencias (Meta + Google Ads).
 * Lo dispara un cron externo (Vercel Cron, crontab, etc.) una vez al día.
 *
 * Seguridad: requiere el secreto CRON_SECRET vía
 *   - header  Authorization: Bearer <CRON_SECRET>   (Vercel Cron)
 *   - o query ?secret=<CRON_SECRET>
 */
function authorized(request: NextRequest): boolean {
  const expected = getSecret('CRON_SECRET');
  if (!expected) return false;
  const auth = request.headers.get('authorization') || '';
  const fromHeader = auth.replace(/^Bearer\s+/i, '');
  const fromQuery = request.nextUrl.searchParams.get('secret') || '';
  return fromHeader === expected || fromQuery === expected;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const hashes = buildEmailHashes();
  const meta = await syncMeta(hashes);
  const google = await syncGoogle(hashes);

  const log = { at: new Date().toISOString(), total: hashes.length, meta, google };
  writeData('data/cron-log.json', log);

  return NextResponse.json({ status: 'ok', ...log });
}
