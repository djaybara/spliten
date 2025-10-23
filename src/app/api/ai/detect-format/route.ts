// src/app/api/ai/detect-format/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { openai, DEFAULT_MODEL } from '@/lib/openai';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    
    if (!question || question.trim().length < 10) {
      return NextResponse.json(
        { error: 'Question trop courte (min 10 caractères)' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant qui analyse des questions et détermine le meilleur format de débat.

Pour l'instant, on supporte UNIQUEMENT le format BINARY (questions binaires oui/non, pour/contre).

Les formats POLL (choix multiples) et DISCUSSION (questions ouvertes) sont en développement et pas encore disponibles.

Réponds TOUJOURS avec ce JSON exact :
{
  "primaryFormat": "BINARY",
  "confidence": 0.0-1.0,
  "reasoning": "Courte explication de pourquoi c'est une bonne question binaire",
  "alternatives": [
    {
      "format": "POLL" ou "DISCUSSION",
      "reasoning": "Pourquoi ça pourrait marcher aussi (mais pas encore disponible)",
      "comingSoon": true
    }
  ]
}

Exemples de questions BINARY :
- "Faut-il interdire les voitures en centre-ville ?"
- "L'intelligence artificielle est-elle une menace pour l'humanité ?"
- "Le télétravail devrait-il être un droit ?"

Pour une question BINARY, donne une confidence élevée (0.85-0.95).

Si la question semble plus adaptée à un POLL ou DISCUSSION, garde BINARY comme primaryFormat mais suggère l'alternative avec comingSoon: true.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    // Log usage
    const usage = completion.usage;
    if (usage) {
      const cost = ((usage.prompt_tokens / 1_000_000) * 0.15) + ((usage.completion_tokens / 1_000_000) * 0.60);
      console.log(`[AI] Detect format - Tokens: ${usage.total_tokens}, Cost: ~$${cost.toFixed(4)}`);
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Erreur détection format:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'analyse' },
      { status: 500 }
    );
  }
}