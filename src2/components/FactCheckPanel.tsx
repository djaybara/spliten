'use client';
import React from 'react';
import { ensureProtocol } from '@/lib/utils/url';

type Comment = { text:string; sources?:{url:string}[] };

function extractClaims(text:string){
  // très simple: récupère phrases avec nombres/%
  return text
    .split(/(?<=[\.\!\?])\s+/)
    .filter(s => /\d/.test(s) || /%/.test(s))
    .slice(0,3);
}
function buildQuery(c:string){
  const q = encodeURIComponent(c);
  // multi-moteurs utiles pour fact-check
  return {
    google: `https://www.google.com/search?q=${q}+site:reuters.com+OR+site:apnews.com+OR+site:snopes.com+OR+site:fullfact.org`,
    bing: `https://www.bing.com/search?q=${q}+site:reuters.com+OR+site:apnews.com`,
  };
}

export default function FactCheckPanel({ comments }:{ comments: Comment[] }){
  const claims = Array.from(
    new Set(comments.flatMap(c => extractClaims(c.text)))
  ).slice(0,8);

  if (claims.length===0) return null;

  return (
    <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16}}>
      <h3 style={{fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:8}}>One-click fact-check</h3>
      <div style={{display:'grid', gap:8}}>
        {claims.map((cl,i)=>{
          const q = buildQuery(cl);
          return (
            <div key={i} style={{fontSize:12, color:'var(--text)'}}>
              <div style={{marginBottom:6}}>{cl}</div>
              <div style={{display:'flex', gap:8}}>
                <a href={q.google} target="_blank" className="clickable" style={{fontSize:12, color:'#2563eb'}}>Google</a>
                <a href={q.bing} target="_blank" className="clickable" style={{fontSize:12, color:'#2563eb'}}>Bing</a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
