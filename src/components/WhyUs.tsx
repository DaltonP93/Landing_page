'use client';

import { Zap } from 'lucide-react';
import siteData from '@/data/site.json';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { getIcon } from '@/lib/icons';

export default function WhyUs() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 scifi-grid opacity-40" />
      <div className="orb orb-blue w-[300px] h-[300px] bottom-[10%] left-[5%] animate-float-slow opacity-40" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} text-center max-w-2xl mx-auto mb-16`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-blue/20 mb-4">
            <Zap className="w-3 h-3 text-neon-blue" />
            <span className="text-[11px] text-neon-blue/80 tracking-wider uppercase font-medium">Ventajas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">Tecnología local,</span>{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">estándares globales</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteData.whyUs.map((item, i) => {
            const Icon = getIcon(item.icon);
            return <WhyUsCard key={i} item={item} Icon={Icon} index={i} />;
          })}
        </div>
      </div>
    </section>
  );
}

function WhyUsCard({ item, Icon, index }: { item: { icon: string; title: string; description: string }; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; index: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} glass neon-border rounded-xl p-7 hover:shadow-[0_0_25px_rgba(0,212,255,0.06)] transition-all duration-500 group`}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      <div className="w-10 h-10 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-shadow duration-500">
        <Icon className="w-5 h-5 text-neon-blue" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-2">{item.title}</h3>
      <p className="text-[13px] text-muted/70 leading-relaxed">{item.description}</p>
    </div>
  );
}
