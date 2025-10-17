// src/app/page.tsx
import HomeClient from './HomeClient';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Cache 60 secondes

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

async function getInitialQuestions() {
  const questions = await prisma.question.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      votesACount: true,
      votesBCount: true,
      viewsCount: true,
      createdAt: true,
      author: { select: { username: true } },
      _count: {
        select: {
          arguments: { where: { parentId: null } },
          discussions: true,
        },
      },
    },
  });

  return questions.map(q => {
    const commentsCount = q._count.arguments + q._count.discussions;
    return {
      id: q.id,
      title: q.title,
      category: q.category || 'general',
      author: q.author?.username || 'Anonymous',
      createdAt: q.createdAt.toISOString(),
      viewsCount: q.viewsCount || 0,
      votesACount: q.votesACount || 0,
      votesBCount: q.votesBCount || 0,
      commentsCount,
      badges: calculateBadges({
        createdAt: q.createdAt,
        votesACount: q.votesACount,
        votesBCount: q.votesBCount,
        commentsCount,
      }),
    };
  });
}

export default async function HomePage() {
  const initialQuestions = await getInitialQuestions();
  
  return <HomeClient initialQuestions={initialQuestions} />;
}