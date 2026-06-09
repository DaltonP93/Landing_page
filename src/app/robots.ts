import type { MetadataRoute } from 'next';
import site from '@/data/site.json';

const base = (site.company.siteUrl || 'https://www.tudominio.com.py').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
