'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import siteData from '@/data/site.json';
import products from '@/data/products.json';
import { formatPYG, formatWhatsAppLink } from '@/lib/format';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const INITIAL_MESSAGE = `Hola 👋 Soy el asistente de ${siteData.company.name}.

Puedo ayudarte con:
• Información sobre **productos**
• **Precios** y planes
• Activar una **demo gratis** de 15 días
• Conectarte con un **asesor**

¿Qué necesitás?`;

function generateBotResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.match(/precio|costo|cuanto|cuánto|plan|pagar/)) {
    const list = products
      .sort((a, b) => a.order - b.order)
      .map((p) => `• **${p.name}**: ${formatPYG(p.pricing.monthly)}/mes`)
      .join('\n');
    return `Precios mensuales:\n\n${list}\n\n📌 Pagando anual ahorrás un 17%. Todos incluyen **15 días de prueba gratis**.\n\n¿Te interesa alguno?`;
  }

  for (const p of products) {
    const keywords = [p.name.toLowerCase(), p.shortName.toLowerCase(), p.id];
    if (keywords.some((k) => lower.includes(k))) {
      return `**${p.name}** — ${p.tagline}\n\n${p.description}\n\n✅ Características:\n${p.features.slice(0, 4).map((f) => `• ${f}`).join('\n')}\n\n💰 ${formatPYG(p.pricing.monthly)}/mes\n\n¿Querés activar tu **demo gratis de 15 días**? Completá el formulario en la sección Demo más abajo.`;
    }
  }

  if (lower.match(/producto|servicio|solucio|ofrec|tienen/)) {
    const list = products
      .sort((a, b) => a.order - b.order)
      .map((p) => `• **${p.name}**: ${p.tagline}`)
      .join('\n');
    return `Tenemos ${products.length} soluciones:\n\n${list}\n\n¿Sobre cuál querés saber más?`;
  }

  if (lower.match(/demo|prueba|probar|test|gratis|free/)) {
    return `Ofrecemos **15 días de prueba gratuita** en todos los productos. 🎉\n\nScrolleá hasta la sección **"Demo Gratis"** y completá el formulario. Recibís usuario y contraseña por email al instante.\n\nSin tarjeta, sin compromiso.`;
  }

  if (lower.match(/asesor|hablar|humano|persona|contacto|llamar/)) {
    return `Te conecto con un asesor. 🤝\n\n👉 [Chatear por WhatsApp](${formatWhatsAppLink(siteData.company.whatsapp, 'Hola, quiero hablar con un asesor.')})\n\nO dejá tus datos en la sección de Contacto.`;
  }

  if (lower.match(/hola|buenos|buen día|buenas|hi|hello/)) {
    return `¡Hola! 😊 ¿En qué te puedo ayudar? Escribí **productos**, **precios**, **demo** o **asesor**.`;
  }

  if (lower.match(/gracias|genial|perfecto|dale|ok/)) {
    return `¡De nada! Si necesitás algo más, acá estoy.`;
  }

  return `Podés escribir:\n\n• **productos** — ver soluciones\n• **precios** — ver planes\n• **demo** — prueba gratis 15 días\n• **asesor** — hablar con una persona`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    const history: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(history);
    setTyping(true);

    try {
      // Convierte el historial al formato de la IA (descarta el saludo inicial del bot)
      const apiMessages = history
        .filter((m, i) => !(i === 0 && m.role === 'bot'))
        .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json().catch(() => ({}));
      const reply = data.reply || generateBotResponse(userMsg);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: generateBotResponse(userMsg) }]);
    } finally {
      setTyping(false);
    }
  };

  const renderText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-neon-blue underline">$1</a>');
      return <p key={i} className="mb-0.5" dangerouslySetInnerHTML={{ __html: processed || '&nbsp;' }} />;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'glass-strong border border-border/30 rotate-0'
            : 'bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:scale-105 shadow-[0_0_25px_rgba(124,58,237,0.4)] animate-pulse-glow'
        }`}
      >
        {isOpen ? <X className="w-4 h-4 text-muted" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-22 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-surface-light to-surface border-b border-neon-purple/10 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/20 flex items-center justify-center shadow-[0_0_10px_rgba(124,58,237,0.2)]">
            <Bot className="w-4 h-4 text-neon-blue" />
          </div>
          <div>
            <div className="text-xs font-medium text-white">Asistente Virtual</div>
            <div className="text-[10px] text-muted/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_6px_rgba(0,255,136,0.5)]" /> En línea
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-72 overflow-y-auto p-3 space-y-2.5 bg-background/95">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className="w-6 h-6 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-neon-blue" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon-purple/10 text-foreground/80 rounded-br-sm'
                    : 'glass border border-border/10 text-foreground/60 rounded-bl-sm'
                }`}
              >
                {renderText(msg.text)}
              </div>
              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-neon-blue" />
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center shrink-0">
                <Bot className="w-3 h-3 text-neon-blue" />
              </div>
              <div className="px-3 py-2.5 rounded-lg glass border border-border/10">
                <div className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-neon-blue/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 glass-strong border-t border-border/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribí tu mensaje..."
              className="flex-1 px-3 py-2 rounded-lg bg-surface/50 border border-border/20 text-white placeholder:text-muted/30 text-sm focus:outline-none focus:border-neon-blue/30"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue flex items-center justify-center text-white hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all disabled:opacity-20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
