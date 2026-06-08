'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import siteData from '@/data/site.json';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="relative py-32">
      <div className="section-line" />

      <div className="max-w-2xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} text-center mb-12`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-purple/20 mb-4">
            <HelpCircle className="w-3 h-3 text-neon-purple" />
            <span className="text-[11px] text-neon-purple/80 tracking-wider uppercase font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl font-bold text-white glow-text">Preguntas frecuentes</h2>
        </div>

        <div className="space-y-2">
          {siteData.faq.map((item, i) => (
            <FAQItem key={i} item={item} index={i} isOpen={open === i} toggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ item, index, isOpen, toggle }: { item: { question: string; answer: string }; index: number; isOpen: boolean; toggle: () => void }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} rounded-xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'glass-strong border border-neon-purple/20' : 'glass border border-transparent hover:border-border/30'
      }`}
      style={{ transitionDelay: `${index * 0.06}s` }}
    >
      <button className="w-full flex items-center justify-between p-5 text-left group" onClick={toggle}>
        <span className={`text-sm font-medium pr-4 transition-colors ${isOpen ? 'text-white' : 'text-foreground/60 group-hover:text-white'}`}>
          {item.question}
        </span>
        {isOpen
          ? <Minus className="w-4 h-4 text-neon-purple shrink-0" />
          : <Plus className="w-4 h-4 text-muted/40 shrink-0 group-hover:text-neon-blue" />
        }
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${isOpen ? 'max-h-40 opacity-100 pb-5 px-5' : 'max-h-0 opacity-0'}`}>
        <p className="text-[13px] text-muted/60 leading-relaxed">{item.answer}</p>
      </div>
    </div>
  );
}
