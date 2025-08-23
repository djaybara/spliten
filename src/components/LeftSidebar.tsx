// src/components/LeftSidebar.tsx
'use client';
import { Home as HomeIcon, Hash, Users, Briefcase, Cpu, Heart, Leaf } from 'lucide-react';

type Category = { value: string; label: string; icon: any; color: string };

const defaultCategories: Category[] = [
  { value: 'all', label: 'All', icon: HomeIcon, color: '#FF4500' },
  { value: 'general', label: 'General', icon: Hash, color: '#FFB000' },
  { value: 'politics', label: 'Politics', icon: Users, color: '#7193FF' },
  { value: 'work', label: 'Work', icon: Briefcase, color: '#FF66AC' },
  { value: 'technology', label: 'Tech', icon: Cpu, color: '#00D26A' },
  { value: 'lifestyle', label: 'Life', icon: Heart, color: '#FF8717' },
  { value: 'environment', label: 'Eco', icon: Leaf, color: '#46D160' }
];

export default function LeftSidebar({
  width = 240,
  activeCategory = 'all',
  categories = defaultCategories
}: {
  width?: number;
  activeCategory?: string;
  categories?: Category[];
}) {
  return (
    <aside style={{ width }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#8899A6', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Categories</h3>
        {categories.map(cat => {
          const Icon = cat.icon as any;
          const isSelected = activeCategory === cat.value;
          return (
            <div
              key={cat.value}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                backgroundColor: isSelected ? '#F7F9FA' : 'transparent', borderRadius: '8px',
                marginBottom: '4px'
              }}
            >
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px', backgroundColor: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSelected ? 1 : 0.8
              }}>
                <Icon size={14} color="white" />
              </div>
              <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '500', color: isSelected ? '#1a1a1a' : '#536471' }}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Users size={16} color="#667eea" />
          <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Auto-Translate</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#8899A6', marginBottom: '12px' }}>AI translates content in real-time</p>
        <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E1E8ED', fontSize: '13px', backgroundColor: 'white' }}>
          <option>English</option>
          <option>Français</option>
          <option>Español</option>
          <option>Deutsch</option>
          <option>中文</option>
        </select>
      </div>
    </aside>
  );
}
