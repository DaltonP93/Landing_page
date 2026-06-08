import { NextRequest, NextResponse } from 'next/server';
import products from '@/data/products.json';
import siteData from '@/data/site.json';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'novatech-verify-token';
const WHATSAPP_TOKEN = process.env.WHATSAPP_API_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const NOTIFICATION_PHONE = process.env.NOTIFICATION_PHONE || '';

function generateResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.match(/precio|costo|cuanto|cuánto|plan/)) {
    const list = products
      .sort((a, b) => a.order - b.order)
      .map((p) => `• *${p.name}*: Gs. ${p.pricing.monthly.toLocaleString('es-PY')}/mes`)
      .join('\n');
    return `Estos son nuestros precios mensuales:\n\n${list}\n\n💡 Pagando anual ahorrás un 17%.\n\n¿Te interesa alguno en particular?`;
  }

  for (const p of products) {
    const keywords = [p.name.toLowerCase(), p.shortName.toLowerCase(), p.id];
    if (keywords.some((k) => lower.includes(k))) {
      return `*${p.name}* — ${p.tagline}\n\n${p.description}\n\n✅ Características:\n${p.features.slice(0, 4).map((f) => `• ${f}`).join('\n')}\n\n💰 Gs. ${p.pricing.monthly.toLocaleString('es-PY')}/mes\n\n¿Querés una demo gratuita?`;
    }
  }

  if (lower.match(/producto|servicio|solucio|ofrec|que tienen/)) {
    const list = products
      .sort((a, b) => a.order - b.order)
      .map((p) => `• *${p.name}*: ${p.tagline}`)
      .join('\n');
    return `Tenemos ${products.length} soluciones empresariales:\n\n${list}\n\n¿Sobre cuál querés saber más?`;
  }

  if (lower.match(/demo|prueba|probar/)) {
    return `🎉 ¡Genial! Ofrecemos *30 días de prueba gratuita*.\n\nPara activar tu demo necesito:\n• Tu nombre completo\n• Nombre de la empresa\n• Producto que te interesa\n\n¿Me los compartís?`;
  }

  if (lower.match(/asesor|hablar|humano|persona|contacto/)) {
    return `🤝 ¡Por supuesto! Voy a notificar a un asesor para que te contacte.\n\nMientras tanto, ¿podés decirme tu nombre y sobre qué producto te gustaría asesoramiento?`;
  }

  if (lower.match(/hola|buenos|buen día|buenas|hi|hello/)) {
    return `¡Hola! 👋 Soy el asistente virtual de *${siteData.company.name}*.\n\nPuedo ayudarte con:\n• Información sobre nuestros *productos*\n• *Precios* y planes\n• Solicitar una *demo* gratuita\n• Conectarte con un *asesor*\n\n¿En qué te puedo ayudar?`;
  }

  return `No estoy seguro de entender tu consulta. Podés escribir:\n\n• *"productos"* para ver nuestras soluciones\n• *"precios"* para ver los planes\n• *"demo"* para solicitar una prueba gratis\n• *"asesor"* para hablar con una persona\n\n¿Qué te gustaría saber?`;
}

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Incoming messages (POST)
export async function POST(request: NextRequest) {
  const body = await request.json();

  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (!message) {
    return NextResponse.json({ status: 'no message' });
  }

  const from = message.from;
  const text = message.text?.body || '';

  const responseText = generateResponse(text);

  if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: from,
        type: 'text',
        text: { body: responseText },
      }),
    });

    if (NOTIFICATION_PHONE && text.toLowerCase().match(/asesor|humano|persona|contacto/)) {
      await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: NOTIFICATION_PHONE,
          type: 'text',
          text: {
            body: `🔔 *Nuevo lead solicita asesor*\n\nTeléfono: ${from}\nMensaje: ${text}\n\nContactar lo antes posible.`,
          },
        }),
      });
    }
  }

  return NextResponse.json({ status: 'ok' });
}
