// src/data/questionsData.ts
// Source unique des questions (+ slugs) pour Home & page détail.

import { ensureUniqueSlug } from '@/lib/utils/slug';

export type Question = {
  id: number;
  slug: string;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  views: number;
  pour: number;
  contre: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
  news?: boolean;
};

const BASE: Omit<Question, 'slug'>[] = [
  { id: 1, title: 'Should we ban cars in city centers?', category: 'politics', author: 'urbanplanner', timeAgo: '2 hours ago', views: 3420, pour: 805, contre: 429, upvotes: 342, downvotes: 12, comments: 47, badges: ['trending','controversial'], news: true },
  { id: 2, title: 'Should remote work be a legal right?', category: 'work', author: 'techworker', timeAgo: '4 hours ago', views: 2104, pour: 696, contre: 196, upvotes: 189, downvotes: 8, comments: 23, badges: ['top'] },
  { id: 3, title: 'Is artificial intelligence a threat to humanity?', category: 'technology', author: 'futuretech', timeAgo: '5 hours ago', views: 5871, pour: 432, contre: 567, upvotes: 256, downvotes: 34, comments: 89, badges: ['controversial'], news: true },
  { id: 4, title: 'Should social media be banned for under-16s?', category: 'lifestyle', author: 'parentadvocate', timeAgo: '1 hour ago', views: 1890, pour: 234, contre: 156, upvotes: 89, downvotes: 5, comments: 34, badges: ['new','trending'], news: true },
  { id: 5, title: 'Is nuclear energy the solution to climate change?', category: 'environment', author: 'climatescientist', timeAgo: '3 hours ago', views: 4567, pour: 567, contre: 432, upvotes: 123, downvotes: 23, comments: 67, badges: ['controversial'] },
  { id: 6, title: 'Should companies track employee productivity?', category: 'work', author: 'hrexpert', timeAgo: '6 hours ago', views: 2234, pour: 345, contre: 456, upvotes: 67, downvotes: 12, comments: 29, badges: ['top'] },
  { id: 7, title: 'Is cryptocurrency the future of money?', category: 'technology', author: 'cryptoenthusiast', timeAgo: '8 hours ago', views: 3456, pour: 789, contre: 234, upvotes: 156, downvotes: 34, comments: 78, badges: ['trending'] },
  { id: 8, title: 'Should university education be free?', category: 'general', author: 'student2024', timeAgo: '12 hours ago', views: 5678, pour: 892, contre: 345, upvotes: 234, downvotes: 45, comments: 123, badges: ['top','trending'] },
];

// Slugs stables à partir des titres (sans ID)
const slugSet = new Set<string>();
const QUESTIONS: Question[] = BASE.map(q => ({ ...q, slug: ensureUniqueSlug(slugSet, q.title) }));

// Maps d’accès rapide
const byId = new Map<number, Question>(QUESTIONS.map(q => [q.id, q]));
const bySlug = new Map<string, Question>(QUESTIONS.map(q => [q.slug, q]));

/** Retourne une copie défensive du tableau complet */
export function getAllQuestions(): Question[] {
  return QUESTIONS.map(q => ({ ...q }));
}

export function getQuestionById(id: number): Question | null {
  return byId.get(id) || null;
}

export function getQuestionBySlug(slug: string): Question | null {
  return bySlug.get(slug) || null;
}
