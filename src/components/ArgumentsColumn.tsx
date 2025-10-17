'use client';
import React, { useMemo, useState } from 'react';
import { Plus, ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import SourcePills from '@/components/SourcePills';

export type SourceLink = { url: string };

export type UIComment = {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  votes: number;
  userVote: 'up' | 'down' | null;
  side: 'pour' | 'contre';
  parentId?: number;
  sources?: SourceLink[];
  // tolérance : certains fetch mappent d'autres clés
  sourceLinks?: SourceLink[];
  links?: ({ url: string } | string)[];
  refs?: ({ url: string } | string)[];
  views?: number;
};

type Props = {
  title: string;
  colorHeaderBg: string;
  colorHeaderText: string;
  colorCount: string;
  borderColor: string;
  side: 'pour' | 'contre';
  comments: UIComment[];
  totalCount: number;
  isLoggedIn: boolean;
  requireAuth: (cb: () => void) => void;
  onAdd: (text: string, sources?: SourceLink[]) => void;
  onVote: (commentId: number, type: 'up' | 'down') => void;
  onReply: (parentId: number, text: string, sources?: SourceLink[]) => void;
};

/* ===== Helpers locaux : normalisation & fallback multi-clés ===== */
function normalizeHttp(u?: string) {
  if (!u) return '';
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function pickSourcesAny(maybe: any): SourceLink[] {
  if (!maybe) return [];
  const arr =
    (Array.isArray(maybe.sources) ? maybe.sources : null) ??
    (Array.isArray(maybe.sourceLinks) ? maybe.sourceLinks : null) ??
    (Array.isArray(maybe.links) ? maybe.links : null) ??
    (Array.isArray(maybe.refs) ? maybe.refs : null) ??
    [];

  return (arr as any[])
    .map((x) => (typeof x === 'string' ? { url: x } : x))
    .filter((x) => x && typeof x.url === 'string')
    .map((x) => ({ url: normalizeHttp(x.url) }))
    .filter((x) => !!x.url);
}

export default function ArgumentsColumn({
  title,
  colorHeaderBg,
  colorHeaderText,
  colorCount,
  borderColor,
  side,
  comments,
  totalCount,
  isLoggedIn,
  requireAuth,
  onAdd,
  onVote,
  onReply,
}: Props) {
  const [showInput, setShowInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [newSource, setNewSource] = useState('');

  const isConvincing = (c: UIComment) => {
    const denom = Math.max(c.views ?? 0, c.votes * 4, 1);
    const score = (Math.max(c.votes, 0) / denom) * 100;
    return score >= 65 && c.votes >= 20;
  };

  const topLevel = useMemo(() => comments.filter((c) => !c.parentId), [comments]);
  const byParent = useMemo(() => {
    const m = new Map<number, UIComment[]>();
    comments.filter((c) => c.parentId).forEach((r) => {
      const arr = m.get(r.parentId!) || [];
      arr.push(r);
      m.set(r.parentId!, arr);
    });
    return m;
  }, [comments]);

  const handlePost = () =>
    requireAuth(() => {
      if (!newText.trim()) return;
      const src = newSource.trim();
      const sources = src ? [{ url: normalizeHttp(src) }] : undefined;
      onAdd(newText.trim(), sources);
      setNewText('');
      setNewSource('');
      setShowInput(false);
    });

  return (
    <div className="rounded-lg border overflow-hidden" style={{ background: 'var(--card)', borderColor }}>
      {/* Header */}
      <div className="px-3 py-2 border-b flex justify-between items-center" style={{ background: colorHeaderBg, borderColor }}>
        <div>
          <h3 className="font-semibold text-sm" style={{ color: colorHeaderText }}>{title}</h3>
          <p className="text-xs" style={{ color: colorCount }}>{totalCount} arguments</p>
        </div>
        <button
          onClick={() => requireAuth(() => setShowInput((v) => !v))}
          className="p-1 rounded-full clickable"
          aria-label="Add"
          style={{ background: 'transparent', color: colorHeaderText }}
          title={`Add an argument ${side === 'pour' ? 'FOR' : 'AGAINST'}`}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {/* Composer */}
        {showInput && (
          <div className="rounded-lg p-3 border mb-2" style={{ background: 'var(--pill)', borderColor }}>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder={`Add your argument ${side === 'pour' ? 'FOR' : 'AGAINST'}...`}
              className="w-full p-2 text-sm rounded focus:outline-none"
              rows={2}
              style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text)' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Optional source URL (https://...)"
                className="flex-1 p-2 text-sm rounded"
                style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button onClick={() => setShowInput(false)} className="px-3 py-1 text-xs" style={{ color: 'var(--muted)' }}>
                Cancel
              </button>
              <button onClick={handlePost} className="px-3 py-1 text-xs rounded clickable" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }}>
                Post
              </button>
            </div>
          </div>
        )}

        {/* Items */}
        {topLevel.map((c) => {
          const replies = byParent.get(c.id) || [];
          const cSources = pickSourcesAny(c); // <-- NOUVEAU : fallback multi-clés
          return (
            <div key={c.id} className="bg-white rounded-lg p-3 border" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)', marginBottom: 4 }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>{c.author}</span>
                <span className="mx-1">•</span>
                <span>{c.timeAgo}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <p className="text-sm" style={{ color: 'var(--text)', marginBottom: 6, flex: 1 }}>{c.text}</p>
                {isConvincing(c) && (
                  <span
                    title="High signal: strong upvotes/view ratio"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px',
                      fontSize: 11, borderRadius: 999, border: '1px solid #bbf7d0',
                      background: 'linear-gradient(90deg,#f0fdf4,#dcfce7)', color: '#065f46', whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#16a34a' }} />
                    Convincing
                  </span>
                )}
              </div>

              {/* Sources (argument) */}
              {cSources.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <SourcePills sources={cSources} />
                </div>
              )}

              {/* Actions + Reply */}
              <details style={{ marginTop: 8 }}>
                <summary style={{ listStyle: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <button
                        onClick={(e) => { e.preventDefault(); onVote(c.id, 'up'); }}
                        className="clickable"
                        title="Upvote"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px',
                          borderRadius: 999, fontSize: 12, border: '1px solid var(--border)',
                          color: c.userVote === 'up' ? 'white' : 'var(--text)',
                          background: c.userVote === 'up' ? '#16a34a' : 'var(--pill)',
                        }}
                      >
                        <ThumbsUp size={12} />
                        <span>{c.votes > 0 ? `+${c.votes}` : c.votes}</span>
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); onVote(c.id, 'down'); }}
                        className="clickable"
                        title="Downvote"
                        style={{
                          padding: '2px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)',
                          color: c.userVote === 'down' ? 'white' : 'var(--text)',
                          background: c.userVote === 'down' ? '#dc2626' : 'var(--pill)',
                        }}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>

                    <button
                      onClick={(e) => { e.preventDefault(); alert('Thanks for reporting — queued for review.'); }}
                      className="clickable"
                      title="Report"
                      style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, border: '1px solid var(--border)', background: 'var(--pill)', color: 'var(--text)' }}
                    >
                      <Flag size={12} />
                    </button>

                    <span style={{ marginLeft: 8, fontSize: 12, color: '#667eea', fontWeight: 700 }}>Reply</span>
                  </div>
                </summary>

                <ReplyBox parent={c} onReply={onReply} />
              </details>

              {/* Replies */}
              {replies.length > 0 && (
                <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                  {replies.sort((a, b) => b.votes - a.votes).map((r) => {
                    const rSources = pickSourcesAny(r); // <-- NOUVEAU : fallback multi-clés
                    return (
                      <div key={r.id} style={{ marginTop: 8 }}>
                        <div className="text-xs" style={{ color: 'var(--muted)', marginBottom: 4 }}>
                          <span className="font-medium" style={{ color: 'var(--text)' }}>{r.author}</span>
                          <span className="mx-1">•</span>
                          <span>{r.timeAgo}</span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text)', marginBottom: 6 }}>{r.text}</p>
                        {rSources.length > 0 && (
                          <div style={{ marginTop: 6 }}>
                            <SourcePills sources={rSources} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReplyBox({
  parent,
  onReply,
}: {
  parent: UIComment;
  onReply: (parentId: number, text: string, sources?: SourceLink[]) => void;
}) {
  const [t, setT] = useState('');
  const [s, setS] = useState('');
  return (
    <div style={{ marginTop: 8 }}>
      <textarea
        value={t}
        onChange={(e) => setT(e.target.value)}
        rows={2}
        placeholder="Reply to this argument…"
        className="w-full p-2 rounded"
        style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
      />
      <input
        value={s}
        onChange={(e) => setS(e.target.value)}
        placeholder="Optional source URL (https://...)"
        className="w-full p-2 rounded"
        style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', marginTop: 6 }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button
          onClick={() => {
            if (!t.trim()) return;
            const src = s.trim();
            const sources = src ? [{ url: normalizeHttp(src) }] : undefined;
            onReply(parent.id, t.trim(), sources);
            setT('');
            setS('');
          }}
          className="px-3 py-1 text-xs rounded clickable"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }}
        >
          Reply
        </button>
      </div>
    </div>
  );
}
