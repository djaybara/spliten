import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const count = await prisma.question.count();
  return NextResponse.json({ ok: true, questionCount: count });
}
