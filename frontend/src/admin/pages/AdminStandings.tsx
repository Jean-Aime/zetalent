import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Plus, RefreshCw, X, Check, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface Sport { id: string; slug: string; name: string; }
interface Team { id: string; name: string; logo_url: string; }
interface Standing {
  id: string; sport_id: string; position: number; team_id: string;
  team_name: string; team_logo: string; played: number; won: number;
  drawn: number; lost: number; goals_for: number; goals_against: number;
  goal_difference: number; points: number; form: string[];
}
interface NewRowState {
  team_id: string; won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number;
}

export function AdminStandings() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeSportId, setActiveSportId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddRow, setShowAddRow] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<NewRowState>({ team_id: '', won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0 });

  useEffect(() => { loadSports(); }, []);
  useEffect(() => { if (activeSportId) loadStandings(); }, [activeSportId]);

  async function loadSports() {
    try {
      const s = await api.getSports();
      const t = await api.getTeams();
      setSports(s); setTeams(t);
      if (s.length) setActiveSportId(s[0].id);
    } catch (e: any) { setError(e.message); setLoading(false); }
  }

  async function loadStandings() {
    try {
      setLoading(true); setError(null);
      const activeSport = sports.find(s => s.id === activeSportId);
      const rows = await api.getStandings(activeSport?.slug);
      setStandings(rows.filter((r: Standing) => r.sport_id === activeSportId));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const rows = standings.sort((a, b) => a.position - b.position);

  const updateField = async (row: Standing, field: keyof Standing, value: number) => {
    const updated = { ...row, [field]: value };
    updated.goal_difference = updated.goals_for - updated.goals_against;
    updated.points = updated.won * 3 + updated.drawn;
    updated.played = updated.won + updated.drawn + updated.lost;
    setStandings(prev => prev.map(r => r.id === row.id ? updated : r));
    try {
      await api.updateStanding(row.id, {
        [field]: value,
        goal_difference: updated.goal_difference,
        points: updated.points,
        played: updated.played,
      });
    } catch (e: any) { setError(e.message); }
  };

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const recalced = [...standings]
        .map(r => ({ ...r, goal_difference: r.goals_for - r.goals_against, points: r.won * 3 + r.drawn, played: r.won + r.drawn + r.lost }))
        .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for)
        .map((r, i) => ({ ...r, position: i + 1 }));
      await Promise.all(recalced.map(r => api.updateStanding(r.id, { position: r.position, goal_difference: r.goal_difference, points: r.points, played: r.played })));
      setStandings(recalced);
    } catch (e: any) { setError(e.message); }
    finally { setRecalculating(false); }
  };

  const addRow = async () => {
    if (!newRow.team_id) return;
    setSaving(true);
    try {
      const team = teams.find(t => t.id === newRow.team_id);
      const payload = {
        sport_id: activeSportId,
        team_id: newRow.team_id,
        position: rows.length + 1,
        team_name: team?.name || '',
        team_logo: team?.logo_url || '',
        played: newRow.won + newRow.drawn + newRow.lost,
        won: newRow.won, drawn: newRow.drawn, lost: newRow.lost,
        goals_for: newRow.goals_for, goals_against: newRow.goals_against,
        goal_difference: newRow.goals_for - newRow.goals_against,
        points: newRow.won * 3 + newRow.drawn,
        form: [],
      };
      await api.createStanding(payload);
      await loadStandings();
      setShowAddRow(false);
      setNewRow({ team_id: '', won: 0, drawn: 0, lost: 0, goals_for: 0, goals_against: 0 });
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const deleteRow = async (id: string) => {
    setSaving(true);
    try {
      await api.deleteStanding(id);
      setStandings(prev => prev.filter(r => r.id !== id).map((r, i) => ({ ...r, position: i + 1 })));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const updateNew = (field: keyof NewRowState, value: string | number) =>
    setNewRow(prev => ({ ...prev, [field]: value }));

  const activeSportName = sports.find(s => s.id === activeSportId)?.name || '';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Standings Management</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{rows.length} teams in {activeSportName} table</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={recalculate} disabled={recalculating}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-ink-200 rounded-full border border-ink-200 dark:border-ink-600 hover:border-gold-400 hover:text-gold-500 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate'}
          </button>
          <button onClick={() => setShowAddRow(true)} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add Team</button>
        </div>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Sport tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {sports.map(s => (
          <button key={s.id} onClick={() => { setActiveSportId(s.id); setShowAddRow(false); }}
            className={`chip transition-all ${activeSportId === s.id ? 'bg-gold-400 text-ink-950' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-700/50 hover:bg-gold-400/10'}`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Add row form */}
      <AnimatePresence>
        {showAddRow && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="card-zt p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink-900 dark:text-white">Add Team to {activeSportName} Table</h3>
                <button onClick={() => setShowAddRow(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Select Team</label>
                  <select value={newRow.team_id} onChange={e => updateNew('team_id', e.target.value)} className="input-zt">
                    <option value="">Choose a team...</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                {(['won', 'drawn', 'lost', 'goals_for', 'goals_against'] as const).map(field => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">{field.replace('_', ' ')}</label>
                    <input type="number" value={newRow[field]} onChange={e => updateNew(field, Number(e.target.value))} min={0} className="input-zt" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={() => setShowAddRow(false)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={addRow} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Add to Table
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="card-zt overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/50">
                  <th className="px-3 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">Team</th>
                  <th className="px-2 py-3 font-semibold text-center">P</th>
                  <th className="px-2 py-3 font-semibold text-center">W</th>
                  <th className="px-2 py-3 font-semibold text-center">D</th>
                  <th className="px-2 py-3 font-semibold text-center">L</th>
                  <th className="px-2 py-3 font-semibold text-center">GF</th>
                  <th className="px-2 py-3 font-semibold text-center">GA</th>
                  <th className="px-2 py-3 font-semibold text-center">GD</th>
                  <th className="px-2 py-3 font-semibold text-center">Pts</th>
                  <th className="px-2 py-3 font-semibold text-center">Form</th>
                  <th className="px-2 py-3 font-semibold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {rows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors group">
                    <td className="px-3 py-2.5">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${idx === 0 ? 'bg-gold-400 text-ink-950' : idx < 3 ? 'bg-gold-400/15 text-gold-600 dark:text-gold-400' : 'text-ink-400'}`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {row.team_logo && <img src={row.team_logo} alt={row.team_name} className="h-7 w-7 rounded-lg object-cover" loading="lazy" />}
                        <span className="font-semibold text-ink-800 dark:text-ink-100 whitespace-nowrap">{row.team_name}</span>
                      </div>
                    </td>
                    {(['played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against'] as const).map(field => (
                      <td key={field} className="px-2 py-2.5 text-center">
                        <input type="number" value={row[field] as number}
                          onChange={e => updateField(row, field, Number(e.target.value))}
                          className="w-12 text-center bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-600 rounded-md py-1 text-sm text-ink-800 dark:text-ink-100 focus:outline-none focus:ring-1 focus:ring-gold-400/50 focus:border-gold-400" />
                      </td>
                    ))}
                    <td className="px-2 py-2.5 text-center">
                      <span className={`font-semibold text-sm ${row.goal_difference > 0 ? 'text-green-500' : row.goal_difference < 0 ? 'text-red-500' : 'text-ink-500'}`}>
                        {row.goal_difference > 0 ? '+' : ''}{row.goal_difference}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <span className="font-bold text-base text-ink-900 dark:text-white">{row.points}</span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {(row.form || []).map((result, i) => (
                          <span key={i} className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-white ${result === 'W' ? 'bg-green-500' : result === 'D' ? 'bg-ink-400' : 'bg-red-500'}`}>
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button onClick={() => setDeleteConfirmId(row.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 mx-auto">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><BarChart2 className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No teams in this table yet</p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">Click "Add Team" to get started</p>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Remove from Table?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                "{standings.find(r => r.id === deleteConfirmId)?.team_name}" will be removed from the standings.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={() => deleteRow(deleteConfirmId)} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
