// src/lib/utils/url.ts

/** Liste de paramètres de tracking à supprimer */
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'mc_cid', 'mc_eid', 'igshid', 'mkt_tok',
  'yclid', 'msclkid', 'vero_id'
]);

/** Ajoute https:// si l'utilisateur tape juste "bbc.com" ou "guardian.com/path" */
export function ensureProtocol(raw: string): string {
  if (!raw) return '';
  const s = raw.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  // on refuse les autres protocoles (mailto:, javascript:, etc.)
  if (/^[a-z]+:/i.test(s)) return '';
  return `https://${s.replace(/^\/+/, '')}`;
}

/** Supprime les paramètres de tracking connus */
function stripTrackingParams(u: URL) {
  const params = u.searchParams;
  let changed = false;
  [...params.keys()].forEach((k) => {
    const lk = k.toLowerCase();
    if (TRACKING_PARAMS.has(lk) || lk.startsWith('utm_')) {
      params.delete(k);
      changed = true;
    }
  });
  if (changed) u.search = params.toString();
}

/** Normalise l'URL */
export function normalizeUrl(raw: string): string {
  try {
    const withProto = ensureProtocol(raw);
    if (!withProto) return '';
    const u = new URL(withProto);

    if (!/^https?:$/i.test(u.protocol)) return ''; // http(s) only

    u.hash = '';

    // Ports par défaut
    if ((u.protocol === 'http:' && u.port === '80') ||
        (u.protocol === 'https:' && u.port === '443')) {
      u.port = '';
    }

    // Nettoyage tracking
    stripTrackingParams(u);

    // Nettoyage chemin
    u.pathname = u.pathname.replace(/\/{2,}/g, '/');

    // Host en minuscule
    u.hostname = u.hostname.toLowerCase();

    return u.toString();
  } catch {
    return '';
  }
}

/** Renvoie le hostname sans "www." si possible */
export function domainFromUrl(raw: string): string {
  try {
    const u = new URL(ensureProtocol(raw));
    return u.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return (raw || '').trim();
  }
}

/** Label affichable pour une source */
export function siteLabel(raw: string): string {
  return domainFromUrl(raw);
}

/** Favicon Google S2 (retina-friendly par défaut: 32px) */
export function faviconUrl(raw: string, size = 32): string {
  const host = domainFromUrl(raw);
  if (!host) return '';
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`;
}

/** Fournit un srcset 1x/2x pour <img> */
export function faviconSrcSet(raw: string, base = 16): string {
  const x1 = faviconUrl(raw, base);
  const x2 = faviconUrl(raw, base * 2);
  return `${x1} 1x, ${x2} 2x`;
}

/** Autres sources possibles de favicon (ordre de préférence) */
export function faviconCandidates(raw: string, size = 32): string[] {
  const n = normalizeUrl(raw);
  const host = domainFromUrl(n || raw);
  const origin = (() => {
    try { return n ? new URL(n).origin : ''; } catch { return ''; }
  })();

  const candidates: string[] = [];
  if (host) {
    // 1) Google S2
    candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${size}`);
    // 2) DuckDuckGo (fallback)
    candidates.push(`https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico`);
  }
  // 3) /favicon.ico (même origine)
  if (origin) candidates.push(`${origin}/favicon.ico`);

  return candidates;
}

/** Essaie de parser une URL http(s), sinon renvoie null */
export function safeParseHttpUrl(raw: string): URL | null {
  try {
    const n = normalizeUrl(raw);
    if (!n) return null;
    const u = new URL(n);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u;
  } catch {
    return null;
  }
}
