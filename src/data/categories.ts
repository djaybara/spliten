import { HomeIcon, Hash, Users, Briefcase, Cpu, Heart, Leaf, Newspaper } from 'lucide-react';

export const CATEGORIES = [
  { value: 'all', label: 'All', icon: HomeIcon, color: '#FF4500' },
  { value: 'news', label: 'News', icon: Newspaper, color: '#DC2626' },
  { value: 'general', label: 'General', icon: Hash, color: '#FFB000' },
  { value: 'politics', label: 'Politics', icon: Users, color: '#7193FF' },
  { value: 'work', label: 'Work', icon: Briefcase, color: '#FF66AC' },
  { value: 'technology', label: 'Tech', icon: Cpu, color: '#00D26A' },
  { value: 'lifestyle', label: 'Life', icon: Heart, color: '#FF8717' },
  { value: 'environment', label: 'Eco', icon: Leaf, color: '#46D160' }
];