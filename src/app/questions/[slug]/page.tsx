// src/app/questions/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ClientInteractive, { type ClientQuestion } from './ClientInteractive';

export const runtime = 'nodejs';
export const revalidate = 60;

type PageProps = { params: { slug: string } };

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
  
  const totalEngagement = total + question.commentsCount;
  if (totalEngagement >= 20 && ageHours < 168) badges.push('trending');
  
  return badges;
}

function toClientQuestion(row: any, commentsCount: number): ClientQuestion {
  return {
    id: row.id,
    title: row.title,
    category: row.category ?? 'general',
    description: row.description ?? '',
    createdAtISO: row.createdAt.toISOString(),
    author: row.authorUsername || '—',
    views: row.viewsCount ?? 0,
    votesACount: row.votesACount ?? 0,
    votesBCount: row.votesBCount ?? 0,
    badges: calculateBadges({
      createdAt: row.createdAt,
      votesACount: row.votesACount ?? 0,
      votesBCount: row.votesBCount ?? 0,
      commentsCount,
    }),
  };
}

function mapArgToUI(arg: any) {
  return {
    id: arg.id,
    text: arg.text,
    author: arg.author?.username ?? '—',
    timeAgo: arg.createdAt.toISOString(),
    votes: arg.votes ?? 0,
    userVote: null,
    side: arg.side,
    sources: (arg.sources ?? []).map((s: any) => ({ url: s.url })),
    views: arg.views ?? 0,
  };
}

export default async function QuestionPage({ params }: PageProps) {
  const { slug } = params;

  // 1) Récupérer la question
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    labelA: string;
    labelB: string;
    createdAt: Date;
    viewsCount: number | null;
    votesACount: number | null;
    votesBCount: number | null;
    authorUsername: string | null;
    argumentsFor: string | null;
    argumentsAgainst: string | null;
  }>>`
    SELECT q.id, q.title, q.description, q.category, q."labelA", q."labelB",
           q."createdAt", q."viewsCount", q."votesACount", q."votesBCount",
           q."argumentsFor", q."argumentsAgainst",
           u.username as "authorUsername"
    FROM "Question" q
    LEFT JOIN "User" u ON u.id = q."authorId"
    WHERE q.slug = ${slug}
    LIMIT 1
  `;

  if (rows.length === 0) return notFound();
  const row = rows[0];

  // 2) Parser les arguments JSON
  let aiArgumentsFor: any[] = [];
  let aiArgumentsAgainst: any[] = [];
  
  try {
    if (row.argumentsFor) {
      aiArgumentsFor = JSON.parse(row.argumentsFor);
    }
  } catch (e) {
    console.error('Failed to parse argumentsFor:', e);
  }
  
  try {
    if (row.argumentsAgainst) {
      aiArgumentsAgainst = JSON.parse(row.argumentsAgainst);
    }
  } catch (e) {
    console.error('Failed to parse argumentsAgainst:', e);
  }

  // 3) Charger en parallèle
  const [qSources, topArgs, discussions] = await Promise.all([
    prisma.sourceLink.findMany({
      where: { questionId: row.id },
      select: { url: true, label: true },
    }),
    prisma.argument.findMany({
      where: { questionId: row.id, parentId: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        side: true,
        votes: true,
        views: true,
        createdAt: true,
        author: { select: { username: true } },
        sources: { select: { url: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            text: true,
            votes: true,
            views: true,
            createdAt: true,
            author: { select: { username: true } },
            sources: { select: { url: true } },
          },
        },
      },
    }),
    prisma.discussion.findMany({
      where: { questionId: row.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        text: true,
        likes: true,
        replies: true,
        createdAt: true,
        author: { select: { username: true } },
        sources: { select: { url: true } },
      },
    }),
  ]);

  // 4) Normalisation
  const initialComments: any[] = [];
  for (const a of topArgs) {
    initialComments.push(mapArgToUI(a));
    if (a.replies?.length) {
      for (const r of a.replies) {
        initialComments.push({
          ...mapArgToUI(r),
          parentId: a.id,
          side: a.side,
        });
      }
    }
  }

  const question: ClientQuestion = toClientQuestion(row, initialComments.length);
  const initialSources = qSources.map(s => ({ url: s.url, label: s.label || undefined }));

  const initialDiscussions = discussions.map(d => ({
    id: d.id,
    text: d.text,
    author: d.author?.username ?? '—',
    timeAgo: d.createdAt.toISOString(),
    likes: d.likes ?? 0,
    replies: d.replies ?? 0,
    sources: (d.sources ?? []).map(s => ({ url: s.url })),
  }));

  // 5) Rendu - Passer les arguments IA à ClientInteractive
  return (
    <ClientInteractive
      slug={slug}
      initialQuestion={question}
      initialSources={initialSources}
      initialComments={initialComments as any}
      initialDiscussions={initialDiscussions as any}
      // ✅ NOUVEAU : Passer les arguments IA
      aiArgumentsFor={aiArgumentsFor}
      aiArgumentsAgainst={aiArgumentsAgainst}
    />
  );
}