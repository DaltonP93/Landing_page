import type { MetadataRoute } from 'next';
import products from '@/data/products.json';
import site from '@/data/site.json';

const base = (site.company.siteUrl || 'https://www.tudominio.com.py').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const productUrls = products.flatMap((p) => [
    { url: `${base}/producto/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/contratar/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
  ]);
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    ...productUrls,
  ];
}
