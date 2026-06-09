'use client';

import { Suspense, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2, CreditCard, ShieldCheck, Zap } from 'lucide-react';
import products from '@/data/products.json';
import promotions from '@/data/promotions.json';
import site from '@/data/site.json';
import { formatPYG } from '@/lib/format';
import { getPromoForProduct, applyDiscount, type Promotion } from '@/lib/promotions';

type Step = 'form' | 'sending' | 'success';

function CheckoutInner() {
  const params = useParams<{ productId: string }>();
  const search = useSearchParams();
  const planParam = search.get('plan') === 'annual' ? 'annual' : 'monthly';

  const product = products.find((p) => p.id === params.productId);
  const [plan, setPlan] = useState<'monthly' | 'annual'>(planParam);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', paymentMethod: site.billing.paymentMethods[0], website: '' });
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ amount: number; bankInfo: string; note: string; instructions?: string; gateway?: string; promoApplied: { code: string; percent: number } | null } | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <p className="text-muted mb-4">Producto no encontrado.</p>
          <a href="/" className="text-neon-blue hover:underline">← Volver a la landing</a>
        </div>
      </div>
    );
  }

  const base = plan === 'annual' ? product.pricing.annual : product.pricing.monthly;
  const promo = getPromoForProduct(product.id, promotions as Promotion[]);
  const subtotal = promo ? applyDiscount(base, promo.discountPercent) : base;
  const tax = Math.round((subtotal * (site.billing.taxPercent || 0)) / 100);
  const total = subtotal + tax;

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setStep('sending');
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId: product.id, plan }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'No se pudo procesar la contratación');
      }
      const data = await res.json();
      // Si la pasarela requiere redirección (Stripe/Bancard), enviamos al cliente
      if (data.redirectUrl) { window.location.href = data.redirectUrl; return; }
      setResult(data);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setStep('form');
    }
  };

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="orb orb-purple w-[400px] h-[400px] top-[5%] right-[10%] animate-float-slower opacity-30" />
      <div className="orb orb-blue w-[350px] h-[350px] bottom-[10%] left-[5%] animate-float-slow opacity-30" />
      <div className="absolute inset-0 scifi-grid opacity-30" />

      <div className="relative max-w-3xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors mb-8"><ArrowLeft className="w-4 h-4" /> Volver</a>

        {step === 'success' && result ? (
          <div className="rounded-2xl glass-strong border border-neon-green/20 p-8 text-center shadow-[0_0_50px_rgba(0,255,136,0.05)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,136,0.2)]"><Check className="w-7 h-7 text-neon-green" /></div>
            <h1 className="text-2xl font-bold glow-text mb-2">¡Contratación recibida!</h1>
            <p className="text-sm text-muted/70 max-w-md mx-auto mb-6">{result.note}</p>
            <div className="rounded-xl bg-surface/40 border border-border/20 p-5 text-left max-w-md mx-auto space-y-2 text-sm">
              <Row k="Producto" v={`${product.name} (${plan === 'annual' ? 'Anual' : 'Mensual'})`} />
              <Row k="Total a abonar" v={formatPYG(result.amount + Math.round((result.amount * (site.billing.taxPercent || 0)) / 100))} highlight />
              <Row k="Medio de pago" v={form.paymentMethod} />
              <div className="pt-2 border-t border-border/20 text-xs text-muted/60 whitespace-pre-line">{result.instructions || result.bankInfo}</div>
            </div>
            <a href="/" className="inline-block mt-6 text-xs text-neon-purple hover:text-neon-blue transition-colors">Volver a la landing</a>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-6">
            {/* Formulario */}
            <form onSubmit={submit} className="rounded-2xl glass-strong p-7 order-2 md:order-1">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => update('website', e.target.value)} className="hidden" />
              <h1 className="text-xl font-bold mb-1">Contratar {product.name}</h1>
              <p className="text-xs text-muted/60 mb-6">Completá tus datos y te activamos la cuenta.</p>

              <div className="flex gap-2 mb-6">
                {(['monthly', 'annual'] as const).map((pl) => (
                  <button key={pl} type="button" onClick={() => setPlan(pl)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium border transition-all ${plan === pl ? 'border-neon-purple/40 bg-neon-purple/10 text-white' : 'border-border/20 text-muted/60 hover:text-white'}`}>
                    {pl === 'monthly' ? 'Mensual' : 'Anual'} {pl === 'annual' && <span className="text-neon-green">-17%</span>}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-xs text-muted/60 mb-1.5">Nombre completo *</label><input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-all" placeholder="Juan Pérez" /></div>
                <div><label className="block text-xs text-muted/60 mb-1.5">Email *</label><input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-all" placeholder="juan@empresa.com.py" /></div>
                <div><label className="block text-xs text-muted/60 mb-1.5">Teléfono / WhatsApp</label><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-all" placeholder="+595 981 ..." /></div>
                <div><label className="block text-xs text-muted/60 mb-1.5">Empresa *</label><input required value={form.company} onChange={(e) => update('company', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-all" placeholder="Cooperativa Nacional" /></div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-muted/60 mb-1.5">Medio de pago</label>
                  <select value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 transition-all [&>option]:bg-surface">
                    {site.billing.paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {error && <p className="text-xs text-neon-pink mt-4">{error}</p>}

              <button type="submit" disabled={step === 'sending'} className="w-full mt-6 py-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all disabled:opacity-40">
                {step === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><CreditCard className="w-4 h-4" /> Confirmar contratación</>}
              </button>
              <p className="text-[11px] text-muted/40 text-center mt-3 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3" /> Tus datos están protegidos. No se realiza ningún cargo automático.</p>
            </form>

            {/* Resumen */}
            <div className="order-1 md:order-2">
              <div className="rounded-2xl glass border border-border/20 p-5 sticky top-6">
                <h2 className="text-sm font-semibold mb-4">Resumen del pedido</h2>
                <div className="space-y-2 text-sm">
                  <Row k={`${product.name}`} v={formatPYG(base)} />
                  {promo && <Row k={`Promo ${promo.code} (-${promo.discountPercent}%)`} v={`- ${formatPYG(base - subtotal)}`} accent={promo.color} />}
                  <Row k="Subtotal" v={formatPYG(subtotal)} />
                  {site.billing.taxPercent > 0 && <Row k={`IVA (${site.billing.taxPercent}%)`} v={formatPYG(tax)} />}
                  <div className="pt-3 mt-1 border-t border-border/20"><Row k="Total" v={`${formatPYG(total)} /${plan === 'annual' ? 'año' : 'mes'}`} highlight /></div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-neon-green"><Zap className="w-3 h-3" /> Activación en 24h hábiles</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, highlight, accent }: { k: string; v: string; highlight?: boolean; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs ${highlight ? 'text-white font-semibold' : 'text-muted/60'}`} style={accent ? { color: accent } : undefined}>{k}</span>
      <span className={`${highlight ? 'text-white font-bold text-base' : 'text-muted/80'}`} style={accent ? { color: accent } : undefined}>{v}</span>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutInner />
    </Suspense>
  );
}
