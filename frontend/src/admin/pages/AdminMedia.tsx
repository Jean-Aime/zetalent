import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, Search, Trash2, Copy, Check, Film, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

type MediaType = 'all' | 'images' | 'videos';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  size: string;
  uploadedAt: string;
}

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MediaType>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    // Build media library from news images + player photos
    Promise.all([api.getAdminNews(), api.getPlayers()])
      .then(([articles, players]) => {
        const newsItems: MediaItem[] = articles
          .filter((a: any) => a.image_url)
          .map((a: any) => ({
            id: `img-${a.id}`,
            filename: `article-${a.slug}.jpg`,
            url: a.image_url,
            type: 'image' as const,
            size: '—',
            uploadedAt: a.published_at || a.created_at || new Date().toISOString(),
          }));

        const playerItems: MediaItem[] = players
          .filter((p: any) => p.photo_url)
          .map((p: any) => ({
            id: `img-player-${p.id}`,
            filename: `player-${p.slug}.jpg`,
            url: p.photo_url,
            type: 'image' as const,
            size: '—',
            uploadedAt: p.created_at || new Date().toISOString(),
          }));

        // Deduplicate by URL
        const seen = new Set<string>();
        const all = [...newsItems, ...playerItems].filter(item => {
          if (seen.has(item.url)) return false;
          seen.add(item.url);
          return true;
        });

        setItems(all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...items];
    if (typeFilter !== 'all') result = result.filter(m => m.type === (typeFilter === 'images' ? 'image' : 'video'));
    if (search) result = result.filter(m => m.filename.toLowerCase().includes(search.toLowerCase()));
    return result.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }, [items, typeFilter, search]);

  const copyUrl = (item: MediaItem) => {
    if (item.url) navigator.clipboard?.writeText(item.url).catch(() => {});
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDelete = (id: string) => {
    setItems(prev => prev.filter(m => m.id !== id));
    setDeleteConfirmId(null);
  };

  const typeTabs: { key: MediaType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'images', label: 'Images' },
    { key: 'videos', label: 'Videos' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Media Library</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{items.length} items · {items.filter(m => m.type === 'image').length} images</p>
        </div>
        <button className="btn-gold text-sm"><Upload className="h-4 w-4" /> Upload Media</button>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="card-zt p-8 border-2 border-dashed border-ink-200 dark:border-ink-700 hover:border-gold-400/50 transition-colors text-center cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400/10">
            <Upload className="h-7 w-7 text-gold-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Drag and drop files here</p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">or click to browse · JPG, PNG, MP4 · Max 50MB</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {typeTabs.map(tab => (
            <button key={tab.key} onClick={() => setTypeFilter(tab.key)}
              className={`chip transition-all ${typeFilter === tab.key ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-700/50 hover:bg-gold-400/10'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="input-zt pl-10" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <motion.div key={item.id} layout className="card-zt overflow-hidden group hover:shadow-lg hover:shadow-ink-900/5 hover:-translate-y-1 transition-all duration-300">
              <div className="relative aspect-square bg-ink-100 dark:bg-ink-700/50 overflow-hidden">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.filename} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-ink-800 to-ink-900">
                    <Film className="h-10 w-10 text-gold-400/60" />
                    <span className="text-xs font-medium text-ink-400">Video</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => copyUrl(item)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-ink-800 hover:bg-white transition-colors" title="Copy URL">
                    {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setDeleteConfirmId(item.id)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 text-red-500 hover:bg-white transition-colors" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{item.type}</span>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-ink-800 dark:text-ink-100 truncate" title={item.filename}>{item.filename}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-ink-400 dark:text-ink-500">{item.size}</span>
                  <span className="text-[10px] text-ink-400 dark:text-ink-500">
                    {new Date(item.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><ImageIcon className="h-7 w-7 text-ink-400" /></div>
          <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No media found</p>
          <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">Upload media or add images via news articles and player profiles</p>
        </div>
      )}

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card-zt p-6 max-w-sm w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Remove from Library?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                "{items.find(m => m.id === deleteConfirmId)?.filename}" will be removed from this view.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={() => confirmDelete(deleteConfirmId)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
