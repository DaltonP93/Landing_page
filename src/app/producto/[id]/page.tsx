import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Zap, Target } from 'lucide-react';
import products from '@/data/products.json';
import promotions from '@/data/promotions.json';
import site from '@/data/site.json';
import { formatPYG } from '@/lib/format';
import { getIcon } from '@/lib/icons';
import { getPromoForProduct, applyDiscount, type Promotion } from '@/lib/promotions';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return { title: 'Producto no encontrado' };
  return {
    title: `${product.name} — ${product.tagline} | ${site.company.name}`,
    description: product.description,
    openGraph: {
      title: `${product.name} — ${site.company.name}`,
      description: product.tagline,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  const Icon = getIcon(product.icon);
  const promo = getPromoForProduct(product.id, promotions as Promotion[]);
  const monthly = promo ? applyDiscount(product.pricing.monthly, promo.discountPercent) : product.pricing.monthly;

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="orb orb-purple w-[400px] h-[400px] top-[2%] right-[8%] animate-float-slower opacity-30" />
      <div className="orb orb-blue w-[350px] h-[350px] bottom-[20%] left-[5%] animate-float-slow opacity-25" />
      <div className="absolute inset-0 scifi-grid opacity-30" />

      <header className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors"><ArrowLeft className="w-4 h-4" /> {site.company.name}</a>
        <a href={`/contratar/${product.id}`} className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium shadow-[0_0_15px_rgba(124,58,237,0.25)]">Contratar</a>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row gap-8 items-start mt-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${product.color}1a`, border: `1px solid ${product.color}40` }}>
                <span style={{ color: product.color }}><Icon className="w-6 h-6" /></span>
              </div>
              {product.badge && <span className="text-[11px] px-2.5 py-1 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold uppercase tracking-wide">{product.badge}</span>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold glow-text">{product.name}</h1>
            <p className="text-lg text-muted/70 mt-2">{product.tagline}</p>
            <p className="text-sm text-muted/60 leading-relaxed mt-5 max-w-xl">{product.description}</p>

            <div className="flex items-center gap-3 mt-8">
              <a href={`/contratar/${product.id}`} className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all"><CreditCard className="w-4 h-4" /> Contratar ahora</a>
              <a href="/#demo" className="px-6 py-3 rounded-xl border border-border/40 text-sm text-muted hover:text-neon-blue hover:border-neon-blue/30 transition-all flex items-center gap-2"><Zap className="w-4 h-4" /> Probar 15 días gratis</a>
            </div>
          </div>

          {/* Precio */}
          <div className="w-full md:w-64 shrink-0 rounded-2xl glass-strong border border-border/20 p-6">
            {promo && <div className="text-sm text-muted/40 line-through">{formatPYG(product.pricing.monthly)}</div>}
            <div className="text-3xl font-bold">{formatPYG(monthly)}<span className="text-sm text-muted/50 font-normal">/mes</span></div>
            {promo && <div className="mt-1 inline-block text-[11px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: promo.color }}>-{promo.discountPercent}% {promo.code}</div>}
            <div className="mt-4 pt-4 border-t border-border/20 text-xs text-muted/50">o {formatPYG(promo ? applyDiscount(product.pricing.annual, promo.discountPercent) : product.pricing.annual)}/año</div>
            <a href={`/contratar/${product.id}?plan=annual`} className="block text-center mt-4 text-xs text-neon-blue hover:text-neon-purple transition-colors">Ver plan anual →</a>
          </div>
        </div>

        {/* Imagen principal */}
        {product.image && (
          <div className="mt-12 rounded-2xl overflow-hidden border border-border/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="w-full max-h-[420px] object-cover" />
          </div>
        )}

        {/* Características */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <div>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Check className="w-4 h-4 text-neon-green" /> Características</h2>
            <ul className="space-y-2.5">
              {product.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted/70"><Check className="w-3.5 h-3.5 mt-0.5 text-neon-green/70 shrink-0" /> {f}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-neon-blue" /> Ideal para</h2>
            <ul className="space-y-2.5">
              {product.targetAudience.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-muted/70"><span className="text-neon-blue/70 mt-0.5">→</span> {t}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Galería */}
        {product.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-white mb-4">Galería</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {product.gallery.map((g, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border/20 aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
