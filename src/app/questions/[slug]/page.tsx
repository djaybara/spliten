// src/app/questions/[slug]/page.tsx
'use client';

import {
  // on ne se sert plus de getQuestionById ni extractIdFromSlug
  QUESTIONS_DATA,
  getAIInsightsForQuestion,
  type QuestionDetails,
} from '@/data/questionsData';

import Navbar from '@/components/Navbar';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import AIInsightsCard from '@/components/AIInsightsCard';
import AISkeleton from '@/components/AISkeleton';

import ArgumentsColumn, { type UIComment, type SourceLink as CSource } from '@/components/ArgumentsColumn';
import DiscussionThread, { type UIDiscussion } from '@/components/DiscussionThread';

import OpinionTimeline from '@/components/OpinionTimeline';
import ArgumentTimeline from '@/components/ArgumentTimeline';

import BiasLensCard from '@/components/BiasLensCard';
import ExplainBothSides from '@/components/ExplainBothSides';
import FactCheckPanel from '@/components/FactCheckPanel';
import ExplainToKid from '@/components/ExplainToKid';

/* partagés */
import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';

/* icônes pour le module Sections */
import { Home as HomeIcon, TrendingUp, Newspaper } from 'lucide-react';

type VoteSide = 'pour' | 'contre';

// === Helpers (slugs propres) ===
function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function getQuestionBySlugLocal(slug: string): QuestionDetails | null {
  const all = Object.values(QUESTIONS_DATA || {});
  const found = all.find(q => slugifyTitle(q.title) === slug);
  return found || null;
}

// date helper
function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String((params as any)?.slug || '');

  // ⚠️ AUTH (démo)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('alice');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /** Verrou anti double-clic pour Share */
  const shareBusyRef = useRef(false);

  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); return; }
    cb();
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    }
  };

  // =========================
  // DATA (par SLUG propre)
  // =========================
  const initialQuestion: QuestionDetails = useMemo(() => {
    return (
      getQuestionBySlugLocal(slug) || {
        id: 1,
        title: 'Question not found',
        category: 'general',
        author: 'alice',
        timeAgo: 'now',
        pour: 805,
        contre: 429,
        views: 3420,
        description: "This question doesn't exist.",
        totalComments: 0,
        badges: ['trending'],
        comments: [],
        discussions: [],
      }
    );
  }, [slug]);

  const [question, setQuestion] = useState<QuestionDetails>(initialQuestion);

  // si on navigue vers un autre slug côté client, on recharge la bonne question
useEffect(() => {
  let cancel = false;

  // 1) Essayer d'abord les données locales (mocks)
  const local = getQuestionBySlugLocal(slug);
  if (local) {
    setQuestion(local);
    return () => { cancel = true; };
  }

  // 2) Sinon, aller chercher en DB via l'API
  (async () => {
    try {
      const res = await fetch(`/api/questions/${slug}`, { cache: 'no-store' });
      if (!res.ok) return; // 404 => on laisse "Question not found"

      const data = await res.json();
      if (!cancel && data?.ok && data.question) {
        // On "remplit" ton shape actuel avec des valeurs par défaut pour les champs UI
        setQuestion(prev => ({
          // garde certains champs existants si tu en as déjà
          ...prev,
          id: prev?.id ?? 1,
          title: data.question.title,
          category: data.question.category ?? 'general',
          author: prev?.author ?? 'you',
          timeAgo: prev?.timeAgo ?? 'now',
          pour: prev?.pour ?? 0,
          contre: prev?.contre ?? 0,
          views: prev?.views ?? 0,
          badges: prev?.badges ?? ['new'],
          description: prev?.description ?? '',
          totalComments: prev?.totalComments ?? 0,
          comments: prev?.comments ?? [],
          discussions: prev?.discussions ?? [],
        }));
      }
    } catch {
      // en dev: tu peux console.log l'erreur si tu veux
    }
  })();

  return () => { cancel = true; };
}, [slug]);


  // sources (question)
  const [questionSources] = useState<{ url: string }[]>([
    { url: 'https://www.bbc.com/news/science-environment-123' },
    { url: 'https://www.nature.com/articles/abcd1234' },
    { url: 'https://www.lemonde.fr/politique/article/2024/11/09/xyz_6300000_823448.html' },
  ]);

  // seed arguments + replies
  const [comments, setComments] = useState<UIComment[]>([
    { id:1001, text:'Meta-analysis (n=120k) suggests a 25% improvement over baseline.', author:'Nora', timeAgo:'2h', votes:330, userVote:null, side:'pour',   sources:[{url:'https://www.nature.com/articles/abcd1234'},{url:'reuters.com/world/data'}], views:300 },
    { id:1002, text:'Economic burden could rise by 2–3% of GDP in 5 years without regulation.', author:'Hugo', timeAgo:'5h', votes:28, userVote:null, side:'contre', sources:[{url:'ft.com/special-report/gdp-forecast'}], views:250 },
    { id:1003, text:'Health outcomes improved across low-income groups (+12%).',              author:'Mina', timeAgo:'1d', votes:34, userVote:null, side:'pour',   sources:[{url:'who.int/report/2024'}], views:260 },
    // replies
    { id:2001, text:'The meta-analysis you cite excludes outliers; check appendix B.', author:'Leo',  timeAgo:'1h', votes:6, userVote:null,  side:'contre', parentId:1001, sources:[{url:'arxiv.org/abs/1234.5678'}], views:40 },
    { id:2002, text:'GDP projection assumes linear adoption; scenario likely optimistic.', author:'Sara', timeAgo:'3h', votes:4, userVote:null, side:'pour',   parentId:1002, sources:[{url:'oecd.org/economy/outlook'}],    views:30 },
  ]);

  // seed discussions
  const [discussions, setDiscussions] = useState<UIDiscussion[]>([
    { id:5001, text:'Beyond yes/no: incentives design may matter more than the policy name.', author:'Jon', timeAgo:'3h', likes:12, replies:3, sources:[{url:'https://guardian.com/policy/2024/analysis'}] },
    { id:5002, text:'What about regional disparities? Pilot cities vs rural areas behave differently.', author:'Ana', timeAgo:'1d', likes:7, replies:1, sources:[{url:'https://bbc.com/news/uk/regions'}] },
  ]);

  // timelines (démo)
  const opinionSeries = useMemo(
    () => [{ date: isoOffset(-10), yes:56 }, { date: isoOffset(-3), yes:51 }, { date: isoOffset(-2), yes:49, viral:true }, { date: isoOffset(-1), yes:52 }],
    []
  );
  const argDaily = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({ date: isoOffset(-i), count: i % 5 === 0 ? 7 : (i % 3) + 2 })),
    []
  );

  // votes
  const { pourPercent, contrePercent } = useMemo(() => {
    const total = question.pour + question.contre;
    const pourP = total ? Math.round((question.pour / total) * 100) : 0;
    return { pourPercent: pourP, contrePercent: 100 - pourP };
  }, [question.pour, question.contre]);

  const topLevel = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const pourComments   = useMemo(() => topLevel.filter((c)=>c.side==='pour'  ).sort((a,b)=>b.votes-a.votes), [topLevel]);
  const contreComments = useMemo(() => topLevel.filter((c)=>c.side==='contre').sort((a,b)=>b.votes-a.votes), [topLevel]);

  const [showAllArgs, setShowAllArgs] = useState(false);
  const [userVote, setUserVote] = useState<VoteSide | null>(null);

  const voteYesNo = (side: VoteSide) => {
    requireAuth(() => {
      setQuestion(prev => {
        if (userVote === side) { setUserVote(null); return { ...prev, [side]:(prev as any)[side]-1 } as QuestionDetails; }
        if (userVote) { const other = userVote === 'pour' ? 'contre' : 'pour'; setUserVote(side); return { ...prev, [side]:(prev as any)[side]+1, [other]:(prev as any)[other]-1 } as QuestionDetails; }
        setUserVote(side); return { ...prev, [side]:(prev as any)[side]+1 } as QuestionDetails;
      });
    });
  };

  /** Bouton Share – protégé contre le double-clic */
  const onShare = async () => {
    if (shareBusyRef.current) return;
    shareBusyRef.current = true;
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: question?.title ? `Spliten — ${question.title}` : 'Spliten',
          url
        });
      } else {
        await navigator.clipboard?.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch {
      // ignore
    } finally {
      shareBusyRef.current = false;
    }
  };

  // AI
  const baseInsights = useMemo(() => getAIInsightsForQuestion(question.id), [question.id]);

  // Skeleton de démo (simule un chargement IA)
  const [aiLoading, setAiLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setAiLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // handlers arguments/discussion
  const handleAddArgument = (side: VoteSide) => (text: string, sources?: CSource[]) => {
    const c: UIComment = { id: Date.now(), text, author: username || 'you', timeAgo: 'now', votes: 1, userVote: 'up', side, sources: sources || [], views: 10 };
    setComments((prev) => [c, ...prev]);
  };
  const handleVoteComment = (commentId: number, voteType: 'up' | 'down') => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      let votes = c.votes; let uv = c.userVote;
      if (uv === voteType) { votes += voteType==='up' ? -1 : +1; uv = null; }
      else if (uv)        { votes += voteType==='up' ? +2 : -2; uv = voteType; }
      else                { votes += voteType==='up' ? +1 : -1; uv = voteType; }
      return { ...c, votes, userVote: uv, views: (c.views ?? 0) + 1 };
    }));
  };
  const handleReplyArgument = (parentId: number, text: string, sources?: CSource[]) => {
    const parent = comments.find(c=>c.id===parentId); if (!parent) return;
    const reply: UIComment = { id: Date.now(), text, author: username || 'you', timeAgo: 'now', votes: 0, userVote: null, side: parent.side, parentId, sources: sources || [], views: 1 };
    setComments(prev => [reply, ...prev]);
  };
  const handlePostDiscussion = (text: string, sources?: { url: string }[]) => {
    const d: UIDiscussion = { id: Date.now(), text, author: username || 'you', timeAgo: 'now', likes: 0, replies: 0, sources: sources || [] };
    setDiscussions(prev => [d, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Navbar
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoginClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSignupClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
        onAskClick={() => {
          if (!isLoggedIn) {
            setShowAuthModal(true);
          } else {
            router.push('/ask');
          }
        }}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'flex', gap: 20 }}>
        {/* ===== Sidebar gauche ===== */}
        {!isMobile && (
          <aside
            style={{
              width: 220,
              position: 'sticky',
              top: 76,
              alignSelf: 'flex-start',
              height: 'calc(100vh - 76px)',
              overflowY: 'auto'
            }}
          >
            {/* Sections */}
            <div style={{
              background: 'var(--card)', borderRadius: 12, padding: 8, marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={()=> router.push('/')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontWeight: 700, color: 'var(--text)', cursor: 'pointer'
                  }}
                  title="Home"
                >
                  <HomeIcon size={16} />
                  Home
                </button>

                <button
                  onClick={()=> router.push('/popular')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontWeight: 700, color: 'var(--text)', cursor: 'pointer'
                  }}
                  title="Popular"
                >
                  <TrendingUp size={16} />
                  Popular
                </button>

                <button
                  onClick={()=> router.push('/?sort=news')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 8,
                    fontWeight: 700, color: 'var(--text)', cursor: 'pointer'
                  }}
                  title="News"
                >
                  <Newspaper size={16} />
                  News
                </button>
              </div>
            </div>

            {/* Catégories */}
            <CategoriesPanel
              selected={question.category as any}
              onNavigate={(val)=>{ window.location.href = val === 'all' ? '/' : `/?category=${val}`; }}
            />
          </aside>
        )}

        {/* ===== Main ===== */}
        <main style={{ flex: 1, maxWidth: isMobile ? '100%' : '100%' }}>
          <QuestionCard
            id={question.id}
            title={question.title}
            category={question.category}
            author={question.author}
            timeAgo={question.timeAgo}
            views={question.views}
            pour={question.pour}
            contre={question.contre}
            badges={question.badges as any}
            description={question.description}
            sources={questionSources}
            showDescription={true}
            showSources={true}
            userOpinion={userVote}
            onYes={()=>voteYesNo('pour')}
            onNo={()=>voteYesNo('contre')}
            onShare={onShare}
            onSave={()=>requireAuth(()=>alert('Saved (mock)'))}
            onCommentsClick={()=>document.getElementById('discussion-top')?.scrollIntoView({behavior:'smooth'})}
            commentsCount={(comments.filter(c=>!c.parentId)).length + discussions.length}
          />

          {/* Colonnes arguments */}
          <div className="grid md:grid-cols-2 gap-4">
            <ArgumentsColumn
              title="Arguments FOR"
              colorHeaderBg="linear-gradient(90deg, #f0fdf4, #dcfce7)"
              colorHeaderText="#065f46"
              colorCount="#047857"
              borderColor="#bbf7d0"
              side="pour"
              comments={showAllArgs ? pourComments : pourComments.slice(0, 3)}
              totalCount={pourComments.length}
              isLoggedIn={isLoggedIn}
              requireAuth={requireAuth}
              onAdd={handleAddArgument('pour')}
              onVote={handleVoteComment}
              onReply={handleReplyArgument}
            />
            <ArgumentsColumn
              title="Arguments AGAINST"
              colorHeaderBg="linear-gradient(90deg, #fef2f2, #fee2e2)"
              colorHeaderText="#7f1d1d"
              colorCount="#b91c1c"
              borderColor="#fecaca"
              side="contre"
              comments={showAllArgs ? contreComments : contreComments.slice(0, 3)}
              totalCount={contreComments.length}
              isLoggedIn={isLoggedIn}
              requireAuth={requireAuth}
              onAdd={handleAddArgument('contre')}
              onVote={handleVoteComment}
              onReply={handleReplyArgument}
            />
          </div>

          {(pourComments.length > 3 || contreComments.length > 3) && (
            <div style={{ textAlign:'center', marginTop:8 }}>
              <button onClick={()=>setShowAllArgs(s=>!s)} className="text-xs clickable" style={{ color:'#64748b', background:'transparent', border:'none' }}>
                {showAllArgs ? 'View less' : 'View more'}
              </button>
            </div>
          )}

          {/* Discussion */}
          <h3 id="discussion-top" style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginTop:16, marginBottom:8 }}>Open Discussion</h3>
          <DiscussionThread discussions={discussions} onPost={handlePostDiscussion} onReply={()=>alert('TODO: threaded replies')}/>

          {/* Timelines */}
          <div style={{ display:'grid', gap:12, marginTop:16 }}>
            <OpinionTimeline data={opinionSeries}/>
            <ArgumentTimeline dailyCounts={argDaily}/>
          </div>
        </main>

        {/* ===== Sidebar droite ===== */}
        {!isMobile && (
          <aside style={{ width: 340, flex: '0 0 340px' }}>
            <div style={{ backgroundColor:'var(--card)', borderRadius:12, padding:16, marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h3 style={{ fontSize:16, fontWeight:800, color:'var(--text)' }}>Trending Now</h3>
                <span style={{ width:8, height:8, background:'#667eea', borderRadius:999 }} />
              </div>
              {[
                { topic:'Climate Policy', change:'+234%', count:'1.2k discussions' },
                { topic:'AI Regulation',  change:'+89%',  count:'892 discussions' },
                { topic:'Work-Life Balance', change:'+45%', count:'567 discussions' },
              ].map((t,i,arr)=>(
                <div key={i} style={{ padding:'12px 0', borderBottom: i<arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{t.topic}</span>
                    <span style={{ fontSize:12, color:'#10b981', fontWeight:800 }}>{t.change}</span>
                  </div>
                  <span style={{ fontSize:12, color:'var(--muted)' }}>{t.count}</span>
                </div>
              ))}
            </div>

            {aiLoading ? (
              <AISkeleton />
            ) : (
              <AIInsightsCard
                ai={baseInsights}
                yesPercent={pourPercent}
                totalTopLevelArgs={[...pourComments, ...contreComments].length}
                questionSources={questionSources}
                bodyColor="var(--muted)"
              />
            )}

            <div style={{ marginTop: 16 }}><BiasLensCard comments={[...pourComments, ...contreComments]}/></div>
            <div style={{ marginTop: 16 }}><ExplainBothSides comments={[...pourComments, ...contreComments].map(c=>({side:c.side, text:c.text, votes:c.votes}))}/></div>
            <div style={{ marginTop: 16 }}><FactCheckPanel comments={[...pourComments, ...contreComments]}/></div>
            <div style={{ marginTop: 16 }}><ExplainToKid comments={[...pourComments, ...contreComments]}/></div>
          </aside>
        )}
      </div>

      {/* ===== Modale Auth ===== */}
      {showAuthModal && (
        <div
          // clic sur l’overlay = ferme la modale
          onClick={() => setShowAuthModal(false)}
          style={{
            position: 'fixed', inset: 0 as any, backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
          }}>
          <div
            // stop la propagation pour ne pas fermer si on clique DANS la boîte
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--card)', borderRadius: 16, width: '100%',
              maxWidth: 420, boxShadow: '0 10px 40px rgba(0,0,0,0.4)', position: 'relative', border: '1px solid var(--border)'
            }}>
            <div style={{ padding: 24, borderBottom: `1px solid var(--border)` }}>
              <h2 style={{
                fontSize: 24, fontWeight: 800, color: 'var(--text)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Spliten'}
              </h2>
            </div>

            <form onSubmit={handleAuth} style={{ padding: 24 }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: 12,
                  border: `2px solid var(--border)`, borderRadius: 12, fontSize: 14,
                  outline: 'none', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                required
              />
              <input
                type="password"
                placeholder="Password"
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: 12,
                  border: `2px solid var(--border)`, borderRadius: 12, fontSize: 14,
                  outline: 'none', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                required
              />
              <button
                type="submit"
                style={{
                  width: '100%', padding: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: 12, color: 'white',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 8,
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
              <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
                {authMode === 'login' ? 'New to Spliten? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  style={{ color: '#667eea', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18 }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
