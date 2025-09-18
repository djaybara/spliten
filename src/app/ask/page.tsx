// src/app/ask/page.tsx
'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/Navbar';

export default function AskPage() {
  const router = useRouter();

  // mock auth pour l’instant (Clerk plus tard)
  const [isLoggedIn] = useState(true);
  const [username] = useState('you');

  // Form
  const [title, setTitle]   = useState('');
  const [labelA, setA]      = useState('Yes');
  const [labelB, setB]      = useState('No');
  const [category, setCat]  = useState('general');
  const [mediaUrl, setUrl]  = useState('');
  const [busy, setBusy]     = useState(false);
  const canSubmit = title.trim().length >= 8 && labelA.trim() && labelB.trim();

  // 🔎 SIMILAR: état + effet (debounce 300ms)
  const [similar, setSimilar] = useState<{ slug: string; title: string }[]>([]);
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = title.trim();
      if (q.length < 4) { setSimilar([]); return; }
      try {
        const r = await fetch(`/api/questions/similar?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        const d = await r.json();
        setSimilar(Array.isArray(d?.items) ? d.items : []);
      } catch {
        setSimilar([]); // en cas d’erreur réseau, on n’affiche rien
      }
    }, 300);
    return () => clearTimeout(t);
  }, [title]);

  const previewPct = useMemo(() => {
    const sum = Math.max(1, labelA.length + labelB.length);
    const a = Math.round((labelA.length / sum) * 100);
    return { a, b: 100 - a };
  }, [labelA, labelB]);

  // 🔒 Turnstile: token anti-bot
  const [tsToken, setTsToken] = useState('');
  useEffect(() => {
    // callback globale appelée par le widget Turnstile (data-callback)
    (window as any).onTsVerify = (t: string) => setTsToken(t);
    return () => { (window as any).onTsVerify = undefined; };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;

    // Exige le token Turnstile (sécurité anti-bot)
    if (!tsToken) { alert('Veuillez compléter la vérification anti-bot.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          title, labelA, labelB, category,
          mediaUrl: mediaUrl || undefined,
          authorId: 'demo-user',     // TODO: remplacer par user.id (Clerk) quand branché
          turnstile: tsToken,        // 🔒 on envoie le token au serveur
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'POST_FAILED');
      router.replace(`/questions/${data.question.slug}`);
    } catch (err:any) {
      alert(`Failed: ${err.message || err}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      {/* Script Turnstile (auto-render) */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <Navbar
        isMobile={true}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={''}
        onSearchChange={()=>{}}
        onLoginClick={()=>alert('Login (mock)')}
        onSignupClick={()=>alert('Signup (mock)')}
        onAskClick={()=>{}}
      />

      <div style={{ maxWidth:720, margin:'0 auto', padding:16 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)', marginBottom:12 }}>Create a question</h1>

        <form onSubmit={onSubmit} style={{ display:'grid', gap:12 }}>
          {/* Title */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Title</span>
            <textarea
              value={title}
              onChange={(e)=>setTitle(e.target.value)}
              placeholder="Ask a clear yes/no (or A/B) question…"
              style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12, minHeight:90 }}
            />
          </label>

          {/* 🔎 Suggestions juste sous le textarea Title */}
          {similar.length > 0 && (
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:700 }}>
                Possible duplicates
              </div>
              <ul style={{ display:'grid', gap:8, listStyle:'none', margin:0, padding:0 }}>
                {similar.map((s)=>(
                  <li key={s.slug}>
                    <a
                      href={`/questions/${s.slug}`}
                      style={{ color:'#667eea', fontWeight:700, textDecoration:'underline' }}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Labels */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Label A</span>
              <input
                value={labelA}
                onChange={(e)=>setA(e.target.value)}
                style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}
              />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Label B</span>
              <input
                value={labelB}
                onChange={(e)=>setB(e.target.value)}
                style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}
              />
            </label>
          </div>

          {/* Category */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Category</span>
            <select
              value={category}
              onChange={(e)=>setCat(e.target.value)}
              style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:10 }}
            >
              {['general','news','politics','technology','work','lifestyle','environment'].map(c=>(
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Media URL */}
          <label style={{ display:'grid', gap:6 }}>
            <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Image/Video URL (optional)</span>
            <input
              value={mediaUrl}
              onChange={(e)=>setUrl(e.target.value)}
              placeholder="https://…"
              style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}
            />
          </label>

          {/* Preview simple */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
            <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:700 }}>Preview</div>
            <div style={{ display:'grid', gridTemplateColumns:`${previewPct.a}% ${previewPct.b}%`, gap:4, height:22 }}>
              <div title={labelA} style={{ background:'#00C851', borderRadius:6 }} />
              <div title={labelB} style={{ background:'#FF3547', borderRadius:6 }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--muted)', marginTop:6 }}>
              <span>{labelA} ({previewPct.a}%)</span>
              <span>{labelB} ({previewPct.b}%)</span>
            </div>
          </div>

          {/* Turnstile widget (au-dessus des boutons) */}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <div
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              data-callback="onTsVerify"
            />
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button
              type="button"
              onClick={()=>history.back()}
              style={{ background:'transparent', border:'1px solid var(--border)', borderRadius:999, padding:'10px 18px', color:'var(--muted)', fontWeight:800 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || busy}
              style={{
                background: canSubmit && !busy ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--border)',
                color: canSubmit && !busy ? '#fff' : 'var(--muted)',
                border:'none', borderRadius:999, padding:'10px 18px', fontWeight:800,
                opacity: busy ? 0.8 : 1, cursor: busy ? 'wait' : 'pointer'
              }}
            >
              {busy ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
