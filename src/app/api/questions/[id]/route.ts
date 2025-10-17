// src/app/api/questions/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  const question = await prisma.question.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      labelA: true,
      labelB: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, username: true } },
    },
  });

  if (!question) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, question });
}