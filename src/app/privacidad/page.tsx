import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import site from '@/data/site.json';

export const metadata: Metadata = {
  title: `Política de Privacidad — ${site.company.name}`,
  description: `Cómo ${site.company.name} recopila, usa y protege tus datos personales.`,
};

export default function PrivacidadPage() {
  const c = site.company;
  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="absolute inset-0 scifi-grid opacity-20" />
      <article className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors mb-8"><ArrowLeft className="w-4 h-4" /> Volver</a>
        <h1 className="text-3xl font-bold glow-text mb-2">Política de Privacidad</h1>
        <p className="text-xs text-muted/50 mb-8">Última actualización: {new Date().toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="space-y-6 text-[15px] text-muted/70 leading-relaxed">
          <p>En <strong className="text-white">{c.name}</strong> respetamos tu privacidad. Esta política explica qué datos recopilamos, con qué fin y cómo los protegemos.</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Datos que recopilamos</h2>
            <p>Recopilamos los datos que nos proporcionás voluntariamente al solicitar una demo, contratar un servicio, contactarnos o conversar con nuestro asistente: nombre, email, teléfono, empresa y el contenido de tus mensajes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Uso de los datos</h2>
            <p>Usamos tus datos para: brindarte acceso a las demos y servicios contratados, responder consultas, enviarte información comercial relevante y mejorar nuestros productos. No vendemos tus datos a terceros.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. Cookies y tecnologías de seguimiento</h2>
            <p>Utilizamos cookies y píxeles (Google Analytics, Google Ads, Meta Pixel) para medir el rendimiento del sitio y mostrar publicidad relevante. Podés aceptar o rechazar las cookies no esenciales desde el banner de consentimiento.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Marketing y audiencias</h2>
            <p>Con tu consentimiento, podemos incluir tu email (de forma cifrada/hasheada) en audiencias publicitarias de Google y Meta para mostrarte anuncios. Podés solicitar la exclusión en cualquier momento.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Conservación y seguridad</h2>
            <p>Conservamos tus datos mientras exista una relación comercial o sea necesario para los fines descritos. Aplicamos medidas técnicas y organizativas razonables para protegerlos.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Tus derechos</h2>
            <p>Podés solicitar el acceso, rectificación o eliminación de tus datos escribiéndonos a <a href={`mailto:${c.email}`} className="text-neon-blue underline">{c.email}</a>.</p>
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
