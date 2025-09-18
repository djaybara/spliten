import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get('q') || '').trim();
  if (q.length < 4) return NextResponse.json({ ok: true, items: [] });

  // simple contains insensible à la casse
  const items = await prisma.question.findMany({
    where: { title: { contains: q, mode: 'insensitive' } },
    select: { slug: true, title: true },
    take: 5,
  });

  return NextResponse.json({ ok: true, items });
}
