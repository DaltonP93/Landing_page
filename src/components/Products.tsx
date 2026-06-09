'use client';

import { useState } from 'react';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import products from '@/data/products.json';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getIcon } from '@/lib/icons';

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  const Icon = getIcon(product.icon);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div
        className={`group relative rounded-xl neon-border glass transition-all duration-500 cursor-pointer hover:shadow-[0_0_30px_rgba(0,212,255,0.08)] ${
          expanded ? 'border-neon-purple/30 bg-surface-light/60' : ''
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {product.badge && (
          <div className="absolute -top-2.5 right-4 z-10 px-3 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            {product.badge}
          </div>
        )}

        {product.image && (
          <div className="h-36 w-full overflow-hidden rounded-t-xl border-b border-border/20 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.15)]"
              style={{ background: `${product.color}18`, border: `1px solid ${product.color}30` }}>
              <span style={{ color: product.color }}><Icon className="w-4.5 h-4.5" /></span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{product.name}</h3>
              <p className="text-xs text-muted truncate">{product.tagline}</p>
            </div>
            <ArrowRight className={`w-4 h-4 text-neon-blue/50 transition-all duration-300 ${expanded ? 'rotate-90 text-neon-blue' : 'group-hover:translate-x-0.5 group-hover:text-neon-blue'}`} />
          </div>

          <p className="text-[13px] text-muted/80 leading-relaxed">{product.description}</p>

          <div className={`overflow-hidden transition-all duration-500 ${expanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="pt-4 border-t border-border/20 space-y-2">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span style={{ color: product.color }}><Check className="w-3.5 h-3.5 mt-0.5 shrink-0" /></span>
                  <span className="text-[13px] text-foreground/60">{feat}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4">
              <a
                href={`/producto/${product.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neon-blue hover:text-neon-purple transition-colors"
              >
                Ver detalle <ArrowRight className="w-3 h-3" />
              </a>
              <a
                href="#demo"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-neon-blue transition-colors"
              >
                Probar gratis
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const sorted = [...products].sort((a, b) => a.order - b.order);

  return (
    <section id="soluciones" className="relative py-32">
      <div className="section-line" />
      <div className="orb orb-purple w-[350px] h-[350px] top-[20%] right-[5%] animate-float-slower opacity-50" />

      <div className="max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} max-w-2xl mb-16`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-purple/20 mb-4">
            <Sparkles className="w-3 h-3 text-neon-purple" />
            <span className="text-[11px] text-neon-purple/80 tracking-wider uppercase font-medium">Soluciones</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">Software especializado</span>{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">para cada área</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
