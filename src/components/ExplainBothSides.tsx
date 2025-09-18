'use client';
import React from 'react';

type Comment = { side:'pour'|'contre'; text:string; votes:number };

function summarize(comments:Comment[], side:'pour'|'contre'){
  const top = comments.filter(c=>c.side===side).sort((a,b)=>b.votes-a.votes).slice(0,5);
  const s = top.map(t=>t.text).join(' ');
  // découpe naïve → 100 mots max
  const words = s.split(/\s+/).slice(0,100).join(' ');
  return words + (s.split(/\s+/).length>100 ? '…' : '');
}

export default function ExplainBothSides({ comments }:{ comments: Comment[] }){
  const [open, setOpen] = React.useState(false);
  const forSum = summarize(comments,'pour');
  const againstSum = summarize(comments,'contre');

  return (
    <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12}}>
      <button onClick={()=>setOpen(o=>!o)} className="clickable"
        style={{border:'none', background:'linear-gradient(135deg,#667eea,#764ba2)', color:'#fff', fontWeight:800, borderRadius:8, padding:'8px 12px'}}>
        Explain both sides (100 words)
      </button>
      {open && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
          <div>
            <div style={{fontSize:12, fontWeight:800, color:'#16a34a', marginBottom:6}}>FOR</div>
            <p style={{fontSize:12, color:'var(--text)'}}>{forSum}</p>
          </div>
          <div>
            <div style={{fontSize:12, fontWeight:800, color:'#ef4444', marginBottom:6}}>AGAINST</div>
            <p style={{fontSize:12, color:'var(--text)'}}>{againstSum}</p>
          </div>
        </div>
      )}
    </div>
  );
}
