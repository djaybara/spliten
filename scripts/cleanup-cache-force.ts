import { prisma } from '../src/lib/prisma';
import { Prisma } from '@prisma/client';

async function cleanup() {
  console.log('🧹 Force cleaning cache...\n');

  // Version 1 : Via SQL brut (le plus fiable)
  try {
    await prisma.$executeRaw`
      UPDATE "Question" 
      SET "aiInsights" = '{}'::jsonb, "aiInsightsUpdatedAt" = NULL
    `;
    
    console.log('✅ SQL cleanup executed\n');
  } catch (error) {
    console.error('❌ SQL method failed:', error);
    console.log('Trying alternative method...\n');
    
    // Version 2 : Via Prisma updateMany
    await prisma.question.updateMany({
      data: {
        aiInsights: Prisma.JsonNull,
        aiInsightsUpdatedAt: null
      }
    });
    
    console.log('✅ Prisma cleanup executed\n');
  }

  // Vérification
  const check = await prisma.question.findFirst({
    select: {
      title: true,
      aiInsights: true,
      aiInsightsUpdatedAt: true
    }
  });

  console.log('📊 Sample verification:');
  console.log(`Title: ${check?.title}`);
  console.log(`aiInsights:`, check?.aiInsights);
  console.log(`aiInsightsUpdatedAt:`, check?.aiInsightsUpdatedAt);
  
  const isEmpty = !check?.aiInsights || 
                  (typeof check.aiInsights === 'object' && Object.keys(check.aiInsights).length === 0);
  
  console.log(`\n${isEmpty ? '✅' : '❌'} Insights are ${isEmpty ? 'EMPTY' : 'NOT EMPTY'}`);
  console.log(`${check?.aiInsightsUpdatedAt === null ? '✅' : '❌'} Timestamp is ${check?.aiInsightsUpdatedAt === null ? 'NULL' : 'SET'}`);
}

cleanup()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });