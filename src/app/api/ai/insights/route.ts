import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';
import { prisma } from '@/lib/prisma';
import { translateInsights, detectUserLanguage, type SupportedLanguage } from '@/lib/translation';

export const runtime = 'nodejs';
export const maxDuration = 30;

const CACHE_DURATION_HOURS = 6;
const MAX_STALE_HOURS = 168;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get('questionId');
    const slug = searchParams.get('slug');
    const forceRefresh = searchParams.get('refresh') === 'true';
    const requestedLang = searchParams.get('lang') as SupportedLanguage | null;

    // Détecter la langue de l'utilisateur
    const acceptLanguage = req.headers.get('accept-language') || undefined;
    const userLang = requestedLang || detectUserLanguage(acceptLanguage);

    if (!questionId && !slug) {
      return NextResponse.json({ error: 'questionId or slug required' }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: questionId ? { id: questionId } : { slug: slug! },
      select: {
        id: true,
        title: true,
        description: true,
        votesACount: true,
        votesBCount: true,
        aiInsights: true,
        aiInsightsUpdatedAt: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const now = new Date();
    const cacheAge = question.aiInsightsUpdatedAt 
      ? (now.getTime() - new Date(question.aiInsightsUpdatedAt).getTime()) / (1000 * 60 * 60)
      : 999;

    const cachedData = question.aiInsights as any;
    const hasCachedInsights = cachedData && 
      typeof cachedData === 'object' && 
      Object.keys(cachedData).length > 0;

    // Vérifier si on a la langue demandée en cache
    const hasRequestedLang = hasCachedInsights && cachedData[userLang];
    const hasEnglish = hasCachedInsights && cachedData['en'];

    // DEBUG LOGS
    console.log('[AI] 🔍 Request lang:', userLang);
    console.log('[AI] 🔍 Has cached insights:', hasCachedInsights);
    console.log('[AI] 🔍 Has requested lang:', hasRequestedLang);
    console.log('[AI] 🔍 Has English:', hasEnglish);
    console.log('[AI] 🔍 Cache keys:', cachedData ? Object.keys(cachedData) : 'none');
    console.log('[AI] 🔍 Cache age (hours):', cacheAge.toFixed(2));

    // Fresh cache dans la langue demandée
    if (!forceRefresh && hasRequestedLang && cacheAge < CACHE_DURATION_HOURS) {
      return NextResponse.json({
        ok: true,
        insights: cachedData[userLang],
        cached: true,
        fresh: true,
        age: Math.round(cacheAge * 60),
        lang: userLang,
      });
    }

    // Stale cache: return old + regenerate async
    if (!forceRefresh && hasRequestedLang && cacheAge >= CACHE_DURATION_HOURS && cacheAge < MAX_STALE_HOURS) {
      regenerateInsightsAsync(question.id, question.title, question.description, question.votesACount, question.votesBCount);
      
      return NextResponse.json({
        ok: true,
        insights: cachedData[userLang],
        cached: true,
        stale: true,
        age: Math.round(cacheAge * 60),
        lang: userLang,
      });
    }

    // Si on a l'anglais mais pas la langue demandée, traduire
    if (hasEnglish && userLang !== 'en' && !forceRefresh) {
      console.log(`[AI] Translating from EN to ${userLang}...`);
      
      const translated = await translateInsights(cachedData['en'], userLang);
      
      // Sauvegarder la traduction
      await prisma.question.update({
        where: { id: question.id },
        data: {
          aiInsights: {
            ...cachedData,
            [userLang]: translated,
          },
        },
      });

      return NextResponse.json({
        ok: true,
        insights: translated,
        cached: false,
        translated: true,
        lang: userLang,
      });
    }

    // Generate synchronously (toujours en anglais d'abord)
    const args = await prisma.argument.findMany({
      where: { questionId: question.id, parentId: null },
      orderBy: { votes: 'desc' },
      take: 10,
      select: { text: true, side: true, votes: true },
    });

    const insightsEN = await generateInsights(
      question.title,
      question.description,
      question.votesACount,
      question.votesBCount,
      args
    );

    // Traduire si langue demandée n'est pas anglais
    let insightsToReturn = insightsEN;
    const translations: Record<string, any> = { en: insightsEN };

    if (userLang !== 'en') {
      console.log(`[AI] Translating to ${userLang}...`);
      insightsToReturn = await translateInsights(insightsEN, userLang);
      translations[userLang] = insightsToReturn;
    }

    await prisma.question.update({
      where: { id: question.id },
      data: {
        aiInsights: translations,
        aiInsightsUpdatedAt: now,
      },
    });

    return NextResponse.json({
      ok: true,
      insights: insightsToReturn,
      cached: false,
      generated: true,
      lang: userLang,
    });

  } catch (error: any) {
    console.error('AI insights error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateInsights(
  title: string,
  description: string | null,
  votesACount: number,
  votesBCount: number,
  args: { text: string; side: string; votes: number }[]
) {
  const argsFor = args.filter(a => a.side === 'pour').map(a => `- ${a.text} (${a.votes} votes)`).join('\n');
  const argsAgainst = args.filter(a => a.side === 'contre').map(a => `- ${a.text} (${a.votes} votes)`).join('\n');

  const prompt = `Analyze this debate thoroughly and provide structured insights in JSON format.

**DEBATE QUESTION:**
${title}

**DESCRIPTION:**
${description || 'No additional context provided'}

**VOTE DISTRIBUTION:**
- FOR: ${votesACount} votes
- AGAINST: ${votesBCount} votes
- Total votes: ${votesACount + votesBCount}

**TOP ARGUMENTS FOR:**
${argsFor || 'No arguments yet'}

**TOP ARGUMENTS AGAINST:**
${argsAgainst || 'No arguments yet'}

---

**REQUIRED OUTPUT FORMAT (valid JSON):**

{
  "summary": "2-3 sentence overview of the debate landscape",
  
  "keyTakeaways": [
    "3-5 most important points from both sides"
  ],
  
  "topArguments": {
    "pour": ["strongest pro argument", "second strongest pro argument"],
    "contre": ["strongest con argument", "second strongest con argument"]
  },
  
  "missingAngles": [
    "2-4 perspectives or aspects not yet covered in the debate"
  ],
  
  "biases": [
    "2-4 cognitive biases, logical fallacies, or skewed reasoning patterns observed"
  ],
  
  "counterArgumentsToTest": [
    "3-5 strong counter-arguments that would challenge the dominant position",
    "Frame as: 'What if...' or 'How would X respond to...' questions"
  ],
  
  "factCheckCues": [
    "3-6 specific claims or statistics that should be fact-checked",
    "Format: 'Claim: [statement] - Needs verification: [what to check]'"
  ],
  
  "plainLanguageVerdict": "2-3 sentence plain-English summary of where the debate stands right now, without jargon",
  
  "verdictChangers": [
    "2-4 specific events, data, or arguments that could significantly shift the debate outcome",
    "Format: 'If [condition], then [likely impact]'"
  ],
  
  "scores": {
    "evidenceDensity": <number 0-10>,
    "argumentDiversity": <number 0-10>,
    "controversyLevel": <number 0-10>,
    "reliability": <number 0-10>
  },
  
  "toneSentiment": "<neutral|positive|negative>",
  "debateMaturity": "<early|developing|mature>",
  "consensusLikelihood": "<low|medium|high>",
  
  "riskBenefitMap": {
    "risks": ["3-5 potential risks or downsides mentioned or implied"],
    "benefits": ["3-5 potential benefits or upsides mentioned or implied"]
  },
  
  "stakeholders": [
    "3-6 groups of people who are directly affected by this debate outcome",
    "Format: [Group name]: [how they're affected]"
  ],
  
  "relatedQuestions": [
    "3-5 related questions that naturally follow from this debate",
    "Make them specific and actionable, not generic"
  ],
  
  "dataGaps": [
    "2-4 key pieces of data, research, or information that are missing",
    "If these were available, they could help resolve the debate"
  ]
}

**SCORING GUIDELINES:**

- **evidenceDensity (0-10)**: How well arguments are backed by facts, data, sources, studies
  - 0-3: Mostly opinions, no sources
  - 4-6: Some facts, limited sources
  - 7-10: Well-sourced, data-driven arguments

- **argumentDiversity (0-10)**: Variety of perspectives and argument types
  - 0-3: Very one-sided or repetitive
  - 4-6: Moderate variety, some repetition
  - 7-10: Rich diversity of viewpoints and reasoning styles

- **controversyLevel (0-10)**: How divisive/polarized the debate is
  - 0-3: Broad consensus
  - 4-6: Moderate disagreement
  - 7-10: Highly polarized, emotional

- **reliability (0-10)**: Overall quality and trustworthiness
  - 0-3: Many logical fallacies, poor reasoning
  - 4-6: Mixed quality
  - 7-10: Strong logic, good faith arguments

- **toneSentiment**: Overall emotional tone (neutral/positive/negative)

- **debateMaturity**: 
  - early: < 10 arguments, surface-level
  - developing: 10-30 arguments, some depth
  - mature: 30+ arguments, nuanced discussion

- **consensusLikelihood**: Can this debate reach consensus?
  - low: Values-based, polarized
  - medium: Factual disagreements, room for compromise
  - high: Technical question, evidence could resolve

**SPRINT 3 GUIDELINES:**

- **riskBenefitMap**: Extract actual risks/benefits mentioned in arguments
  - Don't invent risks/benefits not discussed
  - Be specific, not generic ("job loss in manufacturing" not "economic impact")

- **stakeholders**: Identify who's affected based on the debate content
  - Be concrete: "Small business owners", "Parents of school-age children"
  - Explain the impact briefly

- **relatedQuestions**: Suggest natural follow-up questions
  - Should flow logically from this debate
  - Avoid generic questions that apply to everything
  - Format as actual questions with question marks

- **dataGaps**: What information would help resolve uncertainty?
  - Be specific about what data/research is needed
  - Focus on things that could actually be researched
  - Prioritize gaps that multiple arguments reference

**IMPORTANT:**
- All text in English
- Be specific, not generic
- Base analysis on provided arguments, not general knowledge
- Scores should reflect actual debate content, not theoretical ideals
- Keep each item concise (1-2 sentences max)
- Ensure valid JSON syntax`;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert debate analyst. Analyze debates objectively, identify biases, and provide actionable insights. Always respond in valid JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('No OpenAI response');

  // Log usage pour monitoring
  const usage = completion.usage;
  if (usage) {
    const cost = ((usage.prompt_tokens / 1_000_000) * 0.15) + ((usage.completion_tokens / 1_000_000) * 0.60);
    console.log(`[AI] Generated insights - Tokens: ${usage.total_tokens}, Cost: ~$${cost.toFixed(4)}`);
  }

  return JSON.parse(content);
}

function regenerateInsightsAsync(
  questionId: string,
  title: string,
  description: string | null,
  votesACount: number,
  votesBCount: number
) {
  setTimeout(async () => {
    try {
      console.log(`[AI] Async regeneration for ${questionId}`);
      
      const args = await prisma.argument.findMany({
        where: { questionId, parentId: null },
        orderBy: { votes: 'desc' },
        take: 10,
        select: { text: true, side: true, votes: true },
      });

      const insights = await generateInsights(title, description, votesACount, votesBCount, args);

      await prisma.question.update({
        where: { id: questionId },
        data: {
          aiInsights: insights,
          aiInsightsUpdatedAt: new Date(),
        },
      });

      console.log(`[AI] Regeneration complete for ${questionId}`);
    } catch (err) {
      console.error(`[AI] Async regeneration error:`, err);
    }
  }, 100);
}