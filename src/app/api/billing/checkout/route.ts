import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData } from '@/lib/store';
import { getSubscriptions, saveSubscriptions } from '@/lib/repo';
import { notifyTeam, COMPANY_NAME } from '@/lib/provision';
import { getPromoForProduct, applyDiscount, type Promotion } from '@/lib/promotions';
import { createPayment } from '@/lib/gateways';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import products from '@/data/products.json';
import site from '@/data/site.json';


export interface Subscription {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  productName: string;
  plan: 'monthly' | 'annual';
  amount: number;
  promoCode: string;
  paymentMethod: string;
  status: 'pending' | 'active' | 'suspended' | 'cancelled';
  accessEnabled: boolean;
  gateway: string;
  paymentRef: string;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
  activatedAt: string | null;
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(`checkout:${clientIp(request)}`, 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: 'Demasiadas solicitudes. Esperá un minuto.' }, { status: 429 });

  const body = await request.json();
  const { name, email, phone, company, productId, plan, paymentMethod } = body;

  if (body.website) return NextResponse.json({ status: 'ok' }); // honeypot anti-bot

  if (!name || !email || !company || !productId || !plan) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: 'Producto no válido' }, { status: 400 });

  // Precio base según plan + descuento por promoción vigente
  const base = plan === 'annual' ? product.pricing.annual : product.pricing.monthly;
  const promos = readData<Promotion[]>('src/data/promotions.json', []);
  const promo = getPromoForProduct(productId, promos);
  const amount = promo ? applyDiscount(base, promo.discountPercent) : base;

  const sub: Subscription = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: phone || '',
    company,
    productId,
    productName: product.name,
    plan,
    amount,
    promoCode: promo?.code || '',
    paymentMethod: paymentMethod || site.billing.paymentMethods[0] || 'transferencia',
    status: 'pending',
    accessEnabled: false,
    gateway: '',
    paymentRef: '',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    activatedAt: null,
  };

  // Inicia el cobro según la pasarela configurada (manual / stripe / bancard)
  const payment = await createPayment({
    id: sub.id,
    amount: sub.amount,
    currency: site.billing.currency || 'PYG',
    description: `${product.name} (${plan === 'annual' ? 'anual' : 'mensual'})`,
    email,
    name,
  });
  sub.gateway = payment.method;
  sub.paymentRef = payment.reference;

  const subs = await getSubscriptions<Subscription[]>([]);
  subs.push(sub);
  await saveSubscriptions(subs);

  notifyTeam(
    `💳 *Nueva contratación*\n\n👤 ${name}\n🏢 ${company}\n📧 ${email}\n📱 ${phone}\n📦 ${product.name} (${plan === 'annual' ? 'anual' : 'mensual'})\n💰 Gs. ${amount.toLocaleString('es-PY')}${promo ? `\n🏷️ Promo: ${promo.code}` : ''}\n💵 ${sub.paymentMethod}\n\nEstado: PENDIENTE de pago`
  );

  return NextResponse.json({
    status: 'ok',
    id: sub.id,
    amount: sub.amount,
    promoApplied: promo ? { code: promo.code, percent: promo.discountPercent } : null,
    paymentMethod: sub.paymentMethod,
    gateway: payment.method,
    redirectUrl: payment.redirectUrl || null,
    instructions: payment.instructions || site.billing.bankInfo,
    bankInfo: site.billing.bankInfo,
    note: site.billing.checkoutNote,
    company: COMPANY_NAME,
  });
}
