import { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Plus, Search, Edit3, Trash2, X, Check,
  ChevronLeft, ChevronRight, TrendingUp, Star, Zap, Loader2, AlertCircle,
  FileText, Image as ImageIcon, Globe, Settings2, Bold, Italic,
  Link as LinkIcon, Upload, Eye,
} from 'lucide-react';
import { api, uploadImage } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function sanitizeImageUrl(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes('google.') && parsed.pathname === '/imgres') {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    }
    for (const param of ['imgurl', 'direct_url', 'image_url', 'src']) {
      const v = parsed.searchParams.get(param);
      if (v && /^https?:\/\/.+\.(jpe?g|png|webp|gif|svg|avif)/i.test(v)) return decodeURIComponent(v);
    }
  } catch { /* not a valid URL */ }
  return trimmed;
}

function proxyUrl(url: string): string {
  if (!url) return url;
  const clean = sanitizeImageUrl(url);
  if (clean.startsWith('http://localhost') || clean.startsWith('http://127.0.0.1') || clean.startsWith('/')) return clean;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(clean)}`;
}

type Locale = 'en' | 'fr' | 'rw';

interface Article {
  id: string; slug: string; category: string; sport_slug: string;
  author: string; image_url: string; image_alt: string;
  published_at: string; is_featured: boolean;
  is_trending: boolean; is_breaking: boolean; status: string;
  views: number;
  translations: Record<Locale, { title: string; excerpt: string; body: string }>;
}

interface FormState {
  slug: string; category: string; sport_slug: string; author: string;
  image_url: string; status: string;
  is_featured: boolean; is_trending: boolean; is_breaking: boolean;
  translations: Record<Locale, { title: string; excerpt: string; body: string }>;
}

const emptyTranslations = (): Record<Locale, { title: string; excerpt: string; body: string }> => ({
  en: { title: '', excerpt: '', body: '' },
  fr: { title: '', excerpt: '', body: '' },
  rw: { title: '', excerpt: '', body: '' },
});

const emptyForm = (): FormState => ({
  slug: '', category: 'match-reports', sport_slug: 'football', author: 'Admin',
  image_url: '', status: 'published', is_featured: false, is_trending: false, is_breaking: false,
  translations: emptyTranslations(),
});

const newsCategories = [
  { slug: 'match-reports', label: 'Match Reports' },
  { slug: 'transfers', label: 'Transfers' },
  { slug: 'interviews', label: 'Interviews' },
  { slug: 'analysis', label: 'Analysis' },
  { slug: 'breaking', label: 'Breaking' },
];

const locales: { key: Locale; label: string }[] = [
  { key: 'en', label: 'EN' }, { key: 'fr', label: 'FR' }, { key: 'rw', label: 'RW' },
];

export function AdminNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sports, setSports] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const perPage = 8;

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true); setError(null);
      const [a, s] = await Promise.all([api.getAdminNews(), api.getSports()]);
      setArticles(a); setSports(s);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let r = [...articles];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(a => {
        const t = a.translations;
        const title = t?.en?.title || t?.fr?.title || t?.rw?.title || a.slug;
        return title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
      });
    }
    if (categoryFilter !== 'all') r = r.filter(a => a.category === categoryFilter);
    if (statusFilter !== 'all') r = r.filter(a => a.status === statusFilter);
    return r;
  }, [articles, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageArticles = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getTitle = (a: Article) => a.translations?.en?.title || a.translations?.fr?.title || a.translations?.rw?.title || a.slug;

  const startEdit = (a: Article) => {
    setEditingId(a.id);
    setDeleteConfirmId(null);
  };
  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (data: FormState): Promise<void> => {
    if (!editingId) return;
    setSaving(true);
    try {
      await api.updateArticle(editingId, data);
      await loadAll();
      setEditingId(null);
    } catch (e: any) {
      setSaving(false);
      throw e;
    }
    setSaving(false);
  };

  const startAdd = () => setShowAddModal(true);

  const saveAdd = async (data: FormState): Promise<void> => {
    setSaving(true);
    try {
      const titleForSlug = data.translations.en.title ||
        data.translations.fr.title ||
        data.translations.rw.title;
      const slug = titleForSlug
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      await api.createArticle({ ...data, slug });
      await loadAll();
      setShowAddModal(false);
    } catch (e: any) {
      setSaving(false);
      throw e;
    }
    setSaving(false);
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">News Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {articles.length} articles · {articles.filter(a => a.status === 'published').length} published · {articles.filter(a => a.status === 'draft').length} drafts
          </p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> New Article</button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Full-screen Add Article Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <AddArticleModal
            initialSportSlug={sports[0]?.slug || 'football'}
            sports={sports}
            saving={saving}
            onSave={saveAdd}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Full-screen Edit Article Modal ────────────────────────────── */}
      <AnimatePresence>
        {editingId && (() => {
          const article = articles.find(a => a.id === editingId);
          if (!article) return null;
          const initial: FormState = {
            slug: article.slug,
            category: article.category,
            sport_slug: article.sport_slug || sports[0]?.slug || 'football',
            author: article.author,
            image_url: article.image_url || '',
            status: article.status,
            is_featured: article.is_featured,
            is_trending: article.is_trending,
            is_breaking: article.is_breaking,
            translations: {
              en: article.translations?.en || { title: '', excerpt: '', body: '' },
              fr: article.translations?.fr || { title: '', excerpt: '', body: '' },
              rw: article.translations?.rw || { title: '', excerpt: '', body: '' },
            },
          };
          return (
            <EditArticleModal
              key={editingId}
              initial={initial}
              sports={sports}
              saving={saving}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          );
        })()}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="card-zt p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search articles..." className="input-zt pl-10" />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="input-zt sm:w-48">
          <option value="all">All Categories</option>
          {newsCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="input-zt sm:w-40">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card-zt overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/50">
                  <th className="px-4 py-3 font-semibold">Article</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Author</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Views</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {pageArticles.map(article => (
                  <Fragment key={article.id}>
                    <tr key={article.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {article.image_url && (
                            <img src={proxyUrl(article.image_url)} alt={article.image_alt} className="h-10 w-14 rounded-lg object-cover shrink-0" loading="lazy" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-ink-800 dark:text-ink-100 line-clamp-1 max-w-xs">{getTitle(article)}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {article.is_featured && <Star className="h-3 w-3 text-gold-400 fill-gold-400" />}
                              {article.is_trending && <TrendingUp className="h-3 w-3 text-orange-500" />}
                              {article.is_breaking && <Zap className="h-3 w-3 text-red-500" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="chip bg-ink-100 dark:bg-ink-700/50 text-ink-600 dark:text-ink-300 capitalize whitespace-nowrap">
                          {article.category.replace(/-/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">{article.author}</td>
                      <td className="px-4 py-3">
                        <span className={`chip ${article.status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${article.status === 'published' ? 'bg-green-500' : 'bg-ink-400'}`} />
                          {article.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-400 dark:text-ink-500 whitespace-nowrap">
                        {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-ink-900 dark:text-white whitespace-nowrap">
                        {(article.views || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => editingId === article.id ? cancelEdit() : startEdit(article)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(deleteConfirmId === article.id ? null : article.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    <AnimatePresence>
                      {deleteConfirmId === article.id && (
                        <tr key={`del-${article.id}`}>
                          <td colSpan={7} className="p-0">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-red-500/5 border-t border-red-500/20">
                                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                                  Delete "{getTitle(article)}"? This cannot be undone.
                                </p>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-sm font-medium text-ink-600 dark:text-ink-300 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                                  <button onClick={() => confirmDelete(article.id)} disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors">
                                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink-100 dark:border-ink-700/50">
            <p className="text-xs text-ink-400 dark:text-ink-500">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-600 text-ink-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200 px-2">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-600 text-ink-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3">
              <Newspaper className="h-7 w-7 text-ink-400" />
            </div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No articles found</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Full-screen word-processor modal for creating new articles ──────────────

interface AddArticleModalProps {
  initialSportSlug: string;
  sports: { id: string; slug: string; name: string }[];
  saving: boolean;
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// ── Auto-growing textarea ────────────────────────────────────────────────────
function AutoTextarea({ value, onChange, placeholder, minRows = 3, className = '', textareaRef }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; minRows?: number; className?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = (textareaRef || internalRef) as React.RefObject<HTMLTextAreaElement>;
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea ref={ref} value={value} rows={minRows} placeholder={placeholder}
      className={`input-zt resize-none overflow-hidden ${className}`}
      onChange={e => onChange(e.target.value)} />
  );
}

// ── Image picker: URL tab + Upload tab with live preview ─────────────────────
function ImagePicker({ onInsert, onClose }: {
  onInsert: (url: string, caption: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  // null = not yet tried, true = loaded ok, false = failed
  const [imgStatus, setImgStatus] = useState<null | boolean>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // reset status whenever url changes so partial typing doesn't lock it
  const handleUrlChange = (v: string) => { setUrl(sanitizeImageUrl(v)); setImgStatus(null); };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr(''); setImgStatus(null);
    try {
      const hosted = await uploadImage(file);
      setUrl(hosted); setImgStatus(true);
    } catch (err: any) {
      setUploadErr(err.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  // allow insert as long as there's a URL — don't block on preview status
  const canInsert = url.trim().length > 0;

  return (
    <div className="border border-ink-200 dark:border-ink-700 rounded-xl overflow-hidden bg-white dark:bg-ink-900 shadow-lg">
      {/* tabs */}
      <div className="flex items-center border-b border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800">
        <button type="button" onClick={() => { setTab('url'); setUrl(''); setUploadErr(''); setImgStatus(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'url' ? 'text-gold-500 border-b-2 border-gold-400 -mb-px bg-white dark:bg-ink-900' : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
          }`}>
          <LinkIcon className="h-3.5 w-3.5" /> URL
        </button>
        <button type="button" onClick={() => { setTab('upload'); setUrl(''); setUploadErr(''); setImgStatus(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold transition-colors ${
            tab === 'upload' ? 'text-gold-500 border-b-2 border-gold-400 -mb-px bg-white dark:bg-ink-900' : 'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
          }`}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </button>
        <button type="button" onClick={onClose} className="ml-auto px-3 py-2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {tab === 'url' ? (
          <input value={url} onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg" className="input-zt text-sm" autoFocus />
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-600 text-sm text-ink-500 hover:border-gold-400 hover:text-gold-500 transition-colors disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Click to choose image'}
            </button>
            {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
          </div>
        )}

        <input value={caption} onChange={e => setCaption(e.target.value)}
          placeholder="Caption (optional)" className="input-zt text-sm" />

        {/* Live preview — only render img when URL looks complete */}
        {url.trim().match(/^https?:\/\/.+/) && (
          <div className="relative rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-800 min-h-[60px]">
            <img
              key={url}
              src={proxyUrl(url.trim())}
              alt="preview"
              onLoad={() => setImgStatus(true)}
              onError={() => setImgStatus(false)}
              className={`w-full max-h-40 object-cover transition-opacity ${imgStatus === true ? 'opacity-100' : 'opacity-0 absolute'}`}
            />
            {imgStatus === null && (
              <div className="flex items-center justify-center h-16">
                <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
              </div>
            )}
            {imgStatus === false && (
              <div className="flex flex-col items-center justify-center gap-1 py-4">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <p className="text-xs text-amber-600 dark:text-amber-400">Preview unavailable — image will still be inserted</p>
              </div>
            )}
            {imgStatus === true && caption && (
              <p className="text-center text-xs italic text-ink-500 dark:text-ink-400 py-1 px-2 bg-white/80 dark:bg-ink-900/80">{caption}</p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button type="button" disabled={!canInsert} onClick={() => onInsert(url.trim(), caption.trim())}
            className="btn-gold text-xs py-1.5 px-4 disabled:opacity-40 disabled:cursor-not-allowed">
            Insert Image
          </button>
          <button type="button" onClick={onClose}
            className="text-xs text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 px-3">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Cover image picker (sidebar) ─────────────────────────────────────────────
function CoverImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [draft, setDraft] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [imgStatus, setImgStatus] = useState<null | boolean>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); setImgStatus(null); }, [value]);

  const handleUrlChange = (v: string) => { const clean = sanitizeImageUrl(v); setDraft(clean); onChange(clean); setImgStatus(null); };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr(''); setImgStatus(null);
    try {
      const hosted = await uploadImage(file);
      setDraft(hosted); onChange(hosted); setImgStatus(true);
    } catch (err: any) {
      setUploadErr(err.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400">
        <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Cover Image</span>
      </label>

      <div className="flex rounded-lg overflow-hidden border border-ink-200 dark:border-ink-700 text-xs font-semibold">
        <button type="button" onClick={() => setTab('url')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 transition-colors ${
            tab === 'url' ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-700'
          }`}>
          <LinkIcon className="h-3 w-3" /> URL
        </button>
        <button type="button" onClick={() => setTab('upload')}
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 transition-colors ${
            tab === 'upload' ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-700'
          }`}>
          <Upload className="h-3 w-3" /> Upload
        </button>
      </div>

      {tab === 'url' ? (
        <input type="text" value={draft} onChange={e => handleUrlChange(e.target.value)}
          placeholder="https://…" className="input-zt text-sm" />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-600 text-sm text-ink-500 hover:border-gold-400 hover:text-gold-500 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Choose image'}
          </button>
          {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
        </div>
      )}

      {/* Live preview — always show once there's any URL */}
      {draft && (
        <div className="relative rounded-xl overflow-hidden border border-ink-100 dark:border-ink-700/50 bg-ink-100 dark:bg-ink-800 min-h-[60px]">
          <img
            key={draft}
            src={proxyUrl(draft)}
            alt="cover preview"
            onLoad={() => setImgStatus(true)}
            onError={() => setImgStatus(false)}
            className={`w-full h-32 object-cover transition-opacity ${imgStatus === true ? 'opacity-100' : 'opacity-0 absolute'}`}
          />
          {imgStatus === null && (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            </div>
          )}
          {imgStatus === false && (
            <div className="flex flex-col items-center justify-center gap-1 h-32">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center px-2">Preview unavailable — URL saved anyway</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Rich body editor with toolbar ────────────────────────────────────────────
function RichBodyEditor({ value, onChange, placeholder, minRows = 12 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; minRows?: number;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [showImgPicker, setShowImgPicker] = useState(false);

  const wrap = (before: string, after: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const insertImage = (url: string, caption: string) => {
    const ta = taRef.current;
    const pos = ta ? ta.selectionStart : value.length;
    const block = `\n![${caption}](${url})\n`;
    onChange(value.slice(0, pos) + block + value.slice(pos));
    setShowImgPicker(false);
    setTimeout(() => ta?.focus(), 0);
  };

  // Parse body into renderable segments for live preview
  const segments = value.split('\n').map((line, i) => {
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) return { type: 'img' as const, caption: imgMatch[1], url: imgMatch[2], key: i };
    return { type: 'text' as const, line, key: i };
  });
  const hasImages = segments.some(s => s.type === 'img');

  return (
    <div className="rounded-xl border border-ink-200 dark:border-ink-700 overflow-visible">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-ink-50 dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700 rounded-t-xl">
        <button type="button" title="Bold (select text first)" onClick={() => wrap('**', '**')}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white transition-colors">
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" title="Italic (select text first)" onClick={() => wrap('_', '_')}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white transition-colors">
          <Italic className="h-3.5 w-3.5" />
        </button>
        <div className="w-px h-4 bg-ink-200 dark:bg-ink-600 mx-1" />
        <button type="button" title="Insert image" onClick={() => setShowImgPicker(v => !v)}
          className={`flex items-center gap-1.5 h-7 px-2.5 rounded text-xs font-semibold transition-colors ${
            showImgPicker
              ? 'bg-gold-400/20 text-gold-600 dark:text-gold-400'
              : 'text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-white'
          }`}>
          <ImageIcon className="h-3.5 w-3.5" /> Image
        </button>
        {hasImages && (
          <span className="ml-auto flex items-center gap-1 text-xs text-ink-400">
            <Eye className="h-3 w-3" /> preview below
          </span>
        )}
      </div>

      {/* Image picker panel */}
      {showImgPicker && (
        <div className="border-b border-ink-200 dark:border-ink-700">
          <ImagePicker onInsert={insertImage} onClose={() => setShowImgPicker(false)} />
        </div>
      )}

      {/* Textarea */}
      <AutoTextarea
        textareaRef={taRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minRows={minRows}
        className="!rounded-none !border-none text-base text-ink-700 dark:text-ink-200 leading-relaxed font-mono text-sm"
      />

      {/* Inline image preview strip — shown while editing */}
      {hasImages && (
        <div className="border-t border-ink-200 dark:border-ink-700 p-3 space-y-3 bg-ink-50/50 dark:bg-ink-800/30">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Images in article</p>
          {segments.filter(s => s.type === 'img').map(s => s.type === 'img' && (
            <div key={s.key} className="rounded-lg overflow-hidden border border-ink-200 dark:border-ink-700">
              <img src={proxyUrl(s.url)} alt={s.caption}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                className="w-full max-h-48 object-cover" />
              {s.caption && (
                <p className="text-center text-xs italic text-ink-500 dark:text-ink-400 py-1.5 px-2 bg-white dark:bg-ink-900">{s.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddArticleModal({ initialSportSlug, sports, saving, onSave, onCancel }: AddArticleModalProps) {
  const [form, setForm] = useState<FormState>(() => ({ ...emptyForm(), sport_slug: initialSportSlug }));
  const [localeTab, setLocaleTab] = useState<Locale>('en');
  const [modalError, setModalError] = useState<string | null>(null);

  const updateForm = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) =>
    setForm(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } },
    }));

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSave = async () => {
    setModalError(null);
    const anyTitle = form.translations.en.title.trim() ||
      form.translations.fr.title.trim() ||
      form.translations.rw.title.trim();
    if (!anyTitle) {
      setModalError('Please enter a title in at least one language');
      return;
    }
    try {
      await onSave(form);
    } catch (e: any) {
      setModalError(e.message || 'Failed to publish article');
    }
  };

  const t = form.translations[localeTab];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-ink-950"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10">
            <FileText className="h-4 w-4 text-gold-500" />
          </div>
          <span className="font-display font-bold text-ink-900 dark:text-white text-base">New Article</span>
          <span className="text-xs text-ink-400 dark:text-ink-500 hidden sm:block">Press Esc to close</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Discard</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

      {/* Modal-level error banner */}
      {modalError && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-red-500/10 border-b border-red-500/20 text-sm text-red-600 dark:text-red-400 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" /> {modalError}
          <button onClick={() => setModalError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* ── Body: two-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: writing area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl mx-auto w-full">

          {/* Locale tabs */}
          <div className="flex items-center gap-1 mb-6">
            <Globe className="h-4 w-4 text-ink-400 mr-1" />
            {([{ key: 'en' as Locale, label: 'English' }, { key: 'fr' as Locale, label: 'Français' }, { key: 'rw' as Locale, label: 'Kinyarwanda' }]).map(l => (
              <button key={l.key} onClick={() => setLocaleTab(l.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                  localeTab === l.key
                    ? 'bg-gold-400 text-ink-950'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-1">
            <input
              type="text"
              value={t.title}
              onChange={e => updateTranslation(localeTab, 'title', e.target.value)}
              placeholder="Article title…"
              className="w-full bg-transparent border-none outline-none font-display text-3xl font-bold text-ink-900 dark:text-white placeholder:text-ink-300 dark:placeholder:text-ink-600 py-2"
            />
          </div>
          <div className="flex items-center gap-3 mb-6 text-xs text-ink-400">
            <span>{t.title.length} chars</span>
          </div>

          {/* Excerpt */}
          <div className="mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-2">Excerpt</label>
            <AutoTextarea
              value={t.excerpt}
              onChange={v => updateTranslation(localeTab, 'excerpt', v)}
              placeholder="Short summary shown in article cards…"
              minRows={2}
              className="text-base text-ink-700 dark:text-ink-200 leading-relaxed"
            />
          </div>
          <div className="flex items-center gap-3 mb-6 text-xs text-ink-400">
            <span>{wordCount(t.excerpt)} words</span>
          </div>

          {/* Body */}
          <div className="mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-2">Body</label>
            <RichBodyEditor
              value={t.body}
              onChange={v => updateTranslation(localeTab, 'body', v)}
              placeholder="Write your article here…"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span>{wordCount(t.body)} words</span>
            <span>·</span>
            <span>~{Math.ceil(wordCount(t.body) / 200)} min read</span>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-72 shrink-0 border-l border-ink-100 dark:border-ink-700/50 overflow-y-auto bg-ink-50/50 dark:bg-ink-900/50">
          <div className="p-5 space-y-5">

            {/* Settings header */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
              <Settings2 className="h-3.5 w-3.5" /> Article Settings
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => updateForm('status', e.target.value)} className="input-zt text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => updateForm('category', e.target.value)} className="input-zt text-sm">
                {newsCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Sport</label>
              <select value={form.sport_slug} onChange={e => updateForm('sport_slug', e.target.value)} className="input-zt text-sm">
                {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Author</label>
              <input type="text" value={form.author} onChange={e => updateForm('author', e.target.value)}
                placeholder="Author name" className="input-zt text-sm" />
            </div>

            {/* Cover Image */}
            <CoverImagePicker
              value={form.image_url}
              onChange={url => updateForm('image_url', url)}
            />

            {/* Flags */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-2">Flags</label>
              <div className="space-y-2">
                {([
                  { key: 'is_featured' as const, label: 'Featured', icon: Star },
                  { key: 'is_trending' as const, label: 'Trending', icon: TrendingUp },
                  { key: 'is_breaking' as const, label: 'Breaking', icon: Zap },
                ]).map(item => {
                  const Icon = item.icon;
                  const checked = Boolean(form[item.key]);
                  return (
                    <button key={item.key} onClick={() => updateForm(item.key, !checked)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        checked
                          ? 'bg-gold-400/15 text-gold-600 dark:text-gold-400 ring-1 ring-gold-400/30'
                          : 'bg-white dark:bg-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700 border border-ink-100 dark:border-ink-700/50'
                      }`}>
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

// ── Full-screen modal for editing an existing article ───────────────────────

interface EditArticleModalProps {
  initial: FormState;
  sports: { id: string; slug: string; name: string }[];
  saving: boolean;
  onSave: (data: FormState) => Promise<void>;
  onCancel: () => void;
}

function EditArticleModal({ initial, sports, saving, onSave, onCancel }: EditArticleModalProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [localeTab, setLocaleTab] = useState<Locale>('en');
  const [modalError, setModalError] = useState<string | null>(null);

  const updateForm = (field: keyof FormState, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) =>
    setForm(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } },
    }));

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const handleSave = async () => {
    setModalError(null);
    const anyTitle = form.translations.en.title.trim() ||
      form.translations.fr.title.trim() ||
      form.translations.rw.title.trim();
    if (!anyTitle) {
      setModalError('Please enter a title in at least one language');
      return;
    }
    try {
      await onSave(form);
    } catch (e: any) {
      setModalError(e.message || 'Failed to update article');
    }
  };

  const t = form.translations[localeTab];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-ink-950"
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-400/10">
            <Edit3 className="h-4 w-4 text-gold-500" />
          </div>
          <span className="font-display font-bold text-ink-900 dark:text-white text-base">Edit Article</span>
          <span className="text-xs text-ink-400 dark:text-ink-500 hidden sm:block">Press Esc to close</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Discard</button>
          <button onClick={handleSave} disabled={saving} className="btn-gold text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Update
          </button>
        </div>
      </div>

      {modalError && (
        <div className="flex items-center gap-3 px-6 py-2.5 bg-red-500/10 border-b border-red-500/20 text-sm text-red-600 dark:text-red-400 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" /> {modalError}
          <button onClick={() => setModalError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: writing area */}
        <div className="flex-1 overflow-y-auto px-8 py-8 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-1 mb-6">
            <Globe className="h-4 w-4 text-ink-400 mr-1" />
            {([{ key: 'en' as Locale, label: 'English' }, { key: 'fr' as Locale, label: 'Français' }, { key: 'rw' as Locale, label: 'Kinyarwanda' }]).map(l => (
              <button key={l.key} onClick={() => setLocaleTab(l.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
                  localeTab === l.key ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'
                }`}>
                {l.label}
              </button>
            ))}
          </div>

          <div className="mb-1">
            <input type="text" value={t.title}
              onChange={e => updateTranslation(localeTab, 'title', e.target.value)}
              placeholder="Article title…"
              className="w-full bg-transparent border-none outline-none font-display text-3xl font-bold text-ink-900 dark:text-white placeholder:text-ink-300 dark:placeholder:text-ink-600 py-2"
            />
          </div>
          <div className="flex items-center gap-3 mb-6 text-xs text-ink-400">
            <span>{t.title.length} chars</span>
          </div>

          <div className="mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-2">Excerpt</label>
            <AutoTextarea value={t.excerpt} onChange={v => updateTranslation(localeTab, 'excerpt', v)}
              placeholder="Short summary shown in article cards…" minRows={2}
              className="text-base text-ink-700 dark:text-ink-200 leading-relaxed" />
          </div>
          <div className="flex items-center gap-3 mb-6 text-xs text-ink-400">
            <span>{wordCount(t.excerpt)} words</span>
          </div>

          <div className="mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-2">Body</label>
            <RichBodyEditor value={t.body} onChange={v => updateTranslation(localeTab, 'body', v)}
              placeholder="Write your article here…" />
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-400">
            <span>{wordCount(t.body)} words</span>
            <span>·</span>
            <span>~{Math.ceil(wordCount(t.body) / 200)} min read</span>
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-72 shrink-0 border-l border-ink-100 dark:border-ink-700/50 overflow-y-auto bg-ink-50/50 dark:bg-ink-900/50">
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400">
              <Settings2 className="h-3.5 w-3.5" /> Article Settings
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => updateForm('status', e.target.value)} className="input-zt text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Category</label>
              <select value={form.category} onChange={e => updateForm('category', e.target.value)} className="input-zt text-sm">
                {newsCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Sport</label>
              <select value={form.sport_slug} onChange={e => updateForm('sport_slug', e.target.value)} className="input-zt text-sm">
                {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Author</label>
              <input type="text" value={form.author} onChange={e => updateForm('author', e.target.value)}
                placeholder="Author name" className="input-zt text-sm" />
            </div>

            <CoverImagePicker value={form.image_url} onChange={url => updateForm('image_url', url)} />

            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-2">Flags</label>
              <div className="space-y-2">
                {([
                  { key: 'is_featured' as const, label: 'Featured', icon: Star },
                  { key: 'is_trending' as const, label: 'Trending', icon: TrendingUp },
                  { key: 'is_breaking' as const, label: 'Breaking', icon: Zap },
                ]).map(item => {
                  const Icon = item.icon;
                  const checked = Boolean(form[item.key]);
                  return (
                    <button key={item.key} onClick={() => updateForm(item.key, !checked)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        checked
                          ? 'bg-gold-400/15 text-gold-600 dark:text-gold-400 ring-1 ring-gold-400/30'
                          : 'bg-white dark:bg-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700 border border-ink-100 dark:border-ink-700/50'
                      }`}>
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
