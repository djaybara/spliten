// src/data/mockData.ts

export type Q = {
  id: number;
  slug: string; // pour URLs lisibles
  title: string;
  category: 'general' | 'politics' | 'technology' | 'work' | 'lifestyle' | 'environment' | 'news';
  author: string;
  timeAgo: string;
  pour: number;
  contre: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
  hasAI: boolean;
  createdAt: number; // Date.now()
};

export const seedQuestions: Q[] = [
  {
    id: 1,
    slug: 'ban-cars-in-city-centers',
    title: 'Should we ban cars in city centers?',
    category: 'politics',
    author: 'anonymous',
    timeAgo: '2 hours ago',
    pour: 805, contre: 429,
    upvotes: 342, downvotes: 12, comments: 47,
    badges: ['trending', 'controversial'],
    hasAI: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 2,
    slug: 'remote-work-legal-right',
    title: 'Should remote work be a legal right?',
    category: 'work',
    author: 'techworker',
    timeAgo: '4 hours ago',
    pour: 696, contre: 196,
    upvotes: 189, downvotes: 8, comments: 23,
    badges: ['top'],
    hasAI: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: 3,
    slug: 'is-ai-a-threat-to-humanity',
    title: 'Is artificial intelligence a threat to humanity?',
    category: 'technology',
    author: 'futuretech',
    timeAgo: '5 hours ago',
    pour: 432, contre: 567,
    upvotes: 256, downvotes: 34, comments: 89,
    badges: ['controversial'],
    hasAI: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  // --- exemples "news" (onglet Actualités)
  {
    id: 4,
    slug: 'election-debate-tonight',
    title: 'Will tonight’s election debate change voter intentions?',
    category: 'news',
    author: 'newsbot',
    timeAgo: '35 minutes ago',
    pour: 210, contre: 180,
    upvotes: 120, downvotes: 9, comments: 140,
    badges: ['trending'],
    hasAI: true,
    createdAt: Date.now() - 1000 * 60 * 35,
  },
  {
    id: 5,
    slug: 'big-tech-antitrust-ruling',
    title: 'Is the new antitrust ruling against Big Tech fair?',
    category: 'news',
    author: 'economywatch',
    timeAgo: '1 hour ago',
    pour: 320, contre: 260,
    upvotes: 210, downvotes: 15, comments: 96,
    badges: ['new'],
    hasAI: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 1,
  },
  {
    id: 6,
    slug: 'ceasefire-agreement',
    title: 'Will the ceasefire agreement actually hold?',
    category: 'news',
    author: 'worldnews',
    timeAgo: '3 hours ago',
    pour: 540, contre: 520,
    upvotes: 310, downvotes: 41, comments: 212,
    badges: ['controversial'],
    hasAI: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
];

export type SortTab = 'hot' | 'new' | 'top' | 'controversial' | 'news';

export function wilson(up: number, down: number) {
  const n = up + down;
  if (!n) return 0;
  const z = 1.96;
  const p = up / n;
  const denom = 1 + (z * z) / n;
  const num = p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return num / denom;
}

export function hotScore(q: Q) {
  const w = wilson(q.upvotes, q.downvotes);
  const hours = (Date.now() - q.createdAt) / 36e5;
  const decay = Math.exp(-0.08 * hours);
  return w * 100 * decay;
}

export function sortQuestions(arr: Q[], tab: SortTab) {
  const copy = [...arr];
  switch (tab) {
    case 'hot':
      return copy.sort((a, b) => hotScore(b) - hotScore(a));
    case 'new':
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'top':
      return copy.sort((a, b) => wilson(b.upvotes, b.downvotes) - wilson(a.upvotes, a.downvotes));
    case 'controversial':
      return copy.sort((a, b) => {
        const ra = Math.min(a.pour, a.contre) / Math.max(a.pour, a.contre);
        const rb = Math.min(b.pour, b.contre) / Math.max(b.pour, b.contre);
        return rb - ra;
      });
    case 'news':
      return copy.filter(q => q.category === 'news')
                 .sort((a, b) => hotScore(b) - hotScore(a));
    default:
      return copy;
  }
}