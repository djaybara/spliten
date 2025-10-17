'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import CategoriesPanel from '@/components/CategoriesPanel';
import QuestionCard from '@/components/QuestionCard';
import ArgumentsColumn, { type UIComment, type SourceLink as CSource } from '@/components/ArgumentsColumn';
import DiscussionThread, { type UIDiscussion } from '@/components/DiscussionThread';
import AIInsightsCard from '@/components/AIInsightsCard';
import AISkeleton from '@/components/AISkeleton';
import OpinionTimeline from '@/components/OpinionTimeline';
import ArgumentTimeline from '@/components/ArgumentTimeline';
import BiasLensCard from '@/components/BiasLensCard';
import ExplainBothSides from '@/components/ExplainBothSides';
import FactCheckPanel from '@/components/FactCheckPanel';
import ExplainToKid from '@/components/ExplainToKid';

type VoteSide = 'pour' | 'contre';

export type ClientQuestion = {
  id: number | string;
  title: string;
  category: string;
  description?: string;
  createdAtISO?: string;
  author?: string;
  views: number;
  votesACount: number;
  votesBCount: number;
  badges?: Array<'trending' | 'controversial' | 'new' | 'top'>;
};

function formatTimeAgoFR(input?: string) {
  if (!input) return 'just now';
  const date = new Date(input);
  if (isNaN(date.getTime())) return 'just now';
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'yesterday';
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}

export default function ClientInteractive(props: {
  slug: string;
  initialQuestion: ClientQuestion;
  initialSources: { url: string }[];
  initialComments: UIComment[];
  initialDiscussions: UIDiscussion[];
}) {
  const { slug, initialQuestion, initialSources, initialComments, initialDiscussions } = props;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('you');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');

  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); return; }
    cb();
  };

  const [question, setQuestion] = useState<ClientQuestion>(initialQuestion);
  const [questionSources, setQuestionSources] = useState<{ url: string }[]>(initialSources || []);
  const [comments, setComments] = useState<UIComment[]>(initialComments || []);
  const [discussions, setDiscussions] = useState<UIDiscussion[]>(initialDiscussions || []);

  const [aiLoading, setAiLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setAiLoading(false), 400); return () => clearTimeout(t); }, []);

  const total = question.votesACount + question.votesBCount;
  const yesPercent = total ? Math.round((question.votesACount / total) * 100) : 0;

  const timeAgoText = useMemo(() => formatTimeAgoFR(question.createdAtISO), [question.createdAtISO]);

  const handleAddArgument = (side: VoteSide) => (text: string, sources?: CSource[]) => {
    const c: UIComment = {
      id: Date.now(), text, author: username, timeAgo: 'just now',
      votes: 1, userVote: 'up', side, sources: sources || [], views: 1
    };
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
    const reply: UIComment = {
      id: Date.now(), text, author: username, timeAgo: 'just now',
      votes: 0, userVote: null, side: parent.side, parentId, sources: sources || [], views: 1
    };
    setComments(prev => [reply, ...prev]);
  };
  const handlePostDiscussion = (text: string, sources?: { url: string }[]) => {
    const d: UIDiscussion = { id: Date.now(), text, author: username, timeAgo: 'just now', likes: 0, replies: 0, sources: sources || [] };
    setDiscussions(prev => [d, ...prev]);
  };

  const onShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: `Spliten — ${question.title}`, url });
      else { await navigator.clipboard?.writeText(url); alert('Link copied'); }
    } catch {}
  };

  const pourTop = comments.filter(c=>!c.parentId && c.side==='pour').sort((a,b)=>b.votes-a.votes);
  const contreTop = comments.filter(c=>!c.parentId && c.side==='contre').sort((a,b)=>b.votes-a.votes);

  const opinionSeries = useMemo(() => {
    const today = new Date();
    const d = (offset: number) => { const x = new Date(today); x.setDate(x.getDate()+offset); return x.toISOString().slice(0,10); };
    return [{date:d(-10), yes:56},{date:d(-3), yes:51},{date:d(-2), yes:49, viral:true},{date:d(-1), yes:52}];
  }, []);
  const argDaily = useMemo(() => {
    const today = new Date();
    const d = (offset: number) => { const x = new Date(today); x.setDate(x.getDate()+offset); return x.toISOString().slice(0,10); };
    return Array.from({length:14}).map((_,i)=>({date:d(-i), count: i%5===0?7: (i%3)+2}));
  }, []);

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
        onAskClick={() => { if (!isLoggedIn) setShowAuthModal(true); else window.location.href = '/ask'; }}
      />

      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto', 
        padding: isMobile ? 12 : 16, 
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'minmax(200px, 220px) 1fr minmax(300px, 340px)',
        gap: 16 
      }}>
        {/* COLONNE GAUCHE - Navigation (hidden on mobile) */}
        {!isMobile && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 12, padding: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => window.location.href = '/'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--pill)', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <svg width="16" height="16" fill="currentColor"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-7 7A.5.5 0 0 0 1 8.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z"/></svg>
                  Home
                </button>
                <button onClick={() => window.location.href = '/popular'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <svg width="16" height="16" fill="currentColor"><path d="M2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-11zm1 2h9v2h-9V3zm0 3h9v2h-9V6zm0 3h9v2h-9V9zm0 3h5v2h-5v-2z"/></svg>
                  Popular
                </button>
                <button onClick={() => window.location.href = '/?sort=news'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                  <svg width="16" height="16" fill="currentColor"><path d="M2.5 1a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-13a.5.5 0 0 0-.5-.5h-11zm1 2h9v2h-9V3zm0 3h9v2h-9V6zm0 3h9v2h-9V9zm0 3h5v2h-5v-2z"/></svg>
                  News
                </button>
              </div>
            </div>
            <CategoriesPanel
              selected={question.category as any}
              onNavigate={(val)=>{ window.location.href = val === 'all' ? '/' : `/?category=${val}`; }}
            />
          </aside>
        )}

        {/* COLONNE CENTRALE - Contenu principal */}
        <main style={{ minWidth: 0 }}>
          {/* Question Card */}
          <QuestionCard
            id={question.id}
            title={question.title}
            category={question.category}
            author={question.author || '—'}
            timeAgo={timeAgoText}
            views={question.views}
            pour={question.votesACount}
            contre={question.votesBCount}
            total={total}
            badges={question.badges || []}
            description={question.description}
            sources={questionSources}
            showDescription
            showSources
            userOpinion={null}
            onYes={()=>requireAuth(()=>setQuestion(q=>({...q, votesACount:q.votesACount+1})))}
            onNo={()=>requireAuth(()=>setQuestion(q=>({...q, votesBCount:q.votesBCount+1})))}
            onShare={onShare}
            onSave={()=>requireAuth(()=>alert('Saved (mock)'))}
            onCommentsClick={()=>document.getElementById('discussion-top')?.scrollIntoView({behavior:'smooth'})}
            commentsCount={comments.filter(c=>!c.parentId).length + discussions.length}
          />

          {/* MOBILE ONLY: AI Insights compact au top */}
          {isMobile && (
            <div style={{ marginTop: 16 }}>
              {aiLoading ? (
                <AISkeleton />
              ) : (
                <AIInsightsCard
                  questionSlug={slug}
                  yesPercent={yesPercent}
                  totalTopLevelArgs={comments.filter(c=>!c.parentId).length}
                  questionSources={questionSources}
                  bodyColor="var(--muted)"
                  lang="en"
                />
              )}
            </div>
          )}

          {/* Arguments FOR/AGAINST */}
          <div className="grid md:grid-cols-2 gap-4" style={{ marginTop: 16 }}>
            <ArgumentsColumn
              title="Arguments FOR"
              colorHeaderBg="linear-gradient(90deg, #f0fdf4, #dcfce7)"
              colorHeaderText="#065f46"
              colorCount="#047857"
              borderColor="#bbf7d0"
              side="pour"
              comments={pourTop.slice(0, 6)}
              totalCount={pourTop.length}
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
              comments={contreTop.slice(0, 6)}
              totalCount={contreTop.length}
              isLoggedIn={isLoggedIn}
              requireAuth={requireAuth}
              onAdd={handleAddArgument('contre')}
              onVote={handleVoteComment}
              onReply={handleReplyArgument}
            />
          </div>

          {/* Discussion */}
          <h3 id="discussion-top" style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginTop:16, marginBottom:8 }}>Open Discussion</h3>
          <DiscussionThread
            discussions={discussions}
            onPost={handlePostDiscussion}
            onReply={()=>alert('TODO: threaded replies')}
          />

          {/* Timelines */}
          <div style={{ display:'grid', gap:12, marginTop:16 }}>
            <OpinionTimeline data={opinionSeries}/>
            <ArgumentTimeline dailyCounts={argDaily}/>
          </div>
        </main>

        {/* COLONNE DROITE - Analyses & Insights (desktop only) */}
        {!isMobile && (
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Trending Now */}
            <div style={{ backgroundColor:'var(--card)', borderRadius:12, padding:16, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', border:'1px solid var(--border)' }}>
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

            {/* AI Insights */}
            {aiLoading ? (
              <AISkeleton />
            ) : (
              <AIInsightsCard
                questionSlug={slug}
                yesPercent={yesPercent}
                totalTopLevelArgs={comments.filter(c=>!c.parentId).length}
                questionSources={questionSources}
                bodyColor="var(--muted)"
                lang="en"
              />
            )}

            {/* Other Analysis Cards */}
            <BiasLensCard comments={comments.filter(c=>!c.parentId)}/>
            <ExplainBothSides comments={comments.filter(c=>!c.parentId).map(c=>({side:c.side, text:c.text, votes:c.votes}))}/>
            <FactCheckPanel comments={comments.filter(c=>!c.parentId)}/>
            <ExplainToKid comments={comments.filter(c=>!c.parentId)}/>
          </aside>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div onClick={() => setShowAuthModal(false)} style={{ position:'fixed', inset:0 as any, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor:'var(--card)', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 10px 40px rgba(0,0,0,0.4)', position:'relative', border:'1px solid var(--border)' }}>
            <div style={{ padding:24, borderBottom:`1px solid var(--border)` }}>
              <h2 style={{ fontSize:24, fontWeight:800, color:'var(--text)', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Spliten'}
              </h2>
            </div>
            <form onSubmit={(e)=>{ e.preventDefault(); setIsLoggedIn(true); setShowAuthModal(false); }} style={{ padding:24 }}>
              <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid var(--border)`, borderRadius:12, fontSize:14, outline:'none', background:'var(--bg)', color:'var(--text)' }} required />
              <input type="password" placeholder="Password"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid var(--border)`, borderRadius:12, fontSize:14, outline:'none', background:'var(--bg)', color:'var(--text)' }} required />
              <button type="submit" style={{ width:'100%', padding:12, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:8, boxShadow:'0 4px 12px rgba(102,126,234,0.3)' }}>
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            </form>
            <button onClick={() => setShowAuthModal(false)} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:18 }} aria-label="Close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}