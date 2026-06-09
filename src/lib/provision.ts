import site from '@/data/site.json';

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
  const apiKey = process.env.DEMO_PROVISION_API_KEY;
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
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to = process.env.NOTIFICATION_PHONE;
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
