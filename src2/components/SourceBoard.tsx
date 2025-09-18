'use client';
import React from 'react';
import SourcePills from '@/components/SourcePills';
import { domainFromUrl } from '@/lib/utils/url';

type Item = { url:string; label?:string };
type Tag = 'media'|'academic'|'gov'|'blog';
type Lang = 'en'|'fr'|'es'|'de'|'other';

function heuristics(u:string){
  const host = domainFromUrl(u).toLowerCase();
  const tld = host.split('.').pop() || '';

  const academic = ['.edu','.ac.','sciencedirect','nature.com','nih.gov','arxiv.org'].some(s=>host.includes(s));
  const gov = ['.gouv','.gov','.gv.','admin.ch','europa.eu','who.int'].some(s=>host.includes(s));
  const media = ['bbc','guardian','reuters','apnews','ft.com','nytimes','lemonde','washingtonpost','bloomberg'].some(s=>host.includes(s));
  let tag:Tag = blogOr(media? 'media': (academic? 'academic': (gov? 'gov':'blog')));

  // langue simple
  let lang:Lang = 'other';
  if (['uk','us','com','io'].includes(tld)) lang='en';
  if (['fr'].includes(tld) || host.includes('.fr')) lang='fr';
  if (['es'].includes(tld) || host.includes('.es')) lang='es';
  if (['de'].includes(tld) || host.includes('.de')) lang='de';

  // paywall heuristique
  const paywall = ['ft.com','nytimes','wsj.com','economist.com'].some(s=>host.includes(s));

  // pays rapide
  const country = ['fr','uk','us','de','es'].find(c=>host.endsWith('.'+c)) || 'intl';

  return { tag, lang, paywall, country };
}
function blogOr(x:Tag){ return x; }

export default function SourceBoard({
  items
}:{ items: Item[] }) {
  const enriched = React.useMemo(()=> items.map(it => ({...it, meta:heuristics(it.url)})), [items]);

  const [filters, setFilters] = React.useState<{tag?:Tag, lang?:Lang, pay?:boolean}>({});
  const list = enriched.filter(e=>{
    if (filters.tag && e.meta.tag!==filters.tag) return false;
    if (filters.lang && e.meta.lang!==filters.lang) return false;
    if (filters.pay!==undefined && e.meta.paywall!==filters.pay) return false;
    return true;
  });

  const Btn = ({active,label,on}:{active:boolean;label:string;on:()=>void})=>(
    <button onClick={on} className="clickable"
      style={{padding:'4px 8px', border:'1px solid var(--border)', background: active?'#e0e7ff':'var(--pill)', color:'var(--text)', borderRadius:999, fontSize:12}}>
      {label}
    </button>
  );

  return (
    <div style={{border:'1px solid var(--border)', background:'var(--card)', borderRadius:12, padding:12 }}>
      <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10}}>
        <span style={{fontSize:12, fontWeight:800, color:'var(--text)'}}>Filters</span>
        <Btn active={!filters.tag} label="All types" on={()=>setFilters(f=>({...f, tag:undefined}))}/>
        {(['media','academic','gov','blog'] as Tag[]).map(t=>
          <Btn key={t} active={filters.tag===t} label={t} on={()=>setFilters(f=>({...f, tag: f.tag===t? undefined : t}))}/>
        )}
        <div style={{width:1, height:18, background:'var(--border)', margin:'0 4px'}}/>
        <Btn active={!filters.lang} label="All languages" on={()=>setFilters(f=>({...f, lang:undefined}))}/>
        {(['en','fr','es','de'] as Lang[]).map(l=>
          <Btn key={l} active={filters.lang===l} label={l.toUpperCase()} on={()=>setFilters(f=>({...f, lang: f.lang===l? undefined : l}))}/>
        )}
        <div style={{width:1, height:18, background:'var(--border)', margin:'0 4px'}}/>
        <Btn active={filters.pay===undefined} label="All access" on={()=>setFilters(f=>({...f, pay:undefined}))}/>
        <Btn active={filters.pay===false} label="Free" on={()=>setFilters(f=>({...f, pay:false}))}/>
        <Btn active={filters.pay===true} label="Paywalled" on={()=>setFilters(f=>({...f, pay:true}))}/>
      </div>

      {/* liste (réutilise tes pills) */}
      <SourcePills list={list.map(({url,label})=>({url,label}))}/>
    </div>
  );
}
