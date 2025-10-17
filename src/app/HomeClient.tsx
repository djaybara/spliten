// src/app/HomeClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Home as HomeIcon, TrendingUp, Newspaper, Plus, Bot } from 'lucide-react';

import Navbar from '@/components/Navbar';
import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';
import AIInsightsSiteCard from '@/components/AIInsightsSiteCard';
import AISiteSkeleton from '@/components/AISiteSkeleton';
import { AuthModal, CreateModal } from '@/components/HomeModals';
import { getSiteInsights } from '@/data/siteInsights';

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

type Q = {
  id: string | number;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  views: number;
  pour: number;
  contre: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  userVote: 'up' | 'down' | null;
  userOpinion: 'pour' | 'contre' | null;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
  news?: boolean;
};

function formatTimeAgo(isoDate: string) {
  if (!isoDate) return 'just now';
  try {
    const date = new Date(isoDate);
    const now = Date.now();
    const diff = Math.floor((now - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'just now';
  }
}

export default function HomeClient({ initialQuestions }: { initialQuestions?: any[] }) {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    category: 'general',
    mediaType: 'text' as 'text' | 'image' | 'video' | 'link',
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'hot' | 'news' | 'new' | 'top' | 'controversial'>('hot');
  const [allQuestions, setAllQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const loadingMoreRef = useRef(false);
  const shareBusyRef = useRef(false);
  const [aiLoading, setAiLoading] = useState(true);
  const siteInsights = useMemo(() => getSiteInsights(), []);

useEffect(() => {
  // Si on a déjà les questions du serveur, on les utilise
  if (initialQuestions && initialQuestions.length > 0) {
    const questions = initialQuestions.map((q: any) => ({
      id: q.id,
      title: q.title,
      category: q.category || 'general',
      author: q.author || 'Anonymous',
      timeAgo: q.createdAt ? formatTimeAgo(q.createdAt) : 'just now',
      views: q.viewsCount || 0,
      pour: q.votesACount || 0,
      contre: q.votesBCount || 0,
      upvotes: 0,
      downvotes: 0,
      comments: q.commentsCount || 0,
      userVote: null,
      userOpinion: null,
      badges: q.badges || [], // ← AJOUTEZ cette ligne
      news: false,
    }));
    setAllQuestions(questions);
    setLoading(false);
    return;
  }

  // Sinon fallback sur le fetch client
  fetch('/api/questions?limit=50')
    .then((res) => res.json())
    .then((data) => {
      const questions = (data.questions || []).map((q: any) => ({
        id: q.id,
        title: q.title,
        category: q.category || 'general',
        author: q.author?.username || 'Anonymous',
        timeAgo: q.createdAt ? formatTimeAgo(q.createdAt) : 'just now',
        views: q.viewsCount || 0,
        pour: q.votesACount || 0,
        contre: q.votesBCount || 0,
        upvotes: 0,
        downvotes: 0,
        comments: q.commentsCount || 0,
        userVote: null,
        userOpinion: null,
        badges: q.badges || [],
        news: false,
      }));
      setAllQuestions(questions);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Error loading questions:', err);
      setLoading(false);
    });
}, [initialQuestions]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (loadingMoreRef.current) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
      if (nearBottom) {
        loadingMoreRef.current = true;
        setTimeout(() => {
          setVisibleCount((n) => n + 10);
          loadingMoreRef.current = false;
        }, 150);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAiLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  const filteredAndSorted = useMemo(() => {
    const filtered = allQuestions.filter((q) => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const scoreHot = (x: Q) => {
      const badgeBonus = x.badges.includes('trending') ? 100 : x.badges.includes('top') ? 50 : 0;
      const engagement = x.upvotes - x.downvotes + x.comments * 0.6;
      const newsBonus = x.news ? 10 : 0;
      return badgeBonus + engagement + newsBonus;
    };

    let result = [...filtered];

    if (selectedSort === 'hot') {
      result = result.sort((a, b) => scoreHot(b) - scoreHot(a));
    } else if (selectedSort === 'news') {
      result = result.filter((q) => q.news === true).sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else if (selectedSort === 'new') {
      result = result.filter((q) => q.badges.includes('new')).sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else if (selectedSort === 'top') {
      result = result.filter((q) => q.badges.includes('top')).sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    } else if (selectedSort === 'controversial') {
      result = result.filter((q) => q.badges.includes('controversial')).sort((a, b) => {
        const r = (x: Q) => Math.min(x.pour, x.contre) / Math.max(x.pour || 1, x.contre || 1);
        return r(b) - r(a);
      });
    }

    if (result.length === 0 && selectedSort !== 'hot') {
      result = filtered.sort((a, b) => scoreHot(b) - scoreHot(a));
    }

    return result;
  }, [allQuestions, searchQuery, selectedCategory, selectedSort]);

  const visibleQuestions = filteredAndSorted.slice(0, visibleCount);

  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    cb();
  };

  const handleOpinionVote = async (id: string | number, opinion: 'pour' | 'contre') => {
    requireAuth(async () => {
      setAllQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          let newPour = q.pour;
          let newContre = q.contre;
          let newOpinion: 'pour' | 'contre' | null = null;
          if (q.userOpinion === opinion) {
            if (opinion === 'pour') newPour--;
            else newContre--;
            newOpinion = null;
          } else if (q.userOpinion) {
            if (q.userOpinion === 'pour') newPour--;
            else newContre--;
            if (opinion === 'pour') newPour++;
            else newContre++;
            newOpinion = opinion;
          } else {
            if (opinion === 'pour') newPour++;
            else newContre++;
            newOpinion = opinion;
          }
          return { ...q, pour: newPour, contre: newContre, userOpinion: newOpinion };
        })
      );

      fetch(`/api/questions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side: opinion, username }),
      }).catch(() => {
        fetch('/api/questions?limit=50')
          .then(res => res.json())
          .then(data => {
            const questions = (data.questions || []).map((q: any) => ({
              id: q.id,
              pour: q.votesACount || 0,
              contre: q.votesBCount || 0,
            }));
            setAllQuestions(prev => prev.map(pq => {
              const match = questions.find((nq: any) => nq.id === pq.id);
              return match ? { ...pq, ...match } : pq;
            }));
          });
      });
    });
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newQuestion.title.trim();
    if (!title) return;

    requireAuth(() => {
      (async () => {
        try {
          const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              category: newQuestion.category,
              labelA: 'Yes',
              labelB: 'No',
            }),
          });

          if (!res.ok) {
            console.error('Create failed', await res.text());
            alert('Creation failed.');
            return;
          }

          const data = await res.json();
          if (data?.ok && data.question?.slug) {
            setIsCreateModalOpen(false);
            setNewQuestion({ title: '', category: 'general', mediaType: 'text' });
            router.push(`/questions/${data.question.slug}`);
          } else {
            alert('Unexpected server response.');
          }
        } catch (err) {
          console.error(err);
          alert('Network/Server error.');
        }
      })();
    });
  };

  const handleShare = async (q: Q) => {
    const href = `/questions/${slugify(q.title)}`;
    const url = `${window.location.origin}${href}`;
    if (shareBusyRef.current) return;
    shareBusyRef.current = true;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Spliten', text: q.title, url });
      } else {
        await navigator.clipboard?.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch {
    } finally {
      shareBusyRef.current = false;
    }
  };

  const handleSave = (q: Q) => {
    requireAuth(() => alert(`Saved: "${q.title}"`));
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Navbar
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLoginClick={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
        onSignupClick={() => {
          setAuthMode('signup');
          setShowAuthModal(true);
        }}
        onAskClick={() => {
          if (!isLoggedIn) {
            setAuthMode('login');
            setShowAuthModal(true);
          } else {
            router.push('/ask');
          }
        }}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'flex', gap: 20 }}>
        {!isMobile && (
          <aside style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
  <div style={{ backgroundColor: 'var(--card)', borderRadius: 12, padding: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => setSelectedSort('hot')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--pill)', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                    <HomeIcon size={16} />
                    Home
                  </button>
                  <button onClick={() => router.push('/popular')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                    <TrendingUp size={16} />
                    Popular
                  </button>
                  <button onClick={() => setSelectedSort('news')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }}>
                    <Newspaper size={16} />
                    News
                  </button>
                </div>
              </div>
            <CategoriesPanel selected={selectedCategory as any} onSelect={(val) => setSelectedCategory(val)} title="Categories" />
          </aside>
        )}

        <main style={{ flex: 1, maxWidth: '100%' }}>
          <div style={{ backgroundColor: 'var(--card)', borderRadius: 12, padding: '6px 8px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: 8, width: 'fit-content' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select value={selectedSort} onChange={(e) => { setSelectedSort(e.target.value as any); e.currentTarget.blur(); }} style={{ appearance: 'none', padding: '6px 22px 6px 10px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 18, fontWeight: 700, fontSize: 12, cursor: 'pointer', minWidth: 110, outline: 'none' }}>
                <option value="hot">Hot</option>
                <option value="news">News</option>
                <option value="new">New</option>
                <option value="top">Top</option>
                <option value="controversial">Controversial</option>
              </select>
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted)', fontSize: 22 }}>▾</span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading questions...</div>
          ) : visibleQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No questions found. Create the first one!</div>
          ) : (
            visibleQuestions.map((q) => {
              const href = `/questions/${slugify(q.title)}`;
              return (
                <QuestionCard
                  key={q.id}
                  id={q.id as any}
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
                  onYes={() => handleOpinionVote(q.id, 'pour')}
                  onNo={() => handleOpinionVote(q.id, 'contre')}
                  onShare={() => handleShare(q)}
                  onSave={() => handleSave(q)}
                  onCommentsClick={() => router.push(href)}
                  commentsCount={q.comments}
                  onCardClick={() => router.push(href)}
                />
              );
            })
          )}
        </main>

        {!isMobile && (
          <aside style={{ width: 340 }}>
            <div style={{ backgroundColor: 'var(--card)', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>Trending Now</h3>
                <TrendingUp size={18} color="#667eea" />
              </div>
              {[
                { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
                { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
                { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' },
              ].map((topic, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{topic.topic}</span>
                    <span style={{ fontSize: 12, color: '#00C851', fontWeight: 800 }}>{topic.change}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{topic.count}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              {aiLoading ? <AISiteSkeleton /> : <AIInsightsSiteCard insights={siteInsights} bodyColor="var(--muted)" />}
            </div>
          </aside>
        )}
      </div>

      {isMobile && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)', padding: 8, display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#667eea', fontSize: 11 }}>
            <HomeIcon size={20} />
            Home
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11 }}>
            <TrendingUp size={20} />
            Trending
          </button>
          <button onClick={() => { if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); } else { setIsCreateModalOpen(true); } }} style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(102,126,234,0.3)' }}>
            <Plus size={24} />
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11 }}>
            <Bot size={20} />
            AI
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--muted)', fontSize: 11 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border)' }} />
            Profile
          </button>
        </div>
      )}

      <AuthModal show={showAuthModal} mode={authMode} username={username} onUsernameChange={setUsername} onModeChange={setAuthMode} onSubmit={handleAuth} onClose={() => setShowAuthModal(false)} />
      <CreateModal show={isCreateModalOpen} title={newQuestion.title} category={newQuestion.category} mediaType={newQuestion.mediaType} onTitleChange={(val) => setNewQuestion((prev) => ({ ...prev, title: val }))} onCategoryChange={(val) => setNewQuestion((prev) => ({ ...prev, category: val }))} onMediaTypeChange={(val) => setNewQuestion((prev) => ({ ...prev, mediaType: val }))} onSubmit={handleCreateQuestion} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}