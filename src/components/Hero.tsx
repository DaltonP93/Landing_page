'use client';

import { ArrowDown, Zap } from 'lucide-react';
import siteData from '@/data/site.json';
import PromoBanner from './PromoBanner';

export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Orbs */}
      <div className="orb orb-blue w-[500px] h-[500px] top-[10%] left-[15%] animate-float-slow" />
      <div className="orb orb-purple w-[400px] h-[400px] top-[30%] right-[10%] animate-float-slower" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-[15%] left-[40%] animate-float-slow" style={{ animationDelay: '4s' }} />

      {/* Grid */}
      <div className="absolute inset-0 scifi-grid opacity-60" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent"
          style={{ animation: 'scan 8s linear infinite' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24 pb-32">
        <PromoBanner />
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-blue/20 mb-10 shadow-[0_0_15px_rgba(0,212,255,0.1)]">
          <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,136,0.6)] animate-pulse" />
          <span className="text-xs text-neon-blue/80 tracking-wide font-medium">Plataforma activa · Paraguay</span>
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1] tracking-tight">
          <span className="text-white glow-text">Tecnología que</span>
          <br />
          <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent animate-gradient glow-text-strong">
            transforma empresas
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-base sm:text-lg text-muted/80 max-w-xl mx-auto leading-relaxed">
          {siteData.hero.subtitle}
        </p>

        {/* CTAs */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#demo"
            className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-neon-purple via-primary to-neon-blue text-white font-semibold text-sm overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.4)] transition-all duration-500">
            <span className="relative z-10 flex items-center gap-2"><Zap className="w-4 h-4" /> Probar 15 días gratis</span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </a>
          <a href="#soluciones"
            className="px-8 py-3.5 rounded-xl border border-border/50 text-sm text-muted hover:text-neon-blue hover:border-neon-blue/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all duration-500">
            Explorar soluciones
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-20 flex items-center justify-center gap-12 flex-wrap">
          {siteData.stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-white glow-text">{stat.value}</div>
              <div className="text-[11px] text-muted/60 mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <a href="#soluciones" className="text-neon-blue/30 hover:text-neon-blue/60 transition-colors">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </a>
        </div>
      </div>
    </section>
  );
}
