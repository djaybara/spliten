// scripts/regenerate-all-insights.ts
// Usage: npx tsx scripts/regenerate-all-insights.ts

import { prisma } from '../src/lib/prisma';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BATCH_SIZE = 5; // Nombre de questions à traiter en parallèle
const DELAY_BETWEEN_BATCHES = 2000; // 2 secondes entre chaque batch

async function regenerateAllInsights() {
  console.log('🚀 Starting insights regeneration...\n');

  // 1. Récupérer toutes les questions sans insights
  const questions = await prisma.question.findMany({
    where: {
      OR: [
        { aiInsights: { equals: {} } },
        { aiInsightsUpdatedAt: null }
      ]
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`📊 Found ${questions.length} questions without insights\n`);

  if (questions.length === 0) {
    console.log('✅ All questions already have insights!');
    return;
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;

  // 2. Traiter par batches
  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(questions.length / BATCH_SIZE)}`);
    console.log(`   Questions ${i + 1}-${Math.min(i + BATCH_SIZE, questions.length)} of ${questions.length}`);

    // Traiter le batch en parallèle
    const results = await Promise.allSettled(
      batch.map(async (question) => {
        const startTime = Date.now();
        
        try {
          console.log(`   ⏳ Generating: ${question.title.substring(0, 50)}...`);
          
          const response = await fetch(
            `${BASE_URL}/api/ai/insights?slug=${question.slug}&refresh=true`
          );

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`HTTP ${response.status}: ${error}`);
          }

          const data = await response.json();
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);

          if (data.ok && data.insights) {
            console.log(`   ✅ Success (${duration}s): ${question.title.substring(0, 50)}...`);
            return { success: true, question };
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error: any) {
          const duration = ((Date.now() - startTime) / 1000).toFixed(1);
          console.error(`   ❌ Failed (${duration}s): ${question.title.substring(0, 50)}...`);
          console.error(`      Error: ${error.message}`);
          return { success: false, question, error: error.message };
        }
      })
    );

    // Compter les résultats
    results.forEach((result) => {
      processed++;
      if (result.status === 'fulfilled' && result.value.success) {
        succeeded++;
      } else {
        failed++;
      }
    });

    // Afficher progression
    console.log(`\n   📈 Progress: ${processed}/${questions.length} (${succeeded} ✅, ${failed} ❌)`);

    // Attendre entre les batches (sauf pour le dernier)
    if (i + BATCH_SIZE < questions.length) {
      console.log(`   ⏸️  Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // 3. Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 REGENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total processed:  ${processed}`);
  console.log(`Succeeded:        ${succeeded} ✅`);
  console.log(`Failed:           ${failed} ❌`);
  console.log(`Success rate:     ${((succeeded / processed) * 100).toFixed(1)}%`);
  
  const estimatedCost = succeeded * 0.006;
  console.log(`Estimated cost:   ~$${estimatedCost.toFixed(3)}`);
  console.log('='.repeat(60));

  // 4. Vérification finale
  const withInsights = await prisma.question.count({
    where: {
      aiInsights: { not: { equals: {} } }
    }
  });

  console.log(`\n✅ Questions with insights: ${withInsights}/${questions.length + withInsights - failed}`);
}

// Exécution
regenerateAllInsights()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });