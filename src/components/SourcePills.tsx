// src/components/SourcePills.tsx
'use client';

import React from 'react';
import { faviconUrl, faviconSrcSet, siteLabel, normalizeUrl } from '@/lib/utils/url';

type Item = { url: string; label?: string };
export default function SourcePills({ list }: { list: Item[] }) {
  if (!list?.length) return null;

  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {list.map((it, i) => {
        const href = normalizeUrl(it.url) || it.url;
        const label = it.label || siteLabel(href);
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="clickable"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'6px 10px',
              background:'var(--pill)', border:'1px solid var(--border)',
              borderRadius:999, color:'var(--text)', textDecoration:'none',
              lineHeight:1
            }}
          >
            {/* Image 16px visuel mais fournie en 2x → net */}
            <img
              src={faviconUrl(href, 32)}         // ← 32px généré pour écran retina
              srcSet={faviconSrcSet(href, 16)}   // ← 1x/2x
              width={16}
              height={16}
              alt=""
              style={{ display:'block', borderRadius:4, imageRendering:'-webkit-optimize-contrast' }}
              loading="lazy"
              decoding="async"
            />
            <span style={{ fontSize:12, fontWeight:600 }}>{label}</span>
          </a>
        );
      })}
    </div>
  );
}
