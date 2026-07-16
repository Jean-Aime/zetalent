import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit3, Trash2, X, Check, Search, MapPin, User, Loader2, AlertCircle, Link as LinkIcon, Upload } from 'lucide-react';
import { api, uploadImage } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Extract the real image URL from wrapper URLs (e.g. Google Images imgres links)
function sanitizeImageUrl(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();
  try {
    const parsed = new URL(trimmed);
    // Google Images: google.com/imgres?imgurl=<actual url>&...
    if (parsed.hostname.includes('google.') && parsed.pathname === '/imgres') {
      const imgurl = parsed.searchParams.get('imgurl');
      if (imgurl) return decodeURIComponent(imgurl);
    }
    // Generic: any URL that has an imgurl= or similar param pointing to an image
    for (const param of ['imgurl', 'direct_url', 'image_url', 'src']) {
      const v = parsed.searchParams.get(param);
      if (v && /^https?:\/\/.+\.(jpe?g|png|webp|gif|svg|avif)/i.test(v)) {
        return decodeURIComponent(v);
      }
    }
  } catch {
    // not a valid URL, return as-is
  }
  return trimmed;
}

function proxyUrl(url: string): string {
  if (!url) return url;
  const clean = sanitizeImageUrl(url);
  if (clean.startsWith('http://localhost') || clean.startsWith('http://127.0.0.1')) return clean;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(clean)}`;
}

interface Sport { id: string; slug: string; name: string; color: string; }
interface Team {
  id: string; slug: string; name: string; short_name: string;
  sport_id: string; sport_slug: string; city: string; founded: number;
  stadium: string; coach: string; primary_color: string; logo_url: string;
  description: string;
}
interface FormState {
  name: string; short_name: string; sport_id: string; city: string;
  founded: number; stadium: string; coach: string; primary_color: string; logo_url: string; description: string;
}

const emptyForm: FormState = {
  name: '', short_name: '', sport_id: '', city: '', founded: 2020,
  stadium: '', coach: '', primary_color: '#F4B400', logo_url: '', description: '',
};

function LogoPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [imgErr, setImgErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setImgErr(null); }, [value]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr('');
    try {
      const hosted = await uploadImage(file);
      onChange(hosted);
    } catch (err: any) {
      setUploadErr(err.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleImgError = async () => {
    try {
      const res = await fetch(proxyUrl(value));
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setImgErr(data.error || `Error ${res.status}`);
      } else {
        setImgErr('Image failed to load');
      }
    } catch {
      setImgErr('Cannot reach image — check the URL');
    }
  };

  return (
    <div className="space-y-2">
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
        <div className="space-y-1">
          <input type="text" value={value} onChange={e => onChange(sanitizeImageUrl(e.target.value))}
            placeholder="https://example.com/logo.png" className="input-zt text-sm" />
          <p className="text-xs text-ink-400 dark:text-ink-500">Paste a direct image URL — Google Images links are auto-resolved.</p>
        </div>
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

      {value && (
        <div className="flex items-center gap-3 p-2 rounded-xl border border-ink-100 dark:border-ink-700/50 bg-ink-50 dark:bg-ink-800/50">
          {imgErr ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-400" />
            </div>
          ) : (
            <img src={proxyUrl(value)} alt="logo preview"
              className="h-10 w-10 rounded-lg object-contain bg-white dark:bg-ink-900"
              onError={handleImgError} />
          )}
          <div className="flex-1 min-w-0">
            {imgErr && (
              <p className="text-xs text-red-500 mb-0.5">⚠️ {imgErr}</p>
            )}
            <span className="text-xs text-ink-400 truncate block">{value.split('/').pop()}</span>
          </div>
          <button type="button" onClick={() => onChange('')} className="text-ink-400 hover:text-red-500 transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true); setError(null);
      const [t, s] = await Promise.all([api.getTeams(), api.getSports()]);
      setTeams(t); setSports(s);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let r = [...teams];
    if (search) r = r.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.city?.toLowerCase().includes(search.toLowerCase()));
    if (sportFilter !== 'all') r = r.filter(t => t.sport_slug === sportFilter || t.sport_id === sportFilter);
    return r;
  }, [teams, search, sportFilter]);

  const getSportColor = (team: Team) => sports.find(s => s.id === team.sport_id || s.slug === team.sport_slug)?.color || '#999';
  const getSportName = (team: Team) => sports.find(s => s.id === team.sport_id || s.slug === team.sport_slug)?.name || '—';

  const startAdd = () => {
    setShowForm(true); setEditingId(null);
    setFormData({ ...emptyForm, sport_id: sports[0]?.id || '' });
  };
  const startEdit = (t: Team) => {
    setEditingId(t.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ name: t.name, short_name: t.short_name || '', sport_id: t.sport_id, city: t.city || '', founded: t.founded || 2020, stadium: t.stadium || '', coach: t.coach || '', primary_color: t.primary_color || '#F4B400', logo_url: t.logo_url || '', description: t.description || '' });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = { ...formData, slug };
      if (editingId) {
        await api.updateTeam(editingId, payload);
      } else {
        await api.createTeam(payload);
      }
      await loadAll(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteTeam(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Teams Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{teams.length} teams registered</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Team</button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <AnimatePresence>
        {(showForm || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="card-zt p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Team' : 'Add New Team'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Name</label>
                  <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Kigali Queens" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Short Name</label>
                  <input type="text" value={formData.short_name} onChange={e => update('short_name', e.target.value.toUpperCase().slice(0, 4))} placeholder="e.g. KGQ" className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Sport</label>
                  <select value={formData.sport_id} onChange={e => update('sport_id', e.target.value)} className="input-zt">
                    <option value="">Select sport</option>
                    {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">City</label>
                  <input type="text" value={formData.city} onChange={e => update('city', e.target.value)} placeholder="e.g. Kigali" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Founded</label>
                  <input type="number" value={formData.founded} onChange={e => update('founded', Number(e.target.value))} min={1900} max={2030} className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Coach</label>
                  <input type="text" value={formData.coach} onChange={e => update('coach', e.target.value)} placeholder="e.g. Eric Nshuti" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Stadium</label>
                  <input type="text" value={formData.stadium} onChange={e => update('stadium', e.target.value)} placeholder="e.g. Amahoro Stadium" className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={formData.primary_color} onChange={e => update('primary_color', e.target.value)} className="h-11 w-16 rounded-xl border border-ink-200 dark:border-ink-600 cursor-pointer bg-transparent" />
                    <input type="text" value={formData.primary_color} onChange={e => update('primary_color', e.target.value)} placeholder="#F4B400" className="input-zt" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Logo</label>
                  <LogoPicker value={formData.logo_url} onChange={url => update('logo_url', url)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Description</label>
                <textarea value={formData.description} onChange={e => update('description', e.target.value)} rows={3} placeholder="Team description..." className="input-zt resize-none" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update Team' : 'Add Team'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-zt p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..." className="input-zt pl-10" />
        </div>
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="input-zt sm:w-48">
          <option value="all">All Sports</option>
          {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card-zt overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/50">
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Sport</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Coach</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {filtered.map(team => (
                  <tr key={team.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {team.logo_url ? (
                          <img src={proxyUrl(team.logo_url)} alt={team.name} className="h-10 w-10 rounded-xl object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-sm" style={{ backgroundColor: team.primary_color || '#F4B400' }}>
                            {(team.short_name || team.name).slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-800 dark:text-ink-100">{team.name}</p>
                          <p className="text-xs text-ink-400 dark:text-ink-500">{team.short_name} · Est. {team.founded}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="chip whitespace-nowrap" style={{ backgroundColor: `${getSportColor(team)}15`, color: getSportColor(team) }}>{getSportName(team)}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-ink-400" />{team.city}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-ink-400" />{team.coach}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editingId === team.id ? cancelForm() : startEdit(team)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirmId(team.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Users className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No teams found</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card-zt p-6 max-w-sm w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Team?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This will permanently remove the team. This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={() => confirmDelete(deleteConfirmId)} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
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
