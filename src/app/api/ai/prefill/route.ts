// src/app/api/ai/prefill/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';
import { CATEGORIES } from '@/lib/categories';
import SourcePills from '@/components/SourcePills';

export const runtime = 'nodejs';
export const maxDuration = 15;

export async function POST(req: NextRequest) {
  try {
    const { question, format } = await req.json();

    if (!question || question.trim().length < 10) {
      return NextResponse.json(
        { error: 'Question trop courte' },
        { status: 400 }
      );
    }

    if (format !== 'BINARY') {
      return NextResponse.json(
        { error: 'Format non supporté pour l\'instant' },
        { status: 400 }
      );
    }

    const prompt = `Generate structured content for this binary question: "${question}"

Respond with this EXACT JSON (IN ENGLISH by default, unless the question is clearly in French):

{
  "labelA": "Option 1 extracted from question (max 15 chars)",
  "labelB": "Option 2 extracted from question (max 15 chars)",
  "description": "Neutral context in 2-3 sentences",
  "argumentsFor": [
    {
      "text": "Strong argument supporting labelA (1 clear, factual sentence)",
      "source": {
        "url": "https://real-url.com",
        "label": "Source Name"
      }
    },
    {
      "text": "Second argument for labelA (different perspective)",
      "source": {
        "url": "https://real-url.com",
        "label": "Source Name"
      }
    }
  ],
  "argumentsAgainst": [
    {
      "text": "Strong argument supporting labelB (1 clear, factual sentence)",
      "source": {
        "url": "https://real-url.com",
        "label": "Source Name"
      }
    },
    {
      "text": "Second argument for labelB (different perspective)",
      "source": {
        "url": "https://real-url.com",
        "label": "Source Name"
      }
    }
  ],
  "suggestedSources": [],
  "category": "news" | "general" | "technology" | "politics" | "environment" | "work" | "lifestyle" | "entertainment" | "gaming" | "fashion" | "food" | "home" | "arts" | "science" | "sports"
}

**CRITICAL RULES:**

1. **LABELS EXTRACTION:**
   - "Trump or Biden will win?" → labelA = "Trump", labelB = "Biden"
   - "Einstein or Da Vinci?" → labelA = "Einstein", labelB = "Da Vinci"
   - "Cat or dog?" → labelA = "Cat", labelB = "Dog"
   - "Should we ban X?" → labelA = "Yes", labelB = "No"
   - "Is AI dangerous?" → labelA = "Yes", labelB = "No"

2. **Labels must be short (max 15 chars), opposite, and extracted from the question**

3. **ARGUMENTS WITH SOURCES - VERY IMPORTANT:**
   - Each argument MUST have a "text" and a "source" object
   - Each "source" object has "url" and "label"
   - "url" MUST be a real, verifiable URL from authoritative sources
   - "label" should be the readable site name (e.g., "Wikipedia", "Reuters", "Nature", "BBC")
   
4. **AUTHORITATIVE SOURCES ONLY:**
   - Wikipedia, Britannica (for general knowledge)
   - Major news: Reuters, BBC, AP News, The Guardian, NY Times
   - Academic: Nature, Science, PubMed, arXiv, IEEE
   - Government: WHO, UN, NASA, EPA, official .gov sites
   - Industry: OECD, World Bank, IMF
   - If you're not 100% certain the URL exists, use a generic authoritative source like:
     * https://en.wikipedia.org/wiki/[Topic]
     * https://www.britannica.com/topic/[Topic]
   
5. **NEVER invent fake URLs**
   - Better to use a general Wikipedia or Britannica link than a fake specific URL
   - Each of the 4 arguments MUST have a real source

6. **LANGUAGE RULES:**
   - Default: ENGLISH for everything (labels, description, arguments)
   - ONLY use French if question contains French words like "Faut-il", "devrait", etc.

7. **Arguments must be factual, specific, and verifiable**

8. **The description must be neutral and factual**

9. **Category must match the main theme**

10. **suggestedSources stays empty** (we use per-argument sources instead)`;

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting binary options from questions and providing well-sourced arguments. You ONLY cite real, authoritative sources. You respond in ENGLISH by default. You are neutral, factual, and rigorous with sources.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    const usage = completion.usage;
    if (usage) {
      const cost = ((usage.prompt_tokens / 1_000_000) * 0.15) + ((usage.completion_tokens / 1_000_000) * 0.60);
      console.log(`[AI] Prefill - Tokens: ${usage.total_tokens}, Cost: ~$${cost.toFixed(4)}`);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erreur pré-remplissage:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération' },
      { status: 500 }
    );
  }
}