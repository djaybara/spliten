// src/lib/i18n/insights.ts
export const insightsTranslations = {
  en: {
    title: 'AI Insights',
    loading: 'Generating insights...',
    error: 'Failed to load insights',
    retry: 'Retry',
    
    // Existant
    summary: 'Summary',
    keyTakeaways: 'Key Takeaways',
    topArguments: 'Top Arguments',
    pour: 'For',
    contre: 'Against',
    missingAngles: 'Missing Angles',
    biases: 'Detected Biases',
    
    // Sprint 1
    counterArgumentsToTest: 'Counter-Arguments to Test',
    factCheckCues: 'Fact-Check Cues',
    plainLanguageVerdict: 'Plain Language Verdict',
    verdictChangers: 'What Could Change the Verdict',
    
    // Sprint 2 - Scores
    debateQuality: 'Debate Quality Metrics',
    evidenceDensity: 'Evidence Density',
    argumentDiversity: 'Argument Diversity',
    controversyLevel: 'Controversy Level',
    reliability: 'Reliability',
    toneSentiment: 'Overall Tone',
    debateMaturity: 'Debate Maturity',
    consensusLikelihood: 'Consensus Likelihood',
    
    // Maturity levels
    early: 'Early Stage',
    developing: 'Developing',
    mature: 'Mature',
    
    // Consensus levels
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    
    // Sentiment
    neutral: 'Neutral',
    positive: 'Positive',
    negative: 'Negative',
    
    // Sprint 3
    riskBenefitMap: 'Risk & Benefit Map',
    risks: 'Risks',
    benefits: 'Benefits',
    stakeholders: 'Who Is Affected',
    relatedQuestions: 'Related Questions',
    dataGaps: 'Missing Data',
    
    // Helper text
    counterArgumentsHelp: 'Strong challenges to dominant positions',
    factCheckHelp: 'Claims that need verification',
    verdictHelp: 'Where the debate stands right now',
    verdictChangersHelp: 'Events or data that could shift outcomes',
    riskBenefitHelp: 'Potential risks and benefits identified',
    stakeholdersHelp: 'Groups of people affected by this debate',
    relatedQuestionsHelp: 'Natural follow-up questions to explore',
    dataGapsHelp: 'Key information needed to resolve uncertainty',
  },
  
  fr: {
    title: 'Analyses IA',
    loading: 'Generation en cours...',
    error: 'Echec du chargement',
    retry: 'Reessayer',
    
    // Existant
    summary: 'Resume',
    keyTakeaways: 'Points Cles',
    topArguments: 'Meilleurs Arguments',
    pour: 'Pour',
    contre: 'Contre',
    missingAngles: 'Angles Manquants',
    biases: 'Biais Detectes',
    
    // Sprint 1
    counterArgumentsToTest: 'Contre-Arguments a Tester',
    factCheckCues: 'Points a Verifier',
    plainLanguageVerdict: 'Verdict en Langage Simple',
    verdictChangers: 'Ce Qui Pourrait Changer le Verdict',
    
    // Sprint 2 - Scores
    debateQuality: 'Metriques de Qualite',
    evidenceDensity: 'Densite de Preuves',
    argumentDiversity: 'Diversite d\'Arguments',
    controversyLevel: 'Niveau de Controverse',
    reliability: 'Fiabilite',
    toneSentiment: 'Ton General',
    debateMaturity: 'Maturite du Debat',
    consensusLikelihood: 'Probabilite de Consensus',
    
    // Maturity levels
    early: 'Debut',
    developing: 'En Developpement',
    mature: 'Mature',
    
    // Consensus levels
    low: 'Faible',
    medium: 'Moyen',
    high: 'Eleve',
    
    // Sentiment
    neutral: 'Neutre',
    positive: 'Positif',
    negative: 'Negatif',
    
    // Sprint 3
    riskBenefitMap: 'Carte Risques & Benefices',
    risks: 'Risques',
    benefits: 'Benefices',
    stakeholders: 'Qui Est Impacte',
    relatedQuestions: 'Questions Connexes',
    dataGaps: 'Donnees Manquantes',
    
    // Helper text
    counterArgumentsHelp: 'Defis solides aux positions dominantes',
    factCheckHelp: 'Affirmations necessitant verification',
    verdictHelp: 'Etat actuel du debat',
    verdictChangersHelp: 'Evenements ou donnees susceptibles de modifier les resultats',
    riskBenefitHelp: 'Risques et benefices potentiels identifies',
    stakeholdersHelp: 'Groupes de personnes affectes par ce debat',
    relatedQuestionsHelp: 'Questions naturelles a explorer ensuite',
    dataGapsHelp: 'Informations cles necessaires pour trancher',
  },
};

export type Language = 'en' | 'fr';

export function getInsightsTranslations(lang: Language) {
  return insightsTranslations[lang];
}