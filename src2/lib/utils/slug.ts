// src/lib/utils/slug.ts
export function slugifyBase(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function shortHash(input: string): string {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).slice(0, 4);
}

/** Génère un slug unique (sans ID). Ajoute un suffixe court en cas de collision. */
export function ensureUniqueSlug(existing: Set<string>, title: string): string {
  const base = slugifyBase(title) || 'post';
  if (!existing.has(base)) { existing.add(base); return base; }

  const attempt = `${base}-${shortHash(title)}`;
  if (!existing.has(attempt)) { existing.add(attempt); return attempt; }

  for (let i = 2; i < 1000; i++) {
    const cand = `${base}-${shortHash(title + i)}-${i}`;
    if (!existing.has(cand)) { existing.add(cand); return cand; }
  }
  const fallback = `${base}-${Date.now().toString(36).slice(-4)}`;
  existing.add(fallback);
  return fallback;
}
