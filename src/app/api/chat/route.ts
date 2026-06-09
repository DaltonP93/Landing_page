import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { readData, writeData, isAdmin } from '@/lib/store';
import { notifyTeam } from '@/lib/provision';
import { getLivePromotions, type Promotion } from '@/lib/promotions';
import products from '@/data/products.json';
import site from '@/data/site.json';
import promotionsData from '@/data/promotions.json';

const LEADS_PATH = 'data/chat-leads.json';

interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface ChatLead {
  id: string; email: string; phone: string; name: string;
  interest: string; firstSeen: string; lastMessage: string; transcript: string;
}

/* ── Contexto de ventas para la IA ── */
function buildSystemPrompt(): string {
  const promos = getLivePromotions(promotionsData as Promotion[]);
  const catalog = products
    .sort((a, b) => a.order - b.order)
    .map((p) => `- ${p.name} (${p.tagline}): ${p.description} Precio: Gs. ${p.pricing.monthly.toLocaleString('es-PY')}/mes o Gs. ${p.pricing.annual.toLocaleString('es-PY')}/año.`)
    .join('\n');
  const promoText = promos.length
    ? `\n\nPROMOCIONES VIGENTES:\n${promos.map((p) => `- ${p.title}: ${p.discountPercent}% OFF (código ${p.code}). ${p.description}`).join('\n')}`
    : '';

  return `Sos el asistente de ventas de ${site.company.name}, una empresa de software de Paraguay. Hablás en español paraguayo, cordial, claro y conciso (respuestas cortas, máximo 4 frases salvo que pidan detalle).

Tu objetivo es vender: entender la necesidad del cliente, recomendar el sistema adecuado, responder dudas de precios y funciones, y cerrar con una acción concreta: activar la PRUEBA GRATIS de 15 días o CONTRATAR.

CATÁLOGO:
${catalog}${promoText}

REGLAS:
- Recomendá el producto que mejor resuelva lo que pide el cliente.
- Para probar: "Activá tu demo gratis de 15 días en la sección Demo" (recibe usuario y contraseña por email).
- Para contratar: dirigí a /contratar/[producto].
- IMPORTANTE: pedí amablemente el nombre, email y teléfono/WhatsApp para que un asesor le dé seguimiento. Cuando te den el email, confirmá que un asesor lo contactará.
- No inventes funciones que no estén en el catálogo. Si no sabés algo, ofrecé contactar a un asesor humano por WhatsApp (${site.company.whatsapp}).
- Moneda: guaraníes (Gs.).`;
}

/* ── Proveedores de IA ── */
async function callAnthropic(system: string, messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 400,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.[0]?.text ?? null;
}

async function callOpenAI(system: string, messages: ChatMessage[]): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      max_tokens: 400,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

/** Respuesta de respaldo si no hay API key configurada. */
function fallbackReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/precio|cuesta|cuanto|cuánto|plan/)) {
    return `Nuestros precios arrancan en Gs. ${Math.min(...products.map((p) => p.pricing.monthly)).toLocaleString('es-PY')}/mes. ¿Para qué área de tu empresa lo necesitás? Así te recomiendo el sistema ideal. Dejame tu email y un asesor te contacta.`;
  }
  if (lower.match(/demo|prueba|gratis/)) {
    return `Podés activar una prueba gratis de 15 días en la sección Demo: recibís usuario y contraseña por email al instante. ¿Te paso el detalle de algún producto?`;
  }
  return `Contamos con ${products.length} sistemas para empresas. Contame qué necesitás (asistencia, RRHH, comedor, turnos, cámaras o prepagas) y te oriento. Si me dejás tu email y teléfono, un asesor te da seguimiento.`;
}

/* ── Captura de leads ── */
function extractEmail(s: string): string | null {
  const m = s.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return m ? m[0] : null;
}
function extractPhone(s: string): string | null {
  const m = s.match(/(\+?595\s?9\d{2}\s?\d{3}\s?\d{3}|09\d{2}\s?\d{3}\s?\d{3}|\d{7,})/);
  return m ? m[0] : null;
}

export async function POST(request: NextRequest) {
  const { messages } = (await request.json()) as { messages: ChatMessage[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Sin mensajes' }, { status: 400 });
  }

  const system = buildSystemPrompt();
  let reply: string | null = null;
  const provider = (process.env.AI_PROVIDER || 'anthropic').toLowerCase();
  try {
    reply = provider === 'openai' ? await callOpenAI(system, messages) : await callAnthropic(system, messages);
    if (!reply && provider !== 'openai') reply = await callOpenAI(system, messages);
  } catch {
    reply = null;
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  if (!reply) reply = fallbackReply(lastUser);

  // Captura de lead: si el usuario dejó un email, lo guardamos y avisamos al equipo
  const userText = messages.filter((m) => m.role === 'user').map((m) => m.content).join('\n');
  const email = extractEmail(userText);
  if (email) {
    const leads = readData<ChatLead[]>(LEADS_PATH, []);
    if (!leads.some((l) => l.email === email)) {
      const lead: ChatLead = {
        id: crypto.randomUUID(),
        email,
        phone: extractPhone(userText) || '',
        name: '',
        interest: lastUser.slice(0, 120),
        firstSeen: new Date().toISOString(),
        lastMessage: lastUser.slice(0, 200),
        transcript: messages.slice(-8).map((m) => `${m.role === 'user' ? 'Cliente' : 'IA'}: ${m.content}`).join('\n'),
      };
      leads.push(lead);
      writeData(LEADS_PATH, leads);
      notifyTeam(`🤖 *Nuevo lead del chat IA*\n\n📧 ${email}\n📱 ${lead.phone || '—'}\n💬 "${lead.interest}"`);
    }
  }

  return NextResponse.json({ reply });
}

/** Leads captados por el chat (panel admin). */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(readData<ChatLead[]>(LEADS_PATH, []));
}
