import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { questionId, username, text, sources } = await req.json() as {
      questionId: string; username?: string; text: string; sources?: { url: string }[];
    };
    if (!questionId || !text) return new Response('Bad request', { status: 400 });

    const user = await prisma.user.upsert({
      where: { username: username || 'you' },
      update: {},
      create: { username: username || 'you', email: `${username || 'you'}@example.com` }
    });

    const disc = await prisma.discussion.create({
      data: { questionId, authorId: user.id, text, likes: 0, replies: 0 }
    });

    for (const s of (sources || [])) {
      if (s?.url) await prisma.sourceLink.create({ data: { url: s.url, discussionId: disc.id } });
    }

    return Response.json(disc);
  } catch (e) {
    console.error(e);
    return new Response('Server error', { status: 500 });
  }
}
