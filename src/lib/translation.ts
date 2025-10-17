// src/lib/translation.ts
import * as deepl from 'deepl-node';

if (!process.env.DEEPL_API_KEY) {
  console.warn('⚠️ DEEPL_API_KEY not configured - translations will be skipped');
}

const translator = process.env.DEEPL_API_KEY 
  ? new deepl.Translator(process.env.DEEPL_API_KEY)
  : null;

export type SupportedLanguage = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';

const DEEPL_LANGUAGE_MAP: Record<SupportedLanguage, deepl.TargetLanguageCode> = {
  en: 'en-US',
  fr: 'fr',
  es: 'es',
  de: 'de',
  it: 'it',
  pt: 'pt-PT',
};

export interface AIInsights {
  summary: string;
  keyTakeaways: string[];
  topArguments: {
    pour: string[];
    contre: string[];
  };
  missingAngles: string[];
  biases: string[];
  counterArgumentsToTest: string[];
  factCheckCues: string[];
  plainLanguageVerdict: string;
  verdictChangers: string[];
  scores: {
    evidenceDensity: number;
    argumentDiversity: number;
    controversyLevel: number;
    reliability: number;
  };
  toneSentiment: 'neutral' | 'positive' | 'negative';
  debateMaturity: 'early' | 'developing' | 'mature';
  consensusLikelihood: 'low' | 'medium' | 'high';
  riskBenefitMap: {
    risks: string[];
    benefits: string[];
  };
  stakeholders: string[];
  relatedQuestions: string[];
  dataGaps: string[];
}

/**
 * Traduit les insights en gardant la structure JSON
 * Seuls les champs textuels sont traduits, pas les scores/enums
 */
export async function translateInsights(
  insights: AIInsights,
  targetLang: SupportedLanguage
): Promise<AIInsights> {
  // Si anglais, retourne tel quel (source)
  if (targetLang === 'en' || !translator) {
    return insights;
  }

  try {
    const targetCode = DEEPL_LANGUAGE_MAP[targetLang];

    // Collecter tous les textes à traduire
    const textsToTranslate: string[] = [
      insights.summary,
      insights.plainLanguageVerdict,
      ...insights.keyTakeaways,
      ...insights.topArguments.pour,
      ...insights.topArguments.contre,
      ...insights.missingAngles,
      ...insights.biases,
      ...insights.counterArgumentsToTest,
      ...insights.factCheckCues,
      ...insights.verdictChangers,
      ...insights.riskBenefitMap.risks,
      ...insights.riskBenefitMap.benefits,
      ...insights.stakeholders,
      ...insights.relatedQuestions,
      ...insights.dataGaps,
    ];

    console.log(`[Translation] Translating ${textsToTranslate.length} texts to ${targetLang}...`);

    // Traduire en batch (plus efficace)
    const translations = await translator.translateText(
      textsToTranslate,
      'en',
      targetCode
    );

    // Reconstruire l'objet avec les traductions
    let idx = 0;
    const translated: AIInsights = {
      summary: Array.isArray(translations) ? translations[idx++].text : translations.text,
      plainLanguageVerdict: Array.isArray(translations) ? translations[idx++].text : '',
      
      keyTakeaways: insights.keyTakeaways.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      topArguments: {
        pour: insights.topArguments.pour.map(() => 
          Array.isArray(translations) ? translations[idx++].text : ''
        ),
        contre: insights.topArguments.contre.map(() => 
          Array.isArray(translations) ? translations[idx++].text : ''
        ),
      },
      
      missingAngles: insights.missingAngles.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      biases: insights.biases.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      counterArgumentsToTest: insights.counterArgumentsToTest.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      factCheckCues: insights.factCheckCues.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      verdictChangers: insights.verdictChangers.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      riskBenefitMap: {
        risks: insights.riskBenefitMap.risks.map(() => 
          Array.isArray(translations) ? translations[idx++].text : ''
        ),
        benefits: insights.riskBenefitMap.benefits.map(() => 
          Array.isArray(translations) ? translations[idx++].text : ''
        ),
      },
      
      stakeholders: insights.stakeholders.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      relatedQuestions: insights.relatedQuestions.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      dataGaps: insights.dataGaps.map(() => 
        Array.isArray(translations) ? translations[idx++].text : ''
      ),
      
      // Scores et enums non traduits
      scores: insights.scores,
      toneSentiment: insights.toneSentiment,
      debateMaturity: insights.debateMaturity,
      consensusLikelihood: insights.consensusLikelihood,
    };

    console.log(`[Translation] ✅ Translation to ${targetLang} complete`);
    return translated;

  } catch (error: any) {
    console.error('[Translation] ❌ Error:', error.message);
    // En cas d'erreur, retourne l'anglais
    return insights;
  }
}

/**
 * Détecte la langue préférée de l'utilisateur
 */
export function detectUserLanguage(acceptLanguage?: string): SupportedLanguage {
  if (!acceptLanguage) return 'en';

  const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
  
  const supported: SupportedLanguage[] = ['en', 'fr', 'es', 'de', 'it', 'pt'];
  
  if (supported.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }

  return 'en';
}