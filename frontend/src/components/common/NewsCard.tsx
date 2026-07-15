import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatRelative } from '../../utils/format';

// Works with both API response shape and any legacy shape
export interface AnyArticle {
  id: string;
  slug: string;
  // API fields
  image_url?: string;
  published_at?: string;
  sport_slug?: string;
  author?: string;
  author_avatar?: string;
  views?: number;
  is_trending?: boolean;
  is_breaking?: boolean;
  is_featured?: boolean;
  category?: string;
  translations?: Record<string, { title: string; excerpt: string; body: string }>;
  // Legacy seed fields
  image?: string;
  imageAlt?: string;
  publishedAt?: string;
  sport?: string;
  trending?: boolean;
  breaking?: boolean;
  featured?: boolean;
  authorAvatar?: string;
  title?: { en: string; fr?: string; rw?: string } | string;
  excerpt?: { en: string; fr?: string; rw?: string } | string;
}

export function getArticleImage(a: AnyArticle): string {
  return a.image_url || a.image || '';
}
export function getArticleTitle(a: AnyArticle): string {
  if (a.translations?.en?.title) return a.translations.en.title;
  if (typeof a.title === 'string') return a.title;
  if (a.title && typeof a.title === 'object') return (a.title as any).en || '';
  return a.slug;
}
export function getArticleExcerpt(a: AnyArticle): string {
  if (a.translations?.en?.excerpt) return a.translations.en.excerpt;
  if (typeof a.excerpt === 'string') return a.excerpt;
  if (a.excerpt && typeof a.excerpt === 'object') return (a.excerpt as any).en || '';
  return '';
}
export function getArticleDate(a: AnyArticle): string {
  return a.published_at || a.publishedAt || '';
}
export function getArticleAuthor(a: AnyArticle): string {
  return a.author || 'ZT Media';
}
export function getArticleAuthorAvatar(a: AnyArticle): string {
  return a.author_avatar || a.authorAvatar || '';
}
export function getArticleViews(a: AnyArticle): number {
  return a.views || 0;
}
export function isArticleTrending(a: AnyArticle): boolean {
  return !!(a.is_trending || a.trending);
}
export function getArticleCategory(a: AnyArticle): string {
  return a.category || '';
}

interface NewsCardProps {
  article: AnyArticle;
  variant?: 'default' | 'compact' | 'horizontal' | 'minimal';
  index?: number;
}

export function NewsCard({ article, variant = 'default', index = 0 }: NewsCardProps) {
  const title    = getArticleTitle(article);
  const excerpt  = getArticleExcerpt(article);
  const image    = getArticleImage(article);
  const date     = getArticleDate(article);
  const author   = getArticleAuthor(article);
  const avatar   = getArticleAuthorAvatar(article);
  const views    = getArticleViews(article);
  const trending = isArticleTrending(article);
  const category = getArticleCategory(article);

  if (variant === 'minimal') {
    return (
      <Link to={`/news/${article.slug}`} className="group flex items-start gap-3 py-3">
        <span className="text-2xl font-display font-bold text-gold-400/60 leading-none w-8 shrink-0">
          {(index + 1).toString().padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100 leading-snug group-hover:text-gold-400 transition-colors duration-200 line-clamp-2">{title}</h4>
          <p className="text-xs text-ink-400 mt-1">{date ? formatRelative(date) : ''}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/news/${article.slug}`} className="group flex gap-3 card-zt p-3 hover-lift hover:shadow-lg">
        <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-700">
          {image && <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />}
        </div>
        <div className="flex-1 min-w-0">
          {category && <span className="text-[10px] font-bold uppercase tracking-wider text-gold-500">{category.replace(/-/g, ' ')}</span>}
          <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100 leading-snug mt-1 group-hover:text-gold-400 transition-colors line-clamp-2">{title}</h4>
          <p className="text-xs text-ink-400 mt-1">{date ? formatRelative(date) : ''}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/news/${article.slug}`} className="group grid grid-cols-[200px_1fr] gap-5 card-zt overflow-hidden hover-lift hover:shadow-xl">
        <div className="h-full min-h-[140px] overflow-hidden bg-ink-100 dark:bg-ink-700">
          {image && <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        </div>
        <div className="py-4 pr-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            {category && <span className="chip bg-gold-400/15 text-gold-500 capitalize">{category.replace(/-/g, ' ')}</span>}
            {trending && <span className="chip bg-red-500/15 text-red-500">Trending</span>}
          </div>
          <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white leading-snug group-hover:text-gold-400 transition-colors line-clamp-2">{title}</h3>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-2 line-clamp-2">{excerpt}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-ink-400">
            <span>{author}</span>
            {date && <><span>•</span><span>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></>}
            {views > 0 && <><span>•</span><span>{views.toLocaleString()} views</span></>}
          </div>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link to={`/news/${article.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl">
      <div className="relative h-52 overflow-hidden bg-ink-100 dark:bg-ink-700">
        {image && <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {category && <span className="chip bg-gold-400 text-ink-950 capitalize">{category.replace(/-/g, ' ')}</span>}
          {trending && <span className="chip bg-red-500 text-white">Trending</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white leading-snug group-hover:text-gold-400 transition-colors duration-200 line-clamp-2">{title}</h3>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-2 line-clamp-2 flex-1">{excerpt}</p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-ink-100 dark:border-ink-700">
          {avatar && <img src={avatar} alt={author} loading="lazy" className="h-8 w-8 rounded-full object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200 truncate">{author}</p>
            {date && <p className="text-xs text-ink-400">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
          </div>
          <ArrowRight size={14} className="group-hover:translate-x-1 group-hover:text-gold-400 transition-all text-ink-400" />
        </div>
      </div>
    </Link>
  );
}

interface SectionHeaderProps {
  label: string;
  title: string;
  viewAllHref?: string;
}

export function SectionHeader({ label, title, viewAllHref }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="gold-divider" />
          <span className="section-label">{label}</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">{title}</h2>
      </div>
      {viewAllHref && (
        <Link to={viewAllHref} className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-gold-400 transition-colors group">
          View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
