// src/components/HomeInsights.tsx
'use client';

import { Bot, Lightbulb, Eye, CheckCircle } from 'lucide-react';

export default function HomeInsights({
  totalQuestions,
  hotTopic,
  underDiscussed,
}: {
  totalQuestions: number;
  hotTopic: string;
  underDiscussed: string[];
}) {
  return (
    <div className="card" style={{ borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', background: 'var(--card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Bot size={18} />
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>AI Insights (Home)</h3>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Eye size={14}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Overview</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
          {totalQuestions} active questions • hottest: <strong>{hotTopic}</strong>
        </p>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Lightbulb size={14}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Under-discussed angles</span>
        </div>
        <ul style={{ paddingLeft: 16, margin: 0 }}>
          {underDiscussed.map((u, i) => (
            <li key={i} style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{u}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <CheckCircle size={14}/>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Auto-generated from Home feed (not a per-question insight)</span>
      </div>
    </div>
  );
}