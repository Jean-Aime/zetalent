import { useState, useEffect } from 'react';
import { Twitter, Instagram, Facebook, Heart, MessageCircle, Share2, ArrowRight } from 'lucide-react';
import { SectionHeader, Reveal } from '../common/NewsCard';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function proxyUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1') || url.startsWith('/')) return url;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
}

type Tab = 'latest' | 'match' | 'official' | 'fan';

const TABS: { key: Tab; label: string }[] = [
  { key: 'latest',   label: 'Latest Posts' },
  { key: 'match',    label: 'Match Reactions' },
  { key: 'official', label: 'Official Updates' },
  { key: 'fan',      label: 'Fan Reactions' },
];

interface SocialPost {
  id: string;
  platform: string;
  author: string;
  handle: string;
  avatar_url: string;
  content: string;
  image_url: string;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  posted_at: string;
}

function fmt(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function PlatformIcon({ platform }: { platform: string }) {
  const p = platform?.toLowerCase();
  if (p === 'instagram') return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"><Instagram size={14} className="text-white" /></div>;
  if (p === 'facebook')  return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600"><Facebook size={14} className="text-white" /></div>;
  return <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10"><Twitter size={14} className="text-sky-400" /></div>;
}

function AvatarImg({ url, name }: { url: string; name: string }) {
  const [err, setErr] = useState(false);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (!url || err) {
    return (
      <div className="h-10 w-10 rounded-full bg-sky-500/20 flex items-center justify-center text-xs font-bold text-sky-500 shrink-0">
        {initials}
      </div>
    );
  }
  return <img src={proxyUrl(url)} alt={name} onError={() => setErr(true)} className="h-10 w-10 rounded-full object-cover shrink-0" />;
}

function PostCard({ post, index }: { post: SocialPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="flex flex-col bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-700/50 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="p-5 flex-1">
        {/* header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <AvatarImg url={post.avatar_url} name={post.author} />
            <div className="min-w-0">
              <p className="font-semibold text-sm text-ink-900 dark:text-white truncate">{post.author}</p>
              <p className="text-xs text-ink-400 truncate">@{post.handle}</p>
            </div>
          </div>
          <PlatformIcon platform={post.platform} />
        </div>

        {/* content */}
        <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed line-clamp-4">{post.content}</p>

        {/* optional image */}
        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden h-44 bg-ink-100 dark:bg-ink-800">
            <img src={proxyUrl(post.image_url)} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      {/* footer */}
      <div className="px-5 py-3 border-t border-ink-100 dark:border-ink-700/50 flex items-center gap-5">
        <button className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-red-400 transition-colors group">
          <Heart size={13} className="group-hover:fill-red-400 transition-all" />
          <span>{fmt(post.likes)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-sky-400 transition-colors">
          <MessageCircle size={13} />
          <span>{fmt(post.comments)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-sky-400 transition-colors">
          <Share2 size={13} />
          <span>{fmt(post.shares)}</span>
        </button>
        <span className="ml-auto text-xs text-ink-300 dark:text-ink-500">{timeAgo(post.posted_at)}</span>
      </div>
    </motion.div>
  );
}

export function SocialWall() {
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const cat = activeTab === 'latest' ? undefined : activeTab;
    api.getSocialPosts(cat)
      .then(data => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <section className="py-16 bg-ink-50 dark:bg-ink-900/40">
      <div className="container-zt">

        <Reveal>
          <SectionHeader label="Social Wall" title="Voices of the Game" viewAllHref="https://x.com/zetalent" />
        </Reveal>

        <Reveal delay={0.05}>
          {/* tabs */}
          <div className="flex gap-2 flex-wrap mb-8">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-gold-400 text-ink-950'
                    : 'bg-white dark:bg-ink-800 text-ink-500 dark:text-ink-300 border border-ink-200 dark:border-ink-700 hover:border-gold-400 hover:text-gold-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-52 rounded-2xl bg-ink-100 dark:bg-ink-800 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-ink-400 text-sm">No posts yet — add them in the admin panel.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {posts.length > 0 && (
          <Reveal delay={0.1}>
            <div className="flex justify-center mt-10">
              <a
                href="https://x.com/zetalent"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-gold-400 border border-ink-200 dark:border-ink-700 rounded-full px-6 py-2.5 hover:border-gold-400 transition-all"
              >
                View All <ArrowRight size={14} />
              </a>
            </div>
          </Reveal>
        )}

      </div>
    </section>
  );
}
