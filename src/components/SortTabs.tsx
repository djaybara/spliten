'use client';

import { Flame, Newspaper, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import React from 'react';

type Props = {
  value: 'hot' | 'news' | 'new' | 'top' | 'controversial';
  onChange: (v: Props['value']) => void;
  top: number;
  isMobile: boolean;
  height: number; // doit matcher le bouton Create Post
};

export default function SortTabs({ value, onChange, top, isMobile, height }: Props) {
  const items = [
    { value: 'hot', label: 'Hot', icon: Flame as any },
    { value: 'news', label: 'News', icon: Newspaper as any, color: '#DC2626' },
    { value: 'new', label: 'New', icon: Clock as any },
    { value: 'top', label: 'Top', icon: TrendingUp as any },
    { value: 'controversial', label: 'Controversial', icon: BarChart3 as any },
  ];

  return (
    <div
      className="js-sort-tabs"
      role="tablist"
      aria-label="Sort posts"
      style={{
        position: !isMobile ? ('sticky' as const) : ('static' as const),
        top: !isMobile ? top : 0,
        zIndex: 60,
        backgroundColor: 'var(--card)',
        border: `1px solid var(--border)`,
        borderRadius: 12,
        height,
        minHeight: height,
        boxSizing: 'border-box',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin' as any,
      }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const active = value === it.value;
        const bgActive = it.color ? `${it.color}20` : 'rgba(102,126,234,0.15)';
        const bgIdle = it.color ? `${it.color}10` : 'transparent';
        const color = active ? (it.color || '#667eea') : (it.color || 'var(--muted)');
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value as any)}
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 20,
              border: 'none',
              backgroundColor: active ? bgActive : bgIdle,
              color,
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <Icon size={16} aria-hidden />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
