// src/components/SourcePills.tsx
'use client';
import React from 'react';

type Item = { url: string; label?: string };

export default function SourcePills({ list, sources }: { list?: Item[]; sources?: Item[] }) {
  const data = ((sources || list) ?? [])
    .map((s) => ({ url: normalizeUrlLocal(s.url), label: s.label }))
    .filter((s) => !!s.url);

  if (!data.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {data.map((s, i) => {
        const { host, href } = extractHost(s.url);
        const display = s.label || siteNiceName(host); // <-- NOM DE SITE lisible
        const fav = `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(host)}`;
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="clickable"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'var(--pill)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              color: 'var(--text)',
              textDecoration: 'none',
              lineHeight: 1,
            }}
            title={href}
          >
            <img
              src={fav}
              width={16}
              height={16}
              alt=""
              style={{ display: 'block', borderRadius: 4 }}
              loading="lazy"
              decoding="async"
            />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{display}</span>
          </a>
        );
      })}
    </div>
  );
}

function normalizeUrlLocal(u?: string) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function extractHost(u: string) {
  try {
    const p = new URL(u);
    return { host: stripWww(p.hostname), href: p.href };
  } catch {
    const fixed = normalizeUrlLocal(u);
    try {
      const p2 = new URL(fixed);
      return { host: stripWww(p2.hostname), href: p2.href };
    } catch {
      return { host: stripWww(u.replace(/^https?:\/\//i, '')), href: fixed };
    }
  }
}
function stripWww(h: string) {
  return h.replace(/^www\./i, '');
}

/** Nom de site "propre" : mapping pour les plus fréquents + fallback basé sur le domaine. */
function siteNiceName(host: string) {
  const map: Record<string, string> = {
    'wikipedia.org': 'Wikipedia',
    'reuters.com': 'Reuters',
    'ft.com': 'Financial Times',
    'bbc.com': 'BBC',
    'bbc.co.uk': 'BBC',
    'nytimes.com': 'NYTimes',
    'theguardian.com': 'The Guardian',
    'washingtonpost.com': 'Washington Post',
    'who.int': 'WHO',
    'un.org': 'United Nations',
    'ec.europa.eu': 'European Commission',
    'oecd.org': 'OECD',
    'worldbank.org': 'World Bank',
    'imf.org': 'IMF',
    'nature.com': 'Nature',
    'science.org': 'Science',
    'ieee.org': 'IEEE',
    'arxiv.org': 'arXiv',
    'world-nuclear.org': 'World Nuclear',
    'iaea.org': 'IAEA',
    'news.google.com': 'Google News',
    'medium.com': 'Medium',
    'substack.com': 'Substack',
    'ycombinator.com': 'Y Combinator',
    'techcrunch.com': 'TechCrunch',
  };
  if (map[host]) return map[host];

  // Fallback: enlève TLD et capitalise (ex: ft.com -> FT, vox.com -> Vox)
  const parts = host.split('.');
  if (parts.length >= 2) {
    const core = parts[parts.length - 2];
    if (core.length <= 3) return core.toUpperCase();
    return core.charAt(0).toUpperCase() + core.slice(1);
  }
  return host;
}
