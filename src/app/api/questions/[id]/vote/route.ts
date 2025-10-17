// src/app/api/questions/[id]/vote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: questionId } = await params;
    const { side, username } = await req.json() as { side: 'pour' | 'contre'; username?: string };

    if (!questionId || !side) {
      return NextResponse.json({ ok: false, error: 'Missing params' }, { status: 400 });
    }

    // Trouver ou créer l'utilisateur (dev mode)
    const user = await prisma.user.upsert({
      where: { username: username || 'you' },
      update: {},
      create: {
        username: username || 'you',
        email: `${username || 'you'}@example.com`,
      },
    });

    // Vérifier si un vote existe déjà
    const existingVote = await prisma.questionVote.findUnique({
      where: {
        questionId_userId: {
          questionId,
          userId: user.id,
        },
      },
    });

    let deltaA = 0;
    let deltaB = 0;

    if (!existingVote) {
      // Nouveau vote
      await prisma.questionVote.create({
        data: {
          questionId,
          userId: user.id,
          side,
        },
      });
      if (side === 'pour') deltaA = 1;
      else deltaB = 1;
    } else if (existingVote.side === side) {
      // Retirer le vote
      await prisma.questionVote.delete({
        where: {
          questionId_userId: {
            questionId,
            userId: user.id,
          },
        },
      });
      if (side === 'pour') deltaA = -1;
      else deltaB = -1;
    } else {
      // Changer de côté
      await prisma.questionVote.update({
        where: {
          questionId_userId: {
            questionId,
            userId: user.id,
          },
        },
        data: { side },
      });
      if (side === 'pour') {
        deltaA = 1;
        deltaB = -1;
      } else {
        deltaA = -1;
        deltaB = 1;
      }
    }

    // Mettre à jour les compteurs
const updated = await prisma.question.update({
  where: { id: questionId },
  data: {
    votesACount: { increment: deltaA },
    votesBCount: { increment: deltaB },
  },
  select: {
    id: true,
    votesACount: true,
    votesBCount: true,
  },
});

return NextResponse.json({ ok: true, question: updated });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}