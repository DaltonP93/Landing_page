import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData, writeData } from '@/lib/store';
import { notifyTeam, COMPANY_NAME } from '@/lib/provision';
import { getPromoForProduct, applyDiscount, type Promotion } from '@/lib/promotions';
import products from '@/data/products.json';
import site from '@/data/site.json';

const SUBS_PATH = 'data/subscriptions.json';

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
  createdAt: string;
  activatedAt: string | null;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, company, productId, plan, paymentMethod } = body;

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
    createdAt: new Date().toISOString(),
    activatedAt: null,
  };

  const subs = readData<Subscription[]>(SUBS_PATH, []);
  subs.push(sub);
  writeData(SUBS_PATH, subs);

  notifyTeam(
    `💳 *Nueva contratación*\n\n👤 ${name}\n🏢 ${company}\n📧 ${email}\n📱 ${phone}\n📦 ${product.name} (${plan === 'annual' ? 'anual' : 'mensual'})\n💰 Gs. ${amount.toLocaleString('es-PY')}${promo ? `\n🏷️ Promo: ${promo.code}` : ''}\n💵 ${sub.paymentMethod}\n\nEstado: PENDIENTE de pago`
  );

  return NextResponse.json({
    status: 'ok',
    id: sub.id,
    amount: sub.amount,
    promoApplied: promo ? { code: promo.code, percent: promo.discountPercent } : null,
    paymentMethod: sub.paymentMethod,
    bankInfo: site.billing.bankInfo,
    note: site.billing.checkoutNote,
    company: COMPANY_NAME,
  });
}
