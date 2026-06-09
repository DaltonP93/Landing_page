import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { NextRequest } from 'next/server';
import { verifyToken, roleAllows, type Role } from './auth';

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

/** Rol del solicitante: API key maestra (admin) o token de sesión válido. */
export function getRole(request: NextRequest): Role | null {
  const key = request.headers.get('x-api-key') || '';
  if (key && process.env.ADMIN_API_KEY && key === process.env.ADMIN_API_KEY) return 'admin';
  const session = verifyToken(key);
  return session ? session.role : null;
}

/** Acceso autenticado (cualquier rol válido o API key maestra). */
export function isAdmin(request: NextRequest): boolean {
  return getRole(request) !== null;
}

/** Exige al menos el rol indicado (viewer < editor < admin). */
export function requireRole(request: NextRequest, min: Role): boolean {
  const role = getRole(request);
  return role !== null && roleAllows(role, min);
}
