// src/lib/questions/resolver.ts
import { getAllQuestions } from '@/data/questionsData';
import { slugifyBase } from '@/lib/utils/slug';

/** Compat: accepte les slugs natifs ET les anciens `/questions/123-titre` */
export function resolveQuestionBySlugCompat(slug: string) {
  const all = getAllQuestions();

  // 1) Slug natif (sans ID)
  let q = all.find(x => x.slug === slug);
  if (q) return q;

  // 2) Ancien format "123-titre"
  const m = slug.match(/^(\d+)-/);
  if (m) {
    const id = parseInt(m[1], 10);
    q = all.find(x => x.id === id);
    if (q) return q;
  }

  // 3) Tentative par base de titre (défensive)
  const base = slugifyBase(slug);
  q = all.find(x => slugifyBase(x.title) === base);
  return q || null;
}
