import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, ArrowLeft, Share2, Bookmark, Tag, Loader2 } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function proxyUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return url;
  if (url.startsWith('https://zetalent-media.com') || url.startsWith('http://zetalent-media.com')) return url;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
}

interface Article {
  id: string; slug: string; category: string; sport_slug: string;
  author: string; author_avatar: string; image_url: string; image_alt: string;
  published_at: string; read_time: number; views: number;
  is_featured: boolean; is_trending: boolean; is_breaking: boolean;
  tags: string[];
  translations: Record<string, { title: string; excerpt: string; body: string }>;
}

function getBestLocale(a: Article) {
  const locales = ['en', 'fr', 'rw'] as const;
  return locales.find(l => a.translations?.[l]?.title?.trim()) ?? 'en';
}
function getTitle(a: Article) { const l = getBestLocale(a); return a.translations?.[l]?.title || a.slug; }
function getExcerpt(a: Article) {
  const l = getBestLocale(a);
  const raw = a.translations?.[l]?.excerpt || '';
  return raw.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}
function getBody(a: Article) { const l = getBestLocale(a); return a.translations?.[l]?.body || ''; }

const OLD_SITE = 'https://zetalent-media.com';

function rewriteHtml(html: string): string {
  // Decode HTML entities if double-encoded
  const decoded = html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00a0')
    .replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201d').replace(/&ldquo;/g, '\u201c')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014');
  return decoded;
}

export function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);
  const [related, setRelated] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) return;
    Promise.all([api.getArticleBySlug(slug), api.getNews()])
      .then(([found, all]) => {
        setArticle(found);
        setRelated(all.filter((a: Article) => a.id !== found.id && a.sport_slug === found.sport_slug).slice(0, 3));
      })
      .catch(() => setArticle(null));
  }, [slug]);

  if (article === undefined) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>;
  }
  if (article === null) return <Navigate to="/news" replace />;

  const body = getBody(article);

  return (
    <article className="pb-16">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] overflow-hidden bg-ink-950">
        {article.image_url && <img src={proxyUrl(article.image_url)} alt={article.image_alt} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-zt w-full pb-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-3xl">
              <Link to="/news" className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-gold-400 transition-colors mb-4">
                <ArrowLeft size={16} /> Back to News
              </Link>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="chip bg-gold-400 text-ink-950 capitalize">{article.category.replace(/-/g, ' ')}</span>
                {article.sport_slug && <span className="chip bg-white/10 text-white backdrop-blur border border-white/20 capitalize">{article.sport_slug}</span>}
                {article.is_breaking && <span className="chip bg-red-500 text-white animate-pulse">Breaking</span>}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
                {getTitle(article)}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-zt">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 mt-10">
          <div>
            {/* Meta */}
            <Reveal>
              <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-ink-100 dark:border-ink-700">
                <div className="flex items-center gap-3">
                  {article.author_avatar && <img src={proxyUrl(article.author_avatar)} alt={article.author} className="h-12 w-12 rounded-full object-cover" />}
                  <div>
                    <p className="font-semibold text-ink-900 dark:text-white">{article.author}</p>
                    <div className="flex items-center gap-3 text-xs text-ink-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      {article.read_time && <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time} min read</span>}
                      <span className="flex items-center gap-1"><Eye size={12} /> {(article.views || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-gold-400 hover:text-ink-950 transition-all"><Share2 size={16} /></button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-gold-400 hover:text-ink-950 transition-all"><Bookmark size={16} /></button>
                </div>
              </div>
            </Reveal>

            {/* Lead */}
            {getExcerpt(article) && (
              <Reveal delay={0.1}>
                <p className="font-display text-xl sm:text-2xl text-ink-800 dark:text-ink-100 leading-relaxed mb-8 font-medium italic border-l-4 border-gold-400 pl-5">
                  {getExcerpt(article)}
                </p>
              </Reveal>
            )}

            {/* Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {body.trim() ? (
                <div dangerouslySetInnerHTML={{ __html: rewriteHtml(body) }} />
              ) : (
                <p className="text-ink-400 italic">Full article content coming soon.</p>
              )}
            </div>

            {/* Tags */}
            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <Reveal>
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-ink-100 dark:border-ink-700">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-500"><Tag size={14} /> Tags:</span>
                  {article.tags.map(tag => (
                    <span key={tag} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300">#{tag}</span>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="mt-12">
                <Reveal><h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-6">Related Stories</h3></Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {related.map((a, i) => (
                    <Reveal key={a.id} delay={i * 0.1}>
                      <Link to={`/news/${a.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift">
                        {a.image_url && <img src={proxyUrl(a.image_url)} alt={getTitle(a)} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
                        <div className="p-4">
                          <h4 className="font-semibold text-sm text-ink-800 dark:text-ink-100 group-hover:text-gold-400 transition-colors line-clamp-2">{getTitle(a)}</h4>
                          <p className="text-xs text-ink-400 mt-1">{new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card-zt p-6 bg-gradient-to-br from-gold-400/10 to-transparent">
              <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white mb-2">Newsletter</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-4">Get the latest stories delivered to your inbox.</p>
              <Link to="/contact" className="btn-gold w-full text-sm">Subscribe Now</Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
