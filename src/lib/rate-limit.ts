import type { NextRequest } from 'next/server';

interface Entry { count: number; resetAt: number }
const buckets = new Map<string, Entry>();

/** IP del cliente a partir de los headers de proxy. */
export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Rate limit en memoria (ventana fija). Suficiente para un servidor único.
 * Devuelve { ok, remaining, retryAfter }.
 */
export function rateLimit(id: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const e = buckets.get(id);
  if (!e || e.resetAt < now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  e.count += 1;
  if (e.count > limit) return { ok: false, remaining: 0, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  return { ok: true, remaining: limit - e.count, retryAfter: 0 };
}

// Limpieza periódica de buckets vencidos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }, 5 * 60_000).unref?.();
}
