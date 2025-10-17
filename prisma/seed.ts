// prisma/seed.ts
import { PrismaClient, Side } from '@prisma/client';

const prisma = new PrismaClient();

/* ========= Helpers généraux ========= */
const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const normHttp = (u?: string) => (u ? (/^https?:\/\//i.test(u) ? u : `https://${u}`) : '');

const toInt = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

async function upsertUser(username: string, email?: string) {
  const mail = email || `${username}@example.com`;
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, email: mail, role: 'USER' },
  });
}

/* ========= Helpers Sources ========= */
function extractUrlsFromText(text?: string): string[] {
  if (!text) return [];
  const URL_RE =
    /\b((https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)\]}<>"']*)?)/gi;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(text)) !== null) {
    const raw = (m[1] || '').trim().replace(/[.,;:!?)]*$/, '');
    const u = normHttp(raw);
    try {
      const parsed = new URL(u);
      if (parsed.hostname && !u.includes('@')) {
        found.add(parsed.href);
      }
    } catch {}
  }
  return Array.from(found);
}

function coerceSources(input: any): { url: string }[] {
  if (!input) return [];
  const candidates =
    (Array.isArray(input.sources) && input.sources) ||
    (Array.isArray(input.questionSources) && input.questionSources) ||
    (Array.isArray(input.links) && input.links) ||
    (Array.isArray(input.refs) && input.refs) ||
    [];
  return (candidates as any[])
    .map((x) => (typeof x === 'string' ? { url: x } : x))
    .filter((x) => x && typeof x.url === 'string')
    .map((x) => ({ url: normHttp(x.url) }))
    .filter((x) => !!x.url);
}

async function attachSourcesForArgument(
  argId: string,
  payload: any,
  questionTitle: string
) {
  let list = coerceSources(payload);
  if (list.length === 0)
    list = extractUrlsFromText(payload?.text).map((u) => ({ url: u }));
  if (list.length === 0)
    list = [{ url: `https://en.wikipedia.org/wiki/${slugify(questionTitle)}` }];

  for (const s of list) {
    await prisma.sourceLink.create({
      data: { url: normHttp(s.url), argumentId: argId },
    });
  }
}

async function attachSourcesForDiscussion(
  discId: string,
  payload: any,
  questionTitle: string
) {
  let list = coerceSources(payload);
  if (list.length === 0)
    list = extractUrlsFromText(payload?.text).map((u) => ({ url: u }));
  if (list.length === 0)
    list = [
      {
        url: `https://news.google.com/search?q=${encodeURIComponent(
          questionTitle
        )}`,
      },
    ];

  for (const s of list) {
    await prisma.sourceLink.create({
      data: { url: normHttp(s.url), discussionId: discId },
    });
  }
}

/* ========= Types UI (tolérants) ========= */
type Source = { url: string };
type UIComment = {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  side: 'pour' | 'contre';
  parentId?: number;
  sources?: Source[];
  views?: number;
};
type UIDiscussion = {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
  sources?: Source[];
};
type QuestionDetails = {
  id: number;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  pour: number;
  contre: number;
  views: number;
  description?: string;
  totalComments?: number;
  badges?: string[];
  comments?: UIComment[];
  discussions?: UIDiscussion[];
  sources?: Source[];
  questionSources?: Source[];
};

/* ========= Charger les mocks (sans top-level await) ========= */
async function loadMocks(): Promise<Record<string, QuestionDetails> | null> {
  try {
    // @ts-ignore
    const mod = await import('../src/data/questionsData');
    console.log('📦 Mocks via ../src/data/questionsData');
    return (mod.QUESTIONS_DATA || null) as Record<string, QuestionDetails> | null;
  } catch {
    try {
      // @ts-ignore
      const mod2 = await import('../src/app/data/questionsData');
      console.log('📦 Mocks via ../src/app/data/questionsData');
      return (mod2.QUESTIONS_DATA || null) as Record<string, QuestionDetails> | null;
    } catch {
      console.warn('⚠️ Mocks introuvables, fallback minimal.');
      return {
        demo: {
          id: 1,
          title: 'Is nuclear energy the solution to climate change?',
          category: 'environment',
          author: 'alice',
          timeAgo: 'now',
          pour: 10,
          contre: 5,
          views: 100,
          description: 'Demo seed question.',
          totalComments: 0,
          badges: ['trending'],
          comments: [
            {
              id: 1001,
              text: 'Pro: stable baseload (iaea.org, world-nuclear.org).',
              author: 'Nora',
              timeAgo: '2h',
              votes: 12,
              userVote: null,
              side: 'pour',
              sources: [{ url: 'https://iaea.org' }],
              views: 30,
            },
            {
              id: 2001,
              text: 'Con: waste mgmt costs (reuters.com / ft.com).',
              author: 'Leo',
              timeAgo: '1h',
              votes: 4,
              userVote: null,
              side: 'contre',
              views: 20,
            },
          ],
          discussions: [
            {
              id: 5001,
              text: 'Regional grids differ (who.int).',
              author: 'Jon',
              timeAgo: '3h',
              likes: 2,
              replies: 0,
              sources: [{ url: 'https://who.int' }],
            },
          ],
          sources: [{ url: 'https://en.wikipedia.org/wiki/Nuclear_power' }],
        },
      };
    }
  }
}

/* ========= Seed ========= */
async function main() {
  console.log('⏳ Seeding DB from mocks…');

  const QUESTIONS_DATA = await loadMocks();
  if (!QUESTIONS_DATA || Object.keys(QUESTIONS_DATA).length === 0) {
    console.log('❌ Aucun mock — arrêt.');
    return;
  }

  // 1) Auteurs
  const allAuthors = new Set<string>(['you']);
  Object.values(QUESTIONS_DATA).forEach((q) => {
    if (q.author) allAuthors.add(q.author);
    (q.comments || []).forEach((c) => allAuthors.add(c.author));
    (q.discussions || []).forEach((d) => allAuthors.add(d.author));
  });

  const usersMap = new Map<string, string>();
  for (const username of allAuthors) {
    const u = await upsertUser(username);
    usersMap.set(username, u.id);
  }

  // 2) Questions
  for (const q of Object.values(QUESTIONS_DATA)) {
    const slug = slugify(q.title);
    const authorId = usersMap.get(q.author) || usersMap.get('you')!;

    const comments = q.comments || [];
    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => !!c.parentId);

    const forCount = topLevel.filter((c) => c.side === 'pour').length;
    const againstCount = topLevel.filter((c) => c.side === 'contre').length;

    const votesA = toInt(q.pour);
    const votesB = toInt(q.contre);
    const viewsCount = toInt(q.views);
    const argumentsCount = toInt(topLevel.length);
    const argumentsACount = toInt(forCount);
    const argumentsBCount = toInt(againstCount);
    const discussionsCount = toInt((q.discussions || []).length);

    const question = await prisma.question.upsert({
      where: { slug },
      update: {
        title: q.title,
        description: q.description || '',
        category: q.category || 'general',
        badges: q.badges || [],
        viewsCount,
        votesACount: votesA,
        votesBCount: votesB,
        argumentsCount,
        argumentsACount,
        argumentsBCount,
        discussionsCount,
      },
      create: {
        slug,
        title: q.title,
        description: q.description || '',
        category: q.category || 'general',
        badges: q.badges || [],
        authorId,
        viewsCount,
        votesACount: votesA,
        votesBCount: votesB,
        argumentsCount,
        argumentsACount,
        argumentsBCount,
        discussionsCount,
      },
    });

    // Sources au niveau question (directes)
    const qDirect = coerceSources(q);
    for (const s of qDirect) {
      await prisma.sourceLink.create({
        data: { url: s.url, questionId: question.id },
      });
    }

    // ——— Arguments top-level
    const mapTempIdToRealId = new Map<number, string>();
    for (const c of topLevel) {
      const auId = usersMap.get(c.author) || usersMap.get('you')!;
      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId: auId,
          side: c.side as Side,
          text: c.text,
          votes: toInt(c.votes),
          views: toInt(c.views),
        },
      });
      mapTempIdToRealId.set(c.id, created.id);

      // Sources (argument)
      await attachSourcesForArgument(created.id, c, q.title);
    }

    // ——— Replies
    for (const c of replies) {
      const auId = usersMap.get(c.author) || usersMap.get('you')!;
      const parentReal = mapTempIdToRealId.get(c.parentId!);
      if (!parentReal) continue;

      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId: auId,
          side: c.side as Side,
          text: c.text,
          votes: toInt(c.votes),
          views: toInt(c.views),
          parentId: parentReal,
        },
      });

      // Sources (reply)
      await attachSourcesForArgument(created.id, c, q.title);
    }

    // ——— Discussions
    for (const d of q.discussions || []) {
      const auId = usersMap.get(d.author) || usersMap.get('you')!;
      const disc = await prisma.discussion.create({
        data: {
          questionId: question.id,
          authorId: auId,
          text: d.text,
          likes: toInt(d.likes),
          replies: toInt(d.replies),
        },
      });

      // Sources (discussion)
      await attachSourcesForDiscussion(disc.id, d, q.title);
    }

    // ——— Agrégation / fallback question-level si aucune source directe
    if (qDirect.length === 0) {
      const encodedQ = encodeURIComponent(q.title);
      const wikiSlug = slugify(q.title);
      const forcedFallback = [
        `https://news.google.com/search?q=${encodedQ}`,
        `https://en.wikipedia.org/wiki/${wikiSlug}`,
      ];
      for (const u of forcedFallback) {
        await prisma.sourceLink.create({
          data: { url: u, questionId: question.id },
        });
      }
    }

    // ——— lastActivityAt (approximatif)
    const activityBoost = Math.max(argumentsCount + discussionsCount, 1);
    await prisma.question.update({
      where: { id: question.id },
      data: {
        lastActivityAt: new Date(
          Date.now() - Math.min(activityBoost * 60000, 12 * 3600000)
        ),
      },
    });
  }

  console.log('✅ Seed completed.');
}

/* ========= Run ========= */
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
