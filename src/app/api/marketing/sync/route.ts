import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/store';
import { buildEmailHashes, syncMeta, syncGoogle } from '@/lib/audiences';

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const platform = (request.nextUrl.searchParams.get('platform') || '').toLowerCase();
  const hashes = buildEmailHashes();
  if (hashes.length === 0) return NextResponse.json({ ok: false, error: 'No hay leads para sincronizar' }, { status: 400 });

  const result = platform === 'meta' ? await syncMeta(hashes) : platform === 'google' ? await syncGoogle(hashes) : { ok: false, error: 'Plataforma no válida' };

  return NextResponse.json({ platform, total: hashes.length, ...result }, { status: result.ok ? 200 : 400 });
}
