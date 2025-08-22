// src/app/questions/[id]/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark,
  TrendingUp, Flame, Clock, Star, Plus, Send
} from 'lucide-react';

/* =======================
   Types
======================= */
type Side = 'pour' | 'contre';
type CommentVote = 'up' | 'down' | null;

interface Comment {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: CommentVote;
  side: Side;
}

interface Discussion {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
}

interface Question {
  id: number;
  title: string;
  category: string;
  author: string;
  timeAgo: string;
  pour: number;
  contre: number;
  views: number;
  description?: string;
  totalComments: number;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
}

/* =======================
   Page
======================= */
export default function QuestionPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // --- Mock question (tu brancheras plus tard sur ta vraie data) ---
  const [question, setQuestion] = useState<Question>({
    id: Number(id ?? 1),
    title: "Should we ban cars in city centers?",
    category: "work", // "work", "politics", etc. (affiché en pill)
    author: "techworker",
    timeAgo: "4h ago",
    pour: 696,
    contre: 196,
    views: 892,
    description:
      "With increasing pollution and traffic congestion, many cities consider banning private vehicles from city centers. It would favor public transport, bikes, and pedestrians.",
    totalComments: 47,
    badges: ['top']
  });

  // --- Mock arguments ---
  const [comments, setComments] = useState<Comment[]>([
    // POUR
    {
      id: 1,
      text:
        "Cities like Amsterdam and Copenhagen have shown this works. Less pollution, more liveable spaces, and better health outcomes for residents.",
      author: "urbanplanner",
      timeAgo: "1h ago",
      votes: 234,
      userVote: null,
      side: 'pour'
    },
    {
      id: 2,
      text:
        "My asthma has improved a lot since our district went car-free. Kids can actually play in the streets now.",
      author: "healthadvocate",
      timeAgo: "45m ago",
      votes: 189,
      userVote: null,
      side: 'pour'
    },
    {
      id: 3,
      text:
        "Economic studies show pedestrian-only zones often increase local business revenue by 30–40%.",
      author: "economist101",
      timeAgo: "2h ago",
      votes: 156,
      userVote: null,
      side: 'pour'
    },
    // CONTRE
    {
      id: 4,
      text:
        "What about disabled people who can't use public transport? Elderly? Parents with young children? This risks being discriminatory.",
      author: "accessibility",
      timeAgo: "30m ago",
      votes: 312,
      userVote: null,
      side: 'contre'
    },
    {
      id: 5,
      text:
        "I run a small delivery business. This would literally destroy my livelihood.",
      author: "smallbusiness",
      timeAgo: "1h ago",
      votes: 245,
      userVote: null,
      side: 'contre'
    },
    {
      id: 6,
      text:
        "Public transport is already overcrowded and unreliable. Fix that first.",
      author: "commuter2024",
      timeAgo: "2h ago",
      votes: 198,
      userVote: null,
      side: 'contre'
    }
  ]);

  // --- Mock discussion ---
  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: 1,
      text:
        "Real solution: invest in public transport first, THEN reduce car access gradually. We need a transition of at least 5 years.",
      author: "pragmatist",
      timeAgo: "1h ago",
      likes: 89,
      replies: 12
    },
    {
      id: 2,
      text:
        "Compromise idea: start with car-free weekends, or a resident-permit system.",
      author: "mediator",
      timeAgo: "2h ago",
      likes: 156,
      replies: 23
    },
    {
      id: 3,
      text:
        "It’s not about banning cars only — it’s about reimagining urban space for people, not vehicles.",
      author: "urbanist",
      timeAgo: "3h ago",
      likes: 67,
      replies: 8
    }
  ]);

  // --- UI state ---
  const [activeTab, setActiveTab] =
    useState<'arguments' | 'discussion'>('arguments');
  const [userVote, setUserVote] = useState<Side | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showPourInput, setShowPourInput] = useState(false);
  const [showContreInput, setShowContreInput] = useState(false);
  const [newArgumentPour, setNewArgumentPour] = useState('');
  const [newArgumentContre, setNewArgumentContre] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');

  // --- Derived ---
  const { pourPercent, contrePercent, totalVotes } = useMemo(() => {
    const total = question.pour + question.contre;
    const p = total ? Math.round((question.pour / total) * 100) : 0;
    return { pourPercent: p, contrePercent: 100 - p, totalVotes: total };
  }, [question.pour, question.contre]);

  const pourComments = useMemo(
    () => comments.filter(c => c.side === 'pour').sort((a, b) => b.votes - a.votes),
    [comments]
  );
  const contreComments = useMemo(
    () => comments.filter(c => c.side === 'contre').sort((a, b) => b.votes - a.votes),
    [comments]
  );

  // --- Handlers ---
  const handleVote = (side: Side) => {
    setQuestion(prev => {
      if (userVote === side) {
        // toggle off
        setUserVote(null);
        return { ...prev, [side]: (prev as any)[side] - 1 } as Question;
      }
      if (userVote) {
        // switch side
        const other = userVote === 'pour' ? 'contre' : 'pour';
        setUserVote(side);
        return {
          ...prev,
          [side]: (prev as any)[side] + 1,
          [other]: (prev as any)[other] - 1
        } as Question;
      }
      // first vote
      setUserVote(side);
      return { ...prev, [side]: (prev as any)[side] + 1 } as Question;
    });
  };

  const handleCommentVote = (commentId: number, voteType: Exclude<CommentVote, null>) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment.id !== commentId) return comment;
        let votes = comment.votes;
        let uv = comment.userVote;

        if (uv === voteType) {
          votes += voteType === 'up' ? -1 : +1;
          uv = null;
        } else if (uv) {
          votes += voteType === 'up' ? +2 : -2;
          uv = voteType;
        } else {
          votes += voteType === 'up' ? +1 : -1;
          uv = voteType;
        }
        return { ...comment, votes, userVote: uv };
      })
    );
  };

  const handleAddArgument = (side: Side) => {
    const text = side === 'pour' ? newArgumentPour : newArgumentContre;
    if (!text.trim()) return;
    const c: Comment = {
      id: Date.now(),
      text,
      author: "you",
      timeAgo: "now",
      votes: 1,
      userVote: 'up',
      side
    };
    setComments(prev => [c, ...prev]);
    if (side === 'pour') {
      setNewArgumentPour('');
      setShowPourInput(false);
    } else {
      setNewArgumentContre('');
      setShowContreInput(false);
    }
  };

  const handleAddDiscussion = () => {
    if (!newDiscussion.trim()) return;
    const d: Discussion = {
      id: Date.now(),
      text: newDiscussion,
      author: "you",
      timeAgo: "now",
      likes: 0,
      replies: 0
    };
    setDiscussions(prev => [d, ...prev]);
    setNewDiscussion('');
  };

  // --- UI helpers ---
  const badgePill = (b: Question['badges'][number]) => {
    const map = {
      trending: { cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: <TrendingUp size={12} /> },
      controversial: { cls: 'bg-red-100 text-red-700 border-red-200', icon: <Flame size={12} /> },
      new: { cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Clock size={12} /> },
      top: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Star size={12} /> }
    } as const;
    const item = map[b];
    return (
      <span key={b} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${item.cls}`}>
        {item.icon}
        {b}
      </span>
    );
  };

  /* =======================
     Render
  ======================= */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compact - cohérent avec la Home */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
                aria-label="Back"
              >
                <ArrowLeft size={18} />
              </button>
              <Link href="/" className="text-lg font-bold text-orange-500">
                Pollar
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 hover:bg-gray-100 rounded-lg" aria-label="Share">
                <Share2 size={18} />
              </button>
              <button
                onClick={() => setIsSaved(v => !v)}
                className={`p-1.5 hover:bg-gray-100 rounded-lg ${isSaved ? 'text-orange-500' : ''}`}
                aria-label="Save"
              >
                <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="max-w-6xl mx-auto px-4 py-4">
        {/* Question card */}
        <div className="bg-white rounded-lg shadow-sm border p-5 mb-4">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{question.category}</span>
            {question.badges.map(badgePill)}
            <span className="text-xs text-gray-500">• by {question.author} • {question.timeAgo}</span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-3">{question.title}</h1>
          {question.description && (
            <p className="text-sm text-gray-600 mb-4">{question.description}</p>
          )}

          {/* Ratio bar (cohérence avec la Home) */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-green-600">Yes {pourPercent}%</span>
              <span className="text-gray-500">{totalVotes.toLocaleString()} votes</span>
              <span className="text-red-500">No {contrePercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                style={{ width: `${pourPercent}%` }}
              />
            </div>
          </div>

          {/* Vote buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleVote('pour')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                userVote === 'pour'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
              }`}
            >
              Yes ({question.pour})
            </button>
            <button
              onClick={() => handleVote('contre')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                userVote === 'contre'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              }`}
            >
              No ({question.contre})
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 bg-white rounded-lg p-1 border">
          <button
            onClick={() => setActiveTab('arguments')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'arguments'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Arguments ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'discussion'
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Open Discussion ({discussions.length})
          </button>
        </div>

        {/* Tab: Arguments */}
        {activeTab === 'arguments' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* FOR */}
            <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 border-b border-green-200 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-green-800 text-sm">Arguments FOR</h3>
                  <p className="text-xs text-green-600">{pourComments.length} arguments</p>
                </div>
                <button
                  onClick={() => setShowPourInput(v => !v)}
                  className="p-1 hover:bg-green-200 rounded-full transition-colors"
                  aria-label="Add FOR"
                >
                  <Plus size={16} className="text-green-700" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {showPourInput && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-2">
                    <textarea
                      value={newArgumentPour}
                      onChange={(e) => setNewArgumentPour(e.target.value)}
                      placeholder="Add your argument FOR..."
                      className="w-full p-2 text-sm border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => { setShowPourInput(false); setNewArgumentPour(''); }}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddArgument('pour')}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {pourComments.map(comment => (
                  <div key={comment.id} className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">{comment.author}</span>
                      <span className="mx-1">•</span>
                      <span>{comment.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{comment.text}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCommentVote(comment.id, 'up')}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                          comment.userVote === 'up'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        <ThumbsUp size={11} />
                        <span>{comment.votes > 0 ? `+${comment.votes}` : comment.votes}</span>
                      </button>
                      <button
                        onClick={() => handleCommentVote(comment.id, 'down')}
                        className={`p-0.5 rounded-full transition-colors ${
                          comment.userVote === 'down'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <ThumbsDown size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AGAINST */}
            <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-red-100 px-3 py-2 border-b border-red-200 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">Arguments AGAINST</h3>
                  <p className="text-xs text-red-600">{contreComments.length} arguments</p>
                </div>
                <button
                  onClick={() => setShowContreInput(v => !v)}
                  className="p-1 hover:bg-red-200 rounded-full transition-colors"
                  aria-label="Add AGAINST"
                >
                  <Plus size={16} className="text-red-700" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                {showContreInput && (
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200 mb-2">
                    <textarea
                      value={newArgumentContre}
                      onChange={(e) => setNewArgumentContre(e.target.value)}
                      placeholder="Add your argument AGAINST..."
                      className="w-full p-2 text-sm border border-red-200 rounded focus:outline-none focus:ring-1 focus:ring-red-400"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => { setShowContreInput(false); setNewArgumentContre(''); }}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddArgument('contre')}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}

                {contreComments.map(comment => (
                  <div key={comment.id} className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-xs text-gray-500 mb-1">
                      <span className="font-medium text-gray-700">{comment.author}</span>
                      <span className="mx-1">•</span>
                      <span>{comment.timeAgo}</span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{comment.text}</p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCommentVote(comment.id, 'up')}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                          comment.userVote === 'up'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        <ThumbsUp size={11} />
                        <span>{comment.votes > 0 ? `+${comment.votes}` : comment.votes}</span>
                      </button>
                      <button
                        onClick={() => handleCommentVote(comment.id, 'down')}
                        className={`p-0.5 rounded-full transition-colors ${
                          comment.userVote === 'down'
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <ThumbsDown size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Discussion */}
        {activeTab === 'discussion' && (
          <div className="bg-white rounded-lg border p-4">
            <div className="mb-4">
              <div className="flex space-x-2">
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder="Share your thoughts beyond yes/no..."
                  className="flex-1 p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddDiscussion}
                  className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center space-x-1"
                >
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {discussions.map(d => (
                <div key={d.id} className="border-b pb-3 last:border-0">
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-medium text-gray-700">{d.author}</span>
                    <span className="mx-1">•</span>
                    <span>{d.timeAgo}</span>
                  </div>
                  <p className="text-sm text-gray-800 mb-2">{d.text}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <button className="flex items-center space-x-1 hover:text-orange-500">
                      <ThumbsUp size={12} />
                      <span>{d.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-500">
                      <MessageSquare size={12} />
                      <span>{d.replies} replies</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
