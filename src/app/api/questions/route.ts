// src/app/api/questions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureUniqueSlug(base: string) {
  let slug = base;
  let i = 2;
  while (i < 10_000) {
    const exists = await prisma.question.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
  return `${base}-${Date.now()}`;
}

function calculateBadges(question: any): Array<'trending' | 'controversial' | 'new' | 'top'> {
  const badges: Array<'trending' | 'controversial' | 'new' | 'top'> = [];
  
  const ageHours = (Date.now() - new Date(question.createdAt).getTime()) / (1000 * 60 * 60);
  if (ageHours < 24) badges.push('new');
  
  const total = question.votesACount + question.votesBCount;
  if (total >= 10) {
    const ratio = Math.min(question.votesACount, question.votesBCount) / total;
    if (ratio >= 0.4 && ratio <= 0.6) badges.push('controversial');
  }
  
  if (total >= 50) badges.push('top');
  
  const totalEngagement = total + (question.commentsCount || 0);
  if (totalEngagement >= 20 && ageHours < 168) badges.push('trending');
  
  return badges;
}

// GET /api/questions?limit=20
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

  const questions = await prisma.question.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      labelA: true,
      labelB: true,
      category: true,
      votesACount: true,
      votesBCount: true,
      viewsCount: true,
      createdAt: true,
      author: {
        select: { username: true },
      },
      _count: {
        select: {
          arguments: { where: { parentId: null } },
          discussions: true,
        },
      },
    },
  });

  const enriched = questions.map(q => ({
    ...q,
    commentsCount: q._count.arguments + q._count.discussions,
    badges: calculateBadges({
      createdAt: q.createdAt,
      votesACount: q.votesACount,
      votesBCount: q.votesBCount,
      commentsCount: q._count.arguments + q._count.discussions,
    }),
  }));

  return NextResponse.json({ ok: true, questions: enriched });
}

// POST /api/questions (création)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const title = (body?.title ?? '').toString().trim();
    const description = (body?.description ?? '').toString().trim();
    const category = (body?.category ?? 'general').toString().trim() || 'general';
    const labelA = (body?.labelA ?? 'Yes').toString().trim() || 'Yes';
    const labelB = (body?.labelB ?? 'No').toString().trim() || 'No';
    const mediaUrl = body?.mediaUrl ? body.mediaUrl.toString().trim() : undefined;
    const sources = body?.sources || undefined;
    
    // ✅ NOUVEAU : Récupérer les arguments
    const argumentsFor = body?.argumentsFor || undefined;
    const argumentsAgainst = body?.argumentsAgainst || undefined;

    if (!title) {
      return NextResponse.json({ ok: false, error: 'Missing title' }, { status: 400 });
    }

    const base = slugify(title);
    const slug = await ensureUniqueSlug(base || 'question');

    // Auteur démo
    const author =
      (await prisma.user.findFirst()) ??
      (await prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          email: 'demo@spliten.dev',
          username: 'demo-user',
        },
      }));

    const created = await prisma.question.create({
      data: {
        id: crypto.randomUUID(),
        title,
        slug,
        description: description || '',
        category,
        labelA,
        labelB,
        mediaUrl,
        authorId: author.id,
        // ✅ NOUVEAU : Sauvegarder les arguments en JSON
        argumentsFor: argumentsFor ? JSON.stringify(argumentsFor) : undefined,
        argumentsAgainst: argumentsAgainst ? JSON.stringify(argumentsAgainst) : undefined,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        labelA: true,
        labelB: true,
        createdAt: true,
        argumentsFor: true,
        argumentsAgainst: true,
      },
    });

    // ✅ NOUVEAU : Créer les SourceLink si des sources sont fournies
    if (sources && Array.isArray(sources) && sources.length > 0) {
      const sourceLinks = sources
        .filter((s: any) => s && typeof s === 'object' && s.url)
        .map((s: any) => ({
          id: crypto.randomUUID(),
          url: s.url,
          label: s.label || null,
          questionId: created.id,
        }));
      
      if (sourceLinks.length > 0) {
        await prisma.sourceLink.createMany({
          data: sourceLinks,
        });
      }
    }

    return NextResponse.json({ ok: true, question: created });
  } catch (err) {
    console.error('POST /api/questions error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}