import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { NextRequest } from 'next/server';

/** Lee y parsea un JSON relativo a la raíz del proyecto. */
export function readData<T>(relPath: string, fallback: T): T {
  const full = join(process.cwd(), relPath);
  if (!existsSync(full)) return fallback;
  try {
    return JSON.parse(readFileSync(full, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

/** Escribe un JSON relativo a la raíz del proyecto (crea carpetas si faltan). */
export function writeData(relPath: string, data: unknown): void {
  const full = join(process.cwd(), relPath);
  const dir = dirname(full);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2), 'utf-8');
}

/** Valida la API key del admin desde el header x-api-key. */
export function isAdmin(request: NextRequest): boolean {
  return request.headers.get('x-api-key') === process.env.ADMIN_API_KEY;
}
