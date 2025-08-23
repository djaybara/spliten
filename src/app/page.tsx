'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark,
  Search, User, TrendingUp, Flame, Clock, Star,
  Home as HomeIcon, Hash, Briefcase, Cpu, Heart, Leaf, Users,
  Plus, X, Image, Video, Link2, Globe, Bot, Lightbulb, BarChart3, Eye, CheckCircle
} from 'lucide-react';

export default function Home() {
  // États
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    category: 'general',
    mediaType: 'text' as 'text' | 'image' | 'video' | 'link'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'hot' | 'new' | 'top' | 'controversial'>('hot');
  const [isMobile, setIsMobile] = useState(false);

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Données mock
  type Q = {
    id: number; title: string; category: string; author: string; timeAgo: string;
    pour: number; contre: number; upvotes: number; downvotes: number; comments: number;
    userVote: 'up' | 'down' | null; userOpinion: 'pour' | 'contre' | null;
    badges: string[]; wilsonScore: number; hasAI: boolean;
  };

  const [questions, setQuestions] = useState<Q[]>([
    {
      id: 1,
      title: 'Should we ban cars in city centers?',
      category: 'politics',
      author: 'anonymous',
      timeAgo: '2 hours ago',
      pour: 805, contre: 429,
      upvotes: 342, downvotes: 12, comments: 47,
      userVote: null, userOpinion: null,
      badges: ['trending', 'controversial'],
      wilsonScore: 0.89, hasAI: true
    },
    {
      id: 2,
      title: 'Should remote work be a legal right?',
      category: 'work',
      author: 'techworker',
      timeAgo: '4 hours ago',
      pour: 696, contre: 196,
      upvotes: 189, downvotes: 8, comments: 23,
      userVote: null, userOpinion: null,
      badges: ['top'],
      wilsonScore: 0.92, hasAI: true
    },
    {
      id: 3,
      title: 'Is artificial intelligence a threat to humanity?',
      category: 'technology',
      author: 'futuretech',
      timeAgo: '5 hours ago',
      pour: 432, contre: 567,
      upvotes: 256, downvotes: 34, comments: 89,
      userVote: null, userOpinion: null,
      badges: ['controversial'],
      wilsonScore: 0.78, hasAI: false
    }
  ]);

  const trendingTopics = [
    { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
    { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
    { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' }
  ];

  const categories = [
    { value: 'all', label: 'All', icon: HomeIcon, color: '#FF4500' },
    { value: 'general', label: 'General', icon: Hash, color: '#FFB000' },
    { value: 'politics', label: 'Politics', icon: Users, color: '#7193FF' },
    { value: 'work', label: 'Work', icon: Briefcase, color: '#FF66AC' },
    { value: 'technology', label: 'Tech', icon: Cpu, color: '#00D26A' },
    { value: 'lifestyle', label: 'Life', icon: Heart, color: '#FF8717' },
    { value: 'environment', label: 'Eco', icon: Leaf, color: '#46D160' }
  ];

  // Wilson (non utilisé pour le moment mais prêt)
  const calculateWilsonScore = (up: number, down: number) => {
    const n = up + down;
    if (n === 0) return 0;
    const z = 1.96;
    const p = up / n;
    const denominator = 1 + (z * z) / n;
    const numerator = p + (z * z) / (2 * n) - z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
    return numerator / denominator;
  };

  // Tri
  const sortQuestions = (arr: Q[]) => {
    const now = Date.now();
    return [...arr].sort((a, b) => {
      if (selectedSort === 'hot') {
        const decay = (q: Q) => q.wilsonScore * Math.exp(-0.0001 * (now - now)); // placeholder
        return decay(b) - decay(a);
      }
      if (selectedSort === 'top') return b.wilsonScore - a.wilsonScore;
      if (selectedSort === 'controversial') {
        const r = (q: Q) => Math.min(q.pour, q.contre) / Math.max(q.pour, q.contre);
        return r(b) - r(a);
      }
      return 0; // 'new' -> ordre tel que fourni (mock)
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedQuestions = sortQuestions(filteredQuestions);

  const calculatePercentage = (q: { pour: number; contre: number }) => {
    const total = q.pour + q.contre;
    if (total === 0) return { pourPercent: 0, contrePercent: 0 };
    const pourPercent = Math.round((q.pour / total) * 100);
    const contrePercent = 100 - pourPercent;
    return { pourPercent, contrePercent };
  };

  // Handlers
  const handleUpvote = (questionId: number, voteType: 'up' | 'down') => {
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      if (voteType === 'up') {
        if (q.userVote === 'up') return { ...q, upvotes: q.upvotes - 1, userVote: null };
        if (q.userVote === 'down') return { ...q, upvotes: q.upvotes + 1, downvotes: q.downvotes - 1, userVote: 'up' };
        return { ...q, upvotes: q.upvotes + 1, userVote: 'up' };
      } else {
        if (q.userVote === 'down') return { ...q, downvotes: q.downvotes - 1, userVote: null };
        if (q.userVote === 'up') return { ...q, downvotes: q.downvotes + 1, upvotes: q.upvotes - 1, userVote: 'down' };
        return { ...q, downvotes: q.downvotes + 1, userVote: 'down' };
      }
    }));
  };

  const handleOpinionVote = (questionId: number, opinion: 'pour' | 'contre') => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setQuestions(prev => prev.map(q => {
      if (q.id !== questionId) return q;
      if (q.userOpinion === opinion) return { ...q, [opinion]: (q as any)[opinion] - 1, userOpinion: null };
      if (q.userOpinion) {
        const old = q.userOpinion;
        return { ...q, [old]: (q as any)[old] - 1, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
      }
      return { ...q, [opinion]: (q as any)[opinion] + 1, userOpinion: opinion } as Q;
    }));
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.title.trim()) return;
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    const q: Q = {
      id: Date.now(),
      title: newQuestion.title,
      category: newQuestion.category,
      author: username || 'you',
      timeAgo: 'just now',
      pour: 0, contre: 0,
      upvotes: 1, downvotes: 0, comments: 0,
      userVote: 'up', userOpinion: null,
      badges: ['new'], wilsonScore: 1, hasAI: false
    };
    setQuestions(prev => [q, ...prev]);
    setNewQuestion({ title: '', category: 'general', mediaType: 'text' });
    setIsCreateModalOpen(false);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      setShowAuthModal(false);
    }
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'trending': return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: TrendingUp };
      case 'controversial': return { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: Flame };
      case 'new': return { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: Clock };
      case 'top': return { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: Star };
      default: return { bg: '#ccc', icon: Star };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F9FA' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white', borderBottom: '1px solid #E1E8ED',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto', padding: '0 20px',
          height: '56px', display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '20px'
            }}>P</div>
            {!isMobile && <span style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a' }}>pollar</span>}
          </div>

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

      {/* Layout */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '12px' : '20px', display: 'flex', gap: '20px' }}>
        {/* Sidebar gauche */}
        {!isMobile && (
          <aside style={{ width: '240px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#8899A6', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>Categories</h3>
              {categories.map(cat => {
                const Icon = cat.icon as any;
                const isSelected = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                      backgroundColor: isSelected ? '#F7F9FA' : 'transparent', border: 'none', borderRadius: '8px',
                      cursor: 'pointer', transition: 'all 0.2s', marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#F7F9FA'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                  </button>
                );
              })}
            </div>

            {/* Auto-Translate */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Globe size={16} color="#667eea" />
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
          {/* Tri */}
          <div style={{
            backgroundColor: 'white', borderRadius: '12px', padding: '12px', marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: '8px', overflowX: 'auto'
          }}>
            {[
              { value: 'hot', label: 'Hot', icon: Flame },
              { value: 'new', label: 'New', icon: Clock },
              { value: 'top', label: 'Top', icon: TrendingUp },
              { value: 'controversial', label: 'Controversial', icon: BarChart3 }
            ].map((sort) => {
              const Icon = sort.icon as any;
              const active = selectedSort === sort.value;
              return (
                <button
                  key={sort.value}
                  onClick={() => setSelectedSort(sort.value as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '20px',
                    border: 'none', backgroundColor: active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                    color: active ? '#667eea' : '#536471', fontSize: '14px', fontWeight: active ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
                  }}
                >
                  <Icon size={16} />
                  {sort.label}
                </button>
              );
            })}
          </div>

          {/* Questions */}
          {sortedQuestions.map((question) => {
            const stats = calculatePercentage(question);
            const score = question.upvotes - question.downvotes;

            return (
              <div
                key={question.id}
                style={{
                  backgroundColor: 'white', borderRadius: '12px', marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.2s', cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
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
                      const Icon = style.icon as any;
                      return (
                        <span key={badge} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px',
                          background: style.bg, borderRadius: '12px', fontSize: '11px', color: 'white', fontWeight: 600
                        }}>
                          <Icon size={12} />
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
                  <Link href={`/questions/${question.id}`}>
                    <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '12px', lineHeight: '1.4' }}>
                      {question.title}
                    </h3>
                  </Link>

                  {/* YES / BAR / NO */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      {/* YES */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpinionVote(question.id, 'pour'); }}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: question.userOpinion === 'pour' ? '#00C851' : 'white',
                          border: '2px solid #00C851',
                          borderRadius: '20px',
                          color: question.userOpinion === 'pour' ? 'white' : '#00C851',
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
                          width: `${stats.pourPercent}%`,
                          background: 'linear-gradient(90deg, #00C851 0%, #00E676 100%)',
                          transition: 'width 0.5s ease',
                          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px'
                        }}>
                          {stats.pourPercent > 15 && (
                            <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}>
                              {stats.pourPercent}%
                            </span>
                          )}
                        </div>

                        {/* Right (NO) */}
                        <div style={{
                          position: 'absolute', right: 0, top: 0, height: '100%',
                          width: `${stats.contrePercent}%`,
                          background: 'linear-gradient(90deg, #FF3547 0%, #FF6B7A 100%)',
                          transition: 'width 0.5s ease',
                          display: 'flex', alignItems: 'center', paddingLeft: '8px'
                        }}>
                          {stats.contrePercent > 15 && (
                            <span style={{ color: 'white', fontSize: '11px', fontWeight: 'bold', pointerEvents: 'none' }}>
                              {stats.contrePercent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* NO */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpinionVote(question.id, 'contre'); }}
                        style={{
                          padding: '6px 14px',
                          backgroundColor: question.userOpinion === 'contre' ? '#FF3547' : 'white',
                          border: '2px solid #FF3547',
                          borderRadius: '20px',
                          color: question.userOpinion === 'contre' ? 'white' : '#FF3547',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        NO ({question.contre})
                      </button>
                    </div>

                    <div style={{ fontSize: '11px', color: '#8899A6', textAlign: 'center' }}>
                      {question.pour + question.contre} votes • Wilson score: {(question.wilsonScore * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Actions en bulles */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Up/Down */}
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F7F9FA', borderRadius: '20px', padding: '4px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpvote(question.id, 'up'); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '28px', height: '28px',
                          backgroundColor: question.userVote === 'up' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                          border: 'none', borderRadius: '50%',
                          color: question.userVote === 'up' ? '#667eea' : '#8899A6',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <ChevronUp size={18} />
                      </button>
                      <span style={{
                        fontSize: '13px', fontWeight: 600,
                        color: question.userVote ? (question.userVote === 'up' ? '#667eea' : '#FF3547') : '#1a1a1a',
                        margin: '0 4px', minWidth: '20px', textAlign: 'center'
                      }}>
                        {score > 999 ? `${(score / 1000).toFixed(1)}k` : score}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpvote(question.id, 'down'); }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: '28px', height: '28px',
                          backgroundColor: question.userVote === 'down' ? 'rgba(255, 53, 71, 0.2)' : 'transparent',
                          border: 'none', borderRadius: '50%',
                          color: question.userVote === 'down' ? '#FF3547' : '#8899A6',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <ChevronDown size={18} />
                      </button>
                    </div>

                    {/* Comments */}
                    <button style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '6px 12px', backgroundColor: '#F7F9FA',
                      border: 'none', borderRadius: '20px', color: '#536471',
                      fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E1E8ED'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F7F9FA'; }}
                    >
                      <MessageCircle size={16} />
                      {question.comments}
                    </button>

                    {/* Share */}
                    <button style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '36px', height: '36px', backgroundColor: '#F7F9FA',
                      border: 'none', borderRadius: '50%', color: '#536471', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E1E8ED'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F7F9FA'; }}
                    >
                      <Share2 size={16} />
                    </button>

                    {/* Save */}
                    <button style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '36px', height: '36px', backgroundColor: '#F7F9FA',
                      border: 'none', borderRadius: '50%', color: '#536471', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E1E8ED'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F7F9FA'; }}
                    >
                      <Bookmark size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* Sidebar droite */}
        {!isMobile && (
          <aside style={{ width: '320px' }}>
            {/* Create Post */}
            <button
              onClick={() => {
                if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); }
                else { setIsCreateModalOpen(true); }
              }}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none', borderRadius: '24px', color: 'white',
                fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
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
              {trendingTopics.map((topic, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < trendingTopics.length - 1 ? '1px solid #F0F3F4' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{topic.topic}</span>
                    <span style={{ fontSize: '12px', color: '#00C851', fontWeight: 600 }}>{topic.change}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#8899A6' }}>{topic.count}</span>
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

      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white',
          borderTop: '1px solid #E1E8ED', padding: '8px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100
        }}>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#667eea', fontSize: '11px' }}>
            <HomeIcon size={20} />
            Home
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8899A6', fontSize: '11px' }}>
            <TrendingUp size={20} />
            Trending
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn) { setAuthMode('login'); setShowAuthModal(true); }
              else { setIsCreateModalOpen(true); }
            }}
            style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none', borderRadius: '50%', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
            }}
          >
            <Plus size={24} />
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8899A6', fontSize: '11px' }}>
            <Bot size={20} />
            AI
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#8899A6', fontSize: '11px' }}>
            <User size={20} />
            Profile
          </button>
        </div>
      )}

      {/* Modal Auth */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    width: '100%',
    padding: '12px 16px',
    marginBottom: '12px',
    border: '2px solid #E1E8ED',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  }}
  onFocus={(e) => (e.target.style.borderColor = '#667eea')}
  onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
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

      {/* Create Post Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '16px', width: '100%',
            maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #F0F3F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Create a Post</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8899A6' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} style={{ padding: '20px' }}>
              {/* Media Type Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #F0F3F4', paddingBottom: '12px' }}>
                {[
                  { type: 'text', icon: Hash, label: 'Text' },
                  { type: 'image', icon: Image, label: 'Image' },
                  { type: 'video', icon: Video, label: 'Video' },
                  { type: 'link', icon: Link2, label: 'Link' }
                ].map((media) => {
                  const Icon = media.icon as any;
                  return (
                    <button
                      key={media.type}
                      type="button"
                      onClick={() => setNewQuestion(prev => ({ ...prev, mediaType: media.type as any }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                        backgroundColor: newQuestion.mediaType === media.type ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        border: 'none', borderRadius: '8px',
                        color: newQuestion.mediaType === media.type ? '#667eea' : '#8899A6',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
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
                onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px', marginBottom: '16px',
                  border: '2px solid #E1E8ED', borderRadius: '12px', fontSize: '14px', backgroundColor: 'white', outline: 'none'
                }}
              >
                {categories.filter(c => c.value !== 'all').map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              <textarea
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ask a yes/no question..."
                style={{
                  width: '100%', padding: '12px', marginBottom: '16px',
                  border: '2px solid #E1E8ED', borderRadius: '12px', fontSize: '14px',
                  minHeight: '100px', resize: 'vertical', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => (e.target.style.borderColor = '#E1E8ED')}
              />

              {newQuestion.mediaType !== 'text' && (
                <div
                  style={{
                    border: '2px dashed #E1E8ED', borderRadius: '12px', padding: '24px',
                    textAlign: 'center', marginBottom: '16px', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.backgroundColor = 'rgba(102,126,234,0.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E1E8ED'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {newQuestion.mediaType === 'image' && <Image size={32} color="#8899A6" />}
                  {newQuestion.mediaType === 'video' && <Video size={32} color="#8899A6" />}
                  {newQuestion.mediaType === 'link' && <Link2 size={32} color="#8899A6" />}
                  <p style={{ fontSize: '13px', color: '#8899A6', marginTop: '8px' }}>
                    Click to add {newQuestion.mediaType}
                  </p>
                </div>
              )}

              {/* AI helper */}
              <div style={{ backgroundColor: 'rgba(102,126,234,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Bot size={16} color="#667eea" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#667eea' }}>AI Assistant</span>
                </div>
                <p style={{ fontSize: '12px', color: '#536471', marginBottom: '8px' }}>✨ Auto-corrected 2 typos • Suggested category: Politics</p>
                <p style={{ fontSize: '12px', color: '#536471' }}>💡 Similar question exists: "Should cars be restricted in urban areas?" (87% match)</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{ padding: '10px 24px', backgroundColor: 'white', border: '2px solid #E1E8ED', borderRadius: '24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: '#536471' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newQuestion.title.trim()}
                  style={{
                    padding: '10px 24px',
                    background: newQuestion.title.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#E1E8ED',
                    border: 'none', borderRadius: '24px', fontSize: '14px', fontWeight: 600,
                    color: newQuestion.title.trim() ? 'white' : '#8899A6',
                    cursor: newQuestion.title.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: newQuestion.title.trim() ? '0 2px 8px rgba(102,126,234,0.3)' : 'none'
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
