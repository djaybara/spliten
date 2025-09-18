'use client';

import {
  getQuestionById,
  extractIdFromSlug,
  getAIInsightsForQuestion,
  type QuestionDetails,
} from '@/data/questionsData';

import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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

/* === nouveaux composants partagés === */
import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';

type VoteSide = 'pour' | 'contre';
const BRAND_GRADIENT = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

export default function QuestionPage() {
  const params = useParams();
  const id = (params as any).slug as string;

  const [isLoggedIn] = useState(false);
  const [username] = useState('alice'); // démo
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

  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); return; }
    cb();
  };

  // =========================
  // DATA & SEED
  // =========================
  const questionId = extractIdFromSlug(id || '1');
  const qData = getQuestionById(questionId);

  const [question, setQuestion] = useState<QuestionDetails>(
    qData || {
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
  const { pourPercent, contrePercent, totalVotes } = useMemo(() => {
    const total = question.pour + question.contre;
    const pourP = total ? Math.round((question.pour / total) * 100) : 0;
    return { pourPercent: pourP, contrePercent: 100 - pourP, totalVotes: total };
  }, [question.pour, question.contre]);

  const topLevel = useMemo(() => comments.filter(c => !c.parentId), [comments]);
  const commentsCount = topLevel.length + discussions.length;

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
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'flex', gap: 20 }}>
        {/* ===== Sidebar gauche: module catégories partagé ===== */}
        {!isMobile && (
          <aside style={{ width: 240 }}>
            <CategoriesPanel
              selected={question.category as any}
              onNavigate={(val)=>{ window.location.href = val === 'all' ? '/' : `/?category=${val}`; }}
            />
          </aside>
        )}

        {/* ===== Main ===== */}
        <main style={{ flex: 1, maxWidth: isMobile ? '100%' : 640 }}>
          {/* === QuestionCard partagée (avec description + sources) === */}
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
            onShare={()=>{
              try{ if(navigator.share){ navigator.share({ title: document.title, url: window.location.href }); }
              else navigator.clipboard?.writeText(window.location.href); }catch{}
            }}
            onSave={()=>alert('Saved (mock)')}
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

          {/* Timelines en bas */}
          <div style={{ display:'grid', gap:12, marginTop:16 }}>
            <OpinionTimeline data={opinionSeries}/>
            <ArgumentTimeline dailyCounts={argDaily}/>
          </div>
        </main>

        {/* ===== Sidebar droite ===== */}
        <aside style={{ width: 320, flex: '0 0 320px' }}>
          <button
            onClick={() => { isLoggedIn ? alert('Open Create Post modal') : (setAuthMode('login'), setShowAuthModal(true)); }}
            style={{ width:'100%', padding:12, background:BRAND_GRADIENT, border:'none', borderRadius:24, color:'white', fontSize:15, fontWeight:800, marginBottom:16, boxShadow:'0 4px 12px rgba(102,126,234,0.3)' }}
            className="clickable"
          >
            + Create a Post
          </button>

          {/* Trending Now */}
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

          {/* AI Insights */}
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
      </div>
    </div>
  );
}

function isoOffset(days: number) { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
