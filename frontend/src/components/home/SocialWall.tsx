import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Instagram, Youtube, Facebook, Heart, MessageCircle, Share2 } from 'lucide-react';
import { SectionHeader, Reveal } from '../common/NewsCard';
import { api } from '../../lib/api';

interface SocialPost {
  id: string; platform: string; author: string; handle: string;
  avatar_url: string; content: string; image_url: string;
  likes: number; comments: number; shares: number;
  category: string; posted_at: string;
}

const platformMeta: Record<string, { icon: typeof Twitter; color: string; bg: string }> = {
  twitter:   { icon: Twitter,   color: 'text-sky-400',  bg: 'bg-sky-500/10' },
  instagram: { icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  youtube:   { icon: Youtube,   color: 'text-red-500',  bg: 'bg-red-500/10' },
  facebook:  { icon: Facebook,  color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

const categories = [
  { key: 'all',      label: 'All Posts' },
  { key: 'latest',   label: 'Latest' },
  { key: 'match',    label: 'Match Reactions' },
  { key: 'official', label: 'Official' },
  { key: 'fan',      label: 'Fan Reactions' },
] as const;

type CategoryKey = typeof categories[number]['key'];

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : `${n}`;
}

export function SocialWall() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  useEffect(() => {
    api.getSocialPosts()
      .then(data => setPosts(data))
      .catch(() => {});
  }, []);

  const filtered = activeCategory === 'all'
    ? posts.slice(0, 6)
    : posts.filter(p => p.category === activeCategory).slice(0, 6);

  if (!posts.length) return null;

  return (
    <section className="py-16 bg-ink-50 dark:bg-ink-900/40">
      <div className="container-zt">
        <Reveal>
          <SectionHeader label="Social Wall" title="Voices of the Game" viewAllHref="/admin/social" />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                className={`chip whitespace-nowrap transition-all ${activeCategory === cat.key ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post, i) => {
            const meta = platformMeta[post.platform] ?? platformMeta.twitter;
            const Icon = meta.icon;
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-zt p-5 hover-lift hover:shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  {post.avatar_url ? (
                    <img src={post.avatar_url} alt={post.author} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center font-bold text-ink-500 text-sm">
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink-900 dark:text-white text-sm truncate">{post.author}</p>
                    <p className="text-xs text-ink-400 truncate">{post.handle}</p>
                  </div>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
                    <Icon size={16} />
                  </span>
                </div>
                <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed line-clamp-4">{post.content}</p>
                {post.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden h-44 bg-ink-100 dark:bg-ink-700">
                    <img src={post.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-ink-100 dark:border-ink-700 flex items-center gap-4 text-xs text-ink-400">
                  <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
                    <Heart size={14} /> {formatCount(post.likes)}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                    <MessageCircle size={14} /> {formatCount(post.comments)}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-gold-400 transition-colors cursor-pointer">
                    <Share2 size={14} /> {formatCount(post.shares)}
                  </span>
                  <span className="ml-auto text-ink-400">
                    {post.posted_at ? new Date(post.posted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
