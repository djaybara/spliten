'use client';

import * as React from 'react';

export default function AISiteSkeleton() {
  const row = (w:number)=>(
    <div style={{
      height: 10, width: w+'%',
      background: 'var(--pill)', borderRadius: 999,
      border: '1px solid var(--border)'
    }}/>
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 12,
        padding: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        backgroundImage: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)',
        overflow: 'hidden'
      }}
      aria-busy="true"
      aria-live="polite"
    >
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div className="skeleton-pulse" style={{
          width:30, height:30, borderRadius:8, background:'var(--pill)',
          border:'1px solid var(--border)'
        }}/>
        <div className="skeleton-pulse" style={{ height:14, width:120, borderRadius:6, background:'var(--pill)', border:'1px solid var(--border)' }}/>
      </div>

      {/* topics chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
        {[70,50,62,40].map((w,i)=>(
          <div key={i} className="skeleton-pulse" style={{
            height: 24, width: w, minWidth: 80,
            background:'var(--pill)', border:'1px solid var(--border)',
            borderRadius:999
          }}/>
        ))}
      </div>

      {/* quality */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
        {row(80)}
        {row(60)}
        {row(70)}
      </div>

      {/* summary */}
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {row(95)}
        {row(88)}
        {row(76)}
      </div>

      <style>
        {`
          .skeleton-pulse {
            animation: pulse 1.3s ease-in-out infinite;
          }
          @keyframes pulse {
            0%   { opacity: 0.55; }
            50%  { opacity: 0.95; }
            100% { opacity: 0.55; }
          }
        `}
      </style>
    </div>
  );
}
