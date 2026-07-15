import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Reveal } from '../../components/common/NewsCard';

interface Sport { id: string; slug: string; name: string; }
interface Row {
  id: string; sport_id: string; position: number; team_name: string; team_logo: string;
  played: number; won: number; drawn: number; lost: number;
  goals_for: number; goals_against: number; goal_difference: number; points: number; form: string[];
}

export function StandingsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [activeSportId, setActiveSportId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSports()
      .then(s => { setSports(s); if (s.length) setActiveSportId(s[0].id); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeSportId) return;
    setLoading(true);
    const sport = sports.find(s => s.id === activeSportId);
    api.getStandings(sport?.slug)
      .then(data => setRows(
        data.filter((r: Row) => r.sport_id === activeSportId)
            .sort((a: Row, b: Row) => a.position - b.position)
      ))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [activeSportId, sports]);

  return (
    <div className="py-12 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Tables</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              League <span className="gradient-text">Standings</span>
            </h1>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex justify-center flex-wrap gap-2 mb-8">
            {sports.map(s => (
              <button key={s.id} onClick={() => setActiveSportId(s.id)}
                className={`chip transition-all ${activeSportId === s.id ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                {s.name}
              </button>
            ))}
          </div>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>
        ) : rows.length > 0 ? (
          <Reveal delay={0.15}>
            <div className="card-zt overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-ink-50 dark:bg-ink-800/50 text-xs uppercase tracking-wider text-ink-400">
                    <tr>
                      <th className="px-4 py-4 text-left font-semibold w-12">#</th>
                      <th className="px-4 py-4 text-left font-semibold">Team</th>
                      <th className="px-3 py-4 text-center font-semibold">P</th>
                      <th className="px-3 py-4 text-center font-semibold hidden sm:table-cell">W</th>
                      <th className="px-3 py-4 text-center font-semibold hidden sm:table-cell">D</th>
                      <th className="px-3 py-4 text-center font-semibold hidden sm:table-cell">L</th>
                      <th className="px-3 py-4 text-center font-semibold hidden md:table-cell">GF</th>
                      <th className="px-3 py-4 text-center font-semibold hidden md:table-cell">GA</th>
                      <th className="px-3 py-4 text-center font-semibold hidden md:table-cell">GD</th>
                      <th className="px-4 py-4 text-center font-semibold text-gold-500">Pts</th>
                      <th className="px-4 py-4 text-center font-semibold hidden lg:table-cell">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                    {rows.map((row, i) => (
                      <motion.tr key={row.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                        className="hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors">
                        <td className="px-4 py-4">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs ${row.position <= 3 ? 'bg-gold-400/20 text-gold-500' : 'text-ink-400'}`}>{row.position}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {row.team_logo && <img src={row.team_logo} alt="" className="h-8 w-8 rounded-lg" />}
                            <span className="font-semibold text-ink-900 dark:text-white">{row.team_name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-center text-ink-600 dark:text-ink-300 font-medium">{row.played}</td>
                        <td className="px-3 py-4 text-center text-green-600 dark:text-green-400 font-medium hidden sm:table-cell">{row.won}</td>
                        <td className="px-3 py-4 text-center text-ink-500 font-medium hidden sm:table-cell">{row.drawn}</td>
                        <td className="px-3 py-4 text-center text-red-600 dark:text-red-400 font-medium hidden sm:table-cell">{row.lost}</td>
                        <td className="px-3 py-4 text-center text-ink-600 dark:text-ink-300 hidden md:table-cell">{row.goals_for}</td>
                        <td className="px-3 py-4 text-center text-ink-600 dark:text-ink-300 hidden md:table-cell">{row.goals_against}</td>
                        <td className="px-3 py-4 text-center text-ink-600 dark:text-ink-300 font-medium hidden md:table-cell">{row.goal_difference > 0 ? '+' : ''}{row.goal_difference}</td>
                        <td className="px-4 py-4 text-center"><span className="font-display text-base font-bold text-ink-900 dark:text-white">{row.points}</span></td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <div className="flex justify-center gap-1">
                            {(row.form || []).map((f, idx) => (
                              <span key={idx} className={`h-6 w-6 flex items-center justify-center rounded text-[10px] font-bold text-white ${f === 'W' ? 'bg-green-500' : f === 'D' ? 'bg-ink-400' : 'bg-red-500'}`}>{f}</span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No standings yet</h3>
            <p className="text-ink-400 mt-2">Standings will appear once data is added in the admin panel.</p>
          </div>
        )}

        {rows.length > 0 && (
          <Reveal delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-400">
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded bg-green-500 text-white flex items-center justify-center font-bold">W</span> Win</span>
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded bg-ink-400 text-white flex items-center justify-center font-bold">D</span> Draw</span>
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded bg-red-500 text-white flex items-center justify-center font-bold">L</span> Loss</span>
              <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-lg bg-gold-400/20 text-gold-500 flex items-center justify-center"><Trophy size={12} /></span> Champions qualification</span>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
