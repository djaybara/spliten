'use client';

import Link from 'next/link';

export type NewsItem = { id: number; label: string; href: string };

export default function NewsBar({ items }: { items: NewsItem[] }) {
  if (!items?.length) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '8px 16px',
        display: 'flex',
        gap: 16,
        overflowX: 'auto'
      }}>
        {items.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            style={{ fontSize: 13, whiteSpace: 'nowrap', opacity: .95, textDecoration: 'none' }}
          >
            • {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
