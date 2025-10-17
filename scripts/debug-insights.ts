// scripts/debug-insights.ts
import { prisma } from '../src/lib/prisma';

async function debug() {
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      aiInsights: true,
      aiInsightsUpdatedAt: true
    }
  });

  console.log('🔍 DEBUG: Raw database content\n');
  
  questions.forEach((q, i) => {
    console.log(`${i + 1}. ${q.title}`);
    console.log(`   Type of aiInsights:`, typeof q.aiInsights);
    console.log(`   Value:`, JSON.stringify(q.aiInsights));
    console.log(`   Is null:`, q.aiInsights === null);
    console.log(`   Is {}:`, JSON.stringify(q.aiInsights) === '{}');
    console.log(`   Keys count:`, q.aiInsights && typeof q.aiInsights === 'object' ? Object.keys(q.aiInsights).length : 'N/A');
    console.log(`   UpdatedAt:`, q.aiInsightsUpdatedAt);
    
    // Test de la condition du monitoring
    const notEmpty = q.aiInsights && 
                     typeof q.aiInsights === 'object' && 
                     Object.keys(q.aiInsights as object).length > 0;
    
    console.log(`   Monitoring sees as: ${notEmpty ? '❌ WITH insights' : '✅ WITHOUT insights'}\n`);
  });
}

debug().then(() => process.exit(0)).catch(console.error);