'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuestionCard from '@/components/QuestionCard';
import CategoriesPanel from '@/components/CategoriesPanel';
import { TrendingUp, Home as HomeIcon, Newspaper } from 'lucide-react';

type Q = {
  id: number; title: string; category: string; author: string; timeAgo: string;
  views: number; pour: number; contre: number; upvotes: number; downvotes: number;
  comments: number; badges: Array<'trending'|'controversial'|'new'|'top'>; news?: boolean;
};

const DATA: Q[] = [/* réutilise ton seed/SSR ici ou fetch backend */];

function scorePopular(x: Q) {
  // Ranking "Popular" distinct:
  // - Audience (oui+non)
  // - Vues
  // - Engagement (up-down + comments)
  // - Équilibre (plus c’est équilibré, plus c’est intéressant)
  // - Petit bonus badges
  const audience = (x.pour + x.contre) * 0.35;
  const views = x.views * 0.006;
  const engagement = (x.upvotes - x.downvotes) + x.comments * 0.7;
  const balance = (() => {
    const tot = x.pour + x.contre; if (!tot) return 0;
    const p = Math.min(x.pour, x.contre) / Math.max(1, Math.max(x.pour, x.contre));
    return p * 20; // max +20
  })();
  const badge = (x.badges.includes('trending') ? 4 : 0) + (x.badges.includes('top') ? 2 : 0);
  return audience + views + engagement + balance + badge;
}

export default function PopularPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<'all'|string>('all');

  const list = useMemo(() => {
    const filtered = DATA.filter(q => selectedCategory==='all' || q.category===selectedCategory);
    return filtered.sort((a,b)=> scorePopular(b)-scorePopular(a));
  }, [selectedCategory]);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 20, display: 'flex', gap: 20 }}>
      <aside style={{ width: 280 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, marginBottom: 16 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <button onClick={()=>router.push('/')} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8 }}>
              <HomeIcon size={16}/> Home
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:'var(--pill)', border:'1px solid var(--border)', borderRadius:8, fontWeight:700 }}>
              <TrendingUp size={16}/> Popular
            </button>
            <button onClick={()=>router.push('/')} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', border:'1px solid var(--border)', borderRadius:8 }}>
              <Newspaper size={16}/> News
            </button>
          </div>
        </div>
<CategoriesPanel
  selected={selectedCategory as any}
  onSelect={(val) => {
    setSelectedCategory(val);
    setSelectedSort('hot');   // on revient sur l’onglet large
    setSearchQuery('');       // on efface une recherche éventuelle
    setVisibleCount(10);      // on reset la pagination
  }}
  title="Categories"
/>


      </aside>

      <main style={{ flex:1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Popular</h1>
        {list.map(q=>(
          <QuestionCard
            key={q.id}
            id={q.id}
            slugHref={`/questions/${q.id}`}
            title={q.title}
            category={q.category}
            author={q.author}
            timeAgo={q.timeAgo}
            views={q.views}
            pour={q.pour}
            contre={q.contre}
            badges={q.badges as any}
            showDescription={false}
            showSources={false}
            commentsCount={q.comments}
            onCommentsClick={()=>router.push(`/questions/${q.id}`)}
            onCardClick={()=>router.push(`/questions/${q.id}`)}
          />
        ))}
      </main>
    </div>
  );
}
