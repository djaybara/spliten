'use client';
import React from 'react';

export type OpinionPoint = { date: string; yes: number; no: number };

export default function OpinionTimeline({ series }: { series?: OpinionPoint[] }) {
  // Démo auto si pas de props
  const data =
    series && series.length
      ? series
      : [
          { date: 'Day 1', yes: 52, no: 48 },
          { date: 'Day 2', yes: 55, no: 45 },
          { date: 'Day 3', yes: 57, no: 43 },
          { date: 'Day 4', yes: 59, no: 41 },
          { date: 'Day 5', yes: 60, no: 40 },
        ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Opinion Timeline</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        Évolution YES/NO (démo). Remplacer par une vraie courbe plus tard.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: 8 }}>
        <div />
        <div style={{ fontSize: 12, fontWeight: 700 }}>YES %</div>
        <div style={{ fontSize: 12, fontWeight: 700 }}>NO %</div>
        {data.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.date}</div>
            <Bar value={p.yes} color="linear-gradient(90deg,#16a34a,#22c55e)" />
            <Bar value={p.no} color="linear-gradient(90deg,#ef4444,#f87171)" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Bar({ value, color }: { value: number; color: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div style={{ height: 10, background: 'var(--chip)', border: '1px solid var(--border)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${v}%`, height: '100%', background: color }} />
    </div>
  );
}
