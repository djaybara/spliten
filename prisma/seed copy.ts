// prisma/seed.ts
import { PrismaClient, Side } from '@prisma/client';

const prisma = new PrismaClient();

/* ========= Helpers ========= */
const slugify = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const norm = (u?: string) => (u ? (/^https?:\/\//i.test(u) ? u : `https://${u}`) : '');
const toInt = (v: any, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

async function upsertUser(username: string, email?: string) {
  const mail = email || `${username}@example.com`;
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, email: mail },
  });
}

/* ==== Sources: lecture tolérante + extraction d'URL dans le texte ==== */
function extractSourcesMaybe(obj: any): { url: string }[] {
  if (!obj) return [];
  const candidates: any[] = [];
  if (Array.isArray(obj.sources)) candidates.push(obj.sources);
  if (Array.isArray(obj.questionSources)) candidates.push(obj.questionSources);
  if (Array.isArray(obj.links)) candidates.push(obj.links);
  if (Array.isArray(obj.refs)) candidates.push(obj.refs);
  if (Array.isArray(obj.source)) candidates.push(obj.source);

  const arr = candidates.find(Array.isArray) as any[] | undefined;
  if (!arr) return [];
  return arr
    .map((x) => (typeof x === 'string' ? { url: x } : x))
    .filter((x) => x && typeof x.url === 'string')
    .map((x) => ({ url: norm(x.url) }))
    .filter((x) => !!x.url);
}

const URL_RE =
  /\b((https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s)\]}<>"']*)?)/gi;
function extractUrlsFromText(text?: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = URL_RE.exec(text)) !== null) {
    const raw = (m[1] || '').trim().replace(/[.,;:!?)]*$/, '');
    const u = norm(raw);
    try {
      const parsed = new URL(u);
      if (parsed.hostname && !u.includes('@')) {
        found.add(`${parsed.protocol}//${parsed.hostname}${parsed.pathname || ''}`);
      }
    } catch {}
  }
  return Array.from(found);
}

/* ========= Types mock UI ========= */
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

/* ========= Charger les mocks (pas de top-level await) ========= */
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
            { id: 5001, text: 'Regional grids differ (who.int).', author: 'Jon', timeAgo: '3h', likes: 2, replies: 0 },
          ],
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
  console.log('📊 Questions détectées :', Object.keys(QUESTIONS_DATA).length);

  // Users
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

  // Questions
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

    // Pour agrégation des sources question-level
    const foundHostsForQuestion = new Map<string, number>();

    // Arguments top-level
    for (const c of topLevel) {
      const aId = usersMap.get(c.author) || usersMap.get('you')!;
      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId: aId,
          side: c.side as Side,
          text: c.text,
          votes: toInt(c.votes),
          views: toInt(c.views),
        },
      });

      const argSources = [
        ...extractSourcesMaybe(c),
        ...extractUrlsFromText(c.text).map((u) => ({ url: u })),
      ];
      console.log('ARG SOURCES', c.id, '=>', argSources.map((s) => s.url));
      for (const s of argSources) {
        try {
          const createdSrc = await prisma.sourceLink.create({
            data: { url: s.url, argumentId: created.id },
          });
          try {
            const host = new URL(s.url).hostname.replace(/^www\./, '');
            foundHostsForQuestion.set(host, (foundHostsForQuestion.get(host) || 0) + 1);
          } catch {}
          console.log('   ✓ created (argument)', createdSrc.id, s.url);
        } catch (e) {
          console.error('   ✗ FAIL (argument):', s.url, e);
        }
      }
    }

    // Replies
    const mapTempIdToRealId = new Map<number, string>();
    for (const c of topLevel) {
      // map pour replies
      // on le fait après la création pour récupérer created.id
      // mais comme on ne garde pas le created par c.id, on reconstruit juste ci-dessous
      // (optionnel : si tu as besoin de mapTempIdToRealId, tu peux l’alimenter au-dessus)
    }
    // refais proprement : on recalcule un index des topLevel créés (ID temporaire => réel)
    // plus simple : refais une boucle pour créer cette map
    const topLevelAgain = await prisma.argument.findMany({ where: { questionId: question.id, parentId: null } });
    // on suppose l'ordre identique aux mocks; si ce n'est pas garanti, mets un champ temp dans mocks.
    topLevel.forEach((c, i) => {
      const a = topLevelAgain[i];
      if (a) mapTempIdToRealId.set(c.id, a.id);
    });

    const onlyReplies = replies;
    for (const c of onlyReplies) {
      const parentReal = mapTempIdToRealId.get(c.parentId!);
      if (!parentReal) continue;
      const aId = usersMap.get(c.author) || usersMap.get('you')!;
      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId: aId,
          side: c.side as Side,
          text: c.text,
          votes: toInt(c.votes),
          views: toInt(c.views),
          parentId: parentReal,
        },
      });

      const repSources = [
        ...extractSourcesMaybe(c),
        ...extractUrlsFromText(c.text).map((u) => ({ url: u })),
      ];
      console.log('REPLY SOURCES', c.id, '=>', repSources.map((s) => s.url));
      for (const s of repSources) {
        try {
          const createdSrc = await prisma.sourceLink.create({
            data: { url: s.url, argumentId: created.id },
          });
          try {
            const host = new URL(s.url).hostname.replace(/^www\./, '');
            foundHostsForQuestion.set(host, (foundHostsForQuestion.get(host) || 0) + 1);
          } catch {}
          console.log('   ✓ created (reply)', createdSrc.id, s.url);
        } catch (e) {
          console.error('   ✗ FAIL (reply):', s.url, e);
        }
      }
    }

    // Discussions
    for (const d of q.discussions || []) {
      const aId = usersMap.get(d.author) || usersMap.get('you')!;
      const disc = await prisma.discussion.create({
        data: {
          questionId: question.id,
          authorId: aId,
          text: d.text,
          likes: toInt(d.likes),
          replies: toInt(d.replies),
        },
      });

      const dSources = [
        ...extractSourcesMaybe(d),
        ...extractUrlsFromText(d.text).map((u) => ({ url: u })),
      ];
      console.log('DISCUSSION SOURCES', d.id, '=>', dSources.map((s) => s.url));
      for (const s of dSources) {
        try {
          const createdSrc = await prisma.sourceLink.create({
            data: { url: s.url, discussionId: disc.id },
          });
          try {
            const host = new URL(s.url).hostname.replace(/^www\./, '');
            foundHostsForQuestion.set(host, (foundHostsForQuestion.get(host) || 0) + 1);
          } catch {}
          console.log('   ✓ created (discussion)', createdSrc.id, s.url);
        } catch (e) {
          console.error('   ✗ FAIL (discussion):', s.url, e);
        }
      }
    }

    // Sources AU NIVEAU QUESTION
    const qLevel = extractSourcesMaybe(q);
    console.log('QUESTION SOURCES direct =>', qLevel.map((s) => s.url));
    for (const s of qLevel) {
      try {
        const createdQSrc = await prisma.sourceLink.create({
          data: { url: s.url, questionId: question.id },
        });
        console.log('   ✓ created (question)', createdQSrc.id, s.url);
      } catch (e) {
        console.error('   ✗ FAIL (question):', s.url, e);
      }
    }

    // Agrégation ou Fallback
    if (qLevel.length === 0) {
      const agg = [...foundHostsForQuestion.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([host]) => `https://${host}`);

      console.log('QUESTION SOURCES aggregated =>', agg);

      const encodedQ = encodeURIComponent(q.title);
      const wikiSlug = slugify(q.title);
      const forcedFallback = [
        `https://news.google.com/search?q=${encodedQ}`,
        `https://en.wikipedia.org/wiki/${wikiSlug}`,
      ];

      const toInsert = (agg.length > 0 ? agg : forcedFallback)
        .filter((u, i, arr) => arr.indexOf(u) === i);

      for (const u of toInsert) {
        try {
          const createdAgg = await prisma.sourceLink.create({
            data: { url: u, questionId: question.id },
          });
          console.log('   ✓ created (question agg/fallback)', createdAgg.id, u);
        } catch (e) {
          console.error('   ✗ FAIL (question agg/fallback):', u, e);
        }
      }
    }

    // lastActivityAt approximative
    const activityBoost = Math.max(argumentsCount + discussionsCount, 1);
    await prisma.question.update({
      where: { id: question.id },
      data: {
        lastActivityAt: new Date(Date.now() - Math.min(activityBoost * 60000, 12 * 3600000)),
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
