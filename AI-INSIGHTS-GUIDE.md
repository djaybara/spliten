# 🤖 AI Insights - Guide Complet

## 📋 Vue d'ensemble

Le système AI Insights génère des analyses automatiques de débats en utilisant OpenAI GPT-4o-mini.

### **Insights générés (18 au total)**

#### Sprint 1 - Base
- ✅ Summary (résumé 2-3 phrases)
- ✅ Key Takeaways (3-5 points clés)
- ✅ Top Arguments (pour/contre)
- ✅ Missing Angles (perspectives manquantes)
- ✅ Biases (biais détectés)

#### Sprint 1 - Avancé
- ✅ Counter-Arguments to Test (défis aux positions dominantes)
- ✅ Fact-Check Cues (affirmations à vérifier)
- ✅ Plain Language Verdict (résumé simple)
- ✅ Verdict Changers (ce qui pourrait changer l'issue)

#### Sprint 2 - Métriques
- ✅ Evidence Density (0-10)
- ✅ Argument Diversity (0-10)
- ✅ Controversy Level (0-10)
- ✅ Reliability (0-10)
- ✅ Tone Sentiment (neutral/positive/negative)
- ✅ Debate Maturity (early/developing/mature)
- ✅ Consensus Likelihood (low/medium/high)

#### Sprint 3 - Stratégique
- ✅ Risk/Benefit Map (risques vs bénéfices)
- ✅ Stakeholders (qui est impacté)
- ✅ Related Questions (questions connexes)
- ✅ Data Gaps (données manquantes)

---

## 💰 Coûts

### **Par génération**
- Model: `gpt-4o-mini`
- Coût: ~$0.005-0.006 par question
- Tokens: ~1500-2000 (prompt + réponse)

### **Avec cache intelligent**
- Cache frais (<6h): $0 (retour instantané)
- Cache stale (6h-7j): $0 pour l'utilisateur, régénération async
- Pas de cache: $0.006 (génération synchrone)

### **Économies estimées**
- Sans cache: $0.20/jour pour 100 vues
- Avec cache: $0.006/jour pour 100 vues (**97% d'économie**)

---

## 🛠️ Scripts de maintenance

### **1. Nettoyer le cache**

```bash
# Via SQL
psql $DATABASE_URL -f scripts/cleanup-insights-cache.sql

# Ou via Prisma Studio
npx prisma studio
# Puis vider manuellement aiInsights
```

### **2. Régénérer tous les insights**

```bash
# Installer tsx si pas déjà fait
npm install -D tsx

# Lancer le script
npx tsx scripts/regenerate-all-insights.ts
```

**Options configurables** (dans le fichier) :
- `BATCH_SIZE`: Nombre de questions en parallèle (défaut: 5)
- `DELAY_BETWEEN_BATCHES`: Délai entre batches en ms (défaut: 2000)

### **3. Monitoring**

```bash
npx tsx scripts/insights-monitoring.ts
```

Affiche :
- Stats globales (combien de questions avec/sans insights)
- Fraîcheur du cache (combien sont fresh/stale/expired)
- Estimation des coûts (total + mensuel)
- Top questions par votes
- Questions sans insights
- Recommandations

---

## 🔧 Configuration

### **Variables d'environnement**

```bash
# .env.local
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Pour scripts
```

### **Paramètres du cache**

Dans `src/app/api/ai/insights/route.ts` :

```typescript
const CACHE_DURATION_HOURS = 6;    // Cache frais
const MAX_STALE_HOURS = 168;       // 7 jours avant expiration
```

### **Paramètres OpenAI**

Dans `src/app/api/ai/insights/route.ts` :

```typescript
model: 'gpt-4o-mini',
max_tokens: 3000,
temperature: 0.7,
```

---

## 📊 Monitoring en production

### **Logs à surveiller**

```bash
# Génération réussie
[AI] Generated insights - Tokens: 1547, Cost: ~$0.0034

# Erreurs
[AI] Error generating insights: ...
[AI] Async regeneration error: ...
```

### **Métriques clés**

1. **Cache hit rate** : Doit être >90%
2. **Coût mensuel** : Surveiller via logs
3. **Questions sans insights** : Doit être proche de 0
4. **Temps de génération** : ~8-12s en moyenne

### **Alertes recommandées**

- Cache hit rate <80% → Augmenter `CACHE_DURATION_HOURS`
- Coût >$10/mois → Vérifier qu'il n'y a pas de régénérations en boucle
- >10 questions sans insights → Lancer régénération manuelle

---

## 🔄 Workflow de régénération

### **Automatique (utilisateur)**

```
User visite question
    ↓
Cache existe et < 6h ?
    ↓ OUI → Retour instantané ✅
    ↓ NON
Cache existe et < 7j ?
    ↓ OUI → Retour cache + regen async ⚡
    ↓ NON
Génération synchrone (~10s) 🔄
    ↓
Sauvegarde en DB
    ↓
Retour résultat
```

### **Manuelle (admin)**

```bash
# Forcer régénération d'une question
curl "http://localhost:3000/api/ai/insights?slug=SLUG&refresh=true"

# Régénérer toutes les questions
npx tsx scripts/regenerate-all-insights.ts
```

---

## 🚨 Troubleshooting

### **Problème : "Error: 400 you must provide a model parameter"**

**Cause** : Clé API OpenAI manquante ou invalide

**Solution** :
```bash
# Vérifier .env.local
echo $OPENAI_API_KEY

# Redémarrer le serveur
npm run dev
```

### **Problème : Insights en français au lieu d'anglais**

**Cause** : Ancien cache non nettoyé

**Solution** :
```bash
psql $DATABASE_URL -f scripts/cleanup-insights-cache.sql
```

### **Problème : Génération très lente (>30s)**

**Cause** : Timeout ou rate limit OpenAI

**Solution** :
- Vérifier `maxDuration` dans route.ts (défaut: 30s)
- Réduire `BATCH_SIZE` dans script de régénération
- Attendre quelques minutes si rate limit

### **Problème : Coûts élevés**

**Cause** : Cache mal configuré ou régénérations en boucle

**Solution** :
```bash
# Vérifier le monitoring
npx tsx scripts/insights-monitoring.ts

# Si cache hit rate <80%
# → Augmenter CACHE_DURATION_HOURS de 6 à 12h
```

---

## 📈 Optimisations futures

### **Court terme**
- ✅ Dashboard admin pour monitoring visuel
- ✅ Bouton "Regenerate" pour utilisateurs
- ✅ Export PDF des insights

### **Moyen terme**
- ✅ Traduction multilingue (DeepL)
- ✅ Notifications "New insights available"
- ✅ Insights comparés entre questions similaires

### **Long terme**
- ✅ AI Chat contextuel sur le débat
- ✅ Génération d'arguments par IA
- ✅ Text-to-Speech des summaries
- ✅ Analyse de sentiment en temps réel

---

## 📞 Support

Pour toute question :
1. Consulter les logs : `grep "[AI]" logs/app.log`
2. Lancer monitoring : `npx tsx scripts/insights-monitoring.ts`
3. Vérifier la documentation OpenAI : https://platform.openai.com/docs

---

**Version** : 1.0 (Sprint 1+2+3 complets)  
**Dernière mise à jour** : October 2025