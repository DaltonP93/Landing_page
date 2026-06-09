'use client';

import { useEffect, useState } from 'react';
import { Cookie } from 'lucide-react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setShow(true);
  }, []);

  const choose = (value: 'accepted' | 'rejected') => {
    localStorage.setItem('cookie_consent', value);
    window.dispatchEvent(new Event('cookie-consent-changed'));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-[60] rounded-2xl glass-strong border border-neon-purple/20 p-5 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <div className="flex items-start gap-3">
        <Cookie className="w-5 h-5 text-neon-purple mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-white font-medium mb-1">Usamos cookies</p>
          <p className="text-xs text-muted/70 leading-relaxed">
            Utilizamos cookies para analítica y publicidad. Podés aceptarlas o rechazar las no esenciales. Más info en nuestra{' '}
            <a href="/privacidad" className="text-neon-blue underline">Política de Privacidad</a>.
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => choose('accepted')} className="px-4 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white text-xs font-medium shadow-[0_0_15px_rgba(124,58,237,0.25)]">Aceptar</button>
            <button onClick={() => choose('rejected')} className="px-4 py-2 rounded-lg border border-border/40 text-muted/70 hover:text-white text-xs font-medium transition-colors">Rechazar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
