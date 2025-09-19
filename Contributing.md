# Contributing — Spliten

Bienvenue ! Ce repo vise la clarté pour débutant. Merci de suivre ces règles pour garder le projet propre.

## 0) Résumé du projet
- App: Next.js 14 (App Router) + TypeScript
- Styles: Tailwind + variables CSS (tokens)
- DB: Drizzle + Neon Postgres (à venir)
- Hébergement: Vercel
- Auth: Clerk (bientôt). En dev, **auth soft** via cookie `demo_auth=1`.
- IA: Endpoints `/api/ai/*` (OpenAI) côté serveur uniquement.

## 1) Environnement & scripts
```bash
pnpm install        # ou npm install
pnpm dev            # démarre en local
pnpm build          # build prod (doit passer sans erreur)
pnpm lint           # lint (corriger avant PR)
pnpm test           # si des tests existent
