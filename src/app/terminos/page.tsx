import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import site from '@/data/site.json';

export const metadata: Metadata = {
  title: `Términos y Condiciones — ${site.company.name}`,
  description: `Términos y condiciones de uso de los servicios de ${site.company.name}.`,
};

export default function TerminosPage() {
  const c = site.company;
  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="absolute inset-0 scifi-grid opacity-20" />
      <article className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors mb-8"><ArrowLeft className="w-4 h-4" /> Volver</a>
        <h1 className="text-3xl font-bold glow-text mb-2">Términos y Condiciones</h1>
        <p className="text-xs text-muted/50 mb-8">Última actualización: {new Date().toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-[15px] text-muted/70 leading-relaxed">
          <p>Estos términos regulan el uso de los servicios de software ofrecidos por <strong className="text-white">{c.name}</strong>.</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Servicios</h2>
            <p>Ofrecemos sistemas de software bajo modalidad de suscripción mensual o anual. Las características y precios vigentes se detallan en el sitio y pueden actualizarse.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Prueba gratuita</h2>
            <p>La demo gratuita tiene una duración de 15 días, sin costo ni obligación de contratación. Al finalizar, el acceso puede deshabilitarse salvo que se contrate el servicio.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Pagos y facturación</h2>
            <p>El pago se realiza según el medio elegido (transferencia, tarjeta u otros). La activación del servicio se confirma una vez verificado el pago. Los precios están expresados en guaraníes (Gs.) salvo indicación contraria.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Obligaciones del cliente</h2>
            <p>El cliente se compromete a usar los servicios conforme a la ley y a no realizar actividades que comprometan la seguridad o disponibilidad de la plataforma.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Disponibilidad y soporte</h2>
            <p>Procuramos la máxima disponibilidad del servicio y brindamos soporte técnico. No nos responsabilizamos por interrupciones causadas por terceros o fuerza mayor.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Cancelación</h2>
            <p>Podés cancelar tu suscripción en cualquier momento. El servicio permanecerá activo hasta el final del período abonado.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Contacto</h2>
            <p>{c.name} · {c.address} · {c.email} · {c.phone}</p>
          </section>
        </div>
      </article>
    </div>
  );
}
