-- Spliten - Nettoyage complet du cache AI Insights
-- Exécuter une seule fois pour forcer régénération en anglais

-- 1. Voir l'état actuel
SELECT 
  COUNT(*) as total_questions,
  COUNT(CASE WHEN "aiInsights" IS NOT NULL AND "aiInsights" != '{}'::jsonb THEN 1 END) as with_insights,
  COUNT(CASE WHEN "aiInsightsUpdatedAt" IS NOT NULL THEN 1 END) as with_timestamp,
  AVG(EXTRACT(EPOCH FROM (NOW() - "aiInsightsUpdatedAt"))/3600)::numeric(10,2) as avg_age_hours
FROM "Question";

-- 2. Vider tous les insights pour régénération
UPDATE "Question" 
SET 
  "aiInsights" = '{}'::jsonb,
  "aiInsightsUpdatedAt" = NULL
WHERE 
  "aiInsights" IS NOT NULL 
  AND "aiInsights" != '{}'::jsonb;

-- 3. Vérifier le résultat
SELECT 
  COUNT(*) as total_questions,
  COUNT(CASE WHEN "aiInsights" IS NOT NULL AND "aiInsights" != '{}'::jsonb THEN 1 END) as with_insights,
  COUNT(CASE WHEN "aiInsightsUpdatedAt" IS NOT NULL THEN 1 END) as with_timestamp
FROM "Question";

-- Résultat attendu : with_insights = 0, with_timestamp = 0