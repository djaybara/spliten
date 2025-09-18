'use client';
import React from 'react';

export type ArgumentBurst = { date: string; count: number; label?: string };

export default function ArgumentTimeline({ bursts }: { bursts?: ArgumentBurst[] }) {
  const data =
    bursts && bursts.length
      ? bursts
      : [
          { date: 'Mon', count: 6, label: 'news drop' },
          { date: 'Tue', count: 12 },
          { date: 'Wed', count: 4 },
          { date: 'Thu', count: 18, label: 'viral thread' },
          { date: 'Fri', count: 9 },
        ];
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Argument Timeline</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Pics d’activité (nb d’arguments publiés).
      </p>

      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
              <span style={{ color: 'var(--text)', fontWeight: 700 }}>{d.date}</span>
              <span style={{ color: 'var(--muted)' }}>{d.count}</span>
            </div>
            <div style={{ height: 8, background: 'var(--chip)', border: '1px solid var(--border)', borderRadius: 999 }}>
              <div
                style={{
                  height: '100%',
                  width: `${(d.count / max) * 100}%`,
                  background: 'linear-gradient(90deg,#667eea,#764ba2)',
                  borderRadius: 999,
                }}
              />
            </div>
            {!!d.label && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>• {d.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
