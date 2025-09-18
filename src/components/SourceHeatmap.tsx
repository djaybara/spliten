'use client';
import React from 'react';

export type Bucket = { label: string; count: number };

export default function SourceHeatmap({ buckets }: { buckets?: Bucket[] }) {
  const data =
    buckets && buckets.length
      ? buckets
      : [
          { label: 'Academic', count: 7 },
          { label: 'Media', count: 12 },
          { label: 'Blogs', count: 5 },
          { label: 'Gov/NGO', count: 4 },
        ];
  const max = Math.max(...data.map((b) => b.count), 1);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Source Heatmap</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Répartition des types de sources.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 80, fontSize: 12 }}>{b.label}</div>
            <div style={{ flex: 1, height: 10, background: 'var(--chip)', border: '1px solid var(--border)', borderRadius: 999 }}>
              <div
                style={{
                  width: `${(b.count / max) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg,#22c55e,#4ade80)',
                }}
              />
            </div>
            <div style={{ width: 28, fontSize: 12, textAlign: 'right', color: 'var(--muted)' }}>{b.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
