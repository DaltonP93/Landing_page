import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

/**
 * Login del panel. Acepta:
 *  - { username, password }  → devuelve { token, role } (sesión)
 *  - { apiKey }              → valida la API key maestra (compatibilidad)
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Login por usuario/contraseña
  if (body.username && body.password) {
    const result = await login(body.username, body.password);
    if (!result) return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    return NextResponse.json({ status: 'ok', token: result.token, role: result.role });
  }

  // Compatibilidad: API key maestra
  if (body.apiKey) {
    const expected = process.env.ADMIN_API_KEY;
    if (!expected) return NextResponse.json({ error: 'ADMIN_API_KEY no configurada' }, { status: 500 });
    if (body.apiKey !== expected) return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
    return NextResponse.json({ status: 'ok', token: expected, role: 'admin' });
  }

  return NextResponse.json({ error: 'Credenciales requeridas' }, { status: 400 });
}
