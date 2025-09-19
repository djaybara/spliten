// src/app/api/opinion/score/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { softIsAuthed } from '@/lib/authSoft';

export async function GET() {
  return NextResponse.json({ ok: true, info: 'opinion/score GET mock' });
}

export async function POST(req: NextRequest) {
  if (!softIsAuthed(req)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized (API guard / opinion/score)' },
      { status: 401 }
    );
  }

  const payload = await req.json().catch(() => ({}));
  return NextResponse.json({ ok: true, scored: payload });
}
