import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit3, Trash2, X, Check, Clock, MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface Sport { id: string; slug: string; name: string; color: string; }
interface Team { id: string; name: string; logo_url: string; }
interface Match {
  id: string; sport_id: string; sport_slug: string;
  home_team_id: string; home_team_name: string; home_team_logo: string;
  away_team_id: string; away_team_name: string; away_team_logo: string;
  home_score: number | null; away_score: number | null;
  match_date: string; match_time: string; venue: string;
  status: 'upcoming' | 'live' | 'finished'; league_name: string; matchweek: number;
}
interface FormState {
  sport_id: string; league_name: string;
  home_team_id: string; home_team_name: string;
  away_team_id: string; away_team_name: string;
  match_date: string; match_time: string; venue: string;
  status: string; matchweek: number;
  home_score: number | null; away_score: number | null;
}

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  upcoming: { label: 'Upcoming', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  live: { label: 'Live', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 animate-pulse' },
  finished: { label: 'Finished', bg: 'bg-ink-100 dark:bg-ink-700/50', text: 'text-ink-600 dark:text-ink-300', dot: 'bg-ink-400' },
};

const emptyForm: FormState = {
  sport_id: '', league_name: '', home_team_id: '', home_team_name: '',
  away_team_id: '', away_team_name: '', match_date: '', match_time: '15:00',
  venue: '', status: 'upcoming', matchweek: 1, home_score: null, away_score: null,
};

export function AdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      setLoading(true); setError(null);
      const [m, s, t] = await Promise.all([api.getMatches(), api.getSports(), api.getTeams()]);
      setMatches(m); setSports(s); setTeams(t);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const filtered = useMemo(() => {
    let r = [...matches];
    if (statusFilter !== 'all') r = r.filter(m => m.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(m => m.home_team_name.toLowerCase().includes(q) || m.away_team_name.toLowerCase().includes(q) || m.venue?.toLowerCase().includes(q) || m.league_name?.toLowerCase().includes(q));
    }
    return r.sort((a, b) => b.match_date.localeCompare(a.match_date));
  }, [matches, statusFilter, search]);

  const getSportColor = (m: Match) => sports.find(s => s.id === m.sport_id || s.slug === m.sport_slug)?.color || '#999';
  const getSportName = (m: Match) => sports.find(s => s.id === m.sport_id || s.slug === m.sport_slug)?.name || '—';

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData({ ...emptyForm, sport_id: sports[0]?.id || '' }); };
  const startEdit = (m: Match) => {
    setEditingId(m.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ sport_id: m.sport_id, league_name: m.league_name || '', home_team_id: m.home_team_id || '', home_team_name: m.home_team_name, away_team_id: m.away_team_id || '', away_team_name: m.away_team_name, match_date: m.match_date?.slice(0, 10) || '', match_time: m.match_time || '15:00', venue: m.venue || '', status: m.status, matchweek: m.matchweek || 1, home_score: m.home_score, away_score: m.away_score });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.home_team_name || !formData.away_team_name || !formData.match_date) return;
    setSaving(true);
    try {
      // Resolve team names from selected IDs
      const homeTeam = teams.find(t => t.id === formData.home_team_id);
      const awayTeam = teams.find(t => t.id === formData.away_team_id);
      const payload = {
        ...formData,
        home_team_name: homeTeam?.name || formData.home_team_name,
        away_team_name: awayTeam?.name || formData.away_team_name,
        home_team_logo: homeTeam?.logo_url || '',
        away_team_logo: awayTeam?.logo_url || '',
        home_score: formData.status === 'finished' ? formData.home_score : null,
        away_score: formData.status === 'finished' ? formData.away_score : null,
      };
      if (editingId) {
        await api.updateMatch(editingId, payload);
      } else {
        await api.createMatch(payload);
      }
      await loadAll(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' }, { key: 'upcoming', label: 'Upcoming' },
    { key: 'live', label: 'Live' }, { key: 'finished', label: 'Finished' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Matches Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{matches.length} matches · {matches.filter(m => m.status === 'finished').length} results · {matches.filter(m => m.status === 'upcoming').length} upcoming</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Match</button>
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
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit Match' : 'Add New Match'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Sport</label>
                  <select value={formData.sport_id} onChange={e => update('sport_id', e.target.value)} className="input-zt">
                    <option value="">Select sport</option>
                    {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">League Name</label>
                  <input type="text" value={formData.league_name} onChange={e => update('league_name', e.target.value)} placeholder="e.g. Women's Football League" className="input-zt" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Home Team</label>
                  <select value={formData.home_team_id} onChange={e => { const t = teams.find(t => t.id === e.target.value); update('home_team_id', e.target.value); if (t) update('home_team_name', t.name); }} className="input-zt">
                    <option value="">Select home team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Away Team</label>
                  <select value={formData.away_team_id} onChange={e => { const t = teams.find(t => t.id === e.target.value); update('away_team_id', e.target.value); if (t) update('away_team_name', t.name); }} className="input-zt">
                    <option value="">Select away team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Date</label>
                  <input type="date" value={formData.match_date} onChange={e => update('match_date', e.target.value)} className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Time</label>
                  <input type="time" value={formData.match_time} onChange={e => update('match_time', e.target.value)} className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Status</label>
                  <select value={formData.status} onChange={e => update('status', e.target.value)} className="input-zt">
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Venue</label>
                  <input type="text" value={formData.venue} onChange={e => update('venue', e.target.value)} placeholder="e.g. Amahoro Stadium" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Matchweek</label>
                  <input type="number" value={formData.matchweek} onChange={e => update('matchweek', Number(e.target.value))} min={0} className="input-zt" />
                </div>
              </div>
              {formData.status === 'finished' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Home Score</label>
                    <input type="number" value={formData.home_score ?? 0} onChange={e => update('home_score', Number(e.target.value))} min={0} className="input-zt" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Away Score</label>
                    <input type="number" value={formData.away_score ?? 0} onChange={e => update('away_score', Number(e.target.value))} min={0} className="input-zt" />
                  </div>
                </motion.div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update Match' : 'Add Match'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {statusTabs.map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`chip transition-all whitespace-nowrap ${statusFilter === tab.key ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-700/50 hover:bg-gold-400/10'}`}>
              {tab.label}
              <span className={`ml-1 text-[10px] ${statusFilter === tab.key ? 'text-ink-950/70' : 'text-ink-400'}`}>
                {tab.key === 'all' ? matches.length : matches.filter(m => m.status === tab.key).length}
              </span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search matches..." className="input-zt pl-10" />
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
                  <th className="px-4 py-3 font-semibold">Match</th>
                  <th className="px-4 py-3 font-semibold">Score / Date</th>
                  <th className="px-4 py-3 font-semibold">Sport</th>
                  <th className="px-4 py-3 font-semibold">League</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Venue</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {filtered.map(match => {
                  const sc = statusConfig[match.status];
                  return (
                    <tr key={match.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            {match.home_team_logo && <img src={match.home_team_logo} alt={match.home_team_name} className="h-6 w-6 rounded object-cover" loading="lazy" />}
                            <span className="font-medium text-ink-800 dark:text-ink-100 whitespace-nowrap">{match.home_team_name}</span>
                          </div>
                          <span className="text-ink-300 dark:text-ink-600 text-xs">vs</span>
                          <div className="flex items-center gap-1.5">
                            {match.away_team_logo && <img src={match.away_team_logo} alt={match.away_team_name} className="h-6 w-6 rounded object-cover" loading="lazy" />}
                            <span className="font-medium text-ink-800 dark:text-ink-100 whitespace-nowrap">{match.away_team_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {match.status === 'finished' ? (
                          <span className="font-bold text-ink-900 dark:text-white text-base">{match.home_score} - {match.away_score}</span>
                        ) : (
                          <div className="flex flex-col">
                            <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(match.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                            <span className="text-xs text-ink-400 flex items-center gap-1"><Clock className="h-3 w-3" />{match.match_time}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="chip whitespace-nowrap" style={{ backgroundColor: `${getSportColor(match)}15`, color: getSportColor(match) }}>{getSportName(match)}</span>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap text-xs">{match.league_name}</td>
                      <td className="px-4 py-3">
                        <span className={`chip ${sc.bg} ${sc.text} whitespace-nowrap`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300 whitespace-nowrap text-xs">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-ink-400" />{match.venue}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => editingId === match.id ? cancelForm() : startEdit(match)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteConfirmId(match.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Calendar className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No matches found</p>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Match?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">This will permanently remove the match. This action cannot be undone.</p>
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
