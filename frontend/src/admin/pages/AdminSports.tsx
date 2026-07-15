import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Edit3, Trash2, X, Check, Search, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

const presetColors = [
  { label: 'Green', value: '#22c55e' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Gold', value: '#F4B400' },
];
const iconOptions = ['Trophy', 'Circle', 'Dribbble', 'Activity', 'Hand', 'Volleyball'];

interface Sport {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  team_count: number;
  is_active: boolean;
}

interface FormState {
  slug: string;
  name: string;
  icon: string;
  color: string;
  team_count: number;
  is_active: boolean;
}

const emptyForm: FormState = { slug: '', name: '', icon: 'Trophy', color: '#F4B400', team_count: 0, is_active: true };

export function AdminSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const rows = await api.getSports();
      setSports(rows);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = sports.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData(emptyForm); };
  const startEdit = (s: Sport) => {
    setEditingId(s.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ slug: s.slug, name: s.name, icon: s.icon, color: s.color, team_count: s.team_count, is_active: s.is_active });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.name || !formData.slug) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateSport(editingId, { name: formData.name, slug: formData.slug, icon: formData.icon, color: formData.color, team_count: formData.team_count, is_active: formData.is_active });
      } else {
        await api.createSport({ name: formData.name, slug: formData.slug, icon: formData.icon, color: formData.color, team_count: formData.team_count });
      }
      await load();
      cancelForm();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteSport(id);
      setSports(prev => prev.filter(s => s.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (sport: Sport) => {
    try {
      await api.updateSport(sport.id, { is_active: !sport.is_active });
      setSports(prev => prev.map(s => s.id === sport.id ? { ...s, is_active: !s.is_active } : s));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Sports Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{sports.length} sports configured</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Sport</button>
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
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Sport' : 'Add New Sport'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Name</label>
                  <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Football" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Slug</label>
                  <input type="text" value={formData.slug} onChange={e => update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="e.g. football" className="input-zt" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map(c => (
                    <button key={c.value} onClick={() => update('color', c.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${formData.color === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-ink-800 ring-current' : ''}`}
                      style={{ color: c.value }}>
                      <span className="h-5 w-5 rounded-full" style={{ backgroundColor: c.value }} />
                      {c.label}
                      {formData.color === c.value && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Icon</label>
                  <select value={formData.icon} onChange={e => update('icon', e.target.value)} className="input-zt">
                    {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Team Count</label>
                  <input type="number" value={formData.team_count} onChange={e => update('team_count', Number(e.target.value))} min={0} className="input-zt" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update Sport' : 'Add Sport'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-zt p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sports..." className="input-zt pl-10" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card-zt overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/50">
                  <th className="px-4 py-3 font-semibold">Icon</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold text-center">Teams</th>
                  <th className="px-4 py-3 font-semibold text-center">Active</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {filtered.map(sport => (
                  <tr key={sport.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${sport.color}15` }}>
                        <Trophy className="h-5 w-5" style={{ color: sport.color }} />
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="font-semibold" style={{ color: sport.color }}>{sport.name}</span></td>
                    <td className="px-4 py-3"><code className="text-xs font-mono text-ink-400 dark:text-ink-500 bg-ink-50 dark:bg-ink-700/50 px-2 py-0.5 rounded">{sport.slug}</code></td>
                    <td className="px-4 py-3 text-center"><span className="font-semibold text-ink-800 dark:text-ink-100">{sport.team_count}</span></td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(sport)}
                        className={`relative h-5 w-9 rounded-full transition-colors mx-auto block ${sport.is_active ? 'bg-green-500' : 'bg-ink-300 dark:bg-ink-600'}`}>
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${sport.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editingId === sport.id ? cancelForm() : startEdit(sport)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirmId(sport.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Trophy className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No sports found</p>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Sport?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This will permanently remove the sport. This action cannot be undone.</p>
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
