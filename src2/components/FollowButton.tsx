'use client';
import React from 'react';

export default function FollowButton({
  questionId,
  isFollowing,
  onToggle,
}: {
  questionId: number;
  isFollowing: boolean;
  onToggle: (questionId: number) => void;
}) {
  return (
    <button
      onClick={() => onToggle(questionId)}
      className="clickable"
      style={{
        padding: '6px 10px',
        borderRadius: 8,
        border: 'none',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: 12,
        fontWeight: 700,
      }}
      aria-pressed={isFollowing}
      title={isFollowing ? 'Unfollow' : 'Follow'}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}