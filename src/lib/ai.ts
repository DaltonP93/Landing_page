import site from '@/data/site.json';

type Format = 'openai' | 'anthropic';

interface ProviderDef {
  label: string;
  baseUrl: string;
  format: Format;
  defaultModel: string;
  envKeys: string[];   // claves de entorno a probar, en orden
  needsKey: boolean;   // false para Ollama / endpoints locales
}

/**
 * Proveedores de IA soportados. La mayoría usa el formato OpenAI
 * (chat/completions); Anthropic usa su propio formato /messages.
 * Se pueden agregar más con "custom" indicando baseUrl + AI_API_KEY.
 */
export const AI_PROVIDERS: Record<string, ProviderDef> = {
  anthropic:  { label: 'Anthropic (Claude)',     baseUrl: 'https://api.anthropic.com/v1',                          format: 'anthropic', defaultModel: 'claude-3-5-haiku-latest',          envKeys: ['ANTHROPIC_API_KEY', 'AI_API_KEY'], needsKey: true },
  openai:     { label: 'OpenAI (GPT)',           baseUrl: 'https://api.openai.com/v1',                             format: 'openai',    defaultModel: 'gpt-4o-mini',                      envKeys: ['OPENAI_API_KEY', 'AI_API_KEY'],    needsKey: true },
  deepseek:   { label: 'DeepSeek',               baseUrl: 'https://api.deepseek.com/v1',                           format: 'openai',    defaultModel: 'deepseek-chat',                    envKeys: ['DEEPSEEK_API_KEY', 'AI_API_KEY'],  needsKey: true },
  qwen:       { label: 'Qwen (DashScope)',       baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', format: 'openai',   defaultModel: 'qwen-plus',                        envKeys: ['QWEN_API_KEY', 'DASHSCOPE_API_KEY', 'AI_API_KEY'], needsKey: true },
  groq:       { label: 'Groq',                   baseUrl: 'https://api.groq.com/openai/v1',                        format: 'openai',    defaultModel: 'llama-3.3-70b-versatile',          envKeys: ['GROQ_API_KEY', 'AI_API_KEY'],      needsKey: true },
  openrouter: { label: 'OpenRouter',             baseUrl: 'https://openrouter.ai/api/v1',                          format: 'openai',    defaultModel: 'meta-llama/llama-3.1-8b-instruct', envKeys: ['OPENROUTER_API_KEY', 'AI_API_KEY'], needsKey: true },
  mistral:    { label: 'Mistral',                baseUrl: 'https://api.mistral.ai/v1',                             format: 'openai',    defaultModel: 'mistral-small-latest',             envKeys: ['MISTRAL_API_KEY', 'AI_API_KEY'],   needsKey: true },
  gemini:     { label: 'Google Gemini',          baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', format: 'openai',  defaultModel: 'gemini-1.5-flash',                 envKeys: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'AI_API_KEY'], needsKey: true },
  ollama:     { label: 'Ollama (local · gratis)', baseUrl: 'http://localhost:11434/v1',                            format: 'openai',    defaultModel: 'llama3.1',                         envKeys: ['AI_API_KEY'],                      needsKey: false },
  custom:     { label: 'Personalizado (OpenAI-compatible)', baseUrl: '',                                           format: 'openai',    defaultModel: '',                                 envKeys: ['AI_API_KEY'],                      needsKey: false },
};

export interface ChatMsg { role: 'user' | 'assistant'; content: string }

interface AIConfig { provider?: string; model?: string; baseUrl?: string; format?: Format }

function resolveKey(envKeys: string[]): string {
  for (const k of envKeys) if (process.env[k]) return process.env[k] as string;
  return '';
}

/** Resuelve la configuración efectiva (env > site.json > default del proveedor). */
export function resolveAIConfig() {
  const cfg = ((site as { ai?: AIConfig }).ai) || {};
  const providerId = (process.env.AI_PROVIDER || cfg.provider || 'anthropic').toLowerCase();
  const def = AI_PROVIDERS[providerId] || AI_PROVIDERS.openai;
  const baseUrl = (process.env.AI_BASE_URL || cfg.baseUrl || def.baseUrl).replace(/\/$/, '');
  const model = process.env.AI_MODEL || cfg.model || def.defaultModel;
  const format: Format = cfg.format || def.format;
  const key = resolveKey(def.envKeys);
  return { providerId, def, baseUrl, model, format, key, ready: !!baseUrl && (!def.needsKey || !!key) };
}

async function openaiCall(baseUrl: string, key: string, model: string, system: string, messages: ChatMsg[]): Promise<string | null> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (key) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? null;
}

async function anthropicCall(baseUrl: string, key: string, model: string, system: string, messages: ChatMsg[]): Promise<string | null> {
  const res = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 400, system, messages }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.content?.[0]?.text ?? null;
}

/** Llama al proveedor configurado. Devuelve null si no está listo o falla. */
export async function chatComplete(system: string, messages: ChatMsg[]): Promise<string | null> {
  const { format, baseUrl, key, model, def } = resolveAIConfig();
  if (def.needsKey && !key) return null;
  if (!baseUrl) return null;
  try {
    return format === 'anthropic'
      ? await anthropicCall(baseUrl, key, model, system, messages)
      : await openaiCall(baseUrl, key, model, system, messages);
  } catch {
    return null;
  }
}
