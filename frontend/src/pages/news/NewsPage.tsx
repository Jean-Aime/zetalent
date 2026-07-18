import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Loader2, Clock, Eye } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function proxyUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return url;
  if (url.startsWith('https://zetalent-media.com') || url.startsWith('http://zetalent-media.com')) return url;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
}

const newsCategories = [
  { slug: 'match-reports', label: 'Match Reports' },
  { slug: 'transfers', label: 'Transfers' },
  { slug: 'interviews', label: 'Interviews' },
  { slug: 'analysis', label: 'Analysis' },
  { slug: 'breaking', label: 'Breaking' },
];

interface Article {
  id: string; slug: string; category: string; sport_slug: string;
  author: string; image_url: string; published_at: string;
  views: number; is_featured: boolean; is_trending: boolean; is_breaking: boolean;
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

export function NewsPage() {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [sports, setSports] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSport, setActiveSport] = useState('all');
  const [sort, setSort] = useState<'latest' | 'trending'>('latest');

  useEffect(() => {
    Promise.all([api.getNews(), api.getSports()])
      .then(([a, s]) => { setArticles(a); setSports(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = [...articles];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(a => getTitle(a).toLowerCase().includes(q) || getExcerpt(a).toLowerCase().includes(q));
    }
    if (activeCategory !== 'all') r = r.filter(a => a.category === activeCategory);
    if (activeSport !== 'all') r = r.filter(a => a.sport_slug === activeSport);
    if (sort === 'latest') r.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    else r.sort((a, b) => (b.views || 0) - (a.views || 0));
    return r;
  }, [articles, search, activeCategory, activeSport, sort]);

  return (
    <div className="pt-8 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Newsroom</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              All the Latest <span className="gradient-text">Stories</span>
            </h1>
            <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-xl mx-auto">
              Match reports, transfers, interviews and more from across women's sports in Rwanda.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search articles..." className="input-zt !pl-12 !pr-12" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory('all')}
                className={`chip transition-all ${activeCategory === 'all' ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                All Categories
              </button>
              {newsCategories.map(cat => (
                <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}
                  className={`chip transition-all ${activeCategory === cat.slug ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveSport('all')}
                  className={`chip transition-all ${activeSport === 'all' ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800/50 text-ink-500 hover:bg-ink-100'}`}>
                  All Sports
                </button>
                {sports.map(s => (
                  <button key={s.id} onClick={() => setActiveSport(s.slug)}
                    className={`chip transition-all ${activeSport === s.slug ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800/50 text-ink-500 hover:bg-ink-100'}`}>
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-ink-400" />
                <select value={sort} onChange={e => setSort(e.target.value as 'latest' | 'trending')}
                  className="text-sm font-medium bg-transparent text-ink-700 dark:text-ink-200 focus:outline-none cursor-pointer">
                  <option value="latest">Latest</option>
                  <option value="trending">Most Viewed</option>
                </select>
              </div>
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article, i) => (
              <Reveal key={article.id} delay={i * 0.04}>
                <Link to={`/news/${article.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl h-full">
                  <div className="relative h-52 overflow-hidden bg-ink-100 dark:bg-ink-800">
                    {article.image_url && (
                      <img src={proxyUrl(article.image_url)} alt={getTitle(article)} loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
                    {article.is_breaking && <span className="absolute top-3 left-3 chip bg-red-500 text-white text-xs animate-pulse">Breaking</span>}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="chip bg-gold-400/15 text-gold-600 dark:text-gold-400 capitalize text-xs">{article.category.replace(/-/g, ' ')}</span>
                      {article.sport_slug && <span className="chip bg-ink-100 dark:bg-ink-700/50 text-ink-500 text-xs capitalize">{article.sport_slug}</span>}
                    </div>
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white leading-snug group-hover:text-gold-400 transition-colors line-clamp-2 mb-2">
                      {getTitle(article)}
                    </h3>
                    <p className="text-sm text-ink-500 dark:text-ink-400 line-clamp-2 flex-1">{getExcerpt(article)}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100 dark:border-ink-700 text-xs text-ink-400">
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1"><Eye size={11} /> {(article.views || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No articles found</h3>
            <p className="text-ink-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
