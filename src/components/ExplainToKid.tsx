'use client';
import React from 'react';

export default function ExplainToKid({ summary }: { summary?: string }) {
  const s =
    summary ??
    "Imagine deux équipes qui discutent : l’une dit que c’est bon, l’autre dit que c’est risqué. On regarde des preuves, on vérifie si c’est juste, et on décide avec ce qu’on sait.";
  const bullets = [
    'Qu’est-ce qui est bien ?',
    'Qu’est-ce qui peut être dangereux ?',
    'Quelles preuves on a vraiment ?',
    'Qu’est-ce qu’on ne sait pas encore ?',
  ];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Explain like I’m 12</h3>
      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s}</p>
      <ul style={{ marginTop: 8, paddingLeft: 18 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
