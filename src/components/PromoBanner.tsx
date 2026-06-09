'use client';

import { useState, useEffect } from 'react';
import { Tag, X, ArrowRight } from 'lucide-react';
import promotions from '@/data/promotions.json';
import { getLivePromotions, type Promotion } from '@/lib/promotions';

function useCountdown(target: string) {
  // null en SSR y primer render del cliente → evita mismatch de hidratación.
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(new Date(target).getTime() - Date.now());
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [target]);
  return left;
}

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0'); }

export default function PromoBanner() {
  const [hidden, setHidden] = useState(false);
  const live = getLivePromotions(promotions as Promotion[]);
  const promo = live[0];
  const left = useCountdown(promo?.endsAt || new Date().toISOString());

  if (!promo || hidden || left === null || left <= 0) return null;

  const days = Math.floor(left / 86400000);
  const hours = Math.floor(left / 3600000) % 24;
  const mins = Math.floor(left / 60000) % 60;
  const secs = Math.floor(left / 1000) % 60;

  return (
    <div
      className="relative z-20 mx-auto mb-8 flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded-full glass border max-w-2xl"
      style={{ borderColor: `${promo.color}55`, boxShadow: `0 0 25px ${promo.color}22` }}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: promo.color }}>
        <Tag className="w-3.5 h-3.5" /> {promo.title}
      </span>
      <span className="text-xs text-muted/80 hidden sm:inline">{promo.description}</span>

      <span className="flex items-center gap-1 font-mono text-xs text-white">
        {days > 0 && <Chip v={pad(days)} l="d" c={promo.color} />}
        <Chip v={pad(hours)} l="h" c={promo.color} />
        <Chip v={pad(mins)} l="m" c={promo.color} />
        <Chip v={pad(secs)} l="s" c={promo.color} />
      </span>

      {promo.code && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono">{promo.code}</span>
      )}

      <a href="#precios" className="text-xs font-medium flex items-center gap-1 text-white hover:opacity-80 transition-opacity">
        Aprovechar <ArrowRight className="w-3 h-3" />
      </a>

      <button onClick={() => setHidden(true)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted/40 hover:text-white sm:static sm:translate-y-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Chip({ v, l, c }: { v: string; l: string; c: string }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span className="px-1.5 py-1 rounded bg-white/5 border" style={{ borderColor: `${c}33` }}>{v}</span>
      <span className="text-[8px] text-muted/40 mt-0.5">{l}</span>
    </span>
  );
}
