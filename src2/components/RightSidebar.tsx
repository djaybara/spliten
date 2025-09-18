// src/components/RightSidebar.tsx
'use client';
import { TrendingUp, Bot, Lightbulb, CheckCircle, Eye, Plus } from 'lucide-react';

export default function RightSidebar({
  width = 320,
  isLoggedIn = false,
  onCreateClick
}: {
  width?: number;
  isLoggedIn?: boolean;
  onCreateClick?: () => void;
}) {
  const trending = [
    { topic: 'Climate Policy', change: '+234%', count: '1.2k discussions' },
    { topic: 'AI Regulation', change: '+89%', count: '892 discussions' },
    { topic: 'Work-Life Balance', change: '+45%', count: '567 discussions' }
  ];

  return (
    <aside style={{ width }}>
      <button
        onClick={onCreateClick}
        style={{
          width: '100%', padding: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none', borderRadius: '24px', color: 'white',
          fontSize: '15px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(102,126,234,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
        }}
      >
        <Plus size={18} />
        {isLoggedIn ? 'Create Post' : 'Sign in to Post'}
      </button>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Trending Now</h3>
          <TrendingUp size={18} color="#667eea" />
        </div>
        {trending.map((t, i) => (
          <div key={i} style={{ padding: '12px 0', borderBottom: i < trending.length - 1 ? '1px solid #F0F3F4' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{t.topic}</span>
              <span style={{ fontSize: '12px', color: '#00C851', fontWeight: 600 }}>{t.change}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#8899A6' }}>{t.count}</span>
          </div>
        ))}
      </div>

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
            “Economic impact on small businesses” and “accessibility concerns” are under-discussed in current debates.
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

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>People Also Ask</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Should public transport be free?', 'Are electric cars really better?', 'Should bikes have dedicated lanes?'].map((q, i) => (
            <a key={i} href="#" style={{
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
  );
}
