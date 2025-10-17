// src/app/questions/[slug]/ClientQuestion.tsx
'use client';

import {
  getAIInsightsForQuestion,
  type QuestionDetails,
} from '@/data/questionsData';

import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
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

import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';

import { Home as HomeIcon, TrendingUp, Newspaper } from 'lucide-react';

type VoteSide = 'pour' | 'contre';

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export type ClientQuestionProps = {
  slug: string;
  initialQuestion: QuestionDetails;
  initialSources: { url: string }[];
  initialComments: UIComment[];
  initialDiscussions: UIDiscussion[];
};

export default function ClientQuestion({
  slug,
  initialQuestion,
  initialSources,
  initialComments,
  initialDiscussions,
}: ClientQuestionProps) {
  const router = useRouter();

  // ====== AUTH/UI état local (inchangé) ======
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

  const shareBusyRef = useRef(false);
  const requireAuth = (cb: () => void) => { if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); return; } cb(); };

  // ====== DATA (initialisée depuis le SSR) ======
  const [question, setQuestion] = useState<QuestionDetails>(initialQuestion);
  const [questionSources, setQuestionSources] = useState<{ url: string }[]>(initialSources);
  const [comments, setComments] = useState<UIComment[]>(initialComments);
  const [discussions, setDiscussions] = useState<UIDiscussion[]>(initialDiscussions);

  const totalVotes = useMemo(
    () => Number(question.pour || 0) + Number(question.contre || 0),
    [question.pour, question.contre]
  );

  const opinionSeries = useMemo(
    () => [{ date: isoOffset(-10), yes:56 }, { date: isoOffset(-3), yes:51 }, { date: isoOffset(-2), yes:49, viral:true }, { date: isoOffset(-1), yes:52 }],
    []
  );
  const argDaily = useMemo(
    () => Array.from({ length: 14 }).map((_, i) => ({ date: isoOffset(-i), count: i % 5 === 0 ? 7 : (i % 3) + 2 })),
    []
  );

  const { pourPercent } = useMemo(() => {
    const total = question.pour + question.contre;
    const pourP = total ? Math.round((question.pour / total) * 100) : 0;
    return { pourPercent: pourP };
  }, [question.pour, question.contre]);

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

  const onShare = async () => {
    if (shareBusyRef.current) return;
    shareBusyRef.current = true;
    try {
      const url = window.location.href;
      if (navigator.share) await navigator.share({ title: question?.title ? `Spliten — ${question.title}` : 'Spliten', url });
      else { await navigator.clipboard?.writeText(url); alert('Link copied to clipboard!'); }
    } finally { shareBusyRef.current = false; }
  };

  const baseInsights = useMemo(() => getAIInsightsForQuestion(question.id), [question.id]);
  const [aiLoading, setAiLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setAiLoading(false), 500); return () => clearTimeout(t); }, []);

  const handleAddArgument = (side: VoteSide) => (text: string, sources?: CSource[]) => {
    const c: UIComment = { id: Date.now(), text, author: username || 'you', timeAgo: 'now', votes: 1, userVote: 'up', side, sources: sources || [], views: 10 };
    setComments((prev) => [c, ...prev]);
  };
  const handleVoteComment = async (commentId: number, voteType: 'up' | 'down') => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      let votes = c.votes; let uv = c.userVote;
      if (uv === voteType) { votes += voteType==='up' ? -1 : +1; uv = null; }
      else if (uv)        { votes += voteType==='up' ? +2 : -2; uv = voteType; }
      else                { votes += voteType==='up' ? +1 : -1; uv = voteType; }
      return { ...c, votes, userVote: uv, views: (c.views ?? 0) + 1 };
    }));
  };
  const handleReplyArgument = async (parentId: number, text: string, sources?: CSource[]) => {
    const parent = comments.find(c=>c.id===parentId); if (!parent) return;
    const reply: UIComment = { id: Date.now(), text, author: username || 'you', timeAgo: 'now', votes: 0, userVote: null, side: parent.side, parentId, sources: sources || [], views: 1 };
    setComments(prev => [reply, ...prev]);
  };
  const handlePostDiscussion = async (text: string, sources?: { url: string }[]) => {
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
        onAskClick={() => { if (!isLoggedIn) setShowAuthModal(true); else router.push('/ask'); }}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'flex', gap: 20 }}>
        {!isMobile && (
          <aside style={{ width: 220, position: 'sticky', top: 76, alignSelf: 'flex-start', height: 'calc(100vh - 76px)', overflowY: 'auto' }}>
            <div style={{ background: 'var(--card)', borderRadius: 12, padding: 8, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={()=> router.push('/')} className="clickable" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, fontWeight:700, color:'var(--text)', cursor:'pointer' }} title="Home"><HomeIcon size={16}/>Home</button>
                <button onClick={()=> router.push('/popular')} className="clickable" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, fontWeight:700, color:'var(--text)', cursor:'pointer' }} title="Popular"><TrendingUp size={16}/>Popular</button>
                <button onClick={()=> router.push('/?sort=news')} className="clickable" style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, fontWeight:700, color:'var(--text)', cursor:'pointer' }} title="News"><Newspaper size={16}/>News</button>
              </div>
            </div>

            <CategoriesPanel
              selected={question.category as any}
              onNavigate={(val)=>{ window.location.href = val === 'all' ? '/' : `/?category=${val}`; }}
            />
          </aside>
        )}

        <main style={{ flex: 1 }}>
          <QuestionCard
            id={question.id}
            title={question.title}
            category={question.category}
            author={question.author}
            timeAgo={question.timeAgo}
            views={Number(question.views || 0)}
            pour={Number(question.pour || 0)}
            contre={Number(question.contre || 0)}
            total={Number(question.pour || 0) + Number(question.contre || 0)}
            badges={question.badges as any}
            description={question.description}
            sources={questionSources}
            showDescription
            showSources
            userOpinion={null}
            onYes={()=>voteYesNo('pour')}
            onNo={()=>voteYesNo('contre')}
            onShare={onShare}
            onSave={()=>requireAuth(()=>alert('Saved (mock)'))}
            onCommentsClick={()=>document.getElementById('discussion-top')?.scrollIntoView({behavior:'smooth'})}
            commentsCount={(comments.filter(c=>!c.parentId)).length + discussions.length}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <ArgumentsColumn
              title="Arguments FOR"
              colorHeaderBg="linear-gradient(90deg, #f0fdf4, #dcfce7)"
              colorHeaderText="#065f46"
              colorCount="#047857"
              borderColor="#bbf7d0"
              side="pour"
              comments={(showAllArgs ? comments : comments.slice(0, 999)).filter(c=>!c.parentId && c.side==='pour').sort((a,b)=>b.votes-a.votes).slice(0, showAllArgs ? undefined : 3)}
              totalCount={comments.filter(c=>!c.parentId && c.side==='pour').length}
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
              comments={(showAllArgs ? comments : comments.slice(0, 999)).filter(c=>!c.parentId && c.side==='contre').sort((a,b)=>b.votes-a.votes).slice(0, showAllArgs ? undefined : 3)}
              totalCount={comments.filter(c=>!c.parentId && c.side==='contre').length}
              isLoggedIn={isLoggedIn}
              requireAuth={requireAuth}
              onAdd={handleAddArgument('contre')}
              onVote={handleVoteComment}
              onReply={handleReplyArgument}
            />
          </div>

          {(comments.filter(c=>!c.parentId && c.side==='pour').length > 3 || comments.filter(c=>!c.parentId && c.side==='contre').length > 3) && (
            <div style={{ textAlign:'center', marginTop:8 }}>
              <button onClick={()=>setShowAllArgs(s=>!s)} className="text-xs clickable" style={{ color:'#64748b', background:'transparent', border:'none' }}>
                {showAllArgs ? 'View less' : 'View more'}
              </button>
            </div>
          )}

          <h3 id="discussion-top" style={{ fontSize:16, fontWeight:800, color:'var(--text)', marginTop:16, marginBottom:8 }}>Open Discussion</h3>
          <DiscussionThread
            discussions={discussions}
            onPost={handlePostDiscussion}
            onReply={()=>alert('TODO: threaded replies')}
          />

          <div style={{ display:'grid', gap:12, marginTop:16 }}>
            <OpinionTimeline data={opinionSeries}/>
            <ArgumentTimeline dailyCounts={argDaily}/>
          </div>
        </main>

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
                totalTopLevelArgs={comments.filter(c=>!c.parentId).length}
                questionSources={questionSources}
                bodyColor="var(--muted)"
              />
            )}

            <div style={{ marginTop: 16 }}><BiasLensCard comments={comments.filter(c=>!c.parentId)}/></div>
            <div style={{ marginTop: 16 }}><ExplainBothSides comments={comments.filter(c=>!c.parentId).map(c=>({side:c.side, text:c.text, votes:c.votes}))}/></div>
            <div style={{ marginTop: 16 }}><FactCheckPanel comments={comments.filter(c=>!c.parentId)}/></div>
            <div style={{ marginTop: 16 }}><ExplainToKid comments={comments.filter(c=>!c.parentId)}/></div>
          </aside>
        )}
      </div>

      {showAuthModal && (
        <div onClick={() => setShowAuthModal(false)} style={{ position:'fixed', inset:0 as any, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor:'var(--card)', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 10px 40px rgba(0,0,0,0.4)', position:'relative', border:'1px solid var(--border)' }}>
            <div style={{ padding:24, borderBottom:`1px solid var(--border)` }}>
              <h2 style={{ fontSize:24, fontWeight:800, color:'var(--text)', background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Spliten'}
              </h2>
            </div>
            <form onSubmit={(e)=>{ e.preventDefault(); if (username.trim()) { setIsLoggedIn(true); setShowAuthModal(false); } }} style={{ padding:24 }}>
              <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid var(--border)`, borderRadius:12, fontSize:14, outline:'none', background:'var(--bg)', color:'var(--text)' }} required />
              <input type="password" placeholder="Password"
                style={{ width:'100%', padding:'12px 16px', marginBottom:12, border:`2px solid var(--border)`, borderRadius:12, fontSize:14, outline:'none', background:'var(--bg)', color:'var(--text)' }} required />
              <button type="submit" style={{ width:'100%', padding:12, background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border:'none', borderRadius:12, color:'white', fontSize:15, fontWeight:800, cursor:'pointer', marginBottom:8, boxShadow:'0 4px 12px rgba(102,126,234,0.3)' }}>
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
              <p style={{ fontSize:13, color:'var(--muted)', textAlign:'center' }}>
                {authMode === 'login' ? 'New to Spliten? ' : 'Already have an account? '}
                <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} style={{ color:'#667eea', fontWeight:800, background:'none', border:'none', cursor:'pointer' }}>
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </form>
            <button onClick={() => setShowAuthModal(false)} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:18 }} aria-label="Close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
