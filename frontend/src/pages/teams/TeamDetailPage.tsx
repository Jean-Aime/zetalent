import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Trophy, ArrowLeft, ArrowRight, Shirt, Award, Newspaper, Loader2 } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

interface Team {
  id: string; slug: string; name: string; short_name: string;
  sport_id: string; sport_slug: string; city: string; founded: number;
  stadium: string; coach: string; primary_color: string; logo_url: string;
  description: string; achievements: string[];
}
interface Player {
  id: string; slug: string; name: string; position: string;
  shirt_number: number; nationality: string; flag: string;
  photo_url: string; achievements: string[];
}
interface Match {
  id: string; home_team_id: string; away_team_id: string;
  home_team_name: string; away_team_name: string;
  home_team_logo: string; away_team_logo: string;
  home_score: number | null; away_score: number | null;
  match_date: string; match_time: string; venue: string;
  status: string; league_name: string;
}
interface Article {
  id: string; slug: string; image_url: string; published_at: string;
  translations: Record<string, { title: string; excerpt: string; body: string }>;
}

export function TeamDetailPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState<Team | null | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<Article[]>([]);

  useEffect(() => {
    if (!slug) return;
    api.getTeams().then(all => {
      const found: Team | undefined = all.find((t: Team) => t.slug === slug);
      setTeam(found ?? null);
      if (found) {
        Promise.all([
          api.getPlayers({ team: found.id }),
          api.getMatches(),
          api.getNews({ sport: found.sport_slug, limit: '3' }),
        ]).then(([p, m, n]) => {
          setPlayers(p);
          setMatches(m.filter((mx: Match) => mx.home_team_id === found.id || mx.away_team_id === found.id).slice(0, 6));
          setNews(n.slice(0, 3));
        }).catch(() => {});
      }
    }).catch(() => setTeam(null));
  }, [slug]);

  if (team === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>;
  if (team === null) return <Navigate to="/teams" replace />;

  const achievements: string[] = Array.isArray(team.achievements) ? team.achievements : [];
  const getTitle = (a: Article) => a.translations?.en?.title || a.slug;

  return (
    <div className="pb-16">
      {/* Hero */}
      <div className="relative h-[45vh] min-h-[360px] overflow-hidden bg-ink-950">
        <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 50% 120%, ${team.primary_color || '#F4B400'}, transparent 70%)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-zt w-full pb-12">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="flex flex-col items-center text-center">
              <Link to="/teams" className="inline-flex items-center gap-2 text-sm text-ink-300 hover:text-gold-400 transition-colors mb-6">
                <ArrowLeft size={16} /> Back to Teams
              </Link>
              {team.logo_url ? (
                <img src={team.logo_url} alt={team.name} className="h-28 w-28 rounded-2xl object-cover ring-4 ring-white/10 bg-white mb-5" />
              ) : (
                <div className="h-28 w-28 rounded-2xl ring-4 ring-white/10 bg-white flex items-center justify-center font-display font-bold text-3xl text-ink-700 mb-5">
                  {(team.short_name || team.name).slice(0, 2)}
                </div>
              )}
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight">{team.name}</h1>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-ink-200">
                {team.city && <span className="flex items-center gap-1.5"><MapPin size={15} className="text-gold-400" /> {team.city}</span>}
                {team.founded && <span className="flex items-center gap-1.5"><Calendar size={15} className="text-gold-400" /> Founded {team.founded}</span>}
                {team.stadium && <span className="flex items-center gap-1.5"><Users size={15} className="text-gold-400" /> {team.stadium}</span>}
                {team.coach && <span className="flex items-center gap-1.5"><Trophy size={15} className="text-gold-400" /> Coach {team.coach}</span>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container-zt">
        {/* Description + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          <Reveal className="lg:col-span-2">
            <div className="card-zt p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4"><span className="gold-divider" /><span className="section-label">About the Club</span></div>
              <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-4">The story of {team.short_name || team.name}</h2>
              <p className="text-ink-600 dark:text-ink-300 leading-relaxed">{team.description || 'No description available yet.'}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-ink-100 dark:border-ink-700">
                {team.city && <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">City</p><p className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5"><MapPin size={14} className="text-gold-500" /> {team.city}</p></div>}
                {team.founded && <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">Founded</p><p className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5"><Calendar size={14} className="text-gold-500" /> {team.founded}</p></div>}
                {team.stadium && <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">Stadium</p><p className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5 truncate"><Users size={14} className="text-gold-500" /> {team.stadium}</p></div>}
                {team.coach && <div><p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-1">Coach</p><p className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5 truncate"><Trophy size={14} className="text-gold-500" /> {team.coach}</p></div>}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-zt p-6 sm:p-8 h-full">
              <div className="flex items-center gap-3 mb-4"><span className="gold-divider" /><span className="section-label">Honours</span></div>
              <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white mb-5">Achievements</h2>
              {achievements.length > 0 ? (
                <ul className="space-y-3">
                  {achievements.map((ach, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-ink-50 dark:bg-ink-900/40">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500"><Trophy size={16} /></span>
                      <span className="text-sm font-medium text-ink-700 dark:text-ink-200 leading-snug">{ach}</span>
                    </motion.li>
                  ))}
                </ul>
              ) : <p className="text-sm text-ink-400">No honours recorded yet.</p>}
            </div>
          </Reveal>
        </div>

        {/* Players */}
        <section className="mt-16">
          <Reveal>
            <div className="flex items-end justify-between mb-6">
              <div><div className="flex items-center gap-3 mb-2"><span className="gold-divider" /><span className="section-label">The Squad</span></div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Players</h2></div>
              <Link to="/players" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-gold-400 transition-colors group">
                All Players <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>
          {players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {players.map((player, i) => (
                <Reveal key={player.id} delay={i * 0.05}>
                  <Link to={`/players/${player.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl h-full">
                    <div className="relative h-52 overflow-hidden bg-ink-100 dark:bg-ink-700">
                      {player.photo_url ? (
                        <img src={player.photo_url} alt={player.name} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800">
                          <span className="font-display text-4xl font-bold text-ink-400">{player.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                      <span className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-ink-950 font-display font-bold text-sm">{player.shirt_number || '★'}</span>
                      {player.flag && <span className="absolute bottom-3 left-3 chip bg-white/90 text-ink-900 backdrop-blur">{player.flag} {player.nationality}</span>}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-base font-bold text-ink-900 dark:text-white group-hover:text-gold-400 transition-colors">{player.name}</h3>
                      <p className="text-sm text-gold-500 font-medium mt-1 flex items-center gap-1.5"><Shirt size={14} /> {player.position}</p>
                      {Array.isArray(player.achievements) && player.achievements.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700 flex items-center gap-1.5 text-xs text-ink-400">
                          <Award size={13} className="text-gold-500" /><span className="truncate">{player.achievements[0]}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="card-zt p-10 text-center"><Users size={40} className="mx-auto text-ink-300 dark:text-ink-600 mb-3" /><h3 className="font-display text-lg font-bold text-ink-700 dark:text-ink-200">No players listed yet</h3></div>
          )}
        </section>

        {/* Recent Matches */}
        {matches.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <div className="flex items-end justify-between mb-6">
                <div><div className="flex items-center gap-3 mb-2"><span className="gold-divider" /><span className="section-label">Fixtures & Results</span></div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Recent Matches</h2></div>
                <Link to="/fixtures" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-gold-400 transition-colors group">
                  All Fixtures <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.map(m => (
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
                  {m.venue && <p className="text-xs text-ink-400 mt-2 flex items-center gap-1"><MapPin size={11} /> {m.venue}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related News */}
        {news.length > 0 && (
          <section className="mt-16">
            <Reveal>
              <div className="flex items-end justify-between mb-6">
                <div><div className="flex items-center gap-3 mb-2"><span className="gold-divider" /><span className="section-label">In the News</span></div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Related News</h2></div>
                <Link to="/news" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-gold-400 transition-colors group">
                  All News <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((a, i) => (
                <Reveal key={a.id} delay={i * 0.05}>
                  <Link to={`/news/${a.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl">
                    {a.image_url && <img src={a.image_url} alt={getTitle(a)} loading="lazy" className="h-44 w-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold text-sm text-ink-800 dark:text-ink-100 group-hover:text-gold-400 transition-colors line-clamp-2">{getTitle(a)}</h3>
                      <p className="text-xs text-ink-400 mt-2">{new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {news.length === 0 && matches.length === 0 && (
          <div className="mt-16 card-zt p-10 text-center">
            <Newspaper size={40} className="mx-auto text-ink-300 dark:text-ink-600 mb-3" />
            <h3 className="font-display text-lg font-bold text-ink-700 dark:text-ink-200">No additional data yet</h3>
            <p className="text-ink-400 mt-1 text-sm">Matches and news will appear here once added.</p>
          </div>
        )}
      </div>
    </div>
  );
}
