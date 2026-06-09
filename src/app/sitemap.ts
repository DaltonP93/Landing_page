import type { MetadataRoute } from 'next';
import products from '@/data/products.json';
import posts from '@/data/blog.json';
import site from '@/data/site.json';

const base = (site.company.siteUrl || 'https://www.tudominio.com.py').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const productUrls = products.flatMap((p) => [
    { url: `${base}/producto/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${base}/contratar/${p.id}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
  ]);
  const blogUrls = (posts as { slug: string; published: boolean; publishedAt: string }[])
    .filter((p) => p.published)
    .map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.publishedAt), changeFrequency: 'monthly' as const, priority: 0.7 }));
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...productUrls,
    ...blogUrls,
  ];
}
