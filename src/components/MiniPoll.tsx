'use client';
import React, { useState } from 'react';

export default function MiniPoll({
  question,
  options,
}: {
  question?: string;
  options?: string[];
}) {
  const q = question ?? 'Le point X devrait-il être prioritaire ?';
  const opts = options ?? ['Oui', 'Non', 'Besoin de plus de preuves'];

  const [votes, setVotes] = useState<number[]>(Array(opts.length).fill(0));
  const [picked, setPicked] = useState<number | null>(null);
  const total = votes.reduce((a, b) => a + b, 0);

  const vote = (i: number) => {
    if (picked !== null) return;
    const next = votes.slice();
    next[i] += 1;
    setVotes(next);
    setPicked(i);
  };

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Mini Poll</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{q}</p>
      <div style={{ display: 'grid', gap: 8 }}>
        {opts.map((label, i) => {
          const pct = total ? Math.round((votes[i] / total) * 100) : 0;
          return (
            <button
              key={i}
              onClick={() => vote(i)}
              style={{
                textAlign: 'left',
                padding: '8px 10px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: picked === i ? 'linear-gradient(90deg,#e0e7ff,#f5f3ff)' : 'var(--card)',
                cursor: picked === null ? 'pointer' : 'default',
              }}
              title="Vote"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--chip)', borderRadius: 999, marginTop: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)' }} />
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>{total} votes</div>
    </div>
  );
}
