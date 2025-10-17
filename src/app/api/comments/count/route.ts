// src/app/api/comments/count/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get('ids') || '')
    .split(',')
    .filter((s) => s.trim().length > 0);

  if (!ids.length) {
    return NextResponse.json({ counts: {} });
  }

  const pairs = await Promise.all(
    ids.map(async (questionId) => {
      const [argsCount, discsCount] = await Promise.all([
        prisma.argument.count({
          where: { questionId, parentId: null },
        }),
        prisma.discussion.count({
          where: { questionId },
        }),
      ]);
      return [questionId, argsCount + discsCount] as const;
    })
  );

  return NextResponse.json({ counts: Object.fromEntries(pairs) });
}