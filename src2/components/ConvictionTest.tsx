'use client';
import React, { useState } from 'react';

const qs = [
  'Je pourrais défendre ce point devant quelqu’un d’opposé.',
  'J’ai au moins 2 sources solides.',
  'J’ai envisagé un contre-exemple plausible.',
  'Mon opinion changerait si une nouvelle preuve solide apparaît.',
  'Je comprends l’impact long-terme potentiel.',
];

export default function ConvictionTest() {
  const [answers, setAnswers] = useState<number[]>(Array(qs.length).fill(3)); // 1..5
  const score = Math.round((answers.reduce((a, b) => a + b, 0) / (qs.length * 5)) * 100);

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Conviction Test</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
        1 = pas d’accord • 5 = tout à fait d’accord
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {qs.map((q, i) => (
          <div key={i}>
            <div style={{ fontSize: 12, marginBottom: 6 }}>{q}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setAnswers((prev) => prev.map((x, idx) => (idx === i ? v : x)))}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    background: answers[i] === v ? 'linear-gradient(90deg,#dcfce7,#bbf7d0)' : 'var(--card)',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                  title={`Choisir ${v}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Conviction score: {score}/100</div>
        <div style={{ height: 10, background: 'var(--chip)', borderRadius: 999 }}>
          <div style={{ width: `${score}%`, height: '100%', background: 'linear-gradient(90deg,#22c55e,#4ade80)' }} />
        </div>
      </div>
    </div>
  );
}
