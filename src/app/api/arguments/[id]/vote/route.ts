import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VoteType } from '@prisma/client';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const argumentId = params.id;
    const { username, type } = await req.json() as { username?: string; type: 'up'|'down' };

    if (!argumentId || !type) return new Response('Bad request', { status: 400 });

    // Trouve (ou crée) l’utilisateur
    const user = await prisma.user.upsert({
      where: { username: username || 'you' },
      update: {},
      create: { username: username || 'you', email: `${username || 'you'}@example.com` }
    });

    // Cherche vote existant
    const existing = await prisma.argumentVote.findUnique({
      where: { argumentId_userId: { argumentId, userId: user.id } }
    });

    let delta = 0;
    if (!existing) {
      await prisma.argumentVote.create({
        data: { argumentId, userId: user.id, type: type as VoteType }
      });
      delta = type === 'up' ? +1 : -1;
    } else if (existing.type === type) {
      await prisma.argumentVote.delete({
        where: { argumentId_userId: { argumentId, userId: user.id } }
      });
      delta = type === 'up' ? -1 : +1; // retirer le même vote
    } else {
      await prisma.argumentVote.update({
        where: { argumentId_userId: { argumentId, userId: user.id } },
        data: { type: type as VoteType }
      });
      delta = type === 'up' ? +2 : -2; // bascule up<->down
    }

    // Applique le delta sur Argument.votes
    const updated = await prisma.argument.update({
      where: { id: argumentId },
      data: { votes: { increment: delta } },
      select: { id: true, votes: true }
    });

    return Response.json(updated);
  } catch (e) {
    console.error(e);
    return new Response('Server error', { status: 500 });
  }
}
