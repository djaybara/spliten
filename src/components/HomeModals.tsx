// src/components/HomeModals.tsx
'use client';

import { Hash, Image, Video, Link2, Bot, X } from 'lucide-react';

type AuthModalProps = {
  show: boolean;
  mode: 'login' | 'signup';
  username: string;
  onUsernameChange: (val: string) => void;
  onModeChange: (mode: 'login' | 'signup') => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export function AuthModal({
  show,
  mode,
  username,
  onUsernameChange,
  onModeChange,
  onSubmit,
  onClose,
}: AuthModalProps) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
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
          backgroundColor: 'var(--card)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--text)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Join Spliten'}
          </h2>
        </div>

        <form onSubmit={onSubmit} style={{ padding: 24 }}>
          <input
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Username"
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            style={{
              width: '100%',
              padding: '12px 16px',
              marginBottom: 12,
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 14,
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
          {mode === 'signup' && (
            <input
              type="email"
              placeholder="Email"
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: 12,
                border: '2px solid var(--border)',
                borderRadius: 12,
                fontSize: 14,
                outline: 'none',
                background: 'var(--bg)',
                color: 'var(--text)',
              }}
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
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
            {mode === 'login' ? 'New to Spliten? ' : 'Already have an account? '}
            <button
              type="button"
              onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
              style={{
                color: '#667eea',
                fontWeight: 800,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>

        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
          }}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

type CreateModalProps = {
  show: boolean;
  title: string;
  category: string;
  mediaType: 'text' | 'image' | 'video' | 'link';
  onTitleChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onMediaTypeChange: (val: 'text' | 'image' | 'video' | 'link') => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export function CreateModal({
  show,
  title,
  category,
  mediaType,
  onTitleChange,
  onCategoryChange,
  onMediaTypeChange,
  onSubmit,
  onClose,
}: CreateModalProps) {
  if (!show) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
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
          backgroundColor: 'var(--card)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          border: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            padding: 20,
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            Create a Post
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ padding: 20 }}>
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 16,
              borderBottom: '1px solid var(--border)',
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
              const Icon = media.icon;
              const active = mediaType === media.type;
              return (
                <button
                  key={media.type}
                  type="button"
                  onClick={() => onMediaTypeChange(media.type as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    backgroundColor: active ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: 8,
                    color: active ? '#667eea' : 'var(--muted)',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} />
                  {media.label}
                </button>
              );
            })}
          </div>

          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 16,
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 14,
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              outline: 'none',
            }}
          >
            {['news', 'general', 'politics', 'work', 'technology', 'lifestyle', 'environment'].map(
              (v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              )
            )}
          </select>

          <textarea
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ask a yes/no question…"
            style={{
              width: '100%',
              padding: 12,
              marginBottom: 16,
              border: '2px solid var(--border)',
              borderRadius: 12,
              fontSize: 14,
              minHeight: 100,
              resize: 'vertical',
              outline: 'none',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
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
              <span style={{ fontSize: 13, fontWeight: 800, color: '#667eea' }}>AI Assistant</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
              ✨ Auto-corrected 2 typos • Suggested category: Politics
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted)' }}>
              💡 Similar question: "Should cars be restricted in urban areas?" (87% match)
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '2px solid var(--border)',
                background: 'transparent',
                color: 'var(--text)',
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
  );
}