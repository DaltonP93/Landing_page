import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { isAdmin } from '@/lib/store';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'El archivo supera los 5 MB' }, { status: 413 });
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  if (!ALLOWED.includes(ext)) {
    return NextResponse.json({ error: `Formato no permitido (${ALLOWED.join(', ')})` }, { status: 415 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), bytes);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
