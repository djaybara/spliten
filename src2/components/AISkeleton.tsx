'use client';
import React from 'react';

export default function AISkeleton() {
  const line = { height: 10, borderRadius: 6, background: 'var(--pill)', overflow: 'hidden' } as const;
  const shimmer = {
    width: '40%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.16), rgba(255,255,255,0.04))',
    animation: 'aiShimmer 1.2s infinite',
  } as React.CSSProperties;

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: '#667eea' }} />
        <div style={{ width: 140, height: 14, borderRadius: 6, background: 'var(--pill)' }} />
      </div>

      <div style={{ ...line, marginBottom: 8, position: 'relative' }}>
        <div style={{ ...shimmer }} />
      </div>
      <div style={{ ...line, marginBottom: 8, position: 'relative', width: '92%' }}>
        <div style={{ ...shimmer }} />
      </div>
      <div style={{ ...line, marginBottom: 8, position: 'relative', width: '85%' }}>
        <div style={{ ...shimmer }} />
      </div>

      <style>{`
        @keyframes aiShimmer {
          0% { transform: translateX(-60%); }
          100% { transform: translateX(260%); }
        }
      `}</style>
    </div>
  );
}
