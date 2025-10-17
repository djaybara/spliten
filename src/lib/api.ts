// src/lib/api.ts

export type Question = {
  id: string;
  slug: string;
  title: string;
  category: string;
  labelA: string;
  labelB: string;
  votesACount: number;
  votesBCount: number;
  viewsCount: number;
  createdAt: string;
  author?: { username: string };
};

export async function fetchQuestions(limit = 20): Promise<Question[]> {
  const res = await fetch(`/api/questions?limit=${limit}`, {
    cache: 'no-store', // Important : données fraîches
  });
  
  if (!res.ok) throw new Error('Failed to fetch questions');
  
  const data = await res.json();
  return data.questions || [];
}