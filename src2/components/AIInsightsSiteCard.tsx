'use client';

import { Bot, Lightbulb, CheckCircle2, Eye } from 'lucide-react';
import * as React from 'react';
import { faviconCandidates, siteLabel } from '@/lib/utils/url';

type SiteInsights = {
  topics: string[];                 // ex: ["Regulation vs innovation", ...]
  summary: string;                  // ex: "Community leans pro-environment..."
  qualitySignals: string[];         // ex: ["Most cited sources ↑", ...]
  topSources?: { url: string; label?: string }[]; // pour badges source
  metrics?: {                       // (optionnel) affiche des mini stats
    proLeanPct?: number;            // ex: 62  (lean pro-environment)
    civilityScore?: number;         // ex: 7.8/10
    duplicationLow?: boolean;       // ex: true
  };
};

type Props = {
  insights: SiteInsights;
  bodyColor?: string;   // couleur du texte secondaire (par défaut var(--muted))
};

export default function AIInsightsSiteCard({ insights, bodyColor='var(--muted)' }: Props) {
  return (
    <div
      style={{
        backgroundColor: 'var(--card)',
        borderRadius: 12,
        padding: 16,
        border: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        backgroundImage: 'linear-gradient(135deg, rgba(102,126,234,0.06) 0%, rgba(118,75,162,0.06) 100%)'
      }}
    >
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{
          width:30, height:30, borderRadius:8, display:'flex', alignItems:'center',
          justifyContent:'center', background:'linear-gradient(135deg,#667eea,#764ba2)'
        }}>
          <Bot size={16} color="#fff" />
        </div>
        <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)' }}>AI Insights (site)</h3>
      </div>

      {/* Topics */}
      <section style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <Lightbulb size={14} color="#FFB000" />
          <span style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>Emerging Topics</span>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {insights.topics.map((t, i) => (
            <span key={i}
              style={{
                fontSize:12, color:'var(--text)', background:'var(--pill)',
                border:'1px solid var(--border)', borderRadius:999, padding:'6px 10px', fontWeight:600
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Quality signals */}
      <section style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <CheckCircle2 size={14} color="#00C851" />
          <span style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>Quality Signals</span>
        </div>
        <ul style={{ margin:0, paddingLeft:16, color:bodyColor, fontSize:12, lineHeight:1.45 }}>
          {insights.qualitySignals.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </section>

      {/* Summary */}
      <section style={{ marginBottom:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
          <Eye size={14} color="#667eea" />
          <span style={{ fontSize:13, fontWeight:800, color:'var(--text)' }}>Summary</span>
        </div>
        <p style={{ fontSize:12, color:bodyColor, lineHeight:1.5 }}>
          {insights.summary}
        </p>
      </section>

      {/* Metrics mini–chips (optionnel) */}
      {insights.metrics && (
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
          {typeof insights.metrics.proLeanPct === 'number' && (
            <MetricChip label="Pro-env lean" value={`${insights.metrics.proLeanPct}%`} />
          )}
          {typeof insights.metrics.civilityScore === 'number' && (
            <MetricChip label="Civility" value={`${insights.metrics.civilityScore}/10`} />
          )}
          {typeof insights.metrics.duplicationLow !== 'undefined' && (
            <MetricChip label="Duplication" value={insights.metrics.duplicationLow ? 'Low' : 'High'} />
          )}
        </div>
      )}

      {/* Top sources avec favicons nets */}
      {insights.topSources && insights.topSources.length > 0 && (
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:'var(--text)', marginBottom:6 }}>
            Most cited sources
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {insights.topSources.map((s, i) => (
              <SourceBadge key={i} url={s.url} label={s.label} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- sous-composants ---------- */

function MetricChip({ label, value }:{ label:string; value:string }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6, padding:'6px 10px',
      background:'var(--pill)', border:'1px solid var(--border)', borderRadius:999,
      fontSize:12, color:'var(--text)', fontWeight:700
    }}>
      <span style={{ opacity:.75, fontWeight:600 }}>{label}</span>
      <span style={{ fontWeight:800 }}>{value}</span>
    </span>
  );
}

function SourceBadge({ url, label }: { url:string; label?:string }) {
  // essaye une petite cascade d’URLs pour éviter les favicons flous
  const cands = faviconCandidates(url, 32);
  const [srcIdx, setSrcIdx] = React.useState(0);
  const src = cands[srcIdx] || '';
  const text = label || siteLabel(url);

  return (
    <a
      href={url}
      target="_blank" rel="noopener noreferrer"
      style={{
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'6px 10px', background:'var(--pill)',
        border:'1px solid var(--border)', borderRadius:999,
        textDecoration:'none', color:'var(--text)', fontSize:12, fontWeight:700
      }}
      onClick={(e)=>e.stopPropagation()}
    >
      <img
        src={src}
        alt=""
        width={16} height={16}
        style={{ width:16, height:16, borderRadius:4, objectFit:'cover', imageRendering:'-webkit-optimize-contrast' }}
        onError={() => setSrcIdx((i) => Math.min(i + 1, cands.length - 1))}
        loading="lazy"
        decoding="async"
      />
      <span>{text}</span>
    </a>
  );
}
