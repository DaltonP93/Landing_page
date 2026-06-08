'use client';

import { Quote } from 'lucide-react';
import siteData from '@/data/site.json';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Testimonials() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-32">
      <div className="section-line" />

      <div className="max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} max-w-2xl mb-16`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-blue/20 mb-4">
            <Quote className="w-3 h-3 text-neon-blue" />
            <span className="text-[11px] text-neon-blue/80 tracking-wider uppercase font-medium">Testimonios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">Empresas que ya</span>{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">confían en nosotros</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {siteData.testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t, index }: { t: typeof siteData.testimonials[0]; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} glass neon-border rounded-xl p-7 hover:shadow-[0_0_25px_rgba(0,212,255,0.06)] transition-all duration-500`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <Quote className="w-5 h-5 text-neon-purple/30 mb-4" />
      <p className="text-[13px] text-muted/70 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center text-xs font-semibold text-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.1)]">
          {t.avatar}
        </div>
        <div>
          <div className="text-xs font-medium text-white">{t.name}</div>
          <div className="text-[11px] text-muted/50">{t.role} · {t.company}</div>
        </div>
      </div>
    </div>
  );
}
