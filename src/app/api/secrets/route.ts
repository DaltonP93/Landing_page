import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/store';
import { secretsStatus, setSecrets } from '@/lib/secrets';

/** Devuelve el estado enmascarado de cada credencial (nunca el valor real). */
export async function GET(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  return NextResponse.json(secretsStatus());
}

/** Guarda credenciales. Body: { secrets: { CLAVE: valor } }. Vacío = no cambia. */
export async function PUT(request: NextRequest) {
  if (!requireRole(request, 'admin')) return NextResponse.json({ error: 'Solo administradores' }, { status: 403 });
  const { secrets } = await request.json();
  if (!secrets || typeof secrets !== 'object') {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  }
  setSecrets(secrets);
  return NextResponse.json({ status: 'ok' });
}
