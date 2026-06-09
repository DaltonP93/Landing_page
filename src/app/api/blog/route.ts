import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData, isAdmin } from '@/lib/store';

const PATH = 'src/data/blog.json';

export async function GET() {
  return NextResponse.json(readData(PATH, []));
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const posts = await request.json();
  writeData(PATH, posts);
  return NextResponse.json({ status: 'ok', count: Array.isArray(posts) ? posts.length : 0 });
}
