// src/app/page.tsx
'use client';

import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Home as HomeIcon,
  TrendingUp,
  Newspaper,
  Hash,
  Image,
  Video,
  Link2,
  Bot,
  Plus,
  X,
} from 'lucide-react';

import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';

import AIInsightsSiteCard from '@/components/AIInsightsSiteCard';
import AISiteSkeleton from '@/components/AISiteSkeleton';
import { getSiteInsights } from '@/data/siteInsights';

/* =========================
 * UTILS (slug + thème)
 * =======================*/
const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function useThemeBoot() {
  useEffect(() => {
    const el = document.documentElement;
    const prefers = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    const applyTheme = (value: string | null) => {
      const next = value === 'dark' || value === 'light' ? value : prefers();
      el.setAttribute('data-theme', next);
      el.setAttribute('data-theme-ready', 'true');
      el.style.colorScheme = next;
      if (next === 'dark') el.classList.add('dark');
      else el.classList.remove('dark');
    };

    // first paint already done by layout.tsx; ensure consistency + listen to changes
    applyTheme(localStorage.getItem('theme'));

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') applyTheme(e.newValue);
    };
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
    pillBgHover: 'var(--pillHover)',
    yes: { border: '#00C851', grad1: '#00C851', grad2: '#00E676', text: '#FFFFFF' },
    no: { border: '#FF3547', grad1: '#FF3547', grad2: '#FF6B7A', text: '#FFFFFF' },
    badge: {
      trending: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#FFFFFF' },
      controversial: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#FFFFFF' },
      new: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#FFFFFF' },
      top: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#FFFFFF' },
    },
    cardShadow: '0 1px 3px rgba(0,0,0,0.08)',
  };
}

/* =========================
 * TYPES + MOCKS
 * =======================*/
type Q = {
  id: number;
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

const BASE_QUESTIONS: Q[] = [
  { id: 1, title: 'Should we ban cars in city centers?', category: 'politics', author: 'urbanplanner', timeAgo: '2 hours ago', views: 3420, pour: 805, contre: 429, upvotes: 342, downvotes: 12, comments: 47, userVote: null, userOpinion: null, badges: ['trending','controversial'], news: true },
  { id: 2, title: 'Should remote work be a legal right?', category: 'work', author: 'techworker', timeAgo: '4 hours ago', views: 2104, pour: 696, contre: 196, upvotes: 189, downvotes: 8, comments: 23, userVote: null, userOpinion: null, badges: ['top'], news: false },
  { id: 3, title: 'Is artificial intelligence a threat to humanity?', category: 'technology', author: 'futuretech', timeAgo: '5 hours ago', views: 5871, pour: 432, contre: 567, upvotes: 256, downvotes: 34, comments: 89, userVote: null, userOpinion: null, badges: ['controversial'], news: true },
  { id: 4, title: 'Should social media be banned for under-16s?', category: 'lifestyle', author: 'parentadvocate', timeAgo: '1 hour ago', views: 1890, pour: 234, contre: 156, upvotes: 89, downvotes: 5, comments: 34, userVote: null, userOpinion: null, badges: ['new', 'trending'], news: true },
  { id: 5, title: 'Is nuclear energy the solution to climate change?', category: 'environment', author: 'climatescientist', timeAgo: '3 hours ago', views: 4567, pour: 567, contre: 432, upvotes: 123, downvotes: 23, comments: 67, userVote: null, userOpinion: null, badges: ['controversial'], news: false },
  { id: 6, title: 'Should companies track employee productivity?', category: 'work', author: 'hrexpert', timeAgo: '6 hours ago', views: 2234, pour: 345, contre: 456, upvotes: 67, downvotes: 12, comments: 29, userVote: null, userOpinion: null, badges: ['top'], news: false },
  { id: 7, title: 'Is cryptocurrency the future of money?', category: 'technology', author: 'cryptoenthusiast', timeAgo: '8 hours ago', views: 3456, pour: 789, contre: 234, upvotes: 156, downvotes: 34, comments: 78, userVote: null, userOpinion: null, badges: ['trending'], news: false },
  { id: 8, title: 'Should university education be free?', category: 'general', author: 'student2024', timeAgo: '12 hours ago', views: 5678, pour: 892, contre: 345, upvotes: 234, downvotes: 45, comments: 123, userVote: null, userOpinion: null, badges: ['top', 'trending'], news: false },
];

function buildQuestions(): Q[] {
  return BASE_QUESTIONS.map(q => ({ ...q }));
}

/* =========================
 * PAGE HOME
 * =======================*/
export default function Home() {
  const router = useRouter();
  useThemeBoot();
  const palette = usePalette();

  // UI/Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Création post
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    category: 'general',
    mediaType: 'text' as 'text' | 'image' | 'video' | 'link',
  });

  // Filtres
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'hot' | 'news' | 'new' | 'top' | 'controversial'>('hot');

  // DATA + Infinite scroll — seed démo
  const [allQuestions, setAllQuestions] = useState<Q[]>(() => buildQuestions());
  const [visibleCount, setVisibleCount] = useState(10);
  const loadingMoreRef = useRef(false);
  const shareBusyRef = useRef(false);

  const [commentsCountMap, setCommentsCountMap] = useState<Record<number, number>>({});

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Infinite scroll
  useEffect(() => {
    const onScroll = () => {
      if (loadingMoreRef.current) return;
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 800;
      if (nearBottom) {
        loadingMoreRef.current = true;
        setTimeout(() => {
          setVisibleCount((n) => Math.min(n + 10, filteredAndSorted.length));
          loadingMoreRef.current = false;
        }, 150);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrer + trier
  const filteredAndSorted = useMemo(() => {
    const filtered = allQuestions.filter((q) => {
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const scoreHot = (x: Q) => {
      const badgeBonus = x.badges.includes('trending') ? 100 : x.badges.includes('top') ? 50 : 0;
      const engagement = (x.upvotes - x.downvotes) + x.comments * 0.6;
      const newsBonus = x.news ? 10 : 0;
      return badgeBonus + engagement + newsBonus;
    };

    let result = [...filtered];

    if (selectedSort === 'hot') {
      result = result.sort((a, b) => scoreHot(b) - scoreHot(a));
    } else if (selectedSort === 'news') {
      result = result.filter((q) => q.news === true).sort((a, b) => b.id - a.id);
    } else if (selectedSort === 'new') {
      result = result.filter((q) => q.badges.includes('new')).sort((a, b) => b.id - a.id);
    } else if (selectedSort === 'top') {
      result = result
        .filter((q) => q.badges.includes('top'))
        .sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (selectedSort === 'controversial') {
      result = result
        .filter((q) => q.badges.includes('controversial'))
        .sort((a, b) => {
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

  // Récupère les totaux de commentaires (mock API)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const ids = visibleQuestions.map((q) => q.id);
      if (!ids.length) return;

      try {
        const res = await fetch(`/api/comments/count?ids=${ids.join(',')}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setCommentsCountMap(data.counts || {});
      } catch {
        // ignore en dev
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visibleQuestions.map((q) => q.id).join(',')]);

  // Auth guard
  const requireAuth = (cb: () => void) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    cb();
  };

  // Handlers
  const handleUpvote = (id: number, type: 'up' | 'down') => {
    requireAuth(() => {
      setAllQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          if (type === 'up') {
            if (q.userVote === 'up') return { ...q, upvotes: q.upvotes - 1, userVote: null };
            if (q.userVote === 'down') return { ...q, upvotes: q.upvotes + 1, downvotes: q.downvotes - 1, userVote: 'up' };
            return { ...q, upvotes: q.upvotes + 1, userVote: 'up' };
          }
          if (q.userVote === 'down') return { ...q, downvotes: q.downvotes - 1, userVote: null };
          if (q.userVote === 'up') return { ...q, downvotes: q.downvotes + 1, upvotes: q.upvotes - 1, userVote: 'down' };
          return { ...q, downvotes: q.downvotes + 1, userVote: 'down' };
        })
      );
    });
  };

  const handleOpinionVote = (id: number, opinion: 'pour' | 'contre') => {
    requireAuth(() => {
      setAllQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== id) return q;
          if (q.userOpinion === opinion) return { ...q, [opinion]: (q as any)[opinion] - 1, userOpinion: null } as Q;
          if (q.userOpinion) {
            const old = q.userOpinion;
            return { ...q, [old]: (q as any)[old] - 1, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
          }
          return { ...q, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
        })
      );
    });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) return;
    requireAuth(() => {
      const q: Q = {
        id: Date.now(),
        title: newQuestion.title,
        category: newQuestion.category,
        author: username || 'you',
        timeAgo: 'just now',
        views: 0,
        pour: 0,
        contre: 0,
        upvotes: 1,
        downvotes: 0,
        comments: 0,
        userVote: 'up',
        userOpinion: null,
        badges: ['new'],
        news: false,
      };
      setAllQuestions((prev) => [q, ...prev]);
      setNewQuestion({ title: '', category: 'general', mediaType: 'text' });
      setIsCreateModalOpen(false);
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
      // ignore
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

  // AI Insights (site-wide)
  const [aiLoading, setAiLoading] = useState(true);
  const siteInsights = useMemo(() => getSiteInsights(), []);
  useEffect(() => {
    const t = setTimeout(() => setAiLoading(false), 650);
    return () => clearTimeout(t);
  }, []);

  // Trending (dummy)
  const trendingTopics = [
    { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
    { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
    { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: palette.appBg }}>
      {/* HEADER */}
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

      {/* LAYOUT */}
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? 12 : 20,
          display: 'flex',
          gap: 20,
        }}
      >
        {/* Colonne gauche */}
        {!isMobile && (
          <aside
            style={{
              width: 220,
              position: 'sticky',
              top: 76,
              alignSelf: 'flex-start',
              height: 'calc(100vh - 76px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: 12,
                padding: 8,
                marginBottom: 16,
                boxShadow: palette.cardShadow,
                border: `1px solid ${palette.border}`,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => setSelectedSort('hot')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: selectedSort === 'hot' ? 'var(--pill)' : 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontWeight: 700,
                    color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  <HomeIcon size={16} />
                  Home
                </button>

                <button
                  onClick={() => router.push('/popular')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontWeight: 700,
                    color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                  title="Open Popular page"
                >
                  <TrendingUp size={16} />
                  Popular
                </button>

                <button
                  onClick={() => setSelectedSort('news')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    background: selectedSort === 'news' ? 'var(--pill)' : 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontWeight: 700,
                    color: 'var(--text)',
                    cursor: 'pointer',
                  }}
                >
                  <Newspaper size={16} />
                  News
                </button>
              </div>
            </div>

            <CategoriesPanel
              selected={selectedCategory as any}
              onSelect={(val) => setSelectedCategory(val)}
              title="Categories"
            />
          </aside>
        )}

        {/* Colonne centrale */}
        <main style={{ flex: 1, maxWidth: '100%' }}>
          {/* Dropdown de tri */}
          <div
            style={{
              backgroundColor: palette.cardBg,
              borderRadius: 12,
              padding: '6px 8px',
              marginBottom: 16,
              boxShadow: palette.cardShadow,
              border: `1px solid ${palette.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              alignSelf: 'flex-start',
              width: 'fit-content',
            }}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <select
                value={selectedSort}
                onChange={(e) => {
                  setSelectedSort(e.target.value as any);
                  e.currentTarget.blur();
                }}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  padding: '6px 22px 6px 10px',
                  background: 'var(--bg)',
                  color: palette.text,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 18,
                  fontWeight: 700,
                  fontSize: 12,
                  lineHeight: 1,
                  cursor: 'pointer',
                  minWidth: 110,
                  outline: 'none',
                }}
              >
                <option value="hot">Hot</option>
                <option value="news">News</option>
                <option value="new">New</option>
                <option value="top">Top</option>
                <option value="controversial">Controversial</option>
              </select>

              {/* caret ▾ */}
              <span
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--muted)',
                  fontSize: 22,
                }}
              >
                ▾
              </span>
            </div>
          </div>

          {/* Cartes */}
          {visibleQuestions.map((q) => {
            const href = `/questions/${slugify(q.title)}`;
            return (
              <QuestionCard
                key={q.id}
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
                onYes={() => handleOpinionVote(q.id, 'pour')}
                onNo={() => handleOpinionVote(q.id, 'contre')}
                onShare={() => handleShare(q)}
                onSave={() => handleSave(q)}
                onCommentsClick={() => router.push(href)}
                commentsCount={commentsCountMap[q.id] ?? q.comments}
                onCardClick={() => router.push(href)}
              />
            );
          })}
        </main>

        {/* Colonne droite */}
        {!isMobile && (
          <aside style={{ width: 340 }}>
            <div
              style={{
                backgroundColor: palette.cardBg,
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                boxShadow: palette.cardShadow,
                border: `1px solid ${palette.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <h3 style={{ fontSize: 16, fontWeight: 800, color: palette.text }}>Trending Now</h3>
                <TrendingUp size={18} color="#667eea" />
              </div>
              {[
                { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
                { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
                { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' },
              ].map((topic, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 0',
                    borderBottom: i < 2 ? `1px solid ${palette.border}` : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: palette.text }}>
                      {topic.topic}
                    </span>
                    <span style={{ fontSize: 12, color: '#00C851', fontWeight: 800 }}>
                      {topic.change}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: palette.mutetext }}>{topic.count}</span>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div style={{ marginTop: 16 }}>
              {aiLoading ? (
                <AISiteSkeleton />
              ) : (
                <AIInsightsSiteCard insights={siteInsights} bodyColor="var(--muted)" />
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: palette.cardBg,
            borderTop: `1px solid ${palette.border}`,
            padding: 8,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: 11,
            }}
          >
            <HomeIcon size={20} />
            Home
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 11,
            }}
          >
            <TrendingUp size={20} />
            Trending
          </button>

          <button
            onClick={() => {
              if (!isLoggedIn) {
                setAuthMode('login');
                setShowAuthModal(true);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
            }}
          >
            <Plus size={24} />
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 11,
            }}
          >
            <Bot size={20} />
            AI
          </button>

          <button
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              fontSize: 11,
            }}
          >
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--border)' }} />
            Profile
          </button>
        </div>
      )}

      {/* Modale Auth (clic dehors = fermeture) */}
      {showAuthModal && (
        <div
          onClick={() => setShowAuthModal(false)}
          style={{
            position: 'fixed',
            inset: 0 as any,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
          role="dialog"
          aria-modal="true"
          aria-label={authMode === 'login' ? 'Login' : 'Sign up'}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: palette.cardBg,
              borderRadius: 16,
              width: '100%',
              maxWidth: 420,
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              position: 'relative',
              border: `1px solid ${palette.border}`,
            }}
          >
            <div style={{ padding: 24, borderBottom: `1px solid ${palette.border}` }}>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: palette.text,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
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
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: 12,
                  border: `2px solid ${palette.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  outline: 'none',
                  background: palette.softBg,
                  color: palette.text,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = palette.border)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: 12,
                  border: `2px solid ${palette.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  outline: 'none',
                  background: palette.softBg,
                  color: palette.text,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = palette.border)}
              />
              {authMode === 'signup' && (
                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginBottom: 12,
                    border: `2px solid ${palette.border}`,
                    borderRadius: 12,
                    fontSize: 14,
                    outline: 'none',
                    background: palette.softBg,
                    color: palette.text,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = palette.border)}
                />
              )}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: 12,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: 12,
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: 'pointer',
                  marginBottom: 16,
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                }}
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>
              <p style={{ fontSize: 13, color: palette.mutetext, textAlign: 'center' }}>
                {authMode === 'login' ? 'New to Spliten? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  style={{
                    color: '#667eea',
                    fontWeight: 800,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: palette.mutetext,
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Modale Create (clic dehors = fermeture) */}
      {isCreateModalOpen && (
        <div
          onClick={() => setIsCreateModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0 as any,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: palette.cardBg,
              borderRadius: 16,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              border: `1px solid ${palette.border}`,
            }}
          >
            <div
              style={{
                padding: 20,
                borderBottom: `1px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, color: palette.text }}>Create a Post</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: palette.mutetext }}
                aria-label="Close Create"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 16,
                  borderBottom: `1px solid ${palette.border}`,
                  paddingBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                {[
                  { type: 'text', icon: Hash, label: 'Text' },
                  { type: 'image', icon: Image, label: 'Image' },
                  { type: 'video', icon: Video, label: 'Video' },
                  { type: 'link', icon: Link2, label: 'Link' },
                ].map((media) => {
                  const Icon = media.icon as any;
                  const active = newQuestion.mediaType === media.type;
                  return (
                    <button
                      key={media.type}
                      type="button"
                      onClick={() => setNewQuestion((prev) => ({ ...prev, mediaType: media.type as any }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        backgroundColor: active ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                        border: 'none',
                        borderRadius: 8,
                        color: active ? '#667eea' : palette.mutetext,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={16} />
                      {media.label}
                    </button>
                  );
                })}
              </div>

              <select
                value={newQuestion.category}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: 16,
                  border: `2px solid ${palette.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  backgroundColor: palette.softBg,
                  color: palette.text,
                  outline: 'none',
                }}
              >
                {['news', 'general', 'politics', 'work', 'technology', 'lifestyle', 'environment'].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              <textarea
                value={newQuestion.title}
                onChange={(e) => setNewQuestion((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ask a yes/no question…"
                style={{
                  width: '100%',
                  padding: 12,
                  marginBottom: 16,
                  border: `2px solid ${palette.border}`,
                  borderRadius: 12,
                  fontSize: 14,
                  minHeight: 100,
                  resize: 'vertical',
                  outline: 'none',
                  background: palette.softBg,
                  color: palette.text,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#667eea')}
                onBlur={(e) => (e.currentTarget.style.borderColor = palette.border)}
              />

              <div
                style={{
                  backgroundColor: 'rgba(102, 126, 234, 0.15)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Bot size={16} color="#667eea" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#667eea' }}>
                    AI Assistant
                  </span>
                </div>
                <p style={{ fontSize: 12, color: palette.subtext, marginBottom: 8 }}>
                  ✨ Auto-corrected 2 typos • Suggested category: Politics
                </p>
                <p style={{ fontSize: 12, color: palette.subtext }}>
                  💡 Similar question: “Should cars be restricted in urban areas?” (87% match)
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `2px solid ${palette.border}`,
                    background: 'transparent',
                    color: palette.text,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                  }}
                >
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
