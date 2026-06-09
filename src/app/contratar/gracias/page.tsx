import { Check } from 'lucide-react';
import site from '@/data/site.json';

export const metadata = { title: `Gracias — ${site.company.name}` };

export default function GraciasPage() {
  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden flex items-center justify-center px-4">
      <div className="orb orb-purple w-[400px] h-[400px] top-[10%] left-[20%] animate-float-slow opacity-30" />
      <div className="orb orb-blue w-[350px] h-[350px] bottom-[10%] right-[15%] animate-float-slower opacity-30" />
      <div className="absolute inset-0 scifi-grid opacity-30" />

      <div className="relative max-w-md w-full rounded-2xl glass-strong border border-neon-green/20 p-8 text-center shadow-[0_0_50px_rgba(0,255,136,0.05)]">
        <div className="w-14 h-14 mx-auto rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,136,0.2)]">
          <Check className="w-7 h-7 text-neon-green" />
        </div>
        <h1 className="text-2xl font-bold glow-text mb-2">¡Gracias por tu pago!</h1>
        <p className="text-sm text-muted/70 mb-6">
          Recibimos tu pago correctamente. Estamos activando tu cuenta y te enviaremos los accesos por email a la brevedad.
        </p>
        <a href="/" className="inline-block text-xs text-neon-purple hover:text-neon-blue transition-colors">← Volver a {site.company.name}</a>
      </div>
    </div>
  );
}
