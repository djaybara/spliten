// src/components/DiscussionThread.tsx
'use client';
import React, { useState } from 'react';
import { MessageSquare, Flag } from 'lucide-react';
import SourcePills from '@/components/SourcePills';

export type SourceLink = { url: string };
export type UIDiscussion = {
  id: number;
  text: string;
  author: string;
  timeAgo: string;
  likes: number;
  replies: number;
  sources?: SourceLink[];
};

export default function DiscussionThread({
  discussions,
  onPost,
  onReply,
}: {
  discussions: UIDiscussion[];
  onPost: (text: string, sources?: SourceLink[]) => void;
  onReply: (id: number, text: string, sources?: SourceLink[]) => void;
}) {
  const [text, setText] = useState('');
  const [src, setSrc] = useState('');

  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)', marginTop: 8 }}>
      <div className="mb-4">
        <div className="flex space-x-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts beyond yes/no..."
            className="flex-1 p-3 rounded text-sm"
            style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}
            rows={3}
          />
        </div>
        <input
          value={src}
          onChange={(e) => setSrc(e.target.value)}
          placeholder="Optional source URL (https://...)"
          className="w-full p-2 rounded text-sm"
          style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', marginTop: 6 }}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => {
              if (!text.trim()) return;
              onPost(text.trim(), src.trim() ? [{ url: src.trim() }] : undefined);
              setText('');
              setSrc('');
            }}
            className="px-4 py-2 text-sm rounded-lg clickable"
            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white' }}
          >
            Post
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {discussions.map((d) => (
          <div key={d.id} className="border-b pb-3 last:border-0" style={{ borderColor: 'var(--border)' }}>
            <div className="text-xs" style={{ color: 'var(--muted)', marginBottom: 4 }}>
              <span className="font-medium" style={{ color: 'var(--text)' }}>
                {d.author}
              </span>
              <span className="mx-1">•</span>
              <span>{d.timeAgo}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text)', marginBottom: 8 }}>
              {d.text}
            </p>

            {d.sources && d.sources.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <SourcePills list={d.sources} />
              </div>
            )}

            <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--muted)' }}>
              <button className="flex items-center space-x-1 clickable" style={{ color: 'var(--text)' }} onClick={() => alert('Replies modal (TODO DB)')}>
                <MessageSquare size={12} />
                <span>{d.replies} replies</span>
              </button>
              <button
                className="flex items-center space-x-1 clickable"
                style={{ color: 'var(--text)' }}
                onClick={() => alert('Thanks for reporting — queued for review.')}
                title="Report"
              >
                <Flag size={12} />
                <span>Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
