import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2, Plus, Pin, PinOff, Edit3, Trash2, X, Check,
  Heart, MessageCircle, Repeat2, Image as ImageIcon,
  Twitter, Instagram, Youtube, Facebook, Loader2, AlertCircle,
} from 'lucide-react';
import { api } from '../../lib/api';

type Platform = 'twitter' | 'instagram' | 'youtube' | 'facebook' | 'tiktok';
type Category = 'latest' | 'fan' | 'match' | 'official';
type PlatformFilter = 'all' | Platform;

interface SocialPost {
  id: string; platform: Platform; author: string; handle: string;
  avatar_url: string; content: string; image_url: string;
  likes: number; comments: number; shares: number;
  category: Category; posted_at: string;
}
interface FormState {
  platform: string; author: string; handle: string; content: string;
  category: string; image_url: string; avatar_url: string;
}

const platformConfig: Record<Platform, { label: string; badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  twitter: { label: 'Twitter', badge: 'bg-sky-500/10 text-sky-500', icon: Twitter },
  instagram: { label: 'Instagram', badge: 'bg-pink-500/10 text-pink-500', icon: Instagram },
  youtube: { label: 'YouTube', badge: 'bg-red-500/10 text-red-500', icon: Youtube },
  facebook: { label: 'Facebook', badge: 'bg-blue-500/10 text-blue-500', icon: Facebook },
  tiktok: { label: 'TikTok', badge: 'bg-ink-500/10 text-ink-500', icon: Share2 },
};

const categoryConfig: Record<Category, string> = {
  latest: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  fan: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  match: 'bg-green-500/10 text-green-600 dark:text-green-400',
  official: 'bg-gold-400/15 text-gold-500',
};

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.0', '')}k` : `${n}`);

const emptyForm: FormState = { platform: 'twitter', author: '', handle: '', content: '', category: 'latest', image_url: '', avatar_url: '' };

export function AdminSocial() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const rows = await api.getSocialPosts();
      setPosts(rows);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    const r = platformFilter === 'all' ? [...posts] : posts.filter(p => p.platform === platformFilter);
    return r.sort((a, b) => {
      const ap = pinnedIds.has(a.id) ? 1 : 0;
      const bp = pinnedIds.has(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.likes - a.likes;
    });
  }, [posts, platformFilter, pinnedIds]);

  const tabs: { key: PlatformFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'twitter', label: 'Twitter' },
    { key: 'instagram', label: 'Instagram' }, { key: 'youtube', label: 'YouTube' },
    { key: 'facebook', label: 'Facebook' },
  ];

  const countFor = (key: PlatformFilter) => key === 'all' ? posts.length : posts.filter(p => p.platform === key).length;

  const togglePin = (id: string) => {
    setPinnedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData(emptyForm); };
  const startEdit = (p: SocialPost) => {
    setEditingId(p.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ platform: p.platform, author: p.author, handle: p.handle || '', content: p.content, category: p.category, image_url: p.image_url || '', avatar_url: p.avatar_url || '' });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.author || !formData.content) return;
    setSaving(true);
    try {
      const payload = { platform: formData.platform, author: formData.author, handle: formData.handle, content: formData.content, category: formData.category, image_url: formData.image_url || null, avatar_url: formData.avatar_url || null };
      if (editingId) {
        await api.updateSocialPost(editingId, payload);
      } else {
        await api.createSocialPost(payload);
      }
      await load(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteSocialPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setPinnedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  const PostForm = () => (
    <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Post' : 'New Social Post'}</h3>
        <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Platform</label>
          <select value={formData.platform} onChange={e => update('platform', e.target.value)} className="input-zt">
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Category</label>
          <select value={formData.category} onChange={e => update('category', e.target.value)} className="input-zt">
            <option value="latest">Latest</option>
            <option value="fan">Fan</option>
            <option value="match">Match</option>
            <option value="official">Official</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Author</label>
          <input type="text" value={formData.author} onChange={e => update('author', e.target.value)} placeholder="e.g. ZT Media" className="input-zt" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Handle</label>
          <input type="text" value={formData.handle} onChange={e => update('handle', e.target.value)} placeholder="e.g. @ztmedia_rw" className="input-zt" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Content</label>
        <textarea value={formData.content} onChange={e => update('content', e.target.value)} rows={3} placeholder="Write your post content…" className="input-zt resize-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Image URL (optional)</label>
          <div className="relative">
            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input type="text" value={formData.image_url} onChange={e => update('image_url', e.target.value)} placeholder="https://…" className="input-zt pl-10" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Avatar URL (optional)</label>
          <input type="text" value={formData.avatar_url} onChange={e => update('avatar_url', e.target.value)} placeholder="https://…" className="input-zt" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
        <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
        <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {editingId ? 'Update Post' : 'Publish Post'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Social Wall</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{posts.length} posts · {pinnedIds.size} pinned</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> New Post</button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <AnimatePresence>
        {(showForm || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <PostForm />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setPlatformFilter(tab.key)}
            className={`chip transition-all ${platformFilter === tab.key ? 'bg-gold-400 text-ink-950 border border-gold-400' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-700/50 hover:bg-gold-400/10'}`}>
            {tab.label}
            <span className={`ml-1 rounded-full px-1.5 text-[10px] font-bold ${platformFilter === tab.key ? 'bg-ink-950/15' : 'bg-ink-100 dark:bg-ink-700/60'}`}>
              {countFor(tab.key)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(post => {
            const pc = platformConfig[post.platform] || platformConfig.twitter;
            const PIcon = pc.icon;
            const isPinned = pinnedIds.has(post.id);
            return (
              <div key={post.id} className={`bg-white dark:bg-ink-800 rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:shadow-ink-900/5 ${isPinned ? 'border-gold-400 shadow-md shadow-gold-400/10' : 'border-ink-100 dark:border-ink-700/50'}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`chip ${pc.badge}`}><PIcon className="h-3.5 w-3.5" /> {pc.label}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePin(post.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isPinned ? 'bg-gold-400/15 text-gold-500' : 'text-ink-500 hover:bg-gold-400/10 hover:text-gold-500'}`}>
                      {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => editingId === post.id ? cancelForm() : startEdit(post)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmId(post.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {post.avatar_url ? (
                    <img src={post.avatar_url} alt={post.author} className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-200 dark:bg-ink-700 font-bold text-ink-500 text-sm">
                      {post.author.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900 dark:text-white truncate">{post.author}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500 truncate">{post.handle}</p>
                  </div>
                </div>
                <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed mb-3 line-clamp-4">{post.content}</p>
                {post.image_url && (
                  <div className="mb-3 overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-700/40">
                    <img src={post.image_url} alt="" className="w-full max-h-52 object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-ink-500 dark:text-ink-400 mb-3">
                  <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {formatCount(post.likes)}</span>
                  <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {formatCount(post.comments)}</span>
                  <span className="inline-flex items-center gap-1.5"><Repeat2 className="h-3.5 w-3.5" /> {formatCount(post.shares)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-ink-100 dark:border-ink-700/40">
                  <span className="text-xs text-ink-400 dark:text-ink-500">
                    {new Date(post.posted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className={`chip ${categoryConfig[post.category] || ''} capitalize`}>{post.category}</span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Share2 className="h-7 w-7 text-ink-400" /></div>
          <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No posts found</p>
        </div>
      )}

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl p-6 max-w-sm w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Post?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This social post will be permanently removed. This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={() => confirmDelete(deleteConfirmId)} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
