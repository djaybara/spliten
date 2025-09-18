'use client';

import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
  top: number;
  height: number;
  onClick: () => void;
};

export default function CreatePostStickyButton({ top, height, onClick }: Props) {
  return (
    <div
      className="js-create-post-sticky"
      style={{
        position: 'sticky',
        top,
        zIndex: 60,
      }}
    >
      <button
        onClick={onClick}
        aria-label="Create a new post"
        style={{
          width: '100%',
          height,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 24,
          color: 'white',
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Plus size={18} aria-hidden />
        Create Post
      </button>
    </div>
  );
}
