import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData, writeData } from '@/lib/store';
import { setProductAccess, notifyTeam } from '@/lib/provision';
import { getSecret } from '@/lib/secrets';
import type { Subscription } from '../checkout/route';

const SUBS_PATH = 'data/subscriptions.json';

/** Verifica la firma de Stripe (t=...,v1=...) si hay secret configurado. */
function stripeVerified(raw: string, header: string | null): boolean {
  const secret = getSecret('STRIPE_WEBHOOK_SECRET');
  if (!secret) return true; // sin secret no verificamos (modo prueba)
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const signed = `${parts.t}.${raw}`;
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1 || ''));
  } catch {
    return false;
  }
}

/**
 * Recibe la confirmación de pago de la pasarela y activa la suscripción:
 * marca como pagada/activa y habilita el acceso al sistema contratado.
 *
 * Acepta:
 *  - Stripe: { type:'checkout.session.completed', data:{ object:{ metadata:{ subscriptionId } } } }
 *  - Bancard: { operation:{ shop_process_id } }  (match por paymentRef)
 *  - Genérico: { subscriptionId, secret }        (secret = BILLING_WEBHOOK_SECRET)
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(raw); } catch { /* puede venir vacío */ }

  // Verificación Stripe (si aplica)
  const stripeSig = request.headers.get('stripe-signature');
  if (stripeSig && !stripeVerified(raw, stripeSig)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  // Resolver a qué suscripción corresponde
  let subscriptionId = '';
  let paymentRef = '';

  if (body.type && (body.data as { object?: Record<string, unknown> })?.object) {
    const obj = (body.data as { object: Record<string, unknown> }).object;
    subscriptionId = String((obj.metadata as Record<string, string>)?.subscriptionId || obj.client_reference_id || '');
  } else if (body.operation && (body.operation as { shop_process_id?: unknown }).shop_process_id) {
    paymentRef = String((body.operation as { shop_process_id: unknown }).shop_process_id);
  } else if (body.subscriptionId) {
    if (body.secret !== getSecret('BILLING_WEBHOOK_SECRET')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    subscriptionId = String(body.subscriptionId);
  }

  if (!subscriptionId && !paymentRef) {
    return NextResponse.json({ error: 'No se pudo identificar la suscripción' }, { status: 400 });
  }

  const subs = readData<Subscription[]>(SUBS_PATH, []);
  const idx = subs.findIndex((s) => (subscriptionId && s.id === subscriptionId) || (paymentRef && s.paymentRef === paymentRef));
  if (idx === -1) return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });

  const sub = subs[idx];
  sub.paymentStatus = 'paid';
  sub.status = 'active';
  sub.accessEnabled = true;
  sub.activatedAt = new Date().toISOString();
  subs[idx] = sub;
  writeData(SUBS_PATH, subs);

  setProductAccess(sub.productId, { email: sub.email, company: sub.company, enabled: true, plan: sub.plan });
  notifyTeam(`💰 *Pago confirmado*\n\n${sub.company} · ${sub.productName}\n${sub.email}\nGs. ${sub.amount.toLocaleString('es-PY')}\n✅ Cuenta activada automáticamente`);

  return NextResponse.json({ status: 'ok', subscriptionId: sub.id });
}
