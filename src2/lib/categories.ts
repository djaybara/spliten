// src/lib/categories.ts
import {
  Home as HomeIcon, Newspaper, Cpu, Briefcase, Heart, Leaf, Users, Hash,
} from 'lucide-react';

export type CategoryKey =
  | 'all' | 'news' | 'technology' | 'work' | 'lifestyle'
  | 'environment' | 'politics' | 'general';

export type CategoryMeta = {
  value: CategoryKey;
  label: string;
  color: string;
  Icon: any;
};

export const CATEGORIES: CategoryMeta[] = [
  { value: 'all',         label: 'All',      color: '#6b7280', Icon: HomeIcon },
  { value: 'news',        label: 'News',     color: '#2563eb', Icon: Newspaper },
  { value: 'technology',  label: 'Tech',     color: '#00D26A', Icon: Cpu },
  { value: 'work',        label: 'Work',     color: '#f59e0b', Icon: Briefcase },
  { value: 'lifestyle',   label: 'Life',     color: '#ef4444', Icon: Heart },
  { value: 'environment', label: 'Eco',      color: '#10b981', Icon: Leaf },
  { value: 'politics',    label: 'Politics', color: '#8b5cf6', Icon: Users },
  { value: 'general',     label: 'General',  color: '#64748b', Icon: Hash },
];

export function getCategoryMeta(key?: string | null): CategoryMeta {
  const k = (key || 'general') as CategoryKey;
  return CATEGORIES.find(c => c.value === k) || CATEGORIES.find(c => c.value === 'general')!;
}
