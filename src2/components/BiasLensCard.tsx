'use client';
import React from 'react';
import { domainFromUrl } from '@/lib/utils/url';

type Comment = { id:number; side:'pour'|'contre'; sources?: {url:string}[] };

function typeOf(url:string){
  const h = domainFromUrl(url).toLowerCase();
  if (['.edu','.ac.','sciencedirect','nature.com','nih.gov','arxiv.org'].some(s=>h.includes(s))) return 'Academic';
  if (['.gouv','.gov','.gv.','admin.ch','europa.eu','who.int'].some(s=>h.includes(s))) return 'Gov/NGO';
  if (['guardian','bbc','reuters','apnews','ft.com','nytimes','lemonde','washingtonpost','bloomberg'].some(s=>h.includes(s))) return 'Media';
  return 'Blogs';
}

export default function BiasLensCard({ comments }:{ comments: Comment[] }) {
  // agrège par type: part YES (pour)
  const map = new Map<string,{yes:number;no:number}>();
  for (const c of comments) {
    const urls = c.sources?.map(s=>s.url) ?? [];
    const types = urls.length? urls.map(typeOf): ['Blogs'];
    const uniq = Array.from(new Set(types));
    for (const t of uniq) {
      const v = map.get(t) || {yes:0,no:0};
      c.side==='pour' ? v.yes++ : v.no++;
      map.set(t, v);
    }
  }
  const rows = Array.from(map.entries()).map(([k,v])=>{
    const tot = v.yes+v.no || 1;
    const yes = Math.round((v.yes/tot)*100);
    return { type:k, yes, no:100-yes };
  }).sort((a,b)=>b.yes-a.yes);

  const Bar = ({v,color}:{v:number;color:string})=>(
    <div style={{height:8, background:'var(--pill)', border:'1px solid var(--border)', borderRadius:999, overflow:'hidden'}}>
      <div style={{width:`${v}%`, height:'100%', background:color}}/>
    </div>
  );

  return (
    <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:16}}>
      <h3 style={{fontSize:16, fontWeight:800, color:'var(--text)', marginBottom:6}}>Bias lens (by source type)</h3>
      <div style={{display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:8, alignItems:'center'}}>
        <div/>
        <div style={{fontSize:11, color:'var(--muted)', textAlign:'center'}}>YES</div>
        <div style={{fontSize:11, color:'var(--muted)'}}>NO</div>
        {rows.map((r,i)=>(
          <React.Fragment key={i}>
            <div style={{fontSize:12, color:'var(--text)', fontWeight:700}}>{r.type}</div>
            <Bar v={r.yes} color="linear-gradient(90deg,#16a34a,#22c55e)"/>
            <Bar v={r.no} color="linear-gradient(90deg,#ef4444,#f87171)"/>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
