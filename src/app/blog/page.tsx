import type { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import posts from '@/data/blog.json';
import site from '@/data/site.json';

export const metadata: Metadata = {
  title: `Blog — ${site.company.name}`,
  description: `Ideas, guías y novedades sobre transformación digital para empresas en Paraguay.`,
};

interface Post {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; coverImage: string; tags: string[]; published: boolean;
  publishedAt: string; seoDescription: string;
}

export default function BlogPage() {
  const published = (posts as Post[])
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="orb orb-purple w-[400px] h-[400px] top-[5%] right-[10%] animate-float-slower opacity-25" />
      <div className="absolute inset-0 scifi-grid opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors mb-10"><ArrowLeft className="w-4 h-4" /> {site.company.name}</a>

        <h1 className="text-4xl font-bold glow-text mb-2">Blog del CEO</h1>
        <p className="text-muted/60 mb-12">Ideas y novedades sobre tecnología y negocios en Paraguay.</p>

        {published.length === 0 ? (
          <p className="text-muted/50 text-sm">Pronto publicaremos contenido.</p>
        ) : (
          <div className="space-y-5">
            {published.map((p) => (
              <a key={p.id} href={`/blog/${p.slug}`} className="block rounded-2xl glass neon-border p-6 hover:shadow-[0_0_25px_rgba(0,212,255,0.06)] transition-all group">
                <div className="flex items-center gap-3 text-[11px] text-muted/50 mb-2">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(p.publishedAt).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {p.tags.slice(0, 2).map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-white/5">{t}</span>)}
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-neon-blue transition-colors">{p.title}</h2>
                <p className="text-[13px] text-muted/60 mt-2 leading-relaxed">{p.excerpt}</p>
                <span className="inline-flex items-center gap-1 text-xs text-neon-blue mt-4">Leer más <ArrowRight className="w-3 h-3" /></span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
