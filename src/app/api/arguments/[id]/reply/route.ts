import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const parentId = params.id;
    const { username, text, side, sources } = await req.json() as {
      username?: string; text: string; side: 'pour'|'contre'; sources?: { url: string }[];
    };
    if (!text) return new Response('Bad request', { status: 400 });

    const parent = await prisma.argument.findUnique({ where: { id: parentId }, select: { questionId: true } });
    if (!parent) return new Response('Parent not found', { status: 404 });

    const user = await prisma.user.upsert({
      where: { username: username || 'you' },
      update: {},
      create: { username: username || 'you', email: `${username || 'you'}@example.com` }
    });

    const reply = await prisma.argument.create({
      data: {
        questionId: parent.questionId,
        authorId: user.id,
        side: (side || 'pour') as any,
        text,
        votes: 0,
        parentId
      }
    });

    // sources
    for (const s of (sources || [])) {
      if (s?.url) {
        await prisma.sourceLink.create({ data: { url: s.url, argumentId: reply.id } });
      }
    }

    return Response.json(reply);
  } catch (e) {
    console.error(e);
    return new Response('Server error', { status: 500 });
  }
}
