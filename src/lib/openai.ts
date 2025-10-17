// src/lib/openai.ts
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY manquante dans .env');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const DEFAULT_MODEL = 'gpt-4o-mini';

// Interface complète Sprint 1 + 2 + 3
export interface AIInsights {
  summary: string;
  keyTakeaways: string[];
  topArguments: {
    pour: string[];
    contre: string[];
  };
  missingAngles: string[];
  biases: string[];
  
  // Sprint 1
  counterArgumentsToTest: string[];
  factCheckCues: string[];
  plainLanguageVerdict: string;
  verdictChangers: string[];
  
  // Sprint 2 - Scores & Analyses
  scores: {
    evidenceDensity: number;
    argumentDiversity: number;
    controversyLevel: number;
    reliability: number;
  };
  toneSentiment: 'neutral' | 'positive' | 'negative';
  debateMaturity: 'early' | 'developing' | 'mature';
  consensusLikelihood: 'low' | 'medium' | 'high';
  
  // Sprint 3 - Advanced Features
  riskBenefitMap: {
    risks: string[];
    benefits: string[];
  };
  stakeholders: string[];
  relatedQuestions: string[];
  dataGaps: string[];
}