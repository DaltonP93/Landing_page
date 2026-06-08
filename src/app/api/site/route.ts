import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'src/data/site.json');

export async function GET() {
  const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const siteData = await request.json();
  writeFileSync(DATA_PATH, JSON.stringify(siteData, null, 2), 'utf-8');
  return NextResponse.json({ status: 'ok' });
}
