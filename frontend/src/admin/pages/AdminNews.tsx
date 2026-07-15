import { useState, useEffect, useMemo, useRef, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, Plus, Search, Edit3, Trash2, X, Check,
  ChevronLeft, ChevronRight, TrendingUp, Star, Zap, Loader2, AlertCircle,
  FileText, Image as ImageIcon, Globe, Settings2, Bold, Italic,
} from 'lucide-react';
import { api } from '../../lib/api';

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
  const [addLocaleTab, setAddLocaleTab] = useState<Locale>('en');
  const [addForm, setAddForm] = useState<FormState>(emptyForm());
  const [editLocaleTab, setEditLocaleTab] = useState<Locale>('en');
  const [formData, setFormData] = useState<FormState>(emptyForm());

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
      r = r.filter(a => a.translations?.en?.title?.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') r = r.filter(a => a.category === categoryFilter);
    if (statusFilter !== 'all') r = r.filter(a => a.status === statusFilter);
    return r;
  }, [articles, search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageArticles = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getTitle = (a: Article) => a.translations?.en?.title || a.slug;

  const startEdit = (a: Article) => {
    setEditingId(a.id); setDeleteConfirmId(null); setEditLocaleTab('en');
    setFormData({
      slug: a.slug, category: a.category, sport_slug: a.sport_slug || 'football',
      author: a.author, image_url: a.image_url || '', status: a.status,
      is_featured: a.is_featured, is_trending: a.is_trending, is_breaking: a.is_breaking,
      translations: a.translations || emptyTranslations(),
    });
  };
  const cancelEdit = () => { setEditingId(null); setFormData(emptyForm()); };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await api.updateArticle(editingId, formData);
      await loadAll(); cancelEdit();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const startAdd = () => {
    setAddForm({ ...emptyForm(), sport_slug: sports[0]?.slug || 'football' });
    setAddLocaleTab('en');
    setShowAddModal(true);
  };

  const saveAdd = async () => {
    if (!addForm.translations.en.title.trim()) { setError('English title is required'); return; }
    setSaving(true);
    try {
      const slug = addForm.translations.en.title
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
      await api.createArticle({ ...addForm, slug });
      await loadAll();
      setShowAddModal(false);
      setAddForm(emptyForm());
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
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

  const updateForm = (field: keyof FormState, value: unknown) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const updateTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) =>
    setFormData(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } },
    }));

  const updateAddForm = (field: keyof FormState, value: unknown) =>
    setAddForm(prev => ({ ...prev, [field]: value }));

  const updateAddTranslation = (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) =>
    setAddForm(prev => ({
      ...prev,
      translations: { ...prev.translations, [locale]: { ...prev.translations[locale], [field]: value } },
    }));

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
            formData={addForm}
            localeTab={addLocaleTab}
            setLocaleTab={setAddLocaleTab}
            sports={sports}
            saving={saving}
            onUpdate={updateAddForm}
            onUpdateTranslation={updateAddTranslation}
            onSave={saveAdd}
            onCancel={() => setShowAddModal(false)}
          />
        )}
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
                            <img src={article.image_url} alt={article.image_alt} className="h-10 w-14 rounded-lg object-cover shrink-0" loading="lazy" />
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
                      {editingId === article.id && (
                        <tr key={`edit-${article.id}`}>
                          <td colSpan={7} className="p-0">
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                              className="overflow-hidden border-t border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/30">
                              <ArticleForm formData={formData} localeTab={editLocaleTab} setLocaleTab={setEditLocaleTab}
                                locales={locales} sports={sports} categories={newsCategories} saving={saving}
                                onUpdate={updateForm} onUpdateTranslation={updateTranslation}
                                onSave={saveEdit} onCancel={cancelEdit} title="Edit Article" />
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>

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
  formData: FormState;
  localeTab: Locale;
  setLocaleTab: (l: Locale) => void;
  sports: { id: string; slug: string; name: string }[];
  saving: boolean;
  onUpdate: (field: keyof FormState, value: unknown) => void;
  onUpdateTranslation: (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function AutoTextarea({ value, onChange, placeholder, minRows = 3, className = '' }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; minRows?: number; className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      rows={minRows}
      placeholder={placeholder}
      className={`input-zt resize-none overflow-hidden ${className}`}
      onChange={e => onChange(e.target.value)}
    />
  );
}

function AddArticleModal({ formData, localeTab, setLocaleTab, sports, saving, onUpdate, onUpdateTranslation, onSave, onCancel }: AddArticleModalProps) {
  const [imgError, setImgError] = useState(false);

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

  const t = formData.translations[localeTab];

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
          <button onClick={onSave} disabled={saving} className="btn-gold text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

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
              onChange={e => onUpdateTranslation(localeTab, 'title', e.target.value)}
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
              onChange={v => onUpdateTranslation(localeTab, 'excerpt', v)}
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
            <AutoTextarea
              value={t.body}
              onChange={v => onUpdateTranslation(localeTab, 'body', v)}
              placeholder="Write your article here…"
              minRows={12}
              className="text-base text-ink-700 dark:text-ink-200 leading-relaxed"
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
              <select value={formData.status} onChange={e => onUpdate('status', e.target.value)} className="input-zt text-sm">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Category</label>
              <select value={formData.category} onChange={e => onUpdate('category', e.target.value)} className="input-zt text-sm">
                {newsCategories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>

            {/* Sport */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Sport</label>
              <select value={formData.sport_slug} onChange={e => onUpdate('sport_slug', e.target.value)} className="input-zt text-sm">
                {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">Author</label>
              <input type="text" value={formData.author} onChange={e => onUpdate('author', e.target.value)}
                placeholder="Author name" className="input-zt text-sm" />
            </div>

            {/* Image URL + preview */}
            <div>
              <label className="block text-xs font-semibold text-ink-500 dark:text-ink-400 mb-1.5">
                <span className="flex items-center gap-1.5"><ImageIcon className="h-3.5 w-3.5" /> Cover Image URL</span>
              </label>
              <input type="text" value={formData.image_url}
                onChange={e => { onUpdate('image_url', e.target.value); setImgError(false); }}
                placeholder="https://…" className="input-zt text-sm" />
              {formData.image_url && !imgError && (
                <img
                  src={formData.image_url}
                  alt="preview"
                  onError={() => setImgError(true)}
                  className="mt-2 w-full h-32 object-cover rounded-xl border border-ink-100 dark:border-ink-700/50"
                />
              )}
              {formData.image_url && imgError && (
                <p className="mt-1.5 text-xs text-red-500">Image URL could not be loaded</p>
              )}
            </div>

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
                  const checked = Boolean(formData[item.key]);
                  return (
                    <button key={item.key} onClick={() => onUpdate(item.key, !checked)}
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

interface ArticleFormProps {
  formData: FormState;
  localeTab: Locale;
  setLocaleTab: (l: Locale) => void;
  locales: { key: Locale; label: string }[];
  sports: { id: string; slug: string; name: string }[];
  categories: { slug: string; label: string }[];
  saving: boolean;
  onUpdate: (field: keyof FormState, value: unknown) => void;
  onUpdateTranslation: (locale: Locale, field: 'title' | 'excerpt' | 'body', value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  title: string;
}

function ArticleForm({ formData, localeTab, setLocaleTab, locales, sports, categories, saving, onUpdate, onUpdateTranslation, onSave, onCancel, title }: ArticleFormProps) {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-ink-900 dark:text-white">{title}</h3>
        <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Title / Excerpt / Body</label>
        <div className="flex gap-1 mb-2">
          {locales.map(l => (
            <button key={l.key} onClick={() => setLocaleTab(l.key)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${localeTab === l.key ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <input type="text" value={formData.translations[localeTab]?.title || ''}
            onChange={e => onUpdateTranslation(localeTab, 'title', e.target.value)}
            placeholder={`Title (${localeTab.toUpperCase()})`} className="input-zt" />
          <textarea value={formData.translations[localeTab]?.excerpt || ''}
            onChange={e => onUpdateTranslation(localeTab, 'excerpt', e.target.value)}
            placeholder={`Excerpt (${localeTab.toUpperCase()})`} rows={2} className="input-zt resize-none" />
          <textarea value={formData.translations[localeTab]?.body || ''}
            onChange={e => onUpdateTranslation(localeTab, 'body', e.target.value)}
            placeholder={`Body (${localeTab.toUpperCase()})`} rows={5} className="input-zt resize-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Category</label>
          <select value={formData.category} onChange={e => onUpdate('category', e.target.value)} className="input-zt">
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Sport</label>
          <select value={formData.sport_slug} onChange={e => onUpdate('sport_slug', e.target.value)} className="input-zt">
            {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Status</label>
          <select value={formData.status} onChange={e => onUpdate('status', e.target.value)} className="input-zt">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Image URL</label>
          <input type="text" value={formData.image_url} onChange={e => onUpdate('image_url', e.target.value)} placeholder="https://..." className="input-zt" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Author</label>
          <input type="text" value={formData.author} onChange={e => onUpdate('author', e.target.value)} placeholder="Author name" className="input-zt" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {([
          { key: 'is_featured' as const, label: 'Featured', icon: Star },
          { key: 'is_trending' as const, label: 'Trending', icon: TrendingUp },
          { key: 'is_breaking' as const, label: 'Breaking', icon: Zap },
        ]).map(item => {
          const Icon = item.icon;
          const checked = Boolean(formData[item.key]);
          return (
            <button key={item.key} onClick={() => onUpdate(item.key, !checked)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${checked ? 'bg-gold-400/15 text-gold-600 dark:text-gold-400 ring-1 ring-gold-400/30' : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>
              <Icon className="h-4 w-4" />{item.label}{checked && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
        <button onClick={onCancel} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
        <button onClick={onSave} disabled={saving} className="btn-gold text-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save Article
        </button>
      </div>
    </div>
  );
}
