// scripts/cleanup-cache-simple.ts
import { prisma } from '../src/lib/prisma';

async function cleanup() {
  console.log('🧹 Cleaning cache...\n');

  // Récupérer toutes les questions
  const questions = await prisma.question.findMany({
    select: { id: true, title: true }
  });

  console.log(`Found ${questions.length} questions\n`);

  // Nettoyer une par une
  for (const q of questions) {
    await prisma.question.update({
      where: { id: q.id },
      data: {
        aiInsights: {},
        aiInsightsUpdatedAt: null
      }
    });
    console.log(`✅ Cleaned: ${q.title.substring(0, 50)}...`);
  }

  console.log('\n✅ All done!');
}

cleanup()
  .then(() => process.exit(0))
  .catch(console.error);