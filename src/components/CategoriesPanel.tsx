// src/components/CategoriesPanel.tsx
'use client';

import React from 'react';
import { CATEGORIES, type CategoryKey, getCategoryMeta } from '@/lib/categories';

type Props = {
  selected?: CategoryKey | 'all';
  onSelect?: (value: CategoryKey | 'all') => void;
  /** Quand on veut un lien direct au lieu d’un onSelect (Home vs Page question) */
  onNavigate?: (value: CategoryKey | 'all') => void;
  title?: string;
};

export default function CategoriesPanel({
  selected = 'all',
  onSelect,
  onNavigate,
  title = 'Categories',
}: Props) {
  return (
    <div style={{
      backgroundColor: 'var(--card)', borderRadius: 12, padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 16,
      border: '1px solid var(--border)'
    }}>
      <h3 style={{
        fontSize: 12, fontWeight: 800, color: 'var(--muted)',
        textTransform: 'uppercase', marginBottom: 12
      }}>{title}</h3>

      {CATEGORIES.map(cat => {
        const isSelected = selected === cat.value;
        return (
          <button
            key={cat.value}
            onClick={() => {
              if (onSelect) onSelect(cat.value);
              if (onNavigate) onNavigate(cat.value);
            }}
            className="clickable"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              background: isSelected ? 'var(--pill)' : 'transparent',
              border: 'none', borderRadius: 8, transition: 'all 0.2s',
              marginBottom: 4
            }}
            onMouseEnter={(e)=>{ if(!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor='var(--pill)'; }}
            onMouseLeave={(e)=>{ if(!isSelected) (e.currentTarget as HTMLButtonElement).style.backgroundColor='transparent'; }}
          >
            <cat.Icon size={18} color={cat.color}/>
            <span style={{
              fontSize: 14, fontWeight: isSelected ? 700 : 500,
              color: 'var(--text)'
            }}>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Helper pour récupérer uniquement la couleur/icône d’une catégorie */
export function useCategoryBadge(category?: string) {
  const meta = getCategoryMeta(category);
  return { color: meta.color, Icon: meta.Icon, label: meta.label };
}
