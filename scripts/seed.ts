// scripts/seed.ts
import { PrismaClient } from '@prisma/client';
import { seedQuestions } from '../prisma/seed-data';

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 120);
}

async function ensureDemoUser() {
  await prisma.user.upsert({
    where: { id: 'demo-user' },
    update: { updatedAt: new Date() },
    create: {
      id: 'demo-user',
      email: 'demo@example.com',
      username: 'demo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

async function main() {
  await ensureDemoUser();

  for (const q of seedQuestions) {
    const base = slugify(q.title);
    // upsert par slug pour éviter les doublons si tu relances
    await prisma.question.upsert({
      where: { slug: base },
      update: {},
      create: {
        slug: base,
        title: q.title,
        labelA: q.labelA ?? 'Yes',
        labelB: q.labelB ?? 'No',
        category: q.category ?? 'general',
        authorId: 'demo-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log(`✅ Seed ok : ${seedQuestions.length} questions`);
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
