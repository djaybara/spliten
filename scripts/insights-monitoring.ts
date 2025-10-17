// scripts/insights-monitoring.ts
// Usage: npx tsx scripts/insights-monitoring.ts

import { prisma } from '../src/lib/prisma';

async function monitorInsights() {
  console.log('📊 AI Insights Monitoring Report');
  console.log('='.repeat(60));
  console.log(`Generated at: ${new Date().toISOString()}\n`);

  // 1. Récupérer toutes les questions avec insights
  const allQuestions = await prisma.question.findMany({
    select: {
      title: true,
      slug: true,
      aiInsights: true,
      aiInsightsUpdatedAt: true,
      votesACount: true,
      votesBCount: true,
      createdAt: true
    }
  });

  const totalQuestions = allQuestions.length;
  
  // Filtrer ceux qui ont vraiment des insights
  const questionsWithInsights = allQuestions.filter(q => 
    q.aiInsights && 
    typeof q.aiInsights === 'object' && 
    Object.keys(q.aiInsights).length > 0
  );
  
  const withInsights = questionsWithInsights.length;
  const withoutInsights = totalQuestions - withInsights;

  console.log('📈 GLOBAL STATS');
  console.log('-'.repeat(60));
  console.log(`Total questions:          ${totalQuestions}`);
  console.log(`With insights:            ${withInsights} (${((withInsights / totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`Without insights:         ${withoutInsights} (${((withoutInsights / totalQuestions) * 100).toFixed(1)}%)`);

  // 2. Fraîcheur du cache
  const now = Date.now();
  
  const fresh = questionsWithInsights.filter(q => 
    q.aiInsightsUpdatedAt && (now - new Date(q.aiInsightsUpdatedAt).getTime()) < 6 * 60 * 60 * 1000
  ).length;
  
  const stale = questionsWithInsights.filter(q => 
    q.aiInsightsUpdatedAt && 
    (now - new Date(q.aiInsightsUpdatedAt).getTime()) >= 6 * 60 * 60 * 1000 &&
    (now - new Date(q.aiInsightsUpdatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length;

  const expired = questionsWithInsights.filter(q =>
    q.aiInsightsUpdatedAt && (now - new Date(q.aiInsightsUpdatedAt).getTime()) >= 7 * 24 * 60 * 60 * 1000
  ).length;

  const neverGenerated = questionsWithInsights.filter(q => !q.aiInsightsUpdatedAt).length;

  console.log('\n⏰ CACHE FRESHNESS');
  console.log('-'.repeat(60));
  console.log(`< 6 hours (fresh)         ${fresh}`);
  console.log(`6h - 7 days (stale)       ${stale}`);
  console.log(`> 7 days (expired)        ${expired}`);
  console.log(`Never generated           ${neverGenerated}`);

  // 3. Estimation des coûts
  const COST_PER_GENERATION = 0.006;
  const totalGenerations = withInsights;
  const estimatedTotalCost = totalGenerations * COST_PER_GENERATION;

  const monthlyRegenerations = stale > 0 ? (stale / 7) * 30 : 0;
  const estimatedMonthlyCost = monthlyRegenerations * COST_PER_GENERATION;

  console.log('\n💰 COST ESTIMATES');
  console.log('-'.repeat(60));
  console.log(`Total generations:        ${totalGenerations}`);
  console.log(`Estimated total cost:     $${estimatedTotalCost.toFixed(2)}`);
  console.log(`Stale insights (>6h):     ${stale}`);
  console.log(`Est. monthly regens:      ${Math.round(monthlyRegenerations)}`);
  console.log(`Est. monthly cost:        $${estimatedMonthlyCost.toFixed(2)}`);

  // 4. Top questions par vues
  if (questionsWithInsights.length > 0) {
    const topQuestions = questionsWithInsights
      .sort((a, b) => (b.votesACount + b.votesBCount) - (a.votesACount + a.votesBCount))
      .slice(0, 5);

    console.log('\n🔥 TOP 5 QUESTIONS (by votes)');
    console.log('-'.repeat(60));
    topQuestions.forEach((q, idx) => {
      const totalVotes = q.votesACount + q.votesBCount;
      const age = q.aiInsightsUpdatedAt 
        ? Math.round((now - new Date(q.aiInsightsUpdatedAt).getTime()) / (1000 * 60 * 60))
        : null;
      console.log(`${idx + 1}. ${q.title.substring(0, 45)}...`);
      console.log(`   Votes: ${totalVotes} | Cache age: ${age ? age + 'h' : 'N/A'}`);
    });
  }

  // 5. Questions sans insights
  if (withoutInsights > 0) {
    const questionsWithoutInsights = allQuestions
      .filter(q => !q.aiInsights || typeof q.aiInsights !== 'object' || Object.keys(q.aiInsights).length === 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    console.log(`\n⚠️  QUESTIONS WITHOUT INSIGHTS (showing ${Math.min(10, withoutInsights)} of ${withoutInsights})`);
    console.log('-'.repeat(60));
    questionsWithoutInsights.forEach((q, idx) => {
      console.log(`${idx + 1}. ${q.title.substring(0, 50)}...`);
      console.log(`   Slug: ${q.slug}`);
    });
  }

  // 6. Recommandations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(60));
  
  if (withoutInsights > 0) {
    console.log(`⚠️  ${withoutInsights} questions need insights generation`);
    console.log('   → Run: npx tsx scripts/regenerate-all-insights.ts');
    console.log('   → Or visit questions to trigger auto-generation');
  } else {
    console.log('✅ All questions have insights!');
  }
  
  if (stale > 5) {
    console.log(`⚠️  ${stale} insights are stale (>6h old)`);
    console.log('   → They will auto-regenerate on next visit');
  }

  if (withInsights > 0) {
    const freshRate = ((fresh / withInsights) * 100).toFixed(1);
    if (parseFloat(freshRate) > 80) {
      console.log('✅ Cache freshness is good (>80%)');
    } else if (parseFloat(freshRate) > 0) {
      console.log(`⚠️  Cache freshness is ${freshRate}% (target: >80%)`);
    } else {
      console.log('ℹ️  All insights need generation (cache is empty)');
    }
  }

  console.log('\n' + '='.repeat(60));
}

// Exécution
monitorInsights()
  .then(() => {
    console.log('\n✅ Monitoring complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Monitoring failed:', error);
    process.exit(1);
  });