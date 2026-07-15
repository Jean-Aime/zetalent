import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Edit3, Trash2, X, Check, Search, Star, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface Sport { id: string; slug: string; name: string; color: string; }
interface Team { id: string; name: string; sport_id: string; }
interface Player {
  id: string; slug: string; name: string; team_id: string; team_name: string;
  sport_id: string; sport_slug: string; position: string; shirt_number: number;
  nationality: string; flag: string; age: number; height: string;
  photo_url: string; bio: string; is_featured: boolean;
}
interface FormState {
  name: string; team_id: string; sport_id: string; position: string;
  shirt_number: number; nationality: string; flag: string; age: number;
  height: string; photo_url: string; bio: string; is_featured: boolean;
}

const emptyForm: FormState = {
  name: '', team_id: '', sport_id: '', position: '', shirt_number: 0,
  nationality: 'Rwanda', flag: '🇷🇼', age: 20, height: '', photo_url: '', bio: '', is_featured: false,
};

export function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true); setError(null);
      const [p, s, t] = await Promise.all([api.getPlayers(), api.getSports(), api.getTeams()]);
      setPlayers(p); setSports(s); setTeams(t);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let r = [...players];
    if (search) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.position?.toLowerCase().includes(search.toLowerCase()));
    if (sportFilter !== 'all') r = r.filter(p => p.sport_slug === sportFilter || p.sport_id === sportFilter);
    if (teamFilter !== 'all') r = r.filter(p => p.team_id === teamFilter);
    return r;
  }, [players, search, sportFilter, teamFilter]);

  const getSportColor = (p: Player) => sports.find(s => s.id === p.sport_id || s.slug === p.sport_slug)?.color || '#999';
  const getSportName = (p: Player) => sports.find(s => s.id === p.sport_id || s.slug === p.sport_slug)?.name || '—';

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData({ ...emptyForm, sport_id: sports[0]?.id || '' }); };
  const startEdit = (p: Player) => {
    setEditingId(p.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ name: p.name, team_id: p.team_id || '', sport_id: p.sport_id || '', position: p.position || '', shirt_number: p.shirt_number || 0, nationality: p.nationality || 'Rwanda', flag: p.flag || '🇷🇼', age: p.age || 20, height: p.height || '', photo_url: p.photo_url || '', bio: p.bio || '', is_featured: p.is_featured || false });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.name) return;
    setSaving(true);
    try {
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
      const payload = { ...formData, slug };
      if (editingId) {
        await api.updatePlayer(editingId, payload);
      } else {
        await api.createPlayer(payload);
      }
      await loadAll(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deletePlayer(id);
      setPlayers(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const toggleFeatured = async (player: Player) => {
    try {
      await api.updatePlayer(player.id, { is_featured: !player.is_featured });
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, is_featured: !p.is_featured } : p));
    } catch (e: any) { setError(e.message); }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Players Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{players.length} players registered</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Player</button>
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
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Player' : 'Add New Player'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Alice Mukamana" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Position</label>
                  <input type="text" value={formData.position} onChange={e => update('position', e.target.value)} placeholder="e.g. Midfielder" className="input-zt" />
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Team</label>
                  <select value={formData.team_id} onChange={e => update('team_id', e.target.value)} className="input-zt">
                    <option value="">Free Agent</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Shirt #</label>
                  <input type="number" value={formData.shirt_number} onChange={e => update('shirt_number', Number(e.target.value))} min={0} max={99} className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Nationality</label>
                  <input type="text" value={formData.nationality} onChange={e => update('nationality', e.target.value)} placeholder="e.g. Rwanda" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Age</label>
                  <input type="number" value={formData.age} onChange={e => update('age', Number(e.target.value))} min={14} max={50} className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Height</label>
                  <input type="text" value={formData.height} onChange={e => update('height', e.target.value)} placeholder="e.g. 1.68m" className="input-zt" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Photo URL</label>
                <input type="text" value={formData.photo_url} onChange={e => update('photo_url', e.target.value)} placeholder="https://..." className="input-zt" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Bio</label>
                <textarea value={formData.bio} onChange={e => update('bio', e.target.value)} rows={3} placeholder="Player biography..." className="input-zt resize-none" />
              </div>
              <button onClick={() => update('is_featured', !formData.is_featured)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.is_featured ? 'bg-gold-400/15 text-gold-600 dark:text-gold-400 ring-1 ring-gold-400/30' : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500'}`}>
                <Star className={`h-4 w-4 ${formData.is_featured ? 'fill-gold-400' : ''}`} />
                Featured Player
                {formData.is_featured && <Check className="h-3.5 w-3.5" />}
              </button>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update Player' : 'Add Player'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-zt p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..." className="input-zt pl-10" />
        </div>
        <select value={sportFilter} onChange={e => setSportFilter(e.target.value)} className="input-zt sm:w-44">
          <option value="all">All Sports</option>
          {sports.map(s => <option key={s.id} value={s.slug}>{s.name}</option>)}
        </select>
        <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} className="input-zt sm:w-48">
          <option value="all">All Teams</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
                  <th className="px-4 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Sport</th>
                  <th className="px-4 py-3 font-semibold">Position</th>
                  <th className="px-4 py-3 font-semibold">Nationality</th>
                  <th className="px-4 py-3 font-semibold text-center">Featured</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {filtered.map(player => (
                  <tr key={player.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {player.photo_url ? (
                          <img src={player.photo_url} alt={player.name} className="h-10 w-10 rounded-full object-cover ring-1 ring-ink-200 dark:ring-ink-600" loading="lazy" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-200 dark:bg-ink-700 text-ink-500 font-bold text-sm">
                            {player.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-ink-800 dark:text-ink-100">{player.name}</p>
                          <p className="text-xs text-ink-400 dark:text-ink-500">#{player.shirt_number} · {player.age} yrs</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">{player.team_name || 'Free Agent'}</td>
                    <td className="px-4 py-3">
                      <span className="chip whitespace-nowrap" style={{ backgroundColor: `${getSportColor(player)}15`, color: getSportColor(player) }}>{getSportName(player)}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">{player.position}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap">
                      <span className="flex items-center gap-1.5"><span className="text-base">{player.flag}</span>{player.nationality}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(player)}
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg transition-all ${player.is_featured ? 'text-gold-400 hover:bg-gold-400/10' : 'text-ink-300 dark:text-ink-600 hover:bg-ink-100 dark:hover:bg-ink-700'}`}>
                        <Star className={`h-4 w-4 ${player.is_featured ? 'fill-gold-400' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => editingId === player.id ? cancelForm() : startEdit(player)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteConfirmId(player.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><User className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No players found</p>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Player?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This will permanently remove the player. This action cannot be undone.</p>
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
