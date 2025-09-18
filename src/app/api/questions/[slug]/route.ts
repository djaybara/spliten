// src/app/api/questions/[slug]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const key = params.slug;
    const q = await prisma.question.findFirst({
      where: { OR: [{ slug: key }, { id: key }] },
      select: {
        id: true,
        slug: true,
        title: true,
        labelA: true,
        labelB: true,
        category: true,
        mediaUrl: true,
        authorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!q) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ ok: true, question: q });
  } catch (e) {
    console.error('GET /api/questions/[slug] error', e);
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
  }
}
