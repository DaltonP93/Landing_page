'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, Rocket } from 'lucide-react';
import products from '@/data/products.json';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type Step = 'form' | 'sending' | 'success';

export default function DemoRequest() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal<HTMLDivElement>();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    employees: '',
    product: '',
  });
  const [error, setError] = useState('');

  const sorted = [...products].sort((a, b) => a.order - b.order);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('sending');

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al procesar la solicitud');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setStep('form');
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <section id="demo" className="relative py-32">
      <div className="section-line" />
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="orb orb-blue w-[400px] h-[400px] top-[5%] right-[10%] animate-float-slower opacity-40" />
      <div className="orb orb-purple w-[300px] h-[300px] bottom-[10%] left-[5%] animate-float-slow opacity-30" />

      <div className="relative max-w-3xl mx-auto px-6">
        <div ref={headerRef} className={`reveal ${headerVisible ? 'visible' : ''} text-center mb-12`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-neon-green/20 mb-4">
            <Rocket className="w-3 h-3 text-neon-green" />
            <span className="text-[11px] text-neon-green/80 tracking-wider uppercase font-medium">Demo Gratis</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
            <span className="text-white glow-text">15 días para</span>{' '}
            <span className="bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">probarlo todo</span>
          </h2>
          <p className="mt-4 text-sm text-muted/70 max-w-lg mx-auto">
            Elegí el producto, completá tus datos y recibí en tu correo las credenciales de acceso al sistema completo. Sin tarjeta, sin compromiso.
          </p>
        </div>

        {step === 'success' ? (
          <div className="text-center py-16 rounded-xl glass border border-neon-green/20 shadow-[0_0_40px_rgba(0,255,136,0.05)]">
            <div className="w-14 h-14 mx-auto rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
              <Check className="w-7 h-7 text-neon-green" />
            </div>
            <h3 className="text-xl font-semibold text-white glow-text mb-2">¡Cuenta demo creada!</h3>
            <p className="text-sm text-muted/70 max-w-md mx-auto">
              Revisá tu correo <strong className="text-neon-blue">{form.email}</strong>. Te enviamos
              el usuario y contraseña para acceder a <strong className="text-white">{sorted.find(p => p.id === form.product)?.name}</strong> durante 15 días.
            </p>
            <button
              onClick={() => { setStep('form'); setForm({ name: '', email: '', phone: '', company: '', employees: '', product: '' }); }}
              className="mt-6 text-xs text-neon-purple hover:text-neon-blue transition-colors"
            >
              Solicitar otra demo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl glass-strong p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            {/* Product selection */}
            <div className="mb-8">
              <label className="block text-xs font-medium text-muted/70 mb-3">¿Qué producto querés probar?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sorted.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => update('product', p.id)}
                    className={`p-3 rounded-lg border text-left transition-all duration-300 ${
                      form.product === p.id
                        ? 'border-neon-purple/40 bg-neon-purple/[0.08] shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                        : 'border-border/20 glass hover:border-neon-blue/20 hover:shadow-[0_0_10px_rgba(0,212,255,0.05)]'
                    }`}
                  >
                    <span className={`text-xs font-medium ${form.product === p.id ? 'text-white' : 'text-foreground/60'}`}>
                      {p.shortName}
                    </span>
                    <span className="block text-[10px] text-muted/50 mt-0.5 truncate">{p.tagline}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-muted/60 mb-1.5">Nombre completo *</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs text-muted/60 mb-1.5">Email corporativo *</label>
                <input
                  type="email" required value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
                  placeholder="juan@empresa.com.py"
                />
              </div>
              <div>
                <label className="block text-xs text-muted/60 mb-1.5">Teléfono / WhatsApp</label>
                <input
                  type="tel" value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
                  placeholder="+595 981 ..."
                />
              </div>
              <div>
                <label className="block text-xs text-muted/60 mb-1.5">Empresa *</label>
                <input
                  type="text" required value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm placeholder:text-muted/30 focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all"
                  placeholder="Cooperativa Nacional"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-muted/60 mb-1.5">Cantidad de empleados</label>
                <select
                  value={form.employees}
                  onChange={(e) => update('employees', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface/50 border border-border/30 text-white text-sm focus:outline-none focus:border-neon-blue/40 focus:shadow-[0_0_15px_rgba(0,212,255,0.08)] transition-all [&>option]:bg-surface [&>option]:text-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="1-50">1 – 50</option>
                  <option value="51-200">51 – 200</option>
                  <option value="201-500">201 – 500</option>
                  <option value="501-2000">501 – 2,000</option>
                  <option value="2000+">Más de 2,000</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-neon-pink mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={step === 'sending' || !form.product}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-medium text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === 'sending' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta demo...</>
              ) : (
                <>Activar demo gratuita <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <p className="mt-4 text-center text-[11px] text-muted/40">
              Sin tarjeta de crédito · Sin compromiso · Acceso completo por 15 días
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
