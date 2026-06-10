import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireRole } from '@/lib/store';
import { listUsers, saveUsers, hashPassword, type Role, type User } from '@/lib/auth';

function publicUsers(users: User[]) {
  return users.map(({ id, username, role, createdAt }) => ({ id, username, role, createdAt }));
}

export async function GET(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  return NextResponse.json(publicUsers(await listUsers()));
}

export async function POST(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const { username, password, role } = await request.json();
  if (!username || !password) return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
  const users = await listUsers();
  if (users.some((u) => u.username === username)) return NextResponse.json({ error: 'El usuario ya existe' }, { status: 409 });
  users.push({ id: crypto.randomUUID(), username, passwordHash: hashPassword(password), role: (role as Role) || 'viewer', createdAt: new Date().toISOString() });
  await saveUsers(users);
  return NextResponse.json({ status: 'ok' });
}

export async function PATCH(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const { id, role, password } = await request.json();
  const users = await listUsers();
  const u = users.find((x) => x.id === id);
  if (!u) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  if (role) u.role = role as Role;
  if (password) u.passwordHash = hashPassword(password);
  await saveUsers(users);
  return NextResponse.json({ status: 'ok' });
}

export async function DELETE(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const { id } = await request.json();
  const users = await listUsers();
  if (users.length <= 1) return NextResponse.json({ error: 'Debe quedar al menos un usuario' }, { status: 400 });
  await saveUsers(users.filter((u) => u.id !== id));
  return NextResponse.json({ status: 'ok' });
}
