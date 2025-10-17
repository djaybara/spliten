import { prisma } from '@/lib/prisma';

export async function getQuestions(opts?: { take?: number; skip?: number; sort?: 'new'|'top'|'controversial'|'hot' }) {
  const take = opts?.take ?? 20;
  const skip = opts?.skip ?? 0;
  const sort = opts?.sort ?? 'new';

  const orderBy =
    sort === 'top' ? { wilsonScore: 'desc' as const } :
    sort === 'controversial' ? { controversyScore: 'desc' as const } :
    sort === 'hot' ? { trendScore: 'desc' as const } :
    { createdAt: 'desc' as const };

  const items = await prisma.question.findMany({
    take, skip, orderBy,
    select: {
      id: true, slug: true, title: true, description: true, category: true, createdAt: true,
      votesACount: true, votesBCount: true, wilsonScore: true, trendScore: true, controversyScore: true,
      badges: true,
      _count: { select: { arguments: true, discussions: true } }
    }
  });

  const total = await prisma.question.count();
  return { items, total };
}

export async function getQuestionBySlug(slug: string) {
  return prisma.question.findUnique({
    where: { slug },
    include: {
      arguments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          sources: true,
          replies: {
            orderBy: { createdAt: 'asc' },
            include: { sources: true }
          }
        }
      },
      discussions: {
        orderBy: { createdAt: 'desc' },
        include: { sources: true }
      },
      sources: true
    }
  });
}
