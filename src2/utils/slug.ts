// src/utils/slug.ts
// Slug utils — sans ID numérique + suffixe court en cas de collision.

export function slugifyBase(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Mini-hash stable (non cryptographique) -> suffixe lisible en base36 (3–4 chars)
export function shortHash(input: string): string {
  let h = 2166136261 >>> 0; // FNV-like
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // 32 bits -> base36, 3-4 chars
  return (h >>> 0).toString(36).slice(0, 4);
}

/**
 * Génère un slug unique à partir d'un titre.
 * - Pas d'ID numérique
 * - En cas de collision, ajoute un suffixe court `-x3f` (hash)
 */
export function ensureUniqueSlug(existing: Set<string>, title: string): string {
  const base = slugifyBase(title) || 'post';
  if (!existing.has(base)) {
    existing.add(base);
    return base;
  }
  // Collision -> suffixe à partir du hash (titre + compteur si besoin)
  let attempt = `${base}-${shortHash(title)}`;
  if (!existing.has(attempt)) {
    existing.add(attempt);
    return attempt;
  }
  // Dernier recours: itérer avec compteur stable
  let i = 2;
  // Limite de sécurité:
  while (i < 1000) {
    const candidate = `${base}-${shortHash(title + i)}-${i}`;
    if (!existing.has(candidate)) {
      existing.add(candidate);
      return candidate;
    }
    i++;
  }
  // Très improbable
  const fallback = `${base}-${Date.now().toString(36).slice(-4)}`;
  existing.add(fallback);
  return fallback;
}
