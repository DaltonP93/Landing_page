import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/store';
import { getSubscriptions, saveSubscriptions } from '@/lib/repo';
import { setProductAccess, notifyTeam } from '@/lib/provision';
import type { Subscription } from '../billing/checkout/route';

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getSubscriptions<Subscription[]>([]));
}

/** Actualiza estado y/o acceso de una suscripción. Habilita/deshabilita en el sistema. */
export async function PATCH(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, status, accessEnabled } = await request.json();
  const subs = await getSubscriptions<Subscription[]>([]);
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Suscripción no encontrada' }, { status: 404 });

  const sub = subs[idx];

  if (status) {
    sub.status = status;
    if (status === 'active' && !sub.activatedAt) sub.activatedAt = new Date().toISOString();
  }

  if (typeof accessEnabled === 'boolean' && accessEnabled !== sub.accessEnabled) {
    sub.accessEnabled = accessEnabled;
    // Provisiona el acceso en el sistema contratado (habilitar/deshabilitar)
    setProductAccess(sub.productId, {
      email: sub.email,
      company: sub.company,
      enabled: accessEnabled,
      plan: sub.plan,
    });
    notifyTeam(
      `${accessEnabled ? '✅ Acceso HABILITADO' : '⛔ Acceso DESHABILITADO'}\n\n${sub.company} · ${sub.productName}\n${sub.email}`
    );
  }

  subs[idx] = sub;
  await saveSubscriptions(subs);
  return NextResponse.json({ status: 'ok', subscription: sub });
}
