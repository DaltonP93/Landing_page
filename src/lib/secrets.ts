import { readData, writeData } from './store';

const PATH = 'data/secrets.json';
export type SecretStore = Record<string, string>;

export function readSecrets(): SecretStore {
  return readData<SecretStore>(PATH, {});
}

/**
 * Devuelve un secreto. Prioridad: panel (data/secrets.json) → variable de entorno.
 * Así lo configurado en la página manda, con fallback a .env del servidor.
 */
export function getSecret(name: string): string {
  const s = readSecrets();
  if (s[name]) return s[name];
  return process.env[name] || '';
}

/** Guarda secretos. Valor vacío = no cambia; "__CLEAR__" = elimina. */
export function setSecrets(partial: SecretStore): void {
  const next = { ...readSecrets() };
  for (const [k, v] of Object.entries(partial)) {
    if (v === '') continue;
    if (v === '__CLEAR__') { delete next[k]; continue; }
    next[k] = v;
  }
  writeData(PATH, next);
}

/** Catálogo de claves configurables desde el panel, agrupadas. */
export const SECRET_GROUPS: { group: string; keys: { name: string; label: string }[] }[] = [
  { group: 'IA / Chat', keys: [
    { name: 'AI_API_KEY', label: 'Clave genérica de IA' },
    { name: 'ANTHROPIC_API_KEY', label: 'Anthropic (Claude)' },
    { name: 'OPENAI_API_KEY', label: 'OpenAI' },
    { name: 'DEEPSEEK_API_KEY', label: 'DeepSeek' },
    { name: 'QWEN_API_KEY', label: 'Qwen / DashScope' },
    { name: 'GROQ_API_KEY', label: 'Groq' },
    { name: 'OPENROUTER_API_KEY', label: 'OpenRouter' },
    { name: 'MISTRAL_API_KEY', label: 'Mistral' },
    { name: 'GEMINI_API_KEY', label: 'Google Gemini' },
  ] },
  { group: 'Pagos', keys: [
    { name: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key' },
    { name: 'STRIPE_WEBHOOK_SECRET', label: 'Stripe Webhook Secret' },
    { name: 'BANCARD_PUBLIC_KEY', label: 'Bancard Public Key' },
    { name: 'BANCARD_PRIVATE_KEY', label: 'Bancard Private Key' },
    { name: 'BILLING_WEBHOOK_SECRET', label: 'Secreto webhook de pagos' },
  ] },
  { group: 'Marketing (Meta / Google)', keys: [
    { name: 'META_ACCESS_TOKEN', label: 'Meta Access Token' },
    { name: 'META_CUSTOM_AUDIENCE_ID', label: 'Meta Custom Audience ID' },
    { name: 'GOOGLE_ADS_DEVELOPER_TOKEN', label: 'Google Ads Developer Token' },
    { name: 'GOOGLE_ADS_CUSTOMER_ID', label: 'Google Ads Customer ID' },
    { name: 'GOOGLE_ADS_USER_LIST_ID', label: 'Google Ads User List ID' },
    { name: 'GOOGLE_ADS_LOGIN_CUSTOMER_ID', label: 'Google Ads Login Customer ID' },
    { name: 'GOOGLE_OAUTH_CLIENT_ID', label: 'Google OAuth Client ID' },
    { name: 'GOOGLE_OAUTH_CLIENT_SECRET', label: 'Google OAuth Client Secret' },
    { name: 'GOOGLE_OAUTH_REFRESH_TOKEN', label: 'Google OAuth Refresh Token' },
  ] },
  { group: 'Email (SMTP)', keys: [
    { name: 'SMTP_HOST', label: 'SMTP Host' },
    { name: 'SMTP_PORT', label: 'SMTP Port' },
    { name: 'SMTP_USER', label: 'SMTP Usuario' },
    { name: 'SMTP_PASS', label: 'SMTP Password' },
    { name: 'EMAIL_FROM', label: 'Email remitente' },
    { name: 'NOTIFICATION_EMAIL', label: 'Email de avisos del equipo' },
  ] },
  { group: 'WhatsApp', keys: [
    { name: 'WHATSAPP_API_TOKEN', label: 'WhatsApp API Token' },
    { name: 'WHATSAPP_PHONE_NUMBER_ID', label: 'WhatsApp Phone Number ID' },
    { name: 'NOTIFICATION_PHONE', label: 'Teléfono de avisos' },
  ] },
  { group: 'Provisión y Cron', keys: [
    { name: 'DEMO_PROVISION_API_KEY', label: 'Clave de provisión de sistemas' },
    { name: 'CRON_SECRET', label: 'Secreto del cron de sincronización' },
  ] },
];

/** Estado enmascarado de cada clave (nunca devuelve el valor real). */
export function secretsStatus() {
  const file = readSecrets();
  return SECRET_GROUPS.map((g) => ({
    group: g.group,
    keys: g.keys.map((k) => {
      const inPanel = !!file[k.name];
      const inEnv = !!process.env[k.name];
      const val = inPanel ? file[k.name] : process.env[k.name] || '';
      return {
        name: k.name,
        label: k.label,
        configured: inPanel || inEnv,
        source: inPanel ? 'panel' : inEnv ? 'env' : 'none',
        hint: val ? `••••${val.slice(-4)}` : '',
      };
    }),
  }));
}
