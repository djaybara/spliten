// src/app/api/questions/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { softIsAuthed } from '@/lib/authSoft';

// GET: toujours autorisé. On renvoie un mock simple.
export async function GET(_req: Request) {
  return NextResponse.json({
    ok: true,
    items: [], // mock: liste vide
  });
}

// POST: protégé par le middleware ET re-vérifié ici (défense en profondeur).
export async function POST(req: NextRequest) {
  if (!softIsAuthed(req)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized (API guard / questions)' },
      { status: 401 }
    );
  }

  // ⬇️ MOCK : on lit le body et on renvoie tel quel (pas de DB)
  const data = await req.json().catch(() => ({} as any));
  const { title = 'Untitled', labelA = 'For', labelB = 'Against' } = data || {};

  return NextResponse.json({
    ok: true,
    created: {
      id: 'mock-id-1',
      title,
      labelA,
      labelB,
    },
  });
}
