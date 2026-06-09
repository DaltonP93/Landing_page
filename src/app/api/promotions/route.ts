import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, isAdmin } from '@/lib/store';

const PATH = 'src/data/promotions.json';

export async function GET() {
  return NextResponse.json(readData(PATH, []));
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const promos = await request.json();
  writeData(PATH, promos);
  return NextResponse.json({ status: 'ok', count: Array.isArray(promos) ? promos.length : 0 });
}
