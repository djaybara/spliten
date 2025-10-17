// src/app/ask/page.tsx
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/Navbar';

/** Mini util */
function isValidUrl(u: string) {
  try { new URL(u); return true; } catch { return false; }
}

/** Carte AI Insights spécifique à la page Ask (différente de Home/Question) */
function AIInsightsAskCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 14, marginBottom: 20
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
        🤖 {title}
      </div>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13 }}>
        {bullets.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
      </ul>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        Tip : garde la question neutre, précise, et testable par oui/non.
      </div>
    </div>
  );
}

/** Pills source simple */
function SourcePill({ url, onRemove }: { url: string; onRemove: () => void }) {
  const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'var(--pill)', color: 'var(--text)',
      border: '1px solid var(--border)', borderRadius: 999,
      padding: '6px 10px', fontSize: 12
    }}>
      {host}
      <button type="button" onClick={onRemove}
        title="Remove" aria-label="Remove source"
        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
        ×
      </button>
    </span>
  );
}

/** Presets de labels (pour/contre, etc.) */
const LABEL_PRESETS: Array<{ a: string; b: string; name: string }> = [
  { a: 'Pour', b: 'Contre', name: 'Pour/Contre' },
  { a: 'Yes', b: 'No', name: 'Yes/No' },
  { a: 'Vrai', b: 'Faux', name: 'Vrai/Faux' },
  { a: 'A', b: 'B', name: 'A/B' },
];

function AskBuilder() {
  const router = useRouter();

  // mock auth UI pour la navbar (dev)
  const [isLoggedIn] = useState(true);
  const [username] = useState('you');

  // Form state
  const [title, setTitle]       = useState('');
  const [description, setDesc]  = useState('');            // NEW (optionnel)
  const [labelA, setA]          = useState('Yes');
  const [labelB, setB]          = useState('No');
  const [category, setCat]      = useState('general');
  const [mediaUrl, setUrl]      = useState('');

  // Sources (optionnel, multiple)
  const [sources, setSources]   = useState<string[]>([]);
  const [srcInput, setSrcInput] = useState('');
  const srcInputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const canSubmit = title.trim().length >= 8 && labelA.trim() && labelB.trim();

  // Similar (debounced)
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
        setSimilar([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [title]);

  // Preview ratio (petit gimmick)
  const previewPct = useMemo(() => {
    const sum = Math.max(1, labelA.length + labelB.length);
    const a = Math.round((labelA.length / sum) * 100);
    return { a, b: 100 - a };
  }, [labelA, labelB]);

  // Turnstile
  const [tsToken, setTsToken] = useState('');
  useEffect(() => {
    (window as any).onTsVerify = (t: string) => setTsToken(t);
    return () => { (window as any).onTsVerify = undefined; };
  }, []);

  // Layout helpers
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 1024);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  // Add source
  const tryAddSource = () => {
    const raw = srcInput.trim();
    if (!raw) return;
    const val = raw.startsWith('http') ? raw : `https://${raw}`;
    if (!isValidUrl(val)) { alert('URL invalide'); return; }
    if (sources.includes(val)) { setSrcInput(''); return; }
    setSources((s) => [...s, val]);
    setSrcInput('');
    srcInputRef.current?.focus();
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    if (!tsToken) { alert('Veuillez compléter la vérification anti-bot.'); return; }

    setBusy(true);
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          title, description: description || undefined,
          labelA, labelB, category,
          mediaUrl: mediaUrl || undefined,
          sources: sources.length ? sources : undefined,   // NEW
          authorId: 'demo-user',
          turnstile: tsToken,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'POST_FAILED');
      router.replace(`/questions/${data.question.slug}`);
    } catch (err: any) {
      alert(`Failed: ${err.message || err}`);
    } finally {
      setBusy(false);
    }
  }

  // Right rail dummy data
  const trending = [
    { topic: 'Climate Policy', count: '1.2k' },
    { topic: 'AI Regulation', count: '892' },
    { topic: 'Remote Work', count: '567' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      <Navbar
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={''}
        onSearchChange={()=>{}}
        onLoginClick={()=>alert('Login (mock)')}
        onSignupClick={()=>alert('Signup (mock)')}
        onAskClick={()=>{}}
      />

      <div style={{
        maxWidth: 1400, margin:'0 auto', padding: isMobile ? 12 : 20,
        display:'grid',
        gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 260px',
        gap: 20
      }}>

        {/* Colonne gauche — 2 modules */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf:'start' }}>
            {/* Module 1: Conseils */}
            <div style={{
              background:'var(--card)', border:'1px solid var(--border)',
              borderRadius:12, padding:12, marginBottom:16
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:'var(--text)', marginBottom:6 }}>🧭 Conseils rapides</div>
              <ul style={{ margin:0, paddingLeft:18, color:'var(--muted)', fontSize:13 }}>
                <li>Formule une seule idée claire.</li>
                <li>Évite les biais : pas d’adjectifs orientés.</li>
                <li>Ajoute 1–3 sources fiables (optionnel).</li>
              </ul>
            </div>

            {/* Module 2: Presets de labels */}
            <div style={{
              background:'var(--card)', border:'1px solid var(--border)',
              borderRadius:12, padding:12
            }}>
              <div style={{ fontSize:13, fontWeight:800, color:'var(--text)', marginBottom:8 }}>🏷️ Presets de réponses</div>
              <div style={{ display:'grid', gap:8 }}>
                {LABEL_PRESETS.map((p) => (
                  <button key={p.name} type="button" onClick={()=>{ setA(p.a); setB(p.b); }}
                    style={{
                      textAlign:'left', background:'var(--pill)', color:'var(--text)',
                      border:'1px solid var(--border)', borderRadius:10, padding:'8px 10px',
                      cursor:'pointer', fontSize:13, fontWeight:700
                    }}>
                    {p.name} — <span style={{ color:'var(--muted)', fontWeight:600 }}>{p.a} / {p.b}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* CENTRE — Form */}
        <main>
          <div style={{
            background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 14, padding: 12, color:'#fff', fontSize:12, marginBottom:12,
            border: '1px solid #0000'
          }}>
            Mode DEV : Auth coupée. Cette page est accessible sans connexion.
          </div>

          <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)', marginBottom:12 }}>Create a question</h1>

          <form onSubmit={onSubmit} style={{ display:'grid', gap:12 }}>
            {/* Title */}
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Title</span>
              <textarea
                value={title}
                onChange={(e)=>setTitle(e.target.value)}
                placeholder="Ask a clear yes/no (or A/B) question…"
                style={{
                  background:'var(--card)', color:'var(--text)',
                  border:'1px solid var(--border)', borderRadius:12, padding:12, minHeight:90
                }}
              />
            </label>

            {/* Description (optionnel) */}
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Subtitle / Description (optional)</span>
              <textarea
                value={description}
                onChange={(e)=>setDesc(e.target.value)}
                placeholder="Add 1–2 sentences to clarify context (optional)…"
                style={{
                  background:'var(--card)', color:'var(--text)',
                  border:'1px solid var(--border)', borderRadius:12, padding:12, minHeight:72
                }}
              />
            </label>

            {/* Possible duplicates */}
            {similar.length > 0 && (
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:700 }}>
                  Possible duplicates
                </div>
                <ul style={{ display:'grid', gap:8, listStyle:'none', margin:0, padding:0 }}>
                  {similar.map((s)=>(
                    <li key={s.slug}>
                      <a href={`/questions/${s.slug}`} style={{ color:'#667eea', fontWeight:700, textDecoration:'underline' }}>
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

            {/* Catégorie */}
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

            {/* Media URL (optionnel) */}
            <label style={{ display:'grid', gap:6 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Image/Video URL (optional)</span>
              <input
                value={mediaUrl}
                onChange={(e)=>setUrl(e.target.value)}
                placeholder="https://…"
                style={{ background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}
              />
            </label>

            {/* Sources (optionnel, multiples) */}
            <div style={{ display:'grid', gap:8 }}>
              <span style={{ fontSize:12, color:'var(--muted)', fontWeight:700 }}>Sources (optional)</span>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {sources.map((u, idx) => (
                  <SourcePill key={idx} url={u} onRemove={()=>{
                    setSources((s)=>s.filter(x=>x!==u));
                  }} />
                ))}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  ref={srcInputRef}
                  value={srcInput}
                  onChange={(e)=>setSrcInput(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); tryAddSource(); } }}
                  placeholder="Add a source URL and press Enter"
                  style={{ flex:1, background:'var(--card)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:12 }}
                />
                <button type="button" onClick={tryAddSource}
                  style={{ background:'var(--pill)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:12, padding:'0 14px', fontWeight:800 }}>
                  Add
                </button>
              </div>
            </div>

            {/* Preview améliorée */}
            <div style={{
              background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:12
            }}>
              <div style={{ fontSize:12, color:'var(--muted)', marginBottom:8, fontWeight:700 }}>Preview</div>

              <div style={{ display:'grid', gap:4, marginBottom:8 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text)' }}>
                  {title || 'Your question title…'}
                </div>
                {!!description && (
                  <div style={{ fontSize:13, color:'var(--muted)' }}>
                    {description}
                  </div>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:`${previewPct.a}% ${previewPct.b}%`, gap:4, height:22, marginBottom:6 }}>
                <div title={labelA} style={{ background:'#00C851', borderRadius:6 }} />
                <div title={labelB} style={{ background:'#FF3547', borderRadius:6 }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <span style={{
                  flex:1, textAlign:'center', padding:'8px 10px', borderRadius:10,
                  background:'#00C85122', border:'1px solid #00C85155', color:'var(--text)', fontWeight:800
                }}>
                  {labelA || 'A'} ({previewPct.a}%)
                </span>
                <span style={{
                  flex:1, textAlign:'center', padding:'8px 10px', borderRadius:10,
                  background:'#FF354722', border:'1px solid #FF354755', color:'var(--text)', fontWeight:800
                }}>
                  {labelB || 'B'} ({previewPct.b}%)
                </span>
              </div>

              {!!sources.length && (
                <div style={{ marginTop:10, display:'flex', flexWrap:'wrap', gap:8 }}>
                  {sources.slice(0,4).map((u, i) => <SourcePill key={i} url={u} onRemove={()=>{}} />)}
                  {sources.length > 4 && (
                    <span style={{ fontSize:12, color:'var(--muted)' }}>+{sources.length - 4} more</span>
                  )}
                </div>
              )}
            </div>

            {/* Turnstile + actions */}
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <div
                className="cf-turnstile"
                data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                data-callback="onTsVerify"
              />
            </div>

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
        </main>

        {/* Colonne droite — Trending + AI Insight (nouveau) */}
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf:'start' }}>
            <div style={{
              background:'var(--card)', border:'1px solid var(--border)',
              borderRadius:12, padding:12, marginBottom:20
            }}>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--text)', marginBottom:8 }}>🔥 Trending Now</div>
              <ul style={{ fontSize:13, color:'var(--muted)', display:'grid', gap:6, margin:0, paddingLeft:18 }}>
                {trending.map((t, i) => <li key={i}>{t.topic} — {t.count}</li>)}
              </ul>
            </div>

            <AIInsightsAskCard
              title="AI Idea Helper"
              bullets={[
                'Commence par “Should…”, “Do…”, “Is…”.',
                'Évite les doubles négations ou questions composées.',
                'Si ça divise, c’est bon signe (clair mais controversé).'
              ]}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function AskPage() {
  return <AskBuilder />;
}
