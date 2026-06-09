import crypto from 'crypto';
import { readData, writeData } from './store';

const USERS_PATH = 'data/users.json';
export type Role = 'admin' | 'editor' | 'viewer';
const ROLE_RANK: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };

export interface User { id: string; username: string; passwordHash: string; role: Role; createdAt: string }

function sessionSecret(): string {
  return process.env.APP_SECRET || process.env.ADMIN_API_KEY || 'dev-secret-change-me';
}

/* ── Hash de contraseñas (scrypt) ── */
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [, salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(pw, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(calc, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

/* ── Usuarios ── */
export function listUsers(): User[] {
  let users = readData<User[]>(USERS_PATH, []);
  if (users.length === 0) {
    // Semilla inicial: admin por defecto (cambiá la contraseña al entrar)
    const username = process.env.ADMIN_USER || 'admin';
    const password = process.env.ADMIN_PASSWORD || process.env.ADMIN_API_KEY || 'admin123';
    users = [{ id: crypto.randomUUID(), username, passwordHash: hashPassword(password), role: 'admin', createdAt: new Date().toISOString() }];
    writeData(USERS_PATH, users);
  }
  return users;
}

export function saveUsers(users: User[]): void {
  writeData(USERS_PATH, users);
}

/* ── Tokens de sesión (HMAC) ── */
export function createToken(user: User): string {
  const payload = { sub: user.username, role: user.role, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string): { username: string; role: Role } | null {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return { username: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export function login(username: string, password: string): { token: string; role: Role } | null {
  const user = listUsers().find((u) => u.username === username);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { token: createToken(user), role: user.role };
}

export function roleAllows(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}
