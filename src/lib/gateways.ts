import crypto from 'crypto';
import site from '@/data/site.json';
import { getSecret } from './secrets';

const BASE = (site.company.siteUrl || '').replace(/\/$/, '');

export interface PaymentOrder {
  id: string;          // id de la suscripción (shop_process_id / metadata)
  amount: number;      // monto en la moneda base (sin decimales para PYG)
  currency: string;
  description: string;
  email: string;
  name: string;
}

export interface PaymentResult {
  method: 'manual' | 'stripe' | 'bancard';
  reference: string;        // id de la transacción en la pasarela (o '' si manual)
  redirectUrl?: string;     // si la pasarela requiere redirección del cliente
  instructions?: string;    // texto para pago manual / transferencia
}

/** Selecciona la pasarela configurada en el panel (site.billing.gateway). */
export async function createPayment(order: PaymentOrder): Promise<PaymentResult> {
  const gateway = (site.billing as { gateway?: string }).gateway || 'manual';
  try {
    if (gateway === 'stripe') return await stripePayment(order);
    if (gateway === 'bancard') return await bancardPayment(order);
  } catch {
    // Si la pasarela falla, caemos a pago manual para no perder la venta.
  }
  return manualPayment();
}

function manualPayment(): PaymentResult {
  return { method: 'manual', reference: '', instructions: site.billing.bankInfo };
}

/** Stripe Checkout Session vía API REST (sin SDK). Requiere STRIPE_SECRET_KEY. */
async function stripePayment(order: PaymentOrder): Promise<PaymentResult> {
  const key = getSecret('STRIPE_SECRET_KEY');
  if (!key) return manualPayment();

  const zeroDecimal = ['PYG', 'JPY', 'CLP', 'VND'].includes(order.currency.toUpperCase());
  const unitAmount = zeroDecimal ? order.amount : Math.round(order.amount * 100);

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${BASE}/contratar/gracias?ref={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${BASE}/`);
  params.set('customer_email', order.email);
  params.set('client_reference_id', order.id);
  params.set('metadata[subscriptionId]', order.id);
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', order.currency.toLowerCase());
  params.set('line_items[0][price_data][unit_amount]', String(unitAmount));
  params.set('line_items[0][price_data][product_data][name]', order.description);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  if (!res.ok) return manualPayment();
  const data = await res.json();
  return { method: 'stripe', reference: data.id, redirectUrl: data.url };
}

/**
 * Bancard vPOS single_buy (Paraguay). Requiere BANCARD_PUBLIC_KEY y BANCARD_PRIVATE_KEY.
 * token = md5(private_key + shop_process_id + amount + currency)
 */
async function bancardPayment(order: PaymentOrder): Promise<PaymentResult> {
  const publicKey = getSecret('BANCARD_PUBLIC_KEY');
  const privateKey = getSecret('BANCARD_PRIVATE_KEY');
  if (!publicKey || !privateKey) return manualPayment();

  const apiBase = getSecret('BANCARD_BASE_URL') || 'https://vpos.infonet.com.py';
  const shopProcessId = Date.now();
  const amount = `${order.amount}.00`;
  const currency = order.currency.toUpperCase();
  const token = crypto.createHash('md5').update(`${privateKey}${shopProcessId}${amount}${currency}`).digest('hex');

  const res = await fetch(`${apiBase}/vpos/api/0.3/single_buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_key: publicKey,
      operation: {
        token,
        shop_process_id: shopProcessId,
        amount,
        currency,
        additional_data: '',
        description: order.description.slice(0, 50),
        return_url: `${BASE}/contratar/gracias?ref=${shopProcessId}`,
        cancel_url: `${BASE}/`,
      },
    }),
  });
  if (!res.ok) return manualPayment();
  const data = await res.json();
  const processId = data?.process_id;
  if (!processId) return manualPayment();
  return {
    method: 'bancard',
    reference: String(shopProcessId),
    redirectUrl: `${apiBase}/checkout/new/${processId}`,
  };
}
