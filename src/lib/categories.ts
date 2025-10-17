// src/lib/categories.ts
import {
  Newspaper,
  Hash,
  Cpu,
  Scale,
  Leaf,
  Briefcase,
  Heart,
  Tv,
  Gamepad2,
  Shirt,
  UtensilsCrossed,
  Home,
  Palette,
  Atom,
  Trophy,
} from 'lucide-react';

export type CategoryKey =
  | 'all'
  | 'news'
  | 'general'
  | 'technology'
  | 'politics'
  | 'environment'
  | 'work'
  | 'lifestyle'
  | 'entertainment'
  | 'gaming'
  | 'fashion'
  | 'food'
  | 'home'
  | 'arts'
  | 'science'
  | 'sports';

export const CATEGORIES = [
  {
    value: 'all',
    label: 'All',
    labelFr: 'Tout',
    Icon: Hash,
    color: '#667eea',
    priority: 0,
  },
  {
    value: 'news',
    label: 'News',
    labelFr: 'Actualités',
    Icon: Newspaper,
    color: '#ef4444',
    priority: 1, // Priorité maximale
    featured: true, // Badge spécial
  },
  {
    value: 'general',
    label: 'General',
    labelFr: 'Général',
    Icon: Hash,
    color: '#6b7280',
    priority: 2,
  },
  {
    value: 'technology',
    label: 'Technology',
    labelFr: 'Technologie',
    Icon: Cpu,
    color: '#3b82f6',
    priority: 3,
  },
  {
    value: 'politics',
    label: 'Politics & Society',
    labelFr: 'Politique et société',
    Icon: Scale,
    color: '#8b5cf6',
    priority: 3,
  },
  {
    value: 'environment',
    label: 'Environment',
    labelFr: 'Écologie',
    Icon: Leaf,
    color: '#10b981',
    priority: 3,
  },
  {
    value: 'work',
    label: 'Work & Career',
    labelFr: 'Travail et carrière',
    Icon: Briefcase,
    color: '#0ea5e9',
    priority: 3,
  },
  {
    value: 'lifestyle',
    label: 'Lifestyle',
    labelFr: 'Vie et bien-être',
    Icon: Heart,
    color: '#ec4899',
    priority: 3,
  },
  {
    value: 'entertainment',
    label: 'Entertainment',
    labelFr: 'Divertissement',
    Icon: Tv,
    color: '#a855f7',
    priority: 3,
  },
  {
    value: 'gaming',
    label: 'Gaming',
    labelFr: 'Jeux vidéo',
    Icon: Gamepad2,
    color: '#6366f1',
    priority: 3,
  },
  {
    value: 'fashion',
    label: 'Fashion & Beauty',
    labelFr: 'Mode et beauté',
    Icon: Shirt,
    color: '#f59e0b',
    priority: 3,
  },
  {
    value: 'food',
    label: 'Food & Cooking',
    labelFr: 'Gastronomie',
    Icon: UtensilsCrossed,
    color: '#f97316',
    priority: 3,
  },
  {
    value: 'home',
    label: 'Home & Garden',
    labelFr: 'Maison et jardin',
    Icon: Home,
    color: '#84cc16',
    priority: 3,
  },
  {
    value: 'arts',
    label: 'Arts & Culture',
    labelFr: 'Arts et culture',
    Icon: Palette,
    color: '#d946ef',
    priority: 3,
  },
  {
    value: 'science',
    label: 'Science & Nature',
    labelFr: 'Science et nature',
    Icon: Atom,
    color: '#06b6d4',
    priority: 3,
  },
  {
    value: 'sports',
    label: 'Sports',
    labelFr: 'Sports',
    Icon: Trophy,
    color: '#eab308',
    priority: 3,
  },
] as const;

/**
 * Helper pour récupérer les métadonnées d'une catégorie
 */
export function getCategoryMeta(category?: string) {
  const cat = CATEGORIES.find((c) => c.value === category?.toLowerCase());
  return cat || CATEGORIES[1]; // fallback sur "general"
}

/**
 * Catégories triées par priorité
 */
export function getCategoriesSorted() {
  return [...CATEGORIES].sort((a, b) => (a.priority || 999) - (b.priority || 999));
}