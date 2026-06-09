import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData, isAdmin } from '@/lib/store';

interface HasEmail { email: string; phone?: string }

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
const normEmail = (e: string) => e.trim().toLowerCase();
const normPhone = (p: string) => {
  const digits = p.replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('595') ? `+${digits}` : digits.startsWith('0') ? `+595${digits.slice(1)}` : `+${digits}`;
};

/**
 * Exporta la audiencia de leads (demos + suscripciones + chat) en CSV con
 * email/teléfono hasheados en SHA256, listo para subir a:
 *   - Google Ads → Customer Match  (?type=google)
 *   - Meta/Facebook → Custom Audience (?type=meta)
 */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const type = (request.nextUrl.searchParams.get('type') || 'google').toLowerCase();

  const demos = readData<HasEmail[]>('data/demos.json', []);
  const subs = readData<HasEmail[]>('data/subscriptions.json', []);
  const chat = readData<HasEmail[]>('data/chat-leads.json', []);

  // Dedupe por email normalizado
  const map = new Map<string, { email: string; phone: string }>();
  for (const r of [...demos, ...subs, ...chat]) {
    if (!r.email) continue;
    const e = normEmail(r.email);
    if (!map.has(e)) map.set(e, { email: e, phone: r.phone ? normPhone(r.phone) : '' });
  }

  const rows = [...map.values()];
  const header = type === 'meta' ? 'email,phone' : 'Email,Phone';
  const body = rows
    .map((r) => `${sha256(r.email)},${r.phone ? sha256(r.phone) : ''}`)
    .join('\n');
  const csv = `${header}\n${body}\n`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="audiencia-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
