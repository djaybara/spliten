# AGENTS.md — Spliten (GUIDE POUR AGENT)
> IMPORTANT: L’utilisateur est DÉBUTANT COMPLET. Toujours expliquer CLAIREMENT, PAS-À-PAS.
> Éviter le jargon, définir chaque terme technique au moment où il apparaît.
> Fournir les commandes TERMINAL exactes, montrer les DIFFS, et finir par une CHECKLIST de validation.

## 0) Contexte & Mission
Spliten = plateforme de débats binaires (Yes/No, For/Against) avec arguments, votes, threads, et quelques cartes AI.
Objectif: mobile-first, fluide, SEO solide, UI cohérente (sticky panels, ratio bar verte/rouge), pas de flash de thème.

**Stack**
- Next.js 14 (App Router) + TypeScript
- Styles: Tailwind + variables CSS (tokens), design gradient #667eea→#764ba2
- DB: Drizzle ORM + Neon Postgres
- Hébergement: Vercel
- À venir: Clerk (auth), Upstash Redis (rate-limit), Cloudinary (médias), Turnstile
- Tests (si présents): Vitest / Playwright

**Règle URL**
- **AUCUN ID numérique en tête des slugs**. Routes de question: `/questions/[slug]`.

---

## 1) Style d’intervention demandé (OBLIGATOIRE)
1. **Toujours** commencer par un **Plan en 3–7 étapes** (phrases courtes).
2. **Expliquer chaque étape** simplement. Si un sigle apparaît (ex. “SSR”), le **définir**.
3. **Fournir les commandes** exactes à exécuter (copier/coller).
4. **Montrer les diffs** (avant/après) des fichiers modifiés.
5. **Valider**: lancer `pnpm build` (ou `npm run build`) + `pnpm lint` et **coller les sorties** utiles.
6. **Checklists d’acceptation**: liste de points à vérifier manuellement (mobile/desktop, sticky, SEO, etc.).
7. **Erreurs**: si ça casse, fournir un **diagnostic clair** + 2 chemins de correction:
   - **Patch minimal** (rapide)
   - **Fix propre** (robuste)
   Exécuter la solution choisie, re-valider, et résumer.

> Si la tâche implique **DB/migrations** ou sécurité (auth, rate-limit), DEMANDER confirmation et créer une PR séparée. Sinon, pour le reste, appliquer directement.

---

## 2) Structure du repo (référence)
- `src/app/`
  - `layout.tsx` — boot thème **anti-FOUC** (aucun flash au reload)
  - `page.tsx` — Home (sections Hot/Rising/Controversial) + AIInsights site-wide
  - `ask/` — page de création (mock si auth off)
  - `questions/[slug]/page.tsx` — page question (ratio bar, FOR/AGAINST, threads)
  - `legal/{terms,privacy,cookies}/page.tsx` — FR + EN
  - `robots.ts`, `sitemap.ts`
- `src/components/`
  - `Navbar`, `QuestionCard`, `CategoriesPanel`
  - `AIInsightsCard`, `AIInsightsSiteCard`, `AISkeleton`, `AISiteSkeleton`
  - `ArgumentsColumn`, `DiscussionThread`, `OpinionTimeline`, `ArgumentTimeline`
  - Modals (login mock), Pills (sources), Badges (Top/Trending/Controversial)
- `src/data/` — mocks (`questionsData.ts`, `siteInsights.ts`)
- `src/lib/` — utils (slugify, scores Wilson/hotness/controversy, etc.)
- `drizzle/` — schémas & **migrations (zone sensible)**
- `public/` — assets, templates OG
- `middleware.ts` — auth soft + protections basiques

> Si un fichier manquant est nécessaire, **le créer** proprement et lister ce qui a été ajouté.

---

## 3) Commandes & environnement
- Installer deps: `pnpm install` (ou `npm install`)
- Dev: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Tests (si présents): `pnpm test`

**Toujours**:
- détecter pnpm vs npm (si `pnpm-lock.yaml` existe → pnpm)
- afficher la version de Node si pertinent
- **ne jamais** toucher à `.env` (créér `.env.example` au besoin)

---

## 4) Conventions UI/UX & Thème
- Mobile-first. Aucun layout shift.
- Thème dark/light via `data-theme` sur `<html>` ; **anti-FOUC** garanti.
- Gradient marque #667eea→#764ba2 ; actions vert (A/YES), rouge (B/NO).
- **Sticky**:
  - Gauche: `CategoriesPanel` sticky.
  - Centre: **barre d’onglets** (Hot/News/New/Top/Controversial) sticky, **fond opaque**, **même hauteur** que le bouton “Create Post”.
  - Droite: **bouton “Create Post”** sticky, **même offset** vertical que la barre d’onglets.
  - **Toujours un espace constant** sous la Navbar et sous les éléments sticky.
- `QuestionCard` actions (▲/▼, comments, share, save) = **actions inline** (pas de navigation forcée).
- Skeleton-first (`AISiteSkeleton`, `AISkeleton`).
- A11y: focus visibles, contrastes AA+, `aria-*`, `prefers-reduced-motion`.

---

## 5) URLs, Slugs & SEO
- Slugs sans ID en tête. Conflits: suffixer `-2`, `-3`, … (pas de préfixe numérique).
- Redirects 301 si migration d’anciens chemins.
- SEO:
  - SSR pages Question/Tags/Categories.
  - `robots.ts`, `sitemap.ts` complets.
  - `canonical`, `og:*`, **OG dynamiques** (titre + % A/B).
  - `schema.org`: `QAPage` + `Comment`.
  - `noindex` sur contenu “thin”.

---

## 6) Données, API & Sécurité
- DB (vision): `users`, `questions`, `arguments`, `votes`, `argument_votes`, `follows`, `reports`, `badges`, `notifications`, `tags` + pivots.
- Contrats:
  - `questions.slug` UNIQUE.
  - Anti multi-vote (hash + SALT) en V2 (ne pas improviser).
- API App Router: `/api/questions`, `/api/opinion/add`, `/api/opinion/score`, `/api/opinion/reply`, etc.
- Sécurité:
  - Jamais committer de secrets (`.env`).
  - Rate-limit (Upstash) sur endpoints sensibles (PR séparée).
  - Turnstile sur formulaires publics (PR séparée).

---

## 7) Auth & Middleware
- Clerk prévu, peut être désactivé en dev.
- Sans auth: bloquer actions “write” + **modal login mock** (fermeture au clic extérieur).
- `middleware.ts`: gating doux, locale/RGPD de base.

---

## 8) Qualité & Performance
- TypeScript **strict** (pas d’`any` silencieux).
- ESLint propre (pas d’avertissements bloquants).
- `next/image`, prefetch maîtrisé, bundles légers.
- UI states robustes (optimistic UI votes, rollback si échec).
- Mémoïsation légère si utile.

---

## 9) Protocoles d’ERREUR (OBLIGATOIRE)
Quand une erreur survient (build/lint/runtime):
1) **Expliquer** en français simple ce que dit l’erreur.
2) Proposer **deux options**:
   - **Patch minimal**: petite modif rapide, peu risquée.
   - **Fix propre**: correction plus soignée (peut toucher plusieurs fichiers).
3) Dire **ce qui va être modifié** (liste de fichiers) et **pourquoi**.
4) Appliquer la solution retenue, **relancer** `pnpm build`/`pnpm lint`.
5) **Montrer les sorties** (résumées), puis checklist d’acceptation.
6) Si l’erreur touche DB/auth/sécurité → PR **séparée**, avec plan de rollback.

---

## 10) Roadmap IMMÉDIATE (ordre + critères d’acceptation)
1. **Anti-FOUC thème**
   - `layout.tsx` boot script minimal AVANT hydratation, aucun flash au hard refresh.
   - ✅ `pnpm build` OK, bascule dark/light sans clignotement.

2. **Sticky + espacements**
   - Onglets centre & bouton “Create Post” droite → **même hauteur**, sticky, fond opaque; `CategoriesPanel` gauche sticky; offsets constants.
   - ✅ Mobile/desktop OK; pas de chevauchement; scroll fluide.

3. **Slugs propres + redirects**
   - URLs sans ID en tête, conflits `-2`, `-3`; redirections si migration.
   - ✅ Aucune 404 interne; liens/partages OK.

4. **Pages légales FR/EN**
   - `/legal/terms`, `/legal/privacy`, `/legal/cookies` + liens footer; `noindex` si placeholders.
   - ✅ Build OK; navigation OK.

5. **Middleware auth soft + modal**
   - Gating sur actions write; modal login mock fermable au clic extérieur.
   - ✅ Aucune action write sans auth côté serveur.

6. **SEO base**
   - `robots.ts`, `sitemap.ts`, `canonical`, OG dynamiques, `QAPage/Comment`.
   - ✅ Lighthouse SEO ≥ 90 (indicatif).

---

## 11) Processus de travail (toujours)
- Avant d’éditer: créer un commit “baseline” (l’utilisateur est débutant).
- Toujours fournir: **Plan → Diffs → Commandes → Sorties → Checklist**.
- Commits atomiques; messages courts FR/EN; résumer les changements.
- **Ne pas** introduire de lib majeure sans PR dédiée & justification.

---

## 12) PROMPTS TYPES (l’utilisateur peut copier/coller)
- **Anti-FOUC**: “Lis `src/app/layout.tsx`. Supprime tout flash de thème au hard refresh (App Router). Explique pas-à-pas, montre les diffs, donne les commandes pour tester. Valide avec `pnpm build` et `pnpm lint`.”
- **Sticky**: “Rends la barre d’onglets Home et le bouton ‘Create Post’ sticky (même hauteur) avec fond opaque et offset constant sous la navbar; `CategoriesPanel` sticky à gauche. Explique, diffs, commandes, checklist, build.”
- **Slugs**: “Remplace `/questions/123-titre` par `/questions/titre`, gère conflits avec suffixes `-2`/`-3`, ajoute redirections, mets à jour liens internes. Explique, diffs, commandes, build + checklist.”
- **Légales**: “Crée `/legal/{terms,privacy,cookies}` en FR/EN, relie dans le footer, `noindex` si placeholder. Explique, diffs, build + checklist.”
- **Auth soft**: “Ajoute middleware gating des actions write et un modal login mock fermable au clic extérieur. Explique, diffs, build + checklist.”
