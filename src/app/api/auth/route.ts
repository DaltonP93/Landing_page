import { NextRequest, NextResponse } from 'next/server';

/**
 * Valida la API key del panel admin contra la variable de entorno.
 * Permite que el login del panel verifique la clave en el servidor
 * en lugar de solo aceptar cualquier texto en el cliente.
 */
export async function POST(request: NextRequest) {
  const { apiKey } = await request.json().catch(() => ({ apiKey: '' }));

  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    return NextResponse.json(
      { error: 'ADMIN_API_KEY no está configurada en el servidor' },
      { status: 500 }
    );
  }

  if (apiKey !== expected) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }

  return NextResponse.json({ status: 'ok' });
}
