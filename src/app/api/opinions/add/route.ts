// src/app/api/opinion/add/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { softIsAuthed } from '@/lib/authSoft';

// GET: autorisé (mock)
export async function GET() {
  return NextResponse.json({ ok: true, info: 'opinion/add GET mock' });
}

// POST: protégé
export async function POST(req: NextRequest) {
  if (!softIsAuthed(req)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized (API guard / opinion/add)' },
      { status: 401 }
    );
  }

  const payload = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, received: payload });
}
