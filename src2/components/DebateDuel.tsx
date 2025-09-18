'use client';
import React, { useState } from 'react';

export default function DebateDuel({
  left,
  right,
}: {
  left?: { text: string; votes: number };
  right?: { text: string; votes: number };
}) {
  const [A, setA] = useState(left ?? { text: 'FOR: “Étude RCT montre +25% …”', votes: 42 });
  const [B, setB] = useState(right ?? { text: 'AGAINST: “Biais d’échantillonnage …”', votes: 31 });

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Debate Duel</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {[{ side: 'A', v: A, set: setA }, { side: 'B', v: B, set: setB }].map(({ side, v, set }) => (
          <div key={side} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>{v.text}</div>
            <button
              onClick={() => set({ ...v, votes: v.votes + 1 })}
              style={{ fontSize: 12, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}
              title="Upvote"
            >
              +{v.votes} vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
