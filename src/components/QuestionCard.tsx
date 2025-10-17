// src/components/QuestionCard.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Flame, Clock, Star,
  ChevronUp, ChevronDown, MessageSquare, Share2, Bookmark,
} from 'lucide-react';
import { getCategoryMeta } from '@/lib/categories';
import SourcePills from '@/components/SourcePills';

// Normalise les URLs (ajoute https:// si manquant)
const fixSources = (arr?: { url: string }[]) =>
  (arr || []).map(s => ({ url: /^https?:\/\//i.test(s.url) ? s.url : `https://${s.url}` }));


type Badge = 'trending' | 'controversial' | 'new' | 'top';
type VoteSide = 'pour' | 'contre';

export type QuestionCardProps = {
  id: number;
  slugHref?: string;                 // ex: `/questions/1-title`
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  views: number;
  pour: number;
  contre: number;
  badges?: Badge[];
  description?: string;
  sources?: { url: string }[];

  /** UI flags */
  showDescription?: boolean;
  showSources?: boolean;

  /** State user */
  userOpinion?: VoteSide | null;

  /** Actions */
  onYes?: () => void;
  onNo?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onCommentsClick?: () => void;

  /** Compteurs pour l’action bar */
  commentsCount?: number;

  /** Option: clickable card navigation (Home) */
  onCardClick?: () => void;
};

export default function QuestionCard(props: QuestionCardProps) {
  const {
    slugHref,
    title, category, author, timeAgo, views,
    pour, contre, badges = [],
    description, sources = [],
    showDescription = true,
    showSources = true,
    userOpinion = null,
    onYes, onNo, onShare, onSave, onCommentsClick,
    commentsCount = 0,
    onCardClick,
  } = props;

  const cat = getCategoryMeta(category);

  const { yesPct, noPct, total } = useMemo(() => {
    const t = pour + contre;
    const y = t ? Math.round((pour / t) * 100) : 0;
    return { yesPct: y, noPct: 100 - y, total: t };
  }, [pour, contre]);

  return (
    <div
      onClick={onCardClick}
      style={{
        background: 'var(--card)', borderRadius: 12, padding: 16, marginBottom: 12,
        border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        cursor: onCardClick ? 'pointer' : 'default'
      }}
      onMouseEnter={(e)=>{ if(onCardClick) { (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.10)'; } }}
      onMouseLeave={(e)=>{ if(onCardClick) { (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 3px rgba(0,0,0,0.08)'; } }}
    >
      {/* Meta */}
      <div className="flex items-center flex-wrap gap-2 mb-3" style={{ marginBottom: 12 }}>
        {/* Catégorie — couleur = celle de l’icône */}
        <span className="px-2 py-1 rounded text-xs"
              style={{ background: 'var(--chip)', color: cat.color, fontWeight: 800 }}>
          {category}
        </span>

        {badges.map((b) => {
          const { bg, color, Icon } = getBadgeStyle(b);
          return (
            <span key={b} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
                  style={{ background: bg, color }}>
              <Icon size={12}/> {b}
            </span>
          );
        })}

        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          • by {author} • {timeAgo}
        </span>
      </div>

      {/* Titre */}
      {slugHref ? (
        <Link href={slugHref} onClick={(e)=>e.stopPropagation()}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
            {title}
          </h3>
        </Link>
      ) : (
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 8, lineHeight: 1.4 }}>
          {title}
        </h3>
      )}

      {/* Description (optionnelle) */}
      {showDescription && !!description && (
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 10 }}>{description}</p>
      )}

      {/* Sources (optionnelles) */}
      {showSources && sources.length > 0 && (
        <div style={{ marginTop: 4, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#10b981', border: '1px solid #065f46' }}/>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>Sources for this question</span>
          </div>
          <SourcePills list={fixSources(sources)}/>
        </div>
      )}

      {/* YES / BAR / NO */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onYes?.(); }}
            className="clickable"
            style={{
              padding:'6px 14px',
              backgroundColor: userOpinion === 'pour' ? '#00C851' : 'var(--card)',
              border: '2px solid #00C851', borderRadius: 20,
              color: userOpinion === 'pour' ? 'white' : '#00C851',
              fontSize: 13, fontWeight: 800
            }}
          >YES ({pour})</button>

          <div style={{ flex:1, height:24, backgroundColor:'var(--chip)', border:'1px solid var(--border)', borderRadius:12, position:'relative', overflow:'hidden' }}>
            <div style={{
              position:'absolute', left:0, top:0, height:'100%', width:`${yesPct}%`,
              background:'linear-gradient(90deg, #00C851, #00E676)',
              display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:6,
              color:'white', fontSize:11, fontWeight:800
            }}>{`${yesPct}%`}</div>

            <div style={{
              position:'absolute', right:0, top:0, height:'100%', width:`${noPct}%`,
              background:'linear-gradient(90deg, #FF3547, #FF6B7A)',
              display:'flex', alignItems:'center', justifyContent:'flex-start', paddingLeft:6,
              color:'white', fontSize:11, fontWeight:800
            }}>{`${noPct}%`}</div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onNo?.(); }}
            className="clickable"
            style={{
              padding:'6px 14px',
              backgroundColor: userOpinion === 'contre' ? '#FF3547' : 'var(--card)',
              border: '2px solid #FF3547', borderRadius: 20,
              color: userOpinion === 'contre' ? 'white' : '#FF3547',
              fontSize: 13, fontWeight: 800
            }}
          >NO ({contre})</button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          {total.toLocaleString()} votes • {views.toLocaleString()} views
        </div>
      </div>

      {/* ACTION BAR (comme la Home) */}
      <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'flex-start', marginTop: 10 }}>
        <VoteChip
          score={(pour - contre)}
          onUp={() => onYes?.()}
          onDown={() => onNo?.()}
        />
        <Pill icon={<MessageSquare size={18}/>} label={String(commentsCount)} onClick={onCommentsClick}/>
<Pill icon={<Share2 size={18}/>} onClick={onShare} stopCardClick />
<Pill icon={<Bookmark size={18}/>} onClick={onSave} stopCardClick />
      </div>
    </div>
  );
}

/* ===== Helpers visuels ===== */

function Pill({
  icon,
  label,
  onClick,
  stopCardClick = false,   // 👈 nouveau
}:{
  icon: React.ReactNode;
  label?: string;
  onClick?: ()=>void;
  stopCardClick?: boolean; // 👈 nouveau
}) {
  return (
    <button
      onClick={(e) => {
        if (stopCardClick) e.stopPropagation(); // 👈 empêche l’ouverture de la carte
        onClick?.();
      }}
      className="clickable"
      style={{
        display:'inline-flex', alignItems:'center', gap:8,
        padding:'10px 14px',
        background:'var(--pill)', border:'1px solid var(--border)',
        color:'var(--text)', borderRadius:16, fontSize:14, fontWeight:600,
        boxShadow:'0 1px 2px rgba(0,0,0,0.04)'
      }}
    >
      {icon}{label ? <span>{label}</span> : null}
    </button>
  );
}


function VoteChip({ score, onUp, onDown }:{ score:number; onUp:()=>void; onDown:()=>void }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--pill)', border:'1px solid var(--border)', color:'var(--text)', borderRadius:16, padding:'10px 14px', fontWeight:700 }}>
      <button onClick={(e)=>{e.stopPropagation(); onUp();}}   className="clickable" aria-label="Upvote"   style={{ background:'transparent', border:'none', color:'var(--text)' }}><ChevronUp size={18}/></button>
      <span style={{ minWidth:42, textAlign:'center', fontSize:14 }}>{score}</span>
      <button onClick={(e)=>{e.stopPropagation(); onDown();}} className="clickable" aria-label="Downvote" style={{ background:'transparent', border:'none', color:'var(--text)' }}><ChevronDown size={18}/></button>
    </div>
  );
}

function getBadgeStyle(badge: 'trending' | 'controversial' | 'new' | 'top') {
  const map = {
    trending:     { bg:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'#fff', Icon: TrendingUp },
    controversial:{ bg:'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color:'#fff', Icon: Flame },
    new:          { bg:'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color:'#fff', Icon: Clock },
    top:          { bg:'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color:'#fff', Icon: Star },
  } as const;
  return map[badge] || map.top;
}
