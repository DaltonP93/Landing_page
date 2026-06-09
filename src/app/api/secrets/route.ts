import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/store';
import { secretsStatus, setSecrets } from '@/lib/secrets';

/** Devuelve el estado enmascarado de cada credencial (nunca el valor real). */
export async function GET(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(secretsStatus());
}

/** Guarda credenciales. Body: { secrets: { CLAVE: valor } }. Vacío = no cambia. */
export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { secrets } = await request.json();
  if (!secrets || typeof secrets !== 'object') {
    return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
  }
  setSecrets(secrets);
  return NextResponse.json({ status: 'ok' });
}
