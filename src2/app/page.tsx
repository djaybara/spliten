'use client';

import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bookmark, TrendingUp, Flame, Clock,
  Home as HomeIcon, Hash, Image, Video, Link2, Bot, BarChart3, Newspaper, Plus, X, User,
} from 'lucide-react';

import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';
import AIInsightsSiteCard from '@/components/AIInsightsSiteCard';
import AISiteSkeleton from '@/components/AISiteSkeleton';
import { getSiteInsights } from '@/data/siteInsights';

import { getAllQuestions } from '@/data/questionsData';
import { ensureUniqueSlug, slugifyBase } from '@/lib/utils/slug';
import { shuffleArray, preventTriples } from '@/lib/utils/shuffle';

/* ===== Theme / Vars ===== */
function useThemeBoot() {
  useEffect(() => {
    const el = document.documentElement;
    // Ajuste si ta Navbar est plus haute
    if (!el.style.getPropertyValue('--nav-h')) el.style.setProperty('--nav-h', '64px');
    let theme = localStorage.getItem('theme');
    if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    el.setAttribute('data-theme', theme);
    const onStorage = (e: StorageEvent) => { if (e.key === 'theme' && e.newValue) el.setAttribute('data-theme', e.newValue); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
}

function usePalette() {
  return {
    appBg: 'var(--bg)',
    cardBg: 'var(--card)',
    softBg: 'var(--bg)',
    border: 'var(--border)',
    text: 'var(--text)',
    subtext: 'var(--muted)',
    mutetext: 'var(--muted)',
    chipBgActive: 'rgba(102, 126, 234, 0.15)',
    chipTextActive: '#667eea',
    pillBg: 'var(--pill)',
    cardShadow: '0 1px 3px rgba(0,0,0,0.08)',
  };
}

/* ===== Types ===== */
type Q = ReturnType<typeof getAllQuestions>[number];

/* ===== Page ===== */
export default function Home() {
  const router = useRouter();
  useThemeBoot();
  const palette = usePalette();

  // UI/Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login'|'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'hot'|'news'|'new'|'top'|'controversial'>('hot');

  // Data (factorisée)
  const [allQuestions, setAllQuestions] = useState<Q[]>(() => getAllQuestions());
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Infinite scroll
  const [visibleList, setVisibleList] = useState<Q[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerSupported = typeof window !== 'undefined' && 'IntersectionObserver' in window;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const makeBatch = (size = 8): Q[] => {
    const pool = shuffleArray(allQuestions, Date.now() & 0xffff);
    const mixed = preventTriples(pool, x => slugifyBase(x.title));
    return mixed.slice(0, size);
  };

  useEffect(() => {
    setVisibleList(prev => (prev.length ? prev : makeBatch(10)));
    setHasMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allQuestions, selectedCategory, selectedSort, searchQuery]);

  useEffect(() => {
    if (!observerSupported || !sentinelRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) loadMore();
    }, { rootMargin: '400px 0px' });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, visibleList, selectedCategory, selectedSort, searchQuery]);

  const filterSort = (items: Q[]) => {
    const filtered = items.filter(q => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    let result = [...filtered];
    if (selectedSort === 'hot') {
      const score = (x: Q) => {
        const badgeBonus = x.badges.includes('trending') ? 100 : x.badges.includes('top') ? 50 : 0;
        const engagement = (x.upvotes - x.downvotes) + x.comments * 0.6;
        const newsBonus = x.news ? 10 : 0;
        return badgeBonus + engagement + newsBonus;
      };
      result.sort((a, b) => score(b) - score(a));
    } else if (selectedSort === 'news') {
      result = result.filter(q => q.news === true).sort((a, b) => b.id - a.id);
    } else if (selectedSort === 'new') {
      result = result.filter(q => q.badges.includes('new')).sort((a, b) => b.id - a.id);
    } else if (selectedSort === 'top') {
      result = result.filter(q => q.badges.includes('top')).sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (selectedSort === 'controversial') {
      result = result.filter(q => q.badges.includes('controversial'))
        .sort((a, b) => (Math.min(b.pour, b.contre) / Math.max(b.pour || 1, b.contre || 1)) - (Math.min(a.pour, a.contre) / Math.max(a.pour || 1, a.contre || 1)));
    }
    return result;
  };

  const visibleFiltered = useMemo(() => filterSort(visibleList), [visibleList, selectedCategory, selectedSort, searchQuery]);

  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); return; }
    cb();
  };

  const handleOpinionVote = (id: number, opinion: 'pour' | 'contre') => {
    requireAuth(() => {
      setAllQuestions(prev => prev.map(q => {
        if (q.id !== id) return q;
        if (q.userOpinion === opinion) return { ...q, [opinion]: (q as any)[opinion] - 1, userOpinion: null } as Q;
        if (q.userOpinion) {
          const old = q.userOpinion;
          return { ...q, [old]: (q as any)[old] - 1, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
        }
        return { ...q, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
      }));
      setVisibleList(prev => prev.map(q => q.id === id ? allQuestions.find(x => x.id === id)! : q));
    });
  };

  const handleShare = async (q: Q) => {
    const href = `/questions/${q.slug}`;
    const url = `${window.location.origin}${href}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Spliten', text: q.title, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); alert('Link copied to clipboard!'); }
      catch { window.prompt('Copy this link:', url); }
    }
  };

  const handleSave = (q: Q) => {
    requireAuth(() => setSavedIds(prev => prev.includes(q.id) ? prev.filter(x => x !== q.id) : [...prev, q.id]));
  };

  const toggleComments = (id: number) => {
    setExpandedComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [aiLoading, setAiLoading] = useState(true);
  const siteInsights = useMemo(() => getSiteInsights(), []);
  useEffect(() => { const t = setTimeout(() => setAiLoading(false), 600); return () => clearTimeout(t); }, []);

  // Create Post
  const [newQuestion, setNewQuestion] = useState({ title: '', category: 'general', mediaType: 'text' as 'text'|'image'|'video'|'link' });
  const handleAuth = (e: React.FormEvent) => { e.preventDefault(); if (username.trim()) { setIsLoggedIn(true); setShowAuthModal(false); } };
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) return;
    requireAuth(() => {
      const existing = new Set<string>(allQuestions.map(q => q.slug));
      const slug = ensureUniqueSlug(existing, newQuestion.title);
      const q: Q = { id: Date.now(), slug, title: newQuestion.title, category: newQuestion.category, author: username || 'you',
        timeAgo: 'just now', views: 0, pour: 0, contre: 0, upvotes: 1, downvotes: 0, comments: 0,
        userVote: 'up', userOpinion: null, badges: ['new'], news: false };
      setAllQuestions(prev => [q, ...prev]);
      setVisibleList(prev => [q, ...prev]);
      setNewQuestion({ title: '', category: 'general', mediaType: 'text' });
      setIsCreateModalOpen(false);
    });
  };

  const loadMore = () => {
    if (!hasMore) return;
    const batch = makeBatch(8);
    if (!batch.length) { setHasMore(false); return; }
    setVisibleList(prev => preventTriples([...prev, ...batch], x => slugifyBase(x.title)));
    if (visibleList.length + batch.length > 60) setHasMore(false);
  };

  /* ===== STICKY fix (opaque) ===== */
  const LAYOUT_PAD = isMobile ? 12 : 20; // == wrapper padding
  const STICKY_TOP = 'var(--nav-h)';
  const BAR_HEIGHT = 48;
  const CREATE_BTN_HEIGHT = 48;

  // TopPlate: plaque opaque sous la navbar (élimine l’effet “fenêtre” global)
  const TopPlate = () => (
    <div style={{
      position: 'sticky',
      top: 0,
      height: 'var(--nav-h)',
      background: 'var(--bg)',
      zIndex: 45,           // sous la Navbar, au-dessus du contenu
      pointerEvents: 'none'
    }}/>
  );

  const StickyBackplate: React.FC<{ children: React.ReactNode; bleedTop?: number; padBottom?: number; zIndex?: number; }> =
  ({ children, bleedTop = LAYOUT_PAD, padBottom = 16, zIndex = 50 }) => (
    <div style={{
      position: 'sticky',
      top: `calc(${STICKY_TOP})`,
      zIndex,
      background: 'var(--bg)',
      marginTop: `-${bleedTop}px`,
      paddingTop: `${bleedTop}px`,
      paddingBottom: padBottom,
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: palette.appBg }}>
      <Navbar
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSignupClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
      />

      {/* Plaque opaque sous la navbar */}
      <TopPlate />

      {/* LAYOUT */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'flex', gap: 20 }}>
        {/* LEFT */}
        {!isMobile && (
          <aside style={{ width: 240 }}>
            <StickyBackplate>
              <div style={{ backgroundColor: palette.cardBg, borderRadius: 12, boxShadow: palette.cardShadow, border: `1px solid ${palette.border}` }}>
                <CategoriesPanel selected={selectedCategory as any} onSelect={(v)=>setSelectedCategory(v)} title="Categories" />
              </div>
            </StickyBackplate>
          </aside>
        )}

        {/* CENTER */}
        <main style={{ flex: 1, maxWidth: isMobile ? '100%' : 640 }}>
          {/* Tabs sticky */}
          <StickyBackplate>
            <div style={{
              height: BAR_HEIGHT,
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: palette.cardBg, borderRadius: 12, padding: 6,
              boxShadow: palette.cardShadow, border: `1px solid ${palette.border}`,
              overflow: 'hidden', whiteSpace: 'nowrap' // pas de menu déroulant à droite
            }}>
              {[
                { value:'hot', label:'Hot', icon:Flame },
                { value:'news', label:'News', icon:Newspaper },
                { value:'new', label:'New', icon:Clock },
                { value:'top', label:'Top', icon:TrendingUp },
                { value:'controversial', label:'Controversie', icon:BarChart3 }
              ].map(s => {
                const Icon = s.icon as any;
                const active = selectedSort === s.value;
                return (
                  <button key={s.value} onClick={()=>setSelectedSort(s.value as any)} aria-pressed={active}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
                      borderRadius:999, border:'none',
                      backgroundColor: active ? 'rgba(102,126,234,0.15)' : 'transparent',
                      color: active ? '#667eea' : palette.subtext,
                      fontSize:14, fontWeight: active ? 800 : 600, cursor:'pointer'
                    }}>
                    <Icon size={16} /> {s.label}
                  </button>
                );
              })}
            </div>
          </StickyBackplate>

          {/* Cards */}
          {visibleFiltered.map((q) => {
            const href = `/questions/${q.slug}`;
            const isSaved = savedIds.includes(q.id);
            const isExpanded = expandedComments.has(q.id);
            return (
              <div key={`${q.id}-${q.slug}`} style={{ marginBottom: 16 }}>
                <QuestionCard
                  id={q.id}
                  slugHref={href}
                  title={q.title}
                  category={q.category}
                  author={q.author}
                  timeAgo={q.timeAgo}
                  views={q.views}
                  pour={q.pour}
                  contre={q.contre}
                  badges={q.badges as any}
                  showDescription={false}
                  showSources={false}
                  userOpinion={q.userOpinion as any}
                  onYes={()=>handleOpinionVote(q.id,'pour')}
                  onNo={()=>handleOpinionVote(q.id,'contre')}
                  onShare={()=>handleShare(q)}
                  onSave={()=>handleSave(q)}
                  onCommentsClick={()=>toggleComments(q.id)}     // in-card (pas de nav)
                  commentsCount={q.comments}
                  onCardClick={()=>router.push(href)}            // la carte navigue
                  ariaSavePressed={isSaved || undefined}
                />
                {(isSaved || isExpanded) && (
                  <div style={{ backgroundColor: palette.cardBg, border: `1px solid ${palette.border}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: 12 }}>
                    {isSaved && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: 'rgba(250,204,21,0.15)', color: '#ca8a04', fontSize: 12, fontWeight: 800, marginRight: 8 }}>
                        <Bookmark size={14} /> Saved
                      </div>
                    )}
                    {isExpanded && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 13, color: palette.subtext, marginBottom: 8 }}>Mini-thread (demo) — no backend</div>
                        <div style={{ display: 'grid', gap: 8 }}>
                          <div style={{ background: 'var(--pill)', padding: 10, borderRadius: 8, color: 'var(--text)' }}>
                            <strong>@alex</strong> — I think city centers need fewer cars but not a full ban.
                          </div>
                          <div style={{ background: 'var(--pill)', padding: 10, borderRadius: 8, color: 'var(--text)' }}>
                            <strong>@sam</strong> — Public transport first, then restrictions will work better.
                          </div>
                          <button onClick={()=>alert('Reply (demo)')} style={{ alignSelf:'start', padding:'6px 10px', borderRadius:8, border:`1px solid ${palette.border}`, background:'transparent', fontSize:12, cursor:'pointer' }}>
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sentinel + fallback */}
          <div ref={sentinelRef} />
          {(!observerSupported || hasMore) && (
            <div style={{ display:'flex', justifyContent:'center', padding:16 }}>
              <button onClick={loadMore} disabled={!hasMore}
                style={{ padding:'10px 16px', borderRadius:999, border:`1px solid ${palette.border}`, background: hasMore?'transparent':'var(--pill)', color:'var(--text)', cursor: hasMore?'pointer':'not-allowed' }}>
                {hasMore ? 'Load more' : 'No more'}
              </button>
            </div>
          )}
        </main>

        {/* RIGHT */}
        {!isMobile && (
          <aside style={{ width: 320 }}>
            <StickyBackplate>
              <button
                onClick={() => { if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); } else { setIsCreateModalOpen(true); } }}
                style={{
                  height: CREATE_BTN_HEIGHT, width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: 12, color: 'white',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                }}
              >
                <Plus size={18} /> Create Post
              </button>
            </StickyBackplate>

            <div style={{ backgroundColor: palette.cardBg, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: palette.cardShadow, border: `1px solid ${palette.border}` }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: palette.text }}>Trending Now</h3>
                <TrendingUp size={18} color="#667eea" />
              </div>
              {[
                { topic:'Climate Policy', change:'+234%', count:'1.2k discussions' },
                { topic:'AI Regulation', change:'+89%', count:'892 discussions' },
                { topic:'Work-Life Balance', change:'+45%', count:'567 discussions' },
              ].map((t, i) => (
                <div key={i} style={{ padding:'12px 0', borderBottom: i < 2 ? `1px solid ${palette.border}` : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:palette.text }}>{t.topic}</span>
                    <span style={{ fontSize:12, color:'#00C851', fontWeight:800 }}>{t.change}</span>
                  </div>
                  <span style={{ fontSize:12, color:palette.mutetext }}>{t.count}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              {aiLoading ? <AISiteSkeleton /> : <AIInsightsSiteCard insights={getSiteInsights()} bodyColor="var(--muted)" />}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile nav (inchangé) */}
      {isMobile && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, backgroundColor:palette.cardBg, borderTop:`1px solid ${palette.border}`, padding:8, display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:100 }}>
          <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', color:'#667eea', fontSize:11 }}>
            <HomeIcon size={20} /> Home
          </button>
          <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', color:palette.mutetext, fontSize:11 }}>
            <TrendingUp size={20} /> Trending
          </button>
          <button onClick={() => { if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); } else { setIsCreateModalOpen(true); } }}
            style={{ width:48, height:48, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border:'none', borderRadius:'50%', color:'white', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(102,126,234,0.3)' }}
            aria-label="Create Post">
            <Plus size={24} />
          </button>
          <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', color:palette.mutetext, fontSize:11 }}>
            <Bot size={20} /> AI
          </button>
          <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, background:'none', border:'none', color:palette.mutetext, fontSize:11 }}>
            <User size={20} /> Profile
          </button>
        </div>
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <div style={{ position:'fixed', inset:0 as any, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div style={{ backgroundColor:palette.cardBg, borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 10px 40px rgba(0,0,0,0.4)', position:'relative', border:`1px solid ${palette.border}` }}>
            <div style={{ padding:24, borderBottom:`1px solid ${palette.border}` }}>
              <h2 style={{ fontSize:24, fontWeight:800, color:'transparent', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Spliten'}
              </h2>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (username.trim()) { setIsLoggedIn(true); setShowAuthModal(false); } }} style={{ padding:24 }}>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid ${palette.border}`, borderRadius:12, fontSize:14, outline:'none', background:palette.softBg, color:palette.text }} required />
              <input type="password" placeholder="Password"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid ${palette.border}`, borderRadius:12, fontSize:14, outline:'none', background:palette.softBg, color:palette.text }} />
              <button type="submit" style={{ width:'100%', padding:12, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:16 }}>
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            <button onClick={()=>setShowAuthModal(false)} style={{ position:'absolute', top:20, right:20, background:'none', border:'none', cursor:'pointer', color:palette.mutetext }} aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div style={{ position:'fixed', inset:0 as any, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div style={{ backgroundColor:palette.cardBg, borderRadius:16, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto', border:`1px solid ${palette.border}` }}>
            <div style={{ padding:20, borderBottom:`1px solid ${palette.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h2 style={{ fontSize:20, fontWeight:800, color:palette.text }}>Create a Post</h2>
              <button onClick={()=>setIsCreateModalOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:palette.mutetext }} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateQuestion} style={{ padding:20 }}>
              <div style={{ display:'flex', gap:8, marginBottom:16, borderBottom:`1px solid ${palette.border}`, paddingBottom:12 }}>
                {[
                  { type:'text', icon:Hash, label:'Text' },
                  { type:'image', icon:Image, label:'Image' },
                  { type:'video', icon:Video, label:'Video' },
                  { type:'link', icon:Link2, label:'Link' },
                ].map(m => {
                  const Icon = m.icon as any;
                  return (
                    <button key={m.type} type="button" onClick={()=>setNewQuestion(prev=>({ ...prev, mediaType:m.type as any }))}
                      aria-pressed={newQuestion.mediaType===m.type}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', backgroundColor: newQuestion.mediaType===m.type ? 'rgba(102,126,234,0.15)' : 'transparent',
                        border:'none', borderRadius:8, color: newQuestion.mediaType===m.type ? '#667eea' : palette.mutetext, fontSize:13, fontWeight:800, cursor:'pointer' }}>
                      <Icon size={16} /> {m.label}
                    </button>
                  );
                })}
              </div>

              <select value={newQuestion.category} onChange={e=>setNewQuestion(prev=>({ ...prev, category:e.target.value }))}
                style={{ width:'100%', padding:'10px 12px', marginBottom:16, border:`2px solid ${palette.border}`, borderRadius:12, fontSize:14, backgroundColor:palette.softBg, color:palette.text, outline:'none' }}>
                {['news','general','politics','work','technology','lifestyle','environment'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>

              <textarea value={newQuestion.title} onChange={e=>setNewQuestion(prev=>({ ...prev, title:e.target.value }))}
                placeholder="Ask a yes/no question..."
                style={{ width:'100%', padding:12, marginBottom:16, border:`2px solid ${palette.border}`, borderRadius:12, fontSize:14, minHeight:100, resize:'vertical', outline:'none', background:palette.softBg, color:palette.text }}
              />

              <div style={{ display:'flex', justifyContent:'flex-end', gap:12 }}>
                <button type="button" onClick={()=>setIsCreateModalOpen(false)}
                  style={{ padding:'10px 24px', backgroundColor:'transparent', border:`2px solid ${palette.border}`, borderRadius:24, fontSize:14, fontWeight:800, cursor:'pointer', color:palette.subtext }}>
                  Cancel
                </button>
                <button type="submit" disabled={!newQuestion.title.trim()}
                  style={{ padding:'10px 24px', background: newQuestion.title.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : palette.border, border:'none', borderRadius:24, fontSize:14, fontWeight:800, color: newQuestion.title.trim() ? 'white' : palette.mutetext, cursor: newQuestion.title.trim() ? 'pointer' : 'not-allowed' }}>
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
