import { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, ArrowLeft, Share2, Bookmark, Tag, Loader2, Copy, Check, Facebook } from 'lucide-react';
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

function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleShare() {
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
      return;
    }
    setOpen(o => !o);
  }

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    setOpen(false);
  }

  const enc = encodeURIComponent;
  const shareLinks = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(title + ' ' + url)}`, color: 'text-green-500',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
    { label: 'X / Twitter', href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, color: 'text-ink-900 dark:text-white',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, color: 'text-blue-600',
      icon: <Facebook className="w-4 h-4" /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleShare} className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-gold-400 hover:text-ink-950 transition-all">
        <Share2 size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-44 rounded-xl bg-white dark:bg-ink-800 shadow-xl border border-ink-100 dark:border-ink-700 py-1 animate-in fade-in slide-in-from-top-2">
          {shareLinks.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
              onClick={() => setOpen(false)}>
              <span className={s.color}>{s.icon}</span>{s.label}
            </a>
          ))}
          <button onClick={copyLink} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors">
            <span className="text-gold-500">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</span>
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}
    </div>
  );
}

function rewriteHtml(html: string): string {
  const decoded = html
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00a0')
    .replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201d').replace(/&ldquo;/g, '\u201c')
    .replace(/&ndash;/g, '\u2013').replace(/&mdash;/g, '\u2014');
  // Convert markdown images ![alt](url) to <img> tags
  const withImgs = decoded.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
    `<img src="${proxyUrl(src)}" alt="${alt}" style="max-width:100%;height:auto;margin:1rem 0;" />`
  );
  // Wrap plain text paragraphs (non-HTML lines) in <p> tags
  if (!withImgs.trim().startsWith('<')) {
    return withImgs.split(/\n{2,}/).map(p => {
      const t = p.trim();
      if (!t) return '';
      if (t.startsWith('<')) return t;
      return `<p>${t.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');
  }
  return withImgs;
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
                  <ShareButton url={`https://zetalent-media.com/news/${article.slug}`} title={getTitle(article)} />
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
