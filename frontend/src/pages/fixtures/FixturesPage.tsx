import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Star, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Reveal } from '../../components/common/NewsCard';

type StatusFilter = 'all' | 'finished' | 'upcoming' | 'live';
interface Sport { id: string; slug: string; name: string; }
interface Match {
  id: string; sport_id: string; sport_slug: string;
  home_team_name: string; home_team_logo: string;
  away_team_name: string; away_team_logo: string;
  home_score: number | null; away_score: number | null;
  match_date: string; match_time: string; venue: string;
  status: string; league_name: string; matchweek: number; mvp: string;
}

export function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sportFilter, setSportFilter] = useState('all');

  useEffect(() => {
    Promise.all([api.getMatches(), api.getSports()])
      .then(([m, s]) => { setMatches(m); setSports(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = [...matches];
    if (statusFilter !== 'all') r = r.filter(m => m.status === statusFilter);
    if (sportFilter !== 'all') r = r.filter(m => m.sport_slug === sportFilter || m.sport_id === sportFilter);
    return r.sort((a, b) => (a.match_date || '').localeCompare(b.match_date || ''));
  }, [matches, statusFilter, sportFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, Match[]> = {};
    filtered.forEach(m => {
      const d = (m.match_date || '').slice(0, 10);
      if (!g[d]) g[d] = [];
      g[d].push(m);
    });
    return Object.entries(g).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All Matches' },
    { key: 'finished', label: 'Results' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'live', label: 'Live' },
  ];

  return (
    <div className="py-12 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Schedule</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              Fixtures & <span className="gradient-text">Results</span>
            </h1>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {statusTabs.map(tab => (
                <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
                  className={`chip transition-all ${statusFilter === tab.key ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSportFilter('all')}
                className={`chip transition-all ${sportFilter === 'all' ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800/50 text-ink-500 hover:bg-ink-100'}`}>
                All Sports
              </button>
              {sports.map(s => (
                <button key={s.id} onClick={() => setSportFilter(s.slug)}
                  className={`chip transition-all ${sportFilter === s.slug ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-950' : 'bg-ink-50 dark:bg-ink-800/50 text-ink-500 hover:bg-ink-100'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>
        ) : grouped.length > 0 ? (
          <div className="space-y-8">
            {grouped.map(([date, dayMatches], gi) => (
              <Reveal key={date} delay={gi * 0.05}>
                <div>
                  <div className="sticky top-20 z-10 mb-4">
                    <div className="glass rounded-xl px-5 py-3 inline-flex items-center gap-3 shadow-md">
                      <Calendar size={18} className="text-gold-400" />
                      <span className="font-display font-bold text-ink-900 dark:text-white">
                        {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="chip bg-gold-400/15 text-gold-500">{dayMatches.length} {dayMatches.length === 1 ? 'match' : 'matches'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dayMatches.map(match => (
                      <motion.div key={match.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.4 }}
                        className="card-zt p-4 sm:p-5 hover-lift hover:shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-ink-400">{match.league_name}</span>
                          {match.status === 'live' ? (
                            <span className="chip bg-red-500 text-white"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live</span>
                          ) : match.status === 'upcoming' ? (
                            <span className="chip bg-blue-500/15 text-blue-500">Upcoming</span>
                          ) : (
                            <span className="chip bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">Full Time</span>
                          )}
                        </div>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                          <div className="flex items-center gap-3 min-w-0 justify-end text-right">
                            <span className="font-semibold text-ink-900 dark:text-white truncate text-sm sm:text-base">{match.home_team_name}</span>
                            {match.home_team_logo && <img src={match.home_team_logo} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shrink-0" />}
                          </div>
                          <div className="flex flex-col items-center px-3 sm:px-6 py-2 rounded-2xl bg-ink-50 dark:bg-ink-800/50 min-w-[80px]">
                            {match.status === 'upcoming' ? (
                              <><span className="font-display text-lg sm:text-2xl font-bold text-ink-400">VS</span>
                              <span className="text-[10px] text-ink-400 mt-0.5">{match.match_time}</span></>
                            ) : (
                              <span className="font-display text-xl sm:text-3xl font-bold text-ink-900 dark:text-white tabular-nums">
                                {match.home_score} <span className="text-ink-300 dark:text-ink-600">-</span> {match.away_score}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 min-w-0">
                            {match.away_team_logo && <img src={match.away_team_logo} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shrink-0" />}
                            <span className="font-semibold text-ink-900 dark:text-white truncate text-sm sm:text-base">{match.away_team_name}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 flex flex-wrap items-center gap-4 text-xs text-ink-400">
                          {match.status === 'upcoming' && match.match_time && <span className="flex items-center gap-1.5"><Clock size={12} /> {match.match_time}</span>}
                          {match.venue && <span className="flex items-center gap-1.5"><MapPin size={12} /> {match.venue}</span>}
                          {match.status === 'finished' && match.mvp && <span className="flex items-center gap-1.5 text-gold-500"><Star size={12} className="fill-gold-400" /> MVP: {match.mvp}</span>}
                          {match.matchweek > 0 && <span className="ml-auto">Matchweek {match.matchweek}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No matches found</h3>
            <p className="text-ink-400 mt-2">Try changing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
