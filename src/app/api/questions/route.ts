// src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { postLimiter } from '@/lib/rate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120);
}

export async function GET() {
  try {
    const items = await prisma.question.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, slug: true, title: true, createdAt: true },
      take: 50,
    });
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    console.error('GET /api/questions error', e);
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🔒 Rate-limit par IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local';
    const { success, limit, reset, remaining } = await postLimiter.limit(`post:${ip}`);
    if (!success) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', limit, reset, remaining },
        { status: 429 }
      );
    }

    // Validation
    const title = String(body?.title ?? '').trim();
    const labelA = String(body?.labelA ?? 'Yes').trim() || 'Yes';
    const labelB = String(body?.labelB ?? 'No').trim() || 'No';
    const category = String(body?.category ?? 'general').trim() || 'general';
    const mediaUrl = body?.mediaUrl ? String(body.mediaUrl) : undefined;
    const authorId = String(body?.authorId ?? 'demo-user');

    if (title.length < 8) {
      return NextResponse.json({ error: 'TITLE_TOO_SHORT' }, { status: 400 });
    }

    // Slug unique
    let base = slugify(title);
    let slug = base || `q-${Date.now()}`;
    let i = 1;
    while (await prisma.question.findUnique({ where: { slug } })) {
      slug = `${base}-${++i}`;
    }

    const created = await prisma.question.create({
      data: { slug, title, labelA, labelB, category, mediaUrl, authorId },
      select: {
        id: true, slug: true, title: true, labelA: true, labelB: true, category: true, createdAt: true
      },
    });

    return NextResponse.json({ ok: true, question: created }, { status: 201 });
  } catch (e) {
    console.error('POST /api/questions error', e);
    return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
  }
}
