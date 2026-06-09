import site from '@/data/site.json';
import nodemailer from 'nodemailer';
import { getSecret } from './secrets';

/** Envía un email de aviso al equipo (NOTIFICATION_EMAIL o SMTP_USER). Fire-and-forget. */
export async function sendTeamEmail(subject: string, text: string): Promise<void> {
  const host = getSecret('SMTP_HOST');
  const user = getSecret('SMTP_USER');
  const pass = getSecret('SMTP_PASS');
  const to = getSecret('NOTIFICATION_EMAIL') || user;
  if (!host || !user || !pass || !to) return;
  try {
    const port = Number(getSecret('SMTP_PORT') || '587');
    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
    await transporter.sendMail({
      from: `"${site.company.name}" <${getSecret('EMAIL_FROM') || user}>`,
      to,
      subject,
      text,
    });
  } catch {
    /* noop */
  }
}

export interface AccountLike {
  username?: string;
  email: string;
  name: string;
  company: string;
  expiresAt?: string;
}

/** URLs (app y API) de cada producto, configurables por variables de entorno. */
export function getProductUrls(productId: string): { appUrl: string; apiUrl: string } {
  const map: Record<string, { appUrl: string; apiUrl: string }> = {
    'prepaga-digital': { appUrl: process.env.PREPAGA_URL || '#', apiUrl: process.env.PREPAGA_API_URL || '#' },
    'sishoras': { appUrl: process.env.SISHORAS_URL || '#', apiUrl: process.env.SISHORAS_API_URL || '#' },
    'ticket-v2': { appUrl: process.env.TICKET_URL || '#', apiUrl: process.env.TICKET_API_URL || '#' },
    'comedor': { appUrl: process.env.COMEDOR_URL || '#', apiUrl: process.env.COMEDOR_API_URL || '#' },
    'visioncore': { appUrl: process.env.VISIONCORE_URL || '#', apiUrl: process.env.VISIONCORE_API_URL || '#' },
    'rrhh-completo': { appUrl: process.env.RRHH_URL || '#', apiUrl: process.env.RRHH_API_URL || '#' },
  };
  return map[productId] || { appUrl: '#', apiUrl: '#' };
}

/**
 * Habilita o deshabilita el acceso de un cliente en el sistema contratado.
 * Llama al endpoint /api/access del producto (configurable). Fire-and-forget.
 */
export async function setProductAccess(
  productId: string,
  payload: { email: string; company: string; enabled: boolean; plan?: string; until?: string }
): Promise<boolean> {
  const { apiUrl } = getProductUrls(productId);
  const apiKey = getSecret('DEMO_PROVISION_API_KEY');
  if (!apiKey || apiUrl === '#') return false;
  try {
    const res = await fetch(`${apiUrl}/api/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Notifica al equipo por WhatsApp (Meta Cloud API). Fire-and-forget. */
export async function notifyTeam(message: string): Promise<void> {
  // Email (independiente de WhatsApp)
  sendTeamEmail(`${site.company.name} — Notificación`, message);

  const token = getSecret('WHATSAPP_API_TOKEN');
  const phoneId = getSecret('WHATSAPP_PHONE_NUMBER_ID');
  const to = getSecret('NOTIFICATION_PHONE');
  if (!token || !phoneId || !to) return;
  try {
    await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: message } }),
    });
  } catch {
    /* noop */
  }
}

export const COMPANY_NAME = site.company.name;
