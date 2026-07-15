import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Edit3, Trash2, X, Check, ExternalLink, GripVertical, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface Sponsor {
  id: string; name: string; tier: 'platinum' | 'gold' | 'silver';
  logo_text: string; logo_url: string; website: string; sort_order: number; is_active: boolean;
}
interface FormState {
  name: string; tier: string; logo_text: string; logo_url: string; website: string; sort_order: number;
}

const tierConfig: Record<string, { label: string; bg: string; text: string; border: string; cardBg: string }> = {
  platinum: { label: 'Platinum', bg: 'bg-gold-400/15', text: 'text-gold-500', border: 'border-gold-400/40', cardBg: 'bg-gradient-to-br from-gold-400/10 to-transparent' },
  gold: { label: 'Gold', bg: 'bg-yellow-500/15', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/40', cardBg: 'bg-gradient-to-br from-yellow-500/10 to-transparent' },
  silver: { label: 'Silver', bg: 'bg-ink-200/40 dark:bg-ink-600/30', text: 'text-ink-500 dark:text-ink-300', border: 'border-ink-300/40 dark:border-ink-600/40', cardBg: 'bg-gradient-to-br from-ink-200/20 to-transparent dark:from-ink-600/10' },
};

const emptyForm: FormState = { name: '', tier: 'silver', logo_text: '', logo_url: '', website: '', sort_order: 0 };

export function AdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const rows = await api.getSponsors();
      setSponsors(rows);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const sorted = [...sponsors].sort((a, b) => {
    const order = { platinum: 0, gold: 1, silver: 2 };
    return (order[a.tier] ?? 3) - (order[b.tier] ?? 3) || a.name.localeCompare(b.name);
  });

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData(emptyForm); };
  const startEdit = (s: Sponsor) => {
    setEditingId(s.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ name: s.name, tier: s.tier, logo_text: s.logo_text || '', logo_url: s.logo_url || '', website: s.website || '', sort_order: s.sort_order || 0 });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateSponsor(editingId, formData);
      } else {
        await api.createSponsor(formData);
      }
      await load(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteSponsor(id);
      setSponsors(prev => prev.filter(s => s.id !== id));
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
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Sponsors Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            {sponsors.length} sponsors · {sponsors.filter(s => s.tier === 'platinum').length} platinum · {sponsors.filter(s => s.tier === 'gold').length} gold · {sponsors.filter(s => s.tier === 'silver').length} silver
          </p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Sponsor</button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400">
        <GripVertical className="h-4 w-4 shrink-0" />
        <span>Higher tiers appear first on the website. Use sort order to fine-tune within a tier.</span>
      </div>

      <AnimatePresence>
        {(showForm || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="card-zt p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Sponsor' : 'Add New Sponsor'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Sponsor Name</label>
                  <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. RwandaTel" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Logo Text</label>
                  <input type="text" value={formData.logo_text} onChange={e => update('logo_text', e.target.value.toUpperCase().slice(0, 4))} placeholder="e.g. RT" className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Tier</label>
                  <select value={formData.tier} onChange={e => update('tier', e.target.value)} className="input-zt">
                    <option value="platinum">Platinum (Highest)</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Website</label>
                  <input type="text" value={formData.website} onChange={e => update('website', e.target.value)} placeholder="https://..." className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Logo URL (optional)</label>
                  <input type="text" value={formData.logo_url} onChange={e => update('logo_url', e.target.value)} placeholder="https://..." className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Sort Order</label>
                  <input type="number" value={formData.sort_order} onChange={e => update('sort_order', Number(e.target.value))} min={0} className="input-zt" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update Sponsor' : 'Add Sponsor'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map(sponsor => {
            const tc = tierConfig[sponsor.tier] || tierConfig.silver;
            return (
              <div key={sponsor.id} className={`card-zt border ${tc.border} ${tc.cardBg} p-5 group hover:shadow-lg hover:shadow-ink-900/5 transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 dark:text-ink-600">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => editingId === sponsor.id ? cancelForm() : startEdit(sponsor)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteConfirmId(sponsor.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center mb-4">
                  {sponsor.logo_url ? (
                    <img src={sponsor.logo_url} alt={sponsor.name} className="h-16 w-16 rounded-2xl object-contain mb-3" loading="lazy" />
                  ) : (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-3 ${tc.bg}`}>
                      <span className={`font-display text-xl font-bold ${tc.text}`}>{sponsor.logo_text || sponsor.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-ink-900 dark:text-white">{sponsor.name}</h3>
                  {sponsor.website && sponsor.website !== '#' && (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-ink-400 dark:text-ink-500 hover:text-gold-500 transition-colors mt-1">
                      <ExternalLink className="h-3 w-3" /> Visit website
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`chip ${tc.bg} ${tc.text}`}><Award className="h-3 w-3" /> {tc.label}</span>
                  <span className={`chip ${sponsor.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${sponsor.is_active ? 'bg-green-500' : 'bg-ink-400'}`} />
                    {sponsor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {!loading && sponsors.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Award className="h-7 w-7 text-ink-400" /></div>
          <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No sponsors yet</p>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Sponsor?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                "{sponsors.find(s => s.id === deleteConfirmId)?.name}" will be permanently removed.
              </p>
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
