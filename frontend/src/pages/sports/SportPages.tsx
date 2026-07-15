import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Users, MapPin, ChevronRight, Loader2, Trophy } from 'lucide-react';
import { getIcon } from '../../utils/icons';
import { NewsCard, SectionHeader, Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

interface Sport { id: string; slug: string; name: string; color: string; icon: string; team_count: number; }
interface Team { id: string; slug: string; name: string; city: string; founded: number; coach: string; logo_url: string; sport_id: string; sport_slug: string; }
interface Player { id: string; slug: string; name: string; position: string; photo_url: string; sport_id: string; sport_slug: string; }
interface Match {
  id: string; sport_id: string; sport_slug: string;
  home_team_name: string; away_team_name: string;
  home_team_logo: string; away_team_logo: string;
  home_score: number | null; away_score: number | null;
  match_date: string; match_time: string; status: string; league_name: string;
}
interface Standing {
  id: string; sport_id: string; position: number; team_name: string; team_logo: string;
  played: number; won: number; drawn: number; lost: number;
  goal_difference: number; points: number; form: string[];
}
interface Article {
  id: string; slug: string; image_url: string; published_at: string; sport_slug: string;
  translations: Record<string, { title: string; excerpt: string; body: string }>;
}

export function SportsIndexPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSports(), api.getTeams()])
      .then(([s, t]) => { setSports(s); setTeams(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>;

  return (
    <div className="py-12">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Disciplines</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              Explore All <span className="gradient-text">Sports</span>
            </h1>
            <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-xl mx-auto">
              From the pitch to the track — comprehensive coverage of women's sports across Rwanda.
            </p>
          </div>
        </Reveal>

        {sports.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No sports configured yet</h3>
            <p className="text-ink-400 mt-2">Sports will appear here once added in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport, i) => {
              const Icon = getIcon(sport.icon);
              const sportTeams = teams.filter(t => t.sport_id === sport.id || t.sport_slug === sport.slug);
              return (
                <Reveal key={sport.id} delay={i * 0.1}>
                  <Link to={`/sports/${sport.slug}`} className="group block card-zt overflow-hidden hover-lift hover:shadow-2xl relative">
                    <div className="h-2" style={{ backgroundColor: sport.color }} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${sport.color}15` }}>
                          <Icon size={28} style={{ color: sport.color }} />
                        </span>
                        <ChevronRight size={20} className="text-ink-300 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white group-hover:text-gold-400 transition-colors">{sport.name}</h3>
                      <div className="flex items-center gap-4 mt-4 text-sm text-ink-400">
                        <span className="flex items-center gap-1.5"><Users size={15} /> {sport.team_count || sportTeams.length} teams</span>
                      </div>
                      {sportTeams.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-700">
                          <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Top Teams</p>
                          <div className="flex gap-2">
                            {sportTeams.slice(0, 3).map(team => (
                              team.logo_url
                                ? <img key={team.id} src={team.logo_url} alt={team.name} className="h-8 w-8 rounded-lg object-cover" />
                                : <div key={team.id} className="h-8 w-8 rounded-lg bg-ink-200 dark:bg-ink-700 flex items-center justify-center text-xs font-bold text-ink-500">{team.name.slice(0, 2)}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function SportDetailPage() {
  const { slug } = useParams();
  const [sport, setSport] = useState<Sport | null | undefined>(undefined);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [news, setNews] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) return;
    api.getSports().then(all => {
      const found: Sport | undefined = all.find((s: Sport) => s.slug === slug);
      setSport(found ?? null);
      if (found) {
        Promise.all([
          api.getTeams(slug),
          api.getPlayers({ sport: slug }),
          api.getMatches({ sport: slug }),
          api.getStandings(slug),
          api.getNews({ sport: slug, limit: '6' }),
        ]).then(([t, p, m, st, n]) => {
          setTeams(t); setPlayers(p); setMatches(m);
          setStandings(st.filter((r: Standing) => r.sport_id === found.id).sort((a: Standing, b: Standing) => a.position - b.position));
          setNews(n);
        }).catch(() => {});
      }
    }).catch(() => setSport(null));
  }, [slug]);

  if (sport === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>;
  if (sport === null) return <Navigate to="/sports" replace />;

  const Icon = getIcon(sport.icon);
  const getTitle = (a: Article) => a.translations?.en?.title || a.slug;

  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden bg-ink-950">
        <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 30% 50%, ${sport.color}, transparent 70%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-zt">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-center gap-5">
              <span className="flex h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: `${sport.color}25` }}>
                <Icon size={40} style={{ color: sport.color }} />
              </span>
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm text-ink-300">
                  <Link to="/sports" className="hover:text-gold-400">Sports</Link><ChevronRight size={14} />
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">{sport.name}</h1>
                <p className="text-ink-300 mt-1">{sport.team_count || teams.length} active teams</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-zt mt-10 space-y-12">
        {/* Standings */}
        {standings.length > 0 && (
          <Reveal>
            <SectionHeader label="Table" title="League Standings" viewAllHref="/standings" />
            <div className="card-zt overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 dark:bg-ink-800/50 text-xs uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">Team</th>
                    <th className="px-3 py-3 text-center font-semibold hidden sm:table-cell">P</th>
                    <th className="px-3 py-3 text-center font-semibold hidden sm:table-cell">W</th>
                    <th className="px-3 py-3 text-center font-semibold hidden sm:table-cell">D</th>
                    <th className="px-3 py-3 text-center font-semibold hidden sm:table-cell">L</th>
                    <th className="px-3 py-3 text-center font-semibold hidden md:table-cell">GD</th>
                    <th className="px-4 py-3 text-center font-semibold text-gold-500">Pts</th>
                    <th className="px-4 py-3 text-center font-semibold hidden lg:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
                  {standings.map(row => (
                    <tr key={row.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors">
                      <td className="px-4 py-3"><span className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs ${row.position <= 3 ? 'bg-gold-400/20 text-gold-500' : 'text-ink-400'}`}>{row.position}</span></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2.5">{row.team_logo && <img src={row.team_logo} alt="" className="h-7 w-7 rounded-md" />}<span className="font-semibold text-ink-900 dark:text-white">{row.team_name}</span></div></td>
                      <td className="px-3 py-3 text-center text-ink-600 dark:text-ink-300 hidden sm:table-cell">{row.played}</td>
                      <td className="px-3 py-3 text-center text-ink-600 dark:text-ink-300 hidden sm:table-cell">{row.won}</td>
                      <td className="px-3 py-3 text-center text-ink-600 dark:text-ink-300 hidden sm:table-cell">{row.drawn}</td>
                      <td className="px-3 py-3 text-center text-ink-600 dark:text-ink-300 hidden sm:table-cell">{row.lost}</td>
                      <td className="px-3 py-3 text-center text-ink-600 dark:text-ink-300 hidden md:table-cell">{row.goal_difference > 0 ? '+' : ''}{row.goal_difference}</td>
                      <td className="px-4 py-3 text-center font-display font-bold text-ink-900 dark:text-white">{row.points}</td>
                      <td className="px-4 py-3 hidden lg:table-cell"><div className="flex justify-center gap-1">{(row.form || []).map((f, idx) => (<span key={idx} className={`h-5 w-5 flex items-center justify-center rounded text-[10px] font-bold text-white ${f === 'W' ? 'bg-green-500' : f === 'D' ? 'bg-ink-400' : 'bg-red-500'}`}>{f}</span>))}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}

        {/* Matches */}
        {matches.length > 0 && (
          <Reveal>
            <SectionHeader label="Fixtures" title="Matches" viewAllHref="/fixtures" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.slice(0, 6).map(m => (
                <div key={m.id} className="card-zt p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-ink-400">{m.league_name}</span>
                    <span className={`chip text-xs ${m.status === 'live' ? 'bg-red-500 text-white' : m.status === 'upcoming' ? 'bg-blue-500/15 text-blue-500' : 'bg-ink-100 dark:bg-ink-700 text-ink-500'}`}>
                      {m.status === 'live' ? 'Live' : m.status === 'upcoming' ? 'Upcoming' : 'FT'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-ink-800 dark:text-ink-100 truncate">{m.home_team_name}</span>
                    <span className="font-display font-bold text-lg text-ink-900 dark:text-white shrink-0 px-2">
                      {m.status === 'upcoming' ? 'vs' : `${m.home_score ?? 0} - ${m.away_score ?? 0}`}
                    </span>
                    <span className="font-semibold text-sm text-ink-800 dark:text-ink-100 truncate text-right">{m.away_team_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* Teams */}
        {teams.length > 0 && (
          <Reveal>
            <SectionHeader label="Clubs" title="Teams" viewAllHref="/teams" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {teams.map(team => (
                <Link key={team.id} to={`/teams/${team.slug}`} className="group card-zt p-5 hover-lift hover:shadow-lg flex items-center gap-4">
                  {team.logo_url
                    ? <img src={team.logo_url} alt={team.name} className="h-16 w-16 rounded-2xl object-cover" />
                    : <div className="h-16 w-16 rounded-2xl bg-ink-200 dark:bg-ink-700 flex items-center justify-center font-display font-bold text-xl text-ink-500">{team.name.slice(0, 2)}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white group-hover:text-gold-400 transition-colors truncate">{team.name}</h3>
                    {team.city && <p className="text-sm text-ink-400 flex items-center gap-1.5 mt-1"><MapPin size={13} /> {team.city}</p>}
                    {team.founded && <p className="text-xs text-ink-400 mt-0.5">Est. {team.founded}{team.coach ? ` • ${team.coach}` : ''}</p>}
                  </div>
                  <ArrowRight size={18} className="text-ink-300 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {/* Players */}
        {players.length > 0 && (
          <Reveal>
            <SectionHeader label="Athletes" title="Top Players" viewAllHref="/players" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {players.slice(0, 8).map(player => (
                <Link key={player.id} to={`/players/${player.slug}`} className="group card-zt overflow-hidden hover-lift hover:shadow-xl">
                  <div className="relative h-56 overflow-hidden bg-ink-100 dark:bg-ink-700">
                    {player.photo_url
                      ? <img src={player.photo_url} alt={player.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      : <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800"><span className="font-display text-4xl font-bold text-ink-400">{player.name.slice(0, 2).toUpperCase()}</span></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                    <div className="absolute bottom-0 p-3">
                      <span className="text-xs font-semibold text-gold-400">{player.position}</span>
                      <h4 className="font-display font-bold text-white text-sm">{player.name}</h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        )}

        {/* News */}
        {news.length > 0 && (
          <Reveal>
            <SectionHeader label="Newsroom" title="Latest News" viewAllHref="/news" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(a => <NewsCard key={a.id} article={a} />)}
            </div>
          </Reveal>
        )}

        {teams.length === 0 && players.length === 0 && matches.length === 0 && news.length === 0 && (
          <div className="text-center py-20">
            <Trophy size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No data yet for {sport.name}</h3>
            <p className="text-ink-400 mt-2">Teams, matches and news will appear here once added.</p>
          </div>
        )}
      </div>
    </div>
  );
}
