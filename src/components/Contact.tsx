'use client';

import { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Send } from 'lucide-react';
import siteData from '@/data/site.json';
import { formatWhatsAppLink } from '@/lib/format';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function Contact() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Nombre: ${form.name}\nEmail: ${form.email}\nMensaje: ${form.message}`;
    window.open(
      formatWhatsAppLink(siteData.company.whatsapp, body),
      '_blank'
    );
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <section id="contacto" className="relative py-32">
      <div className="section-line" />
      <div className="orb orb-purple w-[350px] h-[350px] top-[20%] right-[5%] animate-float-slower opacity-30" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} max-w-2xl mb-16`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-blue/20 mb-4">
            <Send className="w-3 h-3 text-neon-blue" />
            <span className="text-[11px] text-neon-blue/80 tracking-wider uppercase font-medium">Contacto</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">¿Tenés un proyecto</span>{' '}
            <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">en mente?</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <p className="text-sm text-muted/60 leading-relaxed">
              Contanos qué necesita tu empresa. Te asesoramos sin compromiso y armamos una propuesta a medida.
            </p>
            <div className="space-y-4">
              {[
                { icon: Mail, label: siteData.company.email, color: 'text-neon-blue' },
                { icon: Phone, label: siteData.company.phone, color: 'text-neon-green' },
                { icon: MapPin, label: siteData.company.address, color: 'text-neon-purple' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-lg glass border border-border/20 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(0,212,255,0.1)] transition-shadow">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm text-foreground/60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text" required placeholder="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
              />
              <input
                type="email" required placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
              />
            </div>
            <textarea
              required placeholder="¿Cómo podemos ayudarte?" rows={4} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all resize-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg border border-neon-blue/30 text-sm text-neon-blue/80 hover:text-white hover:bg-neon-blue/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] transition-all duration-300 flex items-center gap-2"
            >
              {sent ? '✓ Enviado' : (<>Enviar por WhatsApp <ArrowRight className="w-3.5 h-3.5" /></>)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
