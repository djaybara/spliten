import type { MetadataRoute } from 'next';
import { listQuestionSlugsClean } from '@/data/questionsIndex';

export const revalidate = 60; // recalcule au max toutes les 60s

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/ask`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const slugs = await listQuestionSlugsClean();
  for (const s of slugs) {
    if (!s) continue;
    urls.push({
      url: `${base}/questions/${s}`,
      changeFrequency: 'hourly',
      priority: 0.8,
    });
  }

  return urls;
}
