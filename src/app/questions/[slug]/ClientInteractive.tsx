'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import QuestionHeader from './QuestionHeader';
import VoteButtons from './VoteButtons';
import TabSwitcher from './TabSwitcher';
import ArgumentsColumn from '@/components/ArgumentsColumn';
import DiscussionSection from './DiscussionSection';
import RelatedQuestions from './RelatedQuestions';
import SourcePills from '@/components/SourcePills';

export type ClientQuestion = {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAtISO: string;
  author: string;
  views: number;
  votesACount: number;
  votesBCount: number;
  badges: Array<'trending' | 'controversial' | 'new' | 'top'>;
};

type SourceLink = { url: string; label?: string };

type Comment = {
  id: number | string;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  side: 'pour' | 'contre';
  parentId?: number | string;
  sources?: SourceLink[];
  views?: number;
  isAI?: boolean;
};

type Discussion = {
  id: string;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
  sources?: SourceLink[];
};

type Props = {
  slug: string;
  initialQuestion: ClientQuestion;
  initialSources: SourceLink[];
  initialComments: Comment[];
  initialDiscussions: Discussion[];
  aiArgumentsFor?: any[];
  aiArgumentsAgainst?: any[];
};

export default function ClientInteractive({
  slug,
  initialQuestion,
  initialSources,
  initialComments,
  initialDiscussions,
  aiArgumentsFor = [],
  aiArgumentsAgainst = [],
}: Props) {
  const [question] = useState(initialQuestion);
  const [sources] = useState(initialSources);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [discussions, setDiscussions] = useState<Discussion[]>(initialDiscussions);
  const [userVote, setUserVote] = useState<'pour' | 'contre' | null>(null);
  const [activeTab, setActiveTab] = useState<'arguments' | 'discussion'>('arguments');
  const [isLoggedIn] = useState(false);
  const [username] = useState('guest');
  const [searchQuery] = useState('');
  const [isMobile] = useState(false);

  const aiCommentsFor: Comment[] = useMemo(() => {
    console.log('🤖 Arguments IA FOR reçus:', aiArgumentsFor);
    return aiArgumentsFor.map((arg, idx) => ({
      id: `ai-for-${idx}`,
      text: arg.text || '',
      author: 'Spliten AI',
      timeAgo: 'Generated',
      votes: 0,
      userVote: null,
      side: 'pour' as const,
      sources: arg.source ? [arg.source] : [],
      views: 0,
      isAI: true,
    }));
  }, [aiArgumentsFor]);

  const aiCommentsAgainst: Comment[] = useMemo(() => {
    console.log('🤖 Arguments IA AGAINST reçus:', aiArgumentsAgainst);
    return aiArgumentsAgainst.map((arg, idx) => ({
      id: `ai-against-${idx}`,
      text: arg.text || '',
      author: 'Spliten AI',
      timeAgo: 'Generated',
      votes: 0,
      userVote: null,
      side: 'contre' as const,
      sources: arg.source ? [arg.source] : [],
      views: 0,
      isAI: true,
    }));
  }, [aiArgumentsAgainst]);

  const allComments = useMemo(() => {
    const merged = [...aiCommentsFor, ...aiCommentsAgainst, ...comments];
    console.log('📊 Total arguments fusionnés:', merged.length);
    return merged;
  }, [aiCommentsFor, aiCommentsAgainst, comments]);

  const commentsFor = useMemo(
    () => allComments.filter((c) => c.side === 'pour').sort((a, b) => b.votes - a.votes),
    [allComments]
  );

  const commentsAgainst = useMemo(
    () => allComments.filter((c) => c.side === 'contre').sort((a, b) => b.votes - a.votes),
    [allComments]
  );

  const requireAuth = (callback: () => void) => {
    if (isLoggedIn) {
      callback();
    } else {
      alert('Please log in to perform this action.');
    }
  };

  const handleQuestionVote = (side: 'pour' | 'contre') => {
    requireAuth(() => {
      setUserVote((prev) => (prev === side ? null : side));
    });
  };

  const handleAddComment = (text: string, sources?: SourceLink[]) => {
    requireAuth(() => {
      const newComment: Comment = {
        id: Date.now(),
        text,
        author: username,
        timeAgo: 'Just now',
        votes: 0,
        userVote: null,
        side: 'pour',
        sources: sources || [],
        views: 0,
      };
      setComments((prev) => [...prev, newComment]);
    });
  };

  const handleVoteComment = (commentId: number | string, type: 'up' | 'down') => {
    requireAuth(() => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            if (c.userVote === type) {
              return { ...c, votes: c.votes - (type === 'up' ? 1 : -1), userVote: null };
            } else {
              const adjustment = type === 'up' ? 1 : -1;
              const prevAdjustment = c.userVote === 'up' ? -1 : c.userVote === 'down' ? 1 : 0;
              return { ...c, votes: c.votes + adjustment + prevAdjustment, userVote: type };
            }
          }
          return c;
        })
      );
    });
  };

  const handleReplyComment = (parentId: number | string, text: string, sources?: SourceLink[]) => {
    requireAuth(() => {
      const parent = allComments.find((c) => c.id === parentId);
      if (!parent) return;
      const newReply: Comment = {
        id: Date.now(),
        text,
        author: username,
        timeAgo: 'Just now',
        votes: 0,
        userVote: null,
        side: parent.side,
        parentId,
        sources: sources || [],
        views: 0,
      };
      setComments((prev) => [...prev, newReply]);
    });
  };

  const handleAddDiscussion = (text: string, sources?: SourceLink[]) => {
    requireAuth(() => {
      const newDiscussion: Discussion = {
        id: `${Date.now()}`,
        text,
        author: username,
        timeAgo: 'Just now',
        likes: 0,
        replies: 0,
        sources: sources || [],
      };
      setDiscussions((prev) => [...prev, newDiscussion]);
    });
  };

  const handleLikeDiscussion = (discussionId: string) => {
    requireAuth(() => {
      setDiscussions((prev) =>
        prev.map((d) => (d.id === discussionId ? { ...d, likes: d.likes + 1 } : d))
      );
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar
        isMobile={isMobile}
        isLoggedIn={isLoggedIn}
        username={username}
        searchQuery={searchQuery}
        onSearchChange={() => {}}
        onLoginClick={() => alert('Login (mock)')}
        onSignupClick={() => alert('Signup (mock)')}
        onAskClick={() => {}}
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: isMobile ? 12 : 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr 260px', gap: 20 }}>
        
        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf: 'start' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>📊 Stats</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                <div>Views: {question.views}</div>
                <div>Arguments: {allComments.length}</div>
              </div>
            </div>
          </aside>
        )}

        <main>
          <QuestionHeader question={question} />

          {question.description && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{question.description}</p>
            </div>
          )}

          {sources.length > 0 && (
            <div style={{ marginTop: 16, padding: 16, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>📚 Sources</h3>
              <SourcePills sources={sources} />
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <VoteButtons
              votesACount={question.votesACount}
              votesBCount={question.votesBCount}
              userVote={userVote}
              onVote={handleQuestionVote}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {activeTab === 'arguments' && (
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <ArgumentsColumn
                title="FOR"
                colorHeaderBg="#00C851"
                colorHeaderText="white"
                colorCount="rgba(255,255,255,0.8)"
                borderColor="#00C85133"
                side="pour"
                comments={commentsFor}
                totalCount={commentsFor.length}
                isLoggedIn={isLoggedIn}
                requireAuth={requireAuth}
                onAdd={handleAddComment}
                onVote={handleVoteComment}
                onReply={handleReplyComment}
                aiArguments={[]}
              />

              <ArgumentsColumn
                title="AGAINST"
                colorHeaderBg="#FF3547"
                colorHeaderText="white"
                colorCount="rgba(255,255,255,0.8)"
                borderColor="#FF354733"
                side="contre"
                comments={commentsAgainst}
                totalCount={commentsAgainst.length}
                isLoggedIn={isLoggedIn}
                requireAuth={requireAuth}
                onAdd={handleAddComment}
                onVote={handleVoteComment}
                onReply={handleReplyComment}
                aiArguments={[]}
              />
            </div>
          )}

          {activeTab === 'discussion' && (
            <div style={{ marginTop: 24 }}>
              <DiscussionSection
                discussions={discussions}
                isLoggedIn={isLoggedIn}
                requireAuth={requireAuth}
                onAdd={handleAddDiscussion}
                onLike={handleLikeDiscussion}
              />
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <RelatedQuestions currentSlug={slug} />
          </div>
        </main>

        {!isMobile && (
          <aside style={{ position: 'sticky', top: 76, alignSelf: 'start' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>💡 Info</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Category: {question.category}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}