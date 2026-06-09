import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import posts from '@/data/blog.json';
import site from '@/data/site.json';
import { renderMarkdown } from '@/lib/markdown';

interface Post {
  id: string; slug: string; title: string; excerpt: string; content: string;
  author: string; coverImage: string; tags: string[]; published: boolean;
  publishedAt: string; seoDescription: string;
}

const all = posts as Post[];

export function generateStaticParams() {
  return all.filter((p) => p.published).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = all.find((p) => p.slug === slug);
  if (!post) return { title: 'Artículo no encontrado' };
  return {
    title: `${post.title} | ${site.company.name}`,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = all.find((p) => p.slug === slug);
  if (!post || !post.published) notFound();

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.publishedAt,
    publisher: { '@type': 'Organization', name: site.company.name },
  };

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      <div className="orb orb-purple w-[350px] h-[350px] top-[3%] right-[8%] animate-float-slower opacity-20" />
      <div className="absolute inset-0 scifi-grid opacity-20" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <article className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        <a href="/blog" className="inline-flex items-center gap-2 text-sm text-muted/60 hover:text-neon-blue transition-colors mb-8"><ArrowLeft className="w-4 h-4" /> Volver al blog</a>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted/50 mb-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.publishedAt).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
          {post.tags.map((t) => <span key={t} className="px-2 py-0.5 rounded-full bg-white/5">{t}</span>)}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold glow-text leading-tight mb-6">{post.title}</h1>

        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden border border-border/20 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        <div className="prose-invert text-[15px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />

        <div className="mt-12 pt-8 border-t border-border/20 text-center">
          <p className="text-sm text-muted/60 mb-4">¿Listo para digitalizar tu empresa?</p>
          <a href="/#soluciones" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold text-sm shadow-[0_0_25px_rgba(124,58,237,0.3)]">Ver soluciones</a>
        </div>
      </article>
    </div>
  );
}
