// Données globales (mock) — tu peux ensuite les brancher à tes analytics
export type SiteInsights = {
  topics: string[];
  summary: string;
  qualitySignals: string[];
  topSources: { url: string; label?: string }[];
  metrics?: { proLeanPct?: number; civilityScore?: number; duplicationLow?: boolean };
};

export function getSiteInsights(): SiteInsights {
  return {
    topics: [
      'Regulation vs innovation balance',
      'Automation social impact',
      'Urban mobility equity',
      'Energy transition trade-offs'
    ],
    summary:
      'Community leans pro-environment and supports pragmatic regulation; split on remote-work policy; cautious on AGI timelines.',
    qualitySignals: [
      'Most cited sources this week',
      'Avg. civility ↑ vs last week',
      'Low cross-thread duplication'
    ],
    topSources: [
      { url: 'https://www.bbc.com' },
      { url: 'https://www.nature.com' },
      { url: 'https://www.ft.com', label: 'FT' },
      { url: 'https://www.oecd.org' }
    ],
    metrics: { proLeanPct: 61, civilityScore: 7.9, duplicationLow: true }
  };
}
