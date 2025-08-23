// src/app/questions/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Search, ChevronDown, Plus, X, Bot, TrendingUp, Clock, BarChart3, Users,
  Home as HomeIcon, Hash, Briefcase, Cpu, Heart, Leaf, Lightbulb, Eye,
  MessageSquare, ThumbsUp, ThumbsDown, CheckCircle, Share2, Bookmark
} from 'lucide-react';

// 👉 ajoute ces 3 lignes (NE PAS les mettre dans le terminal)
import Navbar from '@/components/Navbar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';


/** Types **/
type VoteSide = 'pour' | 'contre';
type CommentVote = 'up' | 'down' | null;

interface Arg {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: CommentVote;
  side: VoteSide;
  sourceUrl?: string;
}

interface Discussion {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
  sourceUrl?: string;
}

interface Question {
  id: number;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  pour: number;
  contre: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  badges: string[];
  wilsonScore: number;
  hasAI: boolean;
  description?: string;
}

/** Page **/
export default function QuestionDetail() {
  const { id } = useParams() as { id: string };

  /** Responsiveness / header state (copie Home) **/
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /** Mock question (aligné Home) **/
  const [question, setQuestion] = useState<Question>({
    id: Number(id ?? 1),
    title: 'Should we ban cars in city centers?',
    description:
      'With increasing pollution and traffic congestion, many cities consider restricting private vehicles in downtown areas to favor transit, bikes, and pedestrians.',
    category: 'politics',
    author: 'anonymous',
    timeAgo: '2 hours ago',
    pour: 805,
    contre: 429,
    upvotes: 342,
    downvotes: 12,
    comments: 47,
    badges: ['trending', 'controversial'],
    wilsonScore: 0.89,
    hasAI: true
  });

  /** Arguments (FOR/AGAINST) + Discussions **/
  const [args, setArgs] = useState<Arg[]>([
    {
      id: 1,
      text:
        'Cities like Amsterdam & Copenhagen prove it: cleaner air, safer streets, better quality of life.',
      author: 'urbanplanner',
      timeAgo: '1h ago',
      votes: 234,
      userVote: null,
      side: 'pour',
      sourceUrl: 'https://en.wikipedia.org/wiki/Car-free_zone'
    },
    {
      id: 2,
      text:
        'My asthma improved since our district reduced car traffic. Kids can safely play outside.',
      author: 'healthadvocate',
      timeAgo: '45m ago',
      votes: 189,
      userVote: null,
      side: 'pour'
    },
    {
      id: 3,
      text:
        'Economic studies show pedestrian-only zones often increase local business revenue.',
      author: 'economist101',
      timeAgo: '2h ago',
      votes: 156,
      userVote: null,
      side: 'pour'
    },
    {
      id: 5,
      text:
        "Accessibility concerns are real: elderly, disabled, parents with toddlers still need door-to-door options.",
      author: 'accessibility',
      timeAgo: '30m ago',
      votes: 312,
      userVote: null,
      side: 'contre',
      sourceUrl: 'https://www.access-board.gov/'
    },
    {
      id: 6,
      text:
        'Small delivery businesses may suffer without exemptions, staging areas, or micro-hubs.',
      author: 'smallbusiness',
      timeAgo: '1h ago',
      votes: 245,
      userVote: null,
      side: 'contre'
    },
    {
      id: 7,
      text:
        'Public transit capacity must improve first; otherwise it just shifts pain points.',
      author: 'commuter2024',
      timeAgo: '2h ago',
      votes: 198,
      userVote: null,
      side: 'contre'
    }
  ]);

  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      text:
        'We need a 3–5 year transition with more buses, bike lanes, and freight micro-hubs before restrictions.',
      author: 'pragmatist',
      timeAgo: '1h ago',
      likes: 89,
      replies: 12
    },
    {
      id: 2,
      text:
        'Start with car-free weekends + resident permits. Measure pollution & retail impacts quarterly.',
      author: 'mediator',
      timeAgo: '2h ago',
      likes: 156,
      replies: 23
    }
  ]);

  /** UI local **/
  const [activeTab, setActiveTab] = useState<'arguments' | 'discussion'>('arguments');
  const [userOpinion, setUserOpinion] = useState<VoteSide | null>(null);
  const [newArgFor, setNewArgFor] = useState('');
  const [newArgForSrc, setNewArgForSrc] = useState('');
  const [newArgAgainst, setNewArgAgainst] = useState('');
  const [newArgAgainstSrc, setNewArgAgainstSrc] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [newDiscussionSrc, setNewDiscussionSrc] = useState('');

  /** Derived (même ratio bar que Home) **/
  const { pourPercent, contrePercent, totalVotes } = useMemo(() => {
    const total = question.pour + question.contre;
    const p = total ? Math.round((question.pour / total) * 100) : 0;
    return { pourPercent: p, contrePercent: 100 - p, totalVotes: total };
  }, [question.pour, question.contre]);

  const forArgs = useMemo(
    () => [...args.filter(a => a.side === 'pour')].sort((a, b) => b.votes - a.votes),
    [args]
  );
  const againstArgs = useMemo(
    () => [...args.filter(a => a.side === 'contre')].sort((a, b) => b.votes - a.votes),
    [args]
  );

  /** Handlers **/
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    }
  };

  const handleOpinionVote = (side: VoteSide) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setQuestion(prev => {
      if (userOpinion === side) {
        setUserOpinion(null);
        return { ...prev, [side]: (prev as any)[side] - 1 };
      }
      if (userOpinion) {
        const other = userOpinion === 'pour' ? 'contre' : 'pour';
        setUserOpinion(side);
        return { ...prev, [side]: (prev as any)[side] + 1, [other]: (prev as any)[other] - 1 };
      }
      setUserOpinion(side);
      return { ...prev, [side]: (prev as any)[side] + 1 };
    });
  };

  const handleArgVote = (id: number, type: Exclude<CommentVote, null>) => {
    setArgs(prev =>
      prev.map(a => {
        if (a.id !== id) return a;
        let votes = a.votes;
        let userVote = a.userVote;

        if (a.userVote === type) {
          votes += type === 'up' ? -1 : +1;
          userVote = null;
        } else if (a.userVote) {
          votes += type === 'up' ? +2 : -2;
          userVote = type;
        } else {
          votes += type === 'up' ? +1 : -1;
          userVote = type;
        }
        return { ...a, votes, userVote };
      })
    );
  };

  const addArg = (side: VoteSide) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    const text = side === 'pour' ? newArgFor : newArgAgainst;
    const src = side === 'pour' ? newArgForSrc : newArgAgainstSrc;
    if (!text.trim()) return;
    const item: Arg = {
      id: Date.now(),
      text,
      author: username || 'you',
      timeAgo: 'now',
      votes: 1,
      userVote: 'up',
      side,
      sourceUrl: src?.trim() ? src.trim() : undefined
    };
    setArgs(prev => [item, ...prev]);
    if (side === 'pour') {
      setNewArgFor(''); setNewArgForSrc('');
    } else {
      setNewArgAgainst(''); setNewArgAgainstSrc('');
    }
  };

  const addDiscussion = () => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    if (!newDiscussion.trim()) return;
    const d: Discussion = {
      id: Date.now(),
      text: newDiscussion,
      author: username || 'you',
      timeAgo: 'now',
      likes: 0,
      replies: 0,
      sourceUrl: newDiscussionSrc?.trim() ? newDiscussionSrc.trim() : undefined
    };
    setDiscussions(prev => [d, ...prev]);
    setNewDiscussion(''); setNewDiscussionSrc('');
  };

  /** UI helpers **/
  const categories = [
    { value: 'all', label: 'All', icon: HomeIcon, color: '#FF4500' },
    { value: 'general', label: 'General', icon: Hash, color: '#FFB000' },
    { value: 'politics', label: 'Politics', icon: Users, color: '#7193FF' },
    { value: 'work', label: 'Work', icon: Briefcase, color: '#FF66AC' },
    { value: 'technology', label: 'Tech', icon: Cpu, color: '#00D26A' },
    { value: 'lifestyle', label: 'Life', icon: Heart, color: '#FF8717' },
    { value: 'environment', label: 'Eco', icon: Leaf, color: '#46D160' }
  ];

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'trending': return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
      case 'controversial': return { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' };
      case 'new': return { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' };
      case 'top': return { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' };
      default: return { bg: '#ccc' };
    }
  };

  /** RENDER **/
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F9FA' }}>
      {/* HEADER — identique Home */}
      <header style={{
        backgroundColor: 'white', borderBottom: '1px solid #E1E8ED',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 20px',
          height: '56px', display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '20px'
            }}>P</div>
            {!isMobile && <span style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>pollar</span>}
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: '600px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: '#8899A6', width: '18px'
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMobile ? 'Search...' : 'Search questions, topics, or categories'}
                style={{
                  width: '100%', padding: '10px 14px 10px 42px', backgroundColor: '#F7F9FA',
                  border: '1px solid transparent', borderRadius: '24px', fontSize: '14px', outline: 'none', transition: 'all 0.2s'
                }}
                onFocus={(e) => { e.target.style.backgroundColor = 'white'; e.target.style.border = '1px solid #667eea'; }}
                onBlur={(e) => { e.target.style.backgroundColor = '#F7F9FA'; e.target.style.border = '1px solid transparent'; }}
              />
            </div>
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isLoggedIn ? (
              <>
                {!isMobile && (
                  <button
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    style={{
                      padding: '8px 20px', backgroundColor: 'transparent',
                      border: '2px solid #667eea', borderRadius: '24px', color: '#667eea',
                      fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#667eea'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#667eea'; }}
                  >Log In</button>
                )}
                <button
                  onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                  style={{
                    padding: '8px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none', borderRadius: '24px', color: 'white',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(102,126,234,0.3)'
                  }}
                >Sign Up</button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: '#F7F9FA', borderRadius: '24px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '14px', fontWeight: 'bold'
                  }}>{username?.[0]?.toUpperCase() || 'U'}</div>
                  {!isMobile && <span style={{ fontSize: '14px', fontWeight: '500' }}>{username}</span>}
                  <ChevronDown size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* LAYOUT identique Home: sidebar gauche — contenu — sidebar droite */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px' : '20px', display: 'flex', gap: '20px' }}>
        {/* Sidebar gauche (catégories + auto-translate) */}
        {!isMobile && (
          <aside style={{ width: '240px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#8899A6', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Categories</h3>
              {categories.map(cat => {
                const Icon = cat.icon as any;
                const isSelected = question.category === cat.value;
                return (
                  <div
                    key={cat.value}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                      backgroundColor: isSelected ? '#F7F9FA' : 'transparent', borderRadius: '8px',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '6px', backgroundColor: cat.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isSelected ? 1 : 0.8
                    }}>
                      <Icon size={14} color="white" />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isSelected ? '600' : '500', color: isSelected ? '#1a1a1a' : '#536471' }}>
                      {cat.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Users size={16} color="#667eea" />
                <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Auto-Translate</h3>
              </div>
              <p style={{ fontSize: '12px', color: '#8899A6', marginBottom: '12px' }}>AI translates content in real-time</p>
              <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #E1E8ED', fontSize: '13px', backgroundColor: 'white' }}>
                <option>English</option>
                <option>Français</option>
                <option>Español</option>
                <option>Deutsch</option>
                <option>中文</option>
              </select>
            </div>
          </aside>
        )}

        {/* Contenu principal */}
        <main style={{ flex: 1, maxWidth: isMobile ? '100%' : '640px' }}>
          {/* Carte Question (design Home) */}
          <div
            style={{
              backgroundColor: 'white', borderRadius: '12px', marginBottom: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.2s'
            }}
          >
            <div style={{ padding: '16px' }}>
              {/* Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: (categories.find(c => c.value === question.category)?.color) }}>{question.category}</span>
                <span style={{ fontSize: '12px', color: '#8899A6' }}>•</span>
                <span style={{ fontSize: '12px', color: '#8899A6' }}>by {question.author}</span>
                <span style={{ fontSize: '12px', color: '#8899A6' }}>•</span>
                <span style={{ fontSize: '12px', color: '#8899A6' }}>{question.timeAgo}</span>

                {question.badges.map((badge) => {
                  const style = getBadgeStyle(badge);
                  return (
                    <span key={badge} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
                      background: style.bg, borderRadius: '12px', fontSize: '11px', color: 'white', fontWeight: 600
                    }}>
                      {badge}
                    </span>
                  );
                })}

                {question.hasAI && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px', fontSize: '11px', color: '#667eea', fontWeight: 600
                  }}>
                    <Bot size={12} />
                    AI insights
                  </span>
                )}
              </div>

              {/* Titre */}
              <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: '#1a1a1a', marginBottom: '10px', lineHeight: '1.35' }}>
                {question.title}
              </h1>
              {question.description && (
                <p style={{ fontSize: '14px', color: '#536471', lineHeight: '1.55', marginBottom: '14px' }}>
                  {question.description}
                </p>
              )}

              {/* YES / BAR / NO — identique Home */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  {/* YES */}
                  <button
                    onClick={() => handleOpinionVote('pour')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: userOpinion === 'pour' ? '#00C851' : 'white',
                      border: '2px solid #00C851',
                      borderRadius: '20px',
                      color: userOpinion === 'pour' ? 'white' : '#00C851',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    YES ({question.pour})
                  </button>

                  {/* Progress bar */}
                  <div style={{
                    flex: 1, height: '24px', backgroundColor: '#F0F3F4',
                    borderRadius: '12px', position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Left (YES) */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      width: `${pourPercent}%`,
                      background: 'linear-gradient(90deg, #00C851 0%, #00E676 100%)',
                      transition: 'width 0.5s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px'
                    }}>
                      {pourPercent > 15 && (
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}>
                          {pourPercent}%
                        </span>
                      )}
                    </div>
                    {/* Right (NO) */}
                    <div style={{
                      position: 'absolute', right: 0, top: 0, height: '100%',
                      width: `${contrePercent}%`,
                      background: 'linear-gradient(90deg, #FF3547 0%, #FF6B7A 100%)',
                      transition: 'width 0.5s ease',
                      display: 'flex', alignItems: 'center', paddingLeft: '8px', justifyContent: 'flex-start'
                    }}>
                      {contrePercent > 15 && (
                        <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}>
                          {contrePercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* NO */}
                  <button
                    onClick={() => handleOpinionVote('contre')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: userOpinion === 'contre' ? '#FF3547' : 'white',
                      border: '2px solid #FF3547',
                      borderRadius: '20px',
                      color: userOpinion === 'contre' ? 'white' : '#FF3547',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    NO ({question.contre})
                  </button>
                </div>

                <div style={{ fontSize: '11px', color: '#8899A6', textAlign: 'center' }}>
                  {totalVotes} votes • Wilson score: {(question.wilsonScore * 100).toFixed(0)}%
                </div>
              </div>

              {/* Actions (Share / Save) */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button title="Share" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', backgroundColor: '#F7F9FA',
                  border: 'none', borderRadius: '50%', color: '#536471', cursor: 'pointer'
                }}>
                  <Share2 size={16} />
                </button>
                <button title="Save" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '36px', height: '36px', backgroundColor: '#F7F9FA',
                  border: 'none', borderRadius: '50%', color: '#536471', cursor: 'pointer'
                }}>
                  <Bookmark size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Onglets */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '8px', marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: '8px'
          }}>
            {[
              { key: 'arguments', label: 'Arguments' },
              { key: 'discussion', label: 'Open Discussion' }
            ].map(t => {
              const active = activeTab === (t.key as any);
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: '10px',
                    border: 'none',
                    backgroundColor: active ? 'rgba(102,126,234,0.12)' : 'transparent',
                    color: active ? '#667eea' : '#536471',
                    fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* TAB: Arguments (2 colonnes FOR / AGAINST + Sources) */}
          {activeTab === 'arguments' && (
            <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
              {/* FOR */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Arguments FOR</h3>
                    <p style={{ fontSize: '12px', color: '#16a34a' }}>{forArgs.length} arguments</p>
                  </div>
                  <Plus size={18} color="#16a34a" title="Add FOR" />
                </div>

                {/* Form FOR */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F4', backgroundColor: 'rgba(22, 163, 74, 0.05)' }}>
                  <textarea
                    value={newArgFor}
                    onChange={(e) => setNewArgFor(e.target.value)}
                    placeholder="Add your argument FOR..."
                    rows={3}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '2px solid #E1E8ED', fontSize: '14px', outline: 'none', marginBottom: '8px'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                  />
                  <input
                    value={newArgForSrc}
                    onChange={(e) => setNewArgForSrc(e.target.value)}
                    placeholder="Source (URL) – optional"
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '2px solid #E1E8ED', fontSize: '13px', outline: 'none'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#16a34a')}
                    onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => { setNewArgFor(''); setNewArgForSrc(''); }}
                      style={{ padding: '8px 12px', backgroundColor: 'white', border: '2px solid #E1E8ED', borderRadius: '10px', fontSize: '13px', color: '#536471' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addArg('pour')}
                      style={{ padding: '8px 12px', backgroundColor: '#16a34a', border: 'none', borderRadius: '10px', fontSize: '13px', color: 'white', fontWeight: 600 }}
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* List FOR */}
                <div style={{ padding: '12px 16px' }}>
                  {forArgs.map(a => (
                    <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #F0F3F4' }}>
                      <div style={{ fontSize: '12px', color: '#8899A6', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{a.author}</span> • {a.timeAgo}
                      </div>
                      <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: '1.5', marginBottom: '8px' }}>{a.text}</p>
                      {a.sourceUrl && (
                        <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#667eea', textDecoration: 'none' }}>
                          Source ↗
                        </a>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleArgVote(a.id, 'up')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 10px', borderRadius: '999px', border: 'none',
                            backgroundColor: a.userVote === 'up' ? '#16a34a' : '#F7F9FA',
                            color: a.userVote === 'up' ? 'white' : '#536471', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          <ThumbsUp size={14} />
                          {a.votes > 0 ? `+${a.votes}` : a.votes}
                        </button>
                        <button
                          onClick={() => handleArgVote(a.id, 'down')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                            backgroundColor: a.userVote === 'down' ? '#FF3547' : '#F7F9FA',
                            color: a.userVote === 'down' ? 'white' : '#8899A6', cursor: 'pointer'
                          }}
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AGAINST */}
              <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>Arguments AGAINST</h3>
                    <p style={{ fontSize: '12px', color: '#dc2626' }}>{againstArgs.length} arguments</p>
                  </div>
                  <Plus size={18} color="#dc2626" title="Add AGAINST" />
                </div>

                {/* Form AGAINST */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F3F4', backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
                  <textarea
                    value={newArgAgainst}
                    onChange={(e) => setNewArgAgainst(e.target.value)}
                    placeholder="Add your argument AGAINST..."
                    rows={3}
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '2px solid #E1E8ED', fontSize: '14px', outline: 'none', marginBottom: '8px'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#dc2626')}
                    onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                  />
                  <input
                    value={newArgAgainstSrc}
                    onChange={(e) => setNewArgAgainstSrc(e.target.value)}
                    placeholder="Source (URL) – optional"
                    style={{
                      width: '100%', padding: '10px', borderRadius: '10px',
                      border: '2px solid #E1E8ED', fontSize: '13px', outline: 'none'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#dc2626')}
                    onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => { setNewArgAgainst(''); setNewArgAgainstSrc(''); }}
                      style={{ padding: '8px 12px', backgroundColor: 'white', border: '2px solid #E1E8ED', borderRadius: '10px', fontSize: '13px', color: '#536471' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => addArg('contre')}
                      style={{ padding: '8px 12px', backgroundColor: '#dc2626', border: 'none', borderRadius: '10px', fontSize: '13px', color: 'white', fontWeight: 600 }}
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* List AGAINST */}
                <div style={{ padding: '12px 16px' }}>
                  {againstArgs.map(a => (
                    <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #F0F3F4' }}>
                      <div style={{ fontSize: '12px', color: '#8899A6', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#374151' }}>{a.author}</span> • {a.timeAgo}
                      </div>
                      <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: '1.5', marginBottom: '8px' }}>{a.text}</p>
                      {a.sourceUrl && (
                        <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#667eea', textDecoration: 'none' }}>
                          Source ↗
                        </a>
                      )}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => handleArgVote(a.id, 'up')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 10px', borderRadius: '999px', border: 'none',
                            backgroundColor: a.userVote === 'up' ? '#16a34a' : '#F7F9FA',
                            color: a.userVote === 'up' ? 'white' : '#536471', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          <ThumbsUp size={14} />
                          {a.votes > 0 ? `+${a.votes}` : a.votes}
                        </button>
                        <button
                          onClick={() => handleArgVote(a.id, 'down')}
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                            backgroundColor: a.userVote === 'down' ? '#FF3547' : '#F7F9FA',
                            color: a.userVote === 'down' ? 'white' : '#8899A6', cursor: 'pointer'
                          }}
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Discussion (avec Source optionnelle) */}
          {activeTab === 'discussion' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {/* Form */}
              <div style={{ marginBottom: '12px' }}>
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Share your thoughts beyond yes/no..."
                  rows={3}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '12px',
                    border: '2px solid #E1E8ED', fontSize: '14px', outline: 'none', marginBottom: '8px'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                />
                <input
                  value={newDiscussionSrc}
                  onChange={(e) => setNewDiscussionSrc(e.target.value)}
                  placeholder="Source (URL) – optional"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '10px',
                    border: '2px solid #E1E8ED', fontSize: '13px', outline: 'none', marginBottom: '8px'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={addDiscussion}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {discussions.map(d => (
                  <div key={d.id} style={{ borderTop: '1px solid #F0F3F4', paddingTop: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#8899A6', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{d.author}</span> • {d.timeAgo}
                    </div>
                    <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: '1.5', marginBottom: '6px' }}>{d.text}</p>
                    {d.sourceUrl && (
                      <a href={d.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#667eea', textDecoration: 'none' }}>
                        Source ↗
                      </a>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', color: '#536471' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <ThumbsUp size={14} /> {d.likes}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <MessageSquare size={14} /> {d.replies} replies
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Sidebar droite (identique Home) */}
        {!isMobile && (
          <aside style={{ width: '320px' }}>
            {/* CTA */}
            <button
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none', borderRadius: '24px', color: 'white',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
              onClick={() => {
                if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); }
              }}
            >
              <Plus size={18} />
              Create Post
            </button>

            {/* Trending Now */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Trending Now</h3>
                <TrendingUp size={18} color="#667eea" />
              </div>
              {[
                { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
                { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
                { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' }
              ].map((t, i, arr) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F0F3F4' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.topic}</span>
                    <span style={{ fontSize: '12px', color: '#00C851', fontWeight: 600 }}>{t.change}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8899A6' }}>{t.count}</span>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div style={{
              backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Bot size={18} color="#667eea" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>AI Insights</h3>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Lightbulb size={14} color="#FFB000" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Unexplored Angles</span>
                </div>
                <p style={{ fontSize: '12px', color: '#536471', lineHeight: '1.4' }}>
                  "Economic impact on small businesses" and "accessibility concerns" are under-discussed in current debates.
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <CheckCircle size={14} color="#00C851" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Fact Check</span>
                </div>
                <p style={{ fontSize: '12px', color: '#536471', lineHeight: '1.4' }}>
                  3 claims verified, 2 need sources. AI confidence: 87%
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Eye size={14} color="#667eea" />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Summary</span>
                </div>
                <p style={{ fontSize: '12px', color: '#536471', lineHeight: '1.4' }}>
                  Main consensus: Environmental benefits clear, but implementation challenges remain for vulnerable populations.
                </p>
              </div>
            </div>

            {/* People Also Ask */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>People Also Ask</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Should public transport be free?', 'Are electric cars really better?', 'Should bikes have dedicated lanes?'].map((q, i) => (
                  <a
                    key={i}
                    href="#"
                    style={{
                      fontSize: '13px', color: '#667eea', textDecoration: 'none', padding: '8px',
                      backgroundColor: '#F7F9FA', borderRadius: '8px', transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(102,126,234,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F7F9FA'; }}
                  >
                    {q}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Modal Auth (copié Home, simplifié) */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #F0F3F4' }}>
              <h2 style={{
                fontSize: '24px', fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {authMode === 'login' ? 'Welcome Back' : 'Join Pollar'}
              </h2>
            </div>

            <form onSubmit={handleAuth} style={{ padding: '24px' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: '12px',
                  border: '2px solid #E1E8ED', borderRadius: '12px', fontSize: '14px',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                required
              />
              <input
                type="password"
                placeholder="Password"
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: '12px',
                  border: '2px solid #E1E8ED', borderRadius: '12px', fontSize: '14px',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                required
              />
              {authMode === 'signup' && (
                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    width: '100%', padding: '12px 16px', marginBottom: '12px',
                    border: '2px solid #E1E8ED', borderRadius: '12px', fontSize: '14px',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                  onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
                />
              )}

              <button
                type="submit"
                style={{
                  width: '100%', padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                }}
              >
                {authMode === 'login' ? 'Log In' : 'Sign Up'}
              </button>

              <p style={{ fontSize: '13px', color: '#8899A6', textAlign: 'center' }}>
                {authMode === 'login' ? 'New to Pollar? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  style={{ color: '#667eea', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </form>

            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#8899A6' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
