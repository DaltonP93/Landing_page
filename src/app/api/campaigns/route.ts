import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, isAdmin } from '@/lib/store';

const PATH = 'src/data/campaigns.json';

export async function GET(request: NextRequest) {
  // Las campañas son datos internos de marketing → requieren auth.
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(readData(PATH, []));
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const campaigns = await request.json();
  writeData(PATH, campaigns);
  return NextResponse.json({ status: 'ok', count: Array.isArray(campaigns) ? campaigns.length : 0 });
}
