// prisma/seed.ts
import { PrismaClient, Side } from '@prisma/client';

const prisma = new PrismaClient();

// ——— Helpers ———
const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function upsertUser(username: string, email?: string) {
  const mail = email || `${username}@example.com`;
  return prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, email: mail }
  });
}

// Essaie d’importer TES mocks existants
type Source = { url: string };
type UIComment = {
  id: number; text: string; author: string; timeAgo: string;
  votes: number; userVote: 'up'|'down'|null; side: 'pour'|'contre';
  parentId?: number; sources?: Source[]; views?: number;
};
type UIDiscussion = {
  id: number; text: string; author: string; timeAgo: string;
  likes: number; replies: number; sources?: Source[];
};
type QuestionDetails = {
  id: number; title: string; category: string; author: string; timeAgo: string;
  pour: number; contre: number; views: number;
  description?: string; totalComments?: number;
  badges?: string[]; comments?: UIComment[]; discussions?: UIDiscussion[];
};

let QUESTIONS_DATA: Record<string, QuestionDetails> | null = null;
try {
  // ⚠️ adapte si ton alias est différent (ex: "../../../src/…")
  // selon ta conf tsconfig paths, tu peux devoir pointer un chemin relatif.
  // @ts-ignore
  const mod = await import('../src/data/questionsData');
  QUESTIONS_DATA = (mod.QUESTIONS_DATA || null) as Record<string, QuestionDetails> | null;
} catch {
  // Fallback minuscule si l'import échoue — au moins 1 question pour valider la pipeline
  QUESTIONS_DATA = {
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
        { id: 1001, text: 'Pro: stable baseload.', author: 'Nora', timeAgo: '2h', votes: 12, userVote: null, side: 'pour', sources:[{url:'https://iaea.org'}], views: 30 },
        { id: 2001, text: 'Con: waste mgmt costs.', author: 'Leo', timeAgo: '1h', votes: 4, userVote: null, side: 'contre', views: 20 },
      ],
      discussions: [
        { id: 5001, text: 'Regional grids differ.', author: 'Jon', timeAgo: '3h', likes: 2, replies: 0 }
      ]
    }
  };
}

async function main() {
  console.log('⏳ Seeding DB from mocks…');

  // 1) Auteur générique "you" + auteurs trouvés dans les mocks
  const allAuthors = new Set<string>(['you']);
  Object.values(QUESTIONS_DATA || {}).forEach(q => {
    if (q.author) allAuthors.add(q.author);
    (q.comments || []).forEach(c => allAuthors.add(c.author));
    (q.discussions || []).forEach(d => allAuthors.add(d.author));
  });

  const usersMap = new Map<string, string>(); // username -> userId
  for (const username of allAuthors) {
    const u = await upsertUser(username);
    usersMap.set(username, u.id);
  }

  // 2) Questions
  for (const q of Object.values(QUESTIONS_DATA || {})) {
    const slug = slugify(q.title);
    const authorId = usersMap.get(q.author) || usersMap.get('you')!;
    const question = await prisma.question.upsert({
      where: { slug },
      update: {
        title: q.title,
        description: q.description || '',
        category: q.category || 'general',
      },
      create: {
        slug,
        title: q.title,
        description: q.description || '',
        category: q.category || 'general',
        authorId,
      }
    });

    // 3) Arguments top-level + replies
    const mapTempIdToRealId = new Map<number, string>();

    const comments = (q.comments || []).filter(c => !c.parentId);
    for (const c of comments) {
      const authorId = usersMap.get(c.author) || usersMap.get('you')!;
      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId,
          side: c.side as Side,
          text: c.text,
          votes: c.votes || 0,
          views: c.views || 0,
        }
      });
      mapTempIdToRealId.set(c.id, created.id);

      // sources
      for (const s of c.sources || []) {
        await prisma.sourceLink.create({
          data: { url: s.url, argumentId: created.id }
        });
      }
    }

    // replies
    const replies = (q.comments || []).filter(c => !!c.parentId);
    for (const c of replies) {
      const authorId = usersMap.get(c.author) || usersMap.get('you')!;
      const parentReal = mapTempIdToRealId.get(c.parentId!);
      if (!parentReal) continue;
      const created = await prisma.argument.create({
        data: {
          questionId: question.id,
          authorId,
          side: c.side as Side,
          text: c.text,
          votes: c.votes || 0,
          views: c.views || 0,
          parentId: parentReal
        }
      });
      for (const s of c.sources || []) {
        await prisma.sourceLink.create({
          data: { url: s.url, argumentId: created.id }
        });
      }
    }

    // 4) Discussions
    for (const d of (q.discussions || [])) {
      const authorId = usersMap.get(d.author) || usersMap.get('you')!;
      const disc = await prisma.discussion.create({
        data: {
          questionId: question.id,
          authorId,
          text: d.text,
          likes: d.likes || 0,
          replies: d.replies || 0
        }
      });
      for (const s of d.sources || []) {
        await prisma.sourceLink.create({
          data: { url: s.url, discussionId: disc.id }
        });
      }
    }

    // 5) Sources au niveau question (si tu en as — ex. questionSources)
    // Ici on laisse vide par défaut; adapte si tu as un tableau global de sources par question.
  }

  console.log('✅ Seed completed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
