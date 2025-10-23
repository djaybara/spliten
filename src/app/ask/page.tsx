// src/app/ask/page.tsx
'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import { CATEGORIES } from '@/lib/categories';
import SourcePills from '@/components/SourcePills';

function isValidUrl(u: string) {
  try { new URL(u); return true; } catch { return false; }
}

function AIInsightsAskCard({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>🤖 {title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13 }}>
        {bullets.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
      </ul>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Tip : garde la question neutre, précise, et testable par oui/non.</div>
    </div>
  );
}

function SourcePill({ url, onRemove }: { url: string; onRemove: () => void }) {
  const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--pill)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 999, padding: '6px 10px', fontSize: 12 }}>
      {host}
      <button type="button" onClick={onRemove} title="Remove" aria-label="Remove source" style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>×</button>
    </span>
  );
}

const LABEL_PRESETS = [
  { a: 'Pour', b: 'Contre', name: 'Pour/Contre' },
  { a: 'Yes', b: 'No', name: 'Yes/No' },
  { a: 'Vrai', b: 'Faux', name: 'Vrai/Faux' },
  { a: 'A', b: 'B', name: 'A/B' },
];

function AskBuilder() {
  const router = useRouter();
  const [isLoggedIn] = useState(true);
  const [username] = useState('you');
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [labelA, setA] = useState('Yes');
  const [labelB, setB] = useState('No');
  const [category, setCat] = useState('general');
  const [mediaUrl, setUrl] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [srcInput, setSrcInput] = useState('');
  const srcInputRef = useRef<HTMLInputElement>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detection, setDetection] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [prefillData, setPrefillData] = useState<any>(null);
  const [isLoadingPrefill, setIsLoadingPrefill] = useState(false);
  const [busy, setBusy] = useState(false);
  const canSubmit = title.trim().length >= 8 && labelA.trim() && labelB.trim();
  const [similar, setSimilar] = useState<{ slug: string; title: string }[]>([]);
  const [tsToken, setTsToken] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  // ✅ NOUVEAUX STATES POUR L'ÉDITION
  const [editableArgumentsFor, setEditableArgumentsFor] = useState<any[]>([]);
  const [editableArgumentsAgainst, setEditableArgumentsAgainst] = useState<any[]>([]);
  const [isEditingArguments, setIsEditingArguments] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      const q = title.trim();
      if (q.length < 4) { setSimilar([]); return; }
      try {
        const r = await fetch('/api/questions/similar?q=' + encodeURIComponent(q), { cache: 'no-store' });
        const d = await r.json();
        setSimilar(Array.isArray(d?.items) ? d.items : []);
      } catch { setSimilar([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [title]);

  const previewPct = useMemo(() => {
    const sum = Math.max(1, labelA.length + labelB.length);
    const a = Math.round((labelA.length / sum) * 100);
    return { a, b: 100 - a };
  }, [labelA, labelB]);

  useEffect(() => {
    (window as any).onTsVerify = (t: string) => setTsToken(t);
    return () => { (window as any).onTsVerify = undefined; };
  }, []);

  useEffect(() => {
    const f = () => setIsMobile(window.innerWidth < 1024);
    f();
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);

  const tryAddSource = () => {
    const raw = srcInput.trim();
    if (!raw) return;
    const val = raw.startsWith('http') ? raw : 'https://' + raw;
    if (!isValidUrl(val)) { alert('URL invalide'); return; }
    if (sources.includes(val)) { setSrcInput(''); return; }
    setSources((s) => [...s, val]);
    setSrcInput('');
    srcInputRef.current?.focus();
  };

  const handleDetectFormat = async () => {
    if (title.trim().length < 10) {
      alert('Your question must be at least 10 characters for AI analysis');
      return;
    }
    setIsDetecting(true);
    setDetection(null);
    setPrefillData(null);
    setSelectedFormat('');
    
    try {
      console.log('[DETECT] Analyzing format...');
      const res = await fetch('/api/ai/detect-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: title })
      });
      
      if (!res.ok) throw new Error('Error during analysis');
      
      const data = await res.json();
      console.log('[DETECT] Detected format:', data.primaryFormat, 'Confidence:', data.confidence);
      
      setDetection(data);
      setSelectedFormat(data.primaryFormat);
      
      // ✅ Auto-fill si confiance ≥80%
      if (data.primaryFormat === 'BINARY' && data.confidence >= 0.80) {
        console.log('[AUTO-FILL] 🚀 Confidence ≥80%, automatic pre-fill!');
        
        setIsLoadingPrefill(true);
        
        try {
          const prefillRes = await fetch('/api/ai/prefill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: title, format: 'BINARY' })
          });
          
          if (!prefillRes.ok) {
            throw new Error('Error during automatic pre-fill');
          }
          
          const prefillData = await prefillRes.json();
          
          console.log('[AUTO-FILL] ===== DATA RECEIVED =====');
          console.log('[AUTO-FILL] Full data:', JSON.stringify(prefillData, null, 2));
          
          // Stocker les données
          setPrefillData(prefillData);
          
          // ✅ Initialiser les arguments éditables
          console.log('[AUTO-FILL] Initializing editable arguments...');
          
          if (prefillData.argumentsFor && Array.isArray(prefillData.argumentsFor)) {
            const forArgs = prefillData.argumentsFor.map((arg: any) => {
              if (typeof arg === 'string') {
                return { text: arg, source: null };
              }
              return {
                text: arg.text || arg,
                source: arg.source || null
              };
            });
            console.log('[AUTO-FILL] FOR arguments editable:', forArgs);
            setEditableArgumentsFor(forArgs);
          }
          
          if (prefillData.argumentsAgainst && Array.isArray(prefillData.argumentsAgainst)) {
            const againstArgs = prefillData.argumentsAgainst.map((arg: any) => {
              if (typeof arg === 'string') {
                return { text: arg, source: null };
              }
              return {
                text: arg.text || arg,
                source: arg.source || null
              };
            });
            console.log('[AUTO-FILL] AGAINST arguments editable:', againstArgs);
            setEditableArgumentsAgainst(againstArgs);
          }
          
          // Attendre un peu
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Remplir les champs
          if (prefillData.labelA) {
            console.log('[AUTO-FILL] Setting labelA:', prefillData.labelA);
            setA(prefillData.labelA);
          }
          
          if (prefillData.labelB) {
            console.log('[AUTO-FILL] Setting labelB:', prefillData.labelB);
            setB(prefillData.labelB);
          }
          
          if (prefillData.description) {
            console.log('[AUTO-FILL] Setting description:', prefillData.description);
            setDesc(prefillData.description);
          }
          
          if (prefillData.category) {
            console.log('[AUTO-FILL] Setting category:', prefillData.category);
            setCat(prefillData.category);
          }
          
          // Sources
          if (prefillData.suggestedSources && Array.isArray(prefillData.suggestedSources) && prefillData.suggestedSources.length > 0) {
            const validSources = prefillData.suggestedSources.filter((s: string) => {
              try {
                return isValidUrl(s);
              } catch {
                return false;
              }
            });
            
            if (validSources.length > 0) {
              console.log('[AUTO-FILL] Sources:', validSources);
              setSources((prev) => {
                const newSources = validSources.filter((s: string) => !prev.includes(s));
                return [...prev, ...newSources];
              });
            }
          }
          
          console.log('[AUTO-FILL] ✅ Pre-fill complete!');
          
        } catch (error: any) {
          console.error('[AUTO-FILL] ❌ Error:', error);
          alert('Error during automatic pre-fill: ' + error.message);
        } finally {
          setIsLoadingPrefill(false);
        }
      } else {
        console.log('[AUTO-FILL] ⏸️ Confidence <80% or non-BINARY format, showing options');
      }
      
    } catch (error: any) {
      console.error('[DETECT] ❌ Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSelectFormat = async (format: string) => {
    setSelectedFormat(format);
    if (format !== 'BINARY') {
      alert('This format is not yet available. Stay on BINARY for now.');
      return;
    }
    setIsLoadingPrefill(true);
    
    try {
      const res = await fetch('/api/ai/prefill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: title, format })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error during pre-fill');
      }
      
      const data = await res.json();
      
      console.log('[DEBUG] ===== DATA RECEIVED =====');
      console.log('[DEBUG] Full data:', JSON.stringify(data, null, 2));
      
      setPrefillData(data);
      
      // ✅ Initialiser les arguments éditables
      if (data.argumentsFor && Array.isArray(data.argumentsFor)) {
        const forArgs = data.argumentsFor.map((arg: any) => {
          if (typeof arg === 'string') {
            return { text: arg, source: null };
          }
          return {
            text: arg.text || arg,
            source: arg.source || null
          };
        });
        setEditableArgumentsFor(forArgs);
      }
      
      if (data.argumentsAgainst && Array.isArray(data.argumentsAgainst)) {
        const againstArgs = data.argumentsAgainst.map((arg: any) => {
          if (typeof arg === 'string') {
            return { text: arg, source: null };
          }
          return {
            text: arg.text || arg,
            source: arg.source || null
          };
        });
        setEditableArgumentsAgainst(againstArgs);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (data.labelA) setA(data.labelA);
      if (data.labelB) setB(data.labelB);
      if (data.description) setDesc(data.description);
      if (data.category) setCat(data.category);
      
      if (data.suggestedSources && Array.isArray(data.suggestedSources) && data.suggestedSources.length > 0) {
        const validSources = data.suggestedSources.filter((s: string) => {
          try {
            return isValidUrl(s);
          } catch {
            return false;
          }
        });
        
        if (validSources.length > 0) {
          setSources((prev) => {
            const newSources = validSources.filter((s: string) => !prev.includes(s));
            return [...prev, ...newSources];
          });
        }
      }
      
    } catch (error: any) {
      console.error('[ERROR] Pre-fill:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoadingPrefill(false);
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev && !tsToken) { 
      alert('Please complete the anti-bot verification.'); 
      return; 
    }
    
    setBusy(true);
    
    console.log('[POST] Sending data...');
    console.log('[POST] editableArgumentsFor:', editableArgumentsFor);
    console.log('[POST] editableArgumentsAgainst:', editableArgumentsAgainst);
    
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, 
          description: description || undefined, 
          labelA, 
          labelB, 
          category,
          mediaUrl: mediaUrl || undefined, 
          sources: sources.length ? sources : undefined,
          authorId: 'demo-user', 
          turnstile: isDev ? 'DEV_MODE_SKIP' : tsToken,
          // ✅ Envoyer les arguments éditables
          argumentsFor: editableArgumentsFor.length > 0 ? editableArgumentsFor : undefined,
          argumentsAgainst: editableArgumentsAgainst.length > 0 ? editableArgumentsAgainst : undefined,
        })
      });
      const data = await res.json();
      console.log('[POST] Response:', data);
      if (!res.ok) throw new Error(data?.error || 'POST_FAILED');
      router.replace('/questions/' + data.question.slug);
    } catch (err: any) {
      console.error('[POST] Error:', err);
      alert('Failed: ' + (err.message || err));
    } finally {
      setBusy(false);
    }
  }

  const trending = [
    { topic: 'Climate Policy', count: '1.2k' },
    { topic: 'AI Regulation', count: '892' },
    { topic: 'Remote Work', count: '567' },
  ];

  const availableCategories = CATEGORIES.filter(c => c.value !== 'all');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <Navbar isMobile={isMobile} isLoggedIn={isLoggedIn} username={username} searchQuery={''} onSearchChange={() => {}} onLoginClick={() => alert('Login (mock)')} onSignupClick={() => alert('Signup (mock)')} onAskClick={() => {}} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 260px', gap: 20 }}>
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf: 'start' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>🧭 Quick Tips</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13 }}>
                <li>Formulate a single clear idea.</li>
                <li>Avoid bias: no loaded adjectives.</li>
                <li>Add 1–3 reliable sources (optional).</li>
              </ul>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>🏷️ Label Presets</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {LABEL_PRESETS.map((p) => (
                  <button key={p.name} type="button" onClick={() => { setA(p.a); setB(p.b); }} style={{ textAlign: 'left', background: 'var(--pill)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                    {p.name} — <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{p.a} / {p.b}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}
        <main>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 14, padding: 12, color: '#fff', fontSize: 12, marginBottom: 12 }}>DEV Mode: Auth disabled.</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Create a question</h1>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Title</span>
              <textarea value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ask a clear binary question" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, minHeight: 90 }} />
            </label>
            <button type="button" onClick={handleDetectFormat} disabled={isDetecting || title.trim().length < 10} style={{ background: isDetecting ? 'var(--border)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: 999, padding: '10px 18px', fontWeight: 800, cursor: isDetecting ? 'wait' : 'pointer', opacity: title.trim().length < 10 ? 0.5 : 1, fontSize: 14 }}>
              {isDetecting ? '🤖 Analyzing...' : '✨ Analyze with AI'}
            </button>
            
            {/* DETECTION */}
            {detection && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>🎯 Suggested Format</h2>
                <div onClick={() => handleSelectFormat(detection.primaryFormat)} style={{ padding: 14, border: '2px solid ' + (selectedFormat === detection.primaryFormat ? '#667eea' : 'var(--border)'), borderRadius: 12, cursor: 'pointer', marginBottom: 12, background: selectedFormat === detection.primaryFormat ? '#667eea11' : 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>⚔️ {detection.primaryFormat}</h3>
                      <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{detection.reasoning}</p>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#667eea', background: '#667eea22', padding: '4px 10px', borderRadius: 999 }}>{Math.round(detection.confidence * 100)}% confidence</div>
                  </div>
                </div>
                {detection.alternatives && detection.alternatives.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginBottom: 8 }}>Or try:</h3>
                    {detection.alternatives.map((alt: any, i: number) => (
                      <div key={i} onClick={() => handleSelectFormat(alt.format)} style={{ padding: 12, border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', marginBottom: 8, opacity: alt.comingSoon ? 0.6 : 1 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                          {alt.format === 'POLL' ? '📊' : '💬'} {alt.format}
                          {alt.comingSoon && <span style={{ marginLeft: 8, fontSize: 11, color: '#f97316', background: '#f9731622', padding: '2px 8px', borderRadius: 999 }}>Soon</span>}
                        </h4>
                        <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{alt.reasoning}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* LOADING */}
            {isLoadingPrefill && (
              <div style={{ textAlign: 'center', padding: 24, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Generating content...</p>
              </div>
            )}
            
            {/* ✅ ARGUMENTS ÉDITABLES */}
            {prefillData && !isLoadingPrefill && (editableArgumentsFor.length > 0 || editableArgumentsAgainst.length > 0) && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: 0 }}>💡 AI-Generated Arguments</h2>
                  <button 
                    type="button"
                    onClick={() => setIsEditingArguments(!isEditingArguments)}
                    style={{ 
                      background: isEditingArguments ? '#667eea' : 'var(--pill)', 
                      color: isEditingArguments ? '#fff' : 'var(--text)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 8, 
                      padding: '6px 12px', 
                      fontSize: 12, 
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isEditingArguments ? '✓ Done' : '✏️ Edit'}
                  </button>
                </div>
                
                <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>
                  {isEditingArguments ? 'Edit the arguments and sources below' : 'These arguments and sources were automatically generated.'}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* FOR ARGUMENTS */}
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#00C851', marginBottom: 8 }}>FOR ({labelA})</h3>
                    {editableArgumentsFor.map((arg: any, i: number) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        {isEditingArguments ? (
                          <>
                            <textarea
                              value={arg.text || ''}
                              onChange={(e) => {
                                const updated = [...editableArgumentsFor];
                                updated[i] = { ...updated[i], text: e.target.value };
                                setEditableArgumentsFor(updated);
                              }}
                              style={{ 
                                width: '100%',
                                padding: 10, 
                                background: '#00C85111', 
                                border: '1px solid #00C85133', 
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'var(--text)',
                                minHeight: 60,
                                marginBottom: 6,
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                            {arg.source && (
                              <div style={{ paddingLeft: 10, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                <input
                                  value={arg.source.url || ''}
                                  onChange={(e) => {
                                    const updated = [...editableArgumentsFor];
                                    updated[i] = { 
                                      ...updated[i], 
                                      source: { ...updated[i].source, url: e.target.value }
                                    };
                                    setEditableArgumentsFor(updated);
                                  }}
                                  placeholder="Source URL"
                                  style={{ 
                                    flex: 1,
                                    padding: 6,
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: 'var(--text)'
                                  }}
                                />
                                <input
                                  value={arg.source.label || ''}
                                  onChange={(e) => {
                                    const updated = [...editableArgumentsFor];
                                    updated[i] = { 
                                      ...updated[i], 
                                      source: { ...updated[i].source, label: e.target.value }
                                    };
                                    setEditableArgumentsFor(updated);
                                  }}
                                  placeholder="Source Name"
                                  style={{ 
                                    width: 100,
                                    padding: 6,
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: 'var(--text)'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editableArgumentsFor];
                                    updated[i] = { ...updated[i], source: null };
                                    setEditableArgumentsFor(updated);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted)',
                                    cursor: 'pointer',
                                    fontSize: 16
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            {!arg.source && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editableArgumentsFor];
                                  updated[i] = { 
                                    ...updated[i], 
                                    source: { url: '', label: '' }
                                  };
                                  setEditableArgumentsFor(updated);
                                }}
                                style={{
                                  marginLeft: 10,
                                  padding: '4px 8px',
                                  background: 'var(--pill)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'var(--text)',
                                  cursor: 'pointer'
                                }}
                              >
                                + Add Source
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <div style={{ 
                              padding: 10, 
                              background: '#00C85111', 
                              border: '1px solid #00C85133', 
                              borderRadius: 8,
                              marginBottom: arg.source ? 6 : 0,
                              fontSize: 12,
                              color: 'var(--text)'
                            }}>
                              {arg.text}
                            </div>
                            {arg.source && (
                              <div style={{ paddingLeft: 10 }}>
                                <SourcePills sources={[arg.source]} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* AGAINST ARGUMENTS */}
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#FF3547', marginBottom: 8 }}>AGAINST ({labelB})</h3>
                    {editableArgumentsAgainst.map((arg: any, i: number) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        {isEditingArguments ? (
                          <>
                            <textarea
                              value={arg.text || ''}
                              onChange={(e) => {
                                const updated = [...editableArgumentsAgainst];
                                updated[i] = { ...updated[i], text: e.target.value };
                                setEditableArgumentsAgainst(updated);
                              }}
                              style={{ 
                                width: '100%',
                                padding: 10, 
                                background: '#FF354711', 
                                border: '1px solid #FF354733', 
                                borderRadius: 8,
                                fontSize: 12,
                                color: 'var(--text)',
                                minHeight: 60,
                                marginBottom: 6,
                                fontFamily: 'inherit',
                                resize: 'vertical'
                              }}
                            />
                            {arg.source && (
                              <div style={{ paddingLeft: 10, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                                <input
                                  value={arg.source.url || ''}
                                  onChange={(e) => {
                                    const updated = [...editableArgumentsAgainst];
                                    updated[i] = { 
                                      ...updated[i], 
                                      source: { ...updated[i].source, url: e.target.value }
                                    };
                                    setEditableArgumentsAgainst(updated);
                                  }}
                                  placeholder="Source URL"
                                  style={{ 
                                    flex: 1,
                                    padding: 6,
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: 'var(--text)'
                                  }}
                                />
                                <input
                                  value={arg.source.label || ''}
                                  onChange={(e) => {
                                    const updated = [...editableArgumentsAgainst];
                                    updated[i] = { 
                                      ...updated[i], 
                                      source: { ...updated[i].source, label: e.target.value }
                                    };
                                    setEditableArgumentsAgainst(updated);
                                  }}
                                  placeholder="Source Name"
                                  style={{ 
                                    width: 100,
                                    padding: 6,
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    color: 'var(--text)'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editableArgumentsAgainst];
                                    updated[i] = { ...updated[i], source: null };
                                    setEditableArgumentsAgainst(updated);
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--muted)',
                                    cursor: 'pointer',
                                    fontSize: 16
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            {!arg.source && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...editableArgumentsAgainst];
                                  updated[i] = { 
                                    ...updated[i], 
                                    source: { url: '', label: '' }
                                  };
                                  setEditableArgumentsAgainst(updated);
                                }}
                                style={{
                                  marginLeft: 10,
                                  padding: '4px 8px',
                                  background: 'var(--pill)',
                                  border: '1px solid var(--border)',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: 'var(--text)',
                                  cursor: 'pointer'
                                }}
                              >
                                + Add Source
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <div style={{ 
                              padding: 10, 
                              background: '#FF354711', 
                              border: '1px solid #FF354733', 
                              borderRadius: 8,
                              marginBottom: arg.source ? 6 : 0,
                              fontSize: 12,
                              color: 'var(--text)'
                            }}>
                              {arg.text}
                            </div>
                            {arg.source && (
                              <div style={{ paddingLeft: 10 }}>
                                <SourcePills sources={[arg.source]} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Description (optional)</span>
              <textarea value={description} onChange={(e) => setDesc(e.target.value)} placeholder="Add context" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, minHeight: 72 }} />
            </label>
            
            {similar.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 700 }}>Possible duplicates</div>
                <ul style={{ display: 'grid', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
                  {similar.map((s) => <li key={s.slug}><a href={'/questions/' + s.slug} style={{ color: '#667eea', fontWeight: 700, textDecoration: 'underline' }}>{s.title}</a></li>)}
                </ul>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Label A</span>
                <input value={labelA} onChange={(e) => setA(e.target.value)} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }} />
              </label>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Label B</span>
                <input value={labelB} onChange={(e) => setB(e.target.value)} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }} />
              </label>
            </div>
            
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Category</span>
              <select value={category} onChange={(e) => setCat(e.target.value)} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
                {availableCategories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>
            
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Media URL (optional)</span>
              <input value={mediaUrl} onChange={(e) => setUrl(e.target.value)} placeholder="https://" style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }} />
            </label>
            
            <div style={{ display: 'grid', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Sources (optional)</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sources.map((u, idx) => <SourcePill key={idx} url={u} onRemove={() => setSources((s) => s.filter(x => x !== u))} />)}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={srcInputRef} value={srcInput} onChange={(e) => setSrcInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); tryAddSource(); } }} placeholder="Add URL" style={{ flex: 1, background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }} />
                <button type="button" onClick={tryAddSource} style={{ background: 'var(--pill)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, padding: '0 14px', fontWeight: 800 }}>Add</button>
              </div>
            </div>
            
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, fontWeight: 700 }}>Preview</div>
              <div style={{ display: 'grid', gap: 4, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{title || 'Your question title'}</div>
                {!!description && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{description}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: previewPct.a + '% ' + previewPct.b + '%', gap: 4, height: 22, marginBottom: 6 }}>
                <div title={labelA} style={{ background: '#00C851', borderRadius: 6 }} />
                <div title={labelB} style={{ background: '#FF3547', borderRadius: 6 }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 10, background: '#00C85122', border: '1px solid #00C85155', color: 'var(--text)', fontWeight: 800 }}>{labelA || 'A'} ({previewPct.a}%)</span>
                <span style={{ flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 10, background: '#FF354722', border: '1px solid #FF354755', color: 'var(--text)', fontWeight: 800 }}>{labelB || 'B'} ({previewPct.b}%)</span>
              </div>
              {!!sources.length && (
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sources.slice(0, 4).map((u, i) => <SourcePill key={i} url={u} onRemove={() => {}} />)}
                  {sources.length > 4 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>+{sources.length - 4} more</span>}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback="onTsVerify" />
            </div>
            
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => history.back()} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 999, padding: '10px 18px', color: 'var(--muted)', fontWeight: 800 }}>Cancel</button>
              <button type="submit" disabled={!canSubmit || busy} style={{ background: canSubmit && !busy ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'var(--border)', color: canSubmit && !busy ? '#fff' : 'var(--muted)', border: 'none', borderRadius: 999, padding: '10px 18px', fontWeight: 800, opacity: busy ? 0.8 : 1, cursor: busy ? 'wait' : 'pointer' }}>
                {busy ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        </main>
        
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf: 'start' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>🔥 Trending Now</div>
              <ul style={{ fontSize: 13, color: 'var(--muted)', display: 'grid', gap: 6, margin: 0, paddingLeft: 18 }}>
                {trending.map((t, i) => <li key={i}>{t.topic} — {t.count}</li>)}
              </ul>
            </div>
            <AIInsightsAskCard title="AI Helper" bullets={['Start with "Should", "Do", "Is".', 'Avoid double negatives.', 'If it divides, it\'s a good sign.']} />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function AskPage() {
  return <AskBuilder />;
}