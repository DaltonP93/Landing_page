'use client';

import { useState } from 'react';
import { Check, Zap, Crown, CreditCard } from 'lucide-react';
import products from '@/data/products.json';
import promotions from '@/data/promotions.json';
import { formatMoney, CURRENCIES } from '@/lib/currency';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getPromoForProduct, applyDiscount, type Promotion } from '@/lib/promotions';

export default function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const sorted = [...products].sort((a, b) => a.order - b.order);

  return (
    <section id="precios" className="relative py-32">
      <div className="section-line" />
      <div className="orb orb-pink w-[300px] h-[300px] top-[10%] left-[10%] animate-float-slow opacity-40" />

      <div className="max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} text-center max-w-2xl mx-auto mb-12`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-pink/20 mb-4">
            <Crown className="w-3 h-3 text-neon-pink" />
            <span className="text-[11px] text-neon-pink/80 tracking-wider uppercase font-medium">Precios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">Transparentes</span>{' '}
            <span className="bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">y sin sorpresas</span>
          </h2>

          <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-lg border border-border/30 glass">
            <button
              className={`px-5 py-2 rounded-md text-xs font-medium transition-all duration-300 ${!annual ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-muted hover:text-white'}`}
              onClick={() => setAnnual(false)}
            >
              Mensual
            </button>
            <button
              className={`px-5 py-2 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${annual ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-muted hover:text-white'}`}
              onClick={() => setAnnual(true)}
            >
              Anual <span className="text-[10px] text-neon-green font-bold">-17%</span>
            </button>
          </div>

          {CURRENCIES.length > 1 && (
            <div className="mt-4 inline-flex items-center gap-1 p-1 rounded-lg border border-border/30 glass ml-0 sm:ml-3">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 ${currency === c ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white' : 'text-muted hover:text-white'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((product, i) => (
            <PricingCard key={product.id} product={product} annual={annual} currency={currency} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingCard({ product, annual, currency, index }: { product: typeof products[0]; annual: boolean; currency: string; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const base = annual ? product.pricing.annual : product.pricing.monthly;
  const isPopular = product.pricing.popular;
  const promo = getPromoForProduct(product.id, promotions as Promotion[]);
  const finalPrice = promo ? applyDiscount(base, promo.discountPercent) : base;
  const plan = annual ? 'annual' : 'monthly';

  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: `${index * 0.08}s` }}>
      <div className={`relative rounded-xl p-6 transition-all duration-500 h-full flex flex-col neon-border ${isPopular ? 'glass-strong shadow-[0_0_40px_rgba(124,58,237,0.15)] border-neon-purple/30' : 'glass hover:shadow-[0_0_25px_rgba(0,212,255,0.06)]'}`}>
        {isPopular && (
          <div className="absolute -top-2.5 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-neon-purple to-neon-blue text-white tracking-wide uppercase shadow-[0_0_12px_rgba(124,58,237,0.4)]">⚡ Popular</div>
        )}
        {promo && (
          <div className="absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white tracking-wide" style={{ background: promo.color, boxShadow: `0 0 12px ${promo.color}66` }}>-{promo.discountPercent}%</div>
        )}

        <div className="mb-5">
          <h3 className="text-sm font-semibold text-white">{product.name}</h3>
          <p className="text-xs text-muted/60 mt-0.5">{product.tagline}</p>
        </div>

        <div className="mb-5">
          {promo && <div className="text-sm text-muted/40 line-through">{formatMoney(base, currency)}</div>}
          <span className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{formatMoney(finalPrice, currency)}</span>
          <span className="text-xs text-muted/50 ml-1">/{annual ? 'año' : 'mes'}</span>
        </div>

        <ul className="space-y-2.5 mb-6 flex-1">
          {product.features.slice(0, 4).map((feat, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 mt-0.5 text-neon-green/70 shrink-0" />
              <span className="text-[13px] text-muted/70">{feat}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <a
            href={`/contratar/${product.id}?plan=${plan}`}
            className={`block w-full text-center py-2.5 rounded-lg text-xs font-medium transition-all duration-300 ${isPopular ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]' : 'bg-white/[0.06] text-white border border-neon-purple/20 hover:border-neon-purple/40 hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]'}`}
          >
            <span className="flex items-center justify-center gap-1.5"><CreditCard className="w-3 h-3" /> Contratar ahora</span>
          </a>
          <a href="#demo" className="block w-full text-center py-2 rounded-lg text-xs font-medium text-muted hover:text-neon-blue transition-colors">
            <span className="flex items-center justify-center gap-1.5"><Zap className="w-3 h-3" /> Probar 15 días gratis</span>
          </a>
        </div>
      </div>
    </div>
  );
}
