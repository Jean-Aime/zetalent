import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight, MapPin, Calendar, Users, Trophy, SearchX, Loader2 } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

interface Sport { id: string; slug: string; name: string; color: string; }
interface Team {
  id: string; slug: string; name: string; short_name: string;
  sport_id: string; sport_slug: string; city: string; founded: number;
  stadium: string; coach: string; primary_color: string; logo_url: string;
  description: string; achievements: string[];
}

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState('all');

  useEffect(() => {
    Promise.all([api.getTeams(), api.getSports()])
      .then(([t, s]) => { setTeams(t); setSports(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getSportName = (team: Team) => sports.find(s => s.id === team.sport_id || s.slug === team.sport_slug)?.name || team.sport_slug || '';

  const filtered = useMemo(() => {
    let r = [...teams];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(t => t.name.toLowerCase().includes(q) || t.city?.toLowerCase().includes(q) || t.coach?.toLowerCase().includes(q));
    }
    if (activeSport !== 'all') r = r.filter(t => t.sport_slug === activeSport || t.sport_id === activeSport);
    return r;
  }, [teams, search, activeSport]);

  return (
    <div className="pt-8 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Clubs</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              All <span className="gradient-text">Teams</span>
            </h1>
            <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-xl mx-auto">
              Discover the clubs powering women's sports across Rwanda.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search teams by name, city, coach..." className="input-zt !pl-12 !pr-12" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white"><X size={18} /></button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveSport('all')}
                className={`chip transition-all ${activeSport === 'all' ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                All Sports
              </button>
              {sports.map(s => (
                <button key={s.id} onClick={() => setActiveSport(s.slug)}
                  className={`chip transition-all ${activeSport === s.slug ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400/10'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mb-6 text-sm text-ink-400">{filtered.length} {filtered.length === 1 ? 'team' : 'teams'} found</div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((team, i) => (
              <Reveal key={team.id} delay={i * 0.05}>
                <Link to={`/teams/${team.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl h-full">
                  <div className="relative h-28 overflow-hidden" style={{ backgroundColor: team.primary_color || '#F4B400' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/30" />
                    <div className="absolute -bottom-8 left-5">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt={team.name} loading="lazy"
                          className="h-16 w-16 rounded-xl object-cover ring-4 ring-white dark:ring-ink-800 bg-white" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl ring-4 ring-white dark:ring-ink-800 bg-white flex items-center justify-center font-display font-bold text-xl text-ink-700">
                          {(team.short_name || team.name).slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <span className="absolute top-3 right-3 chip bg-white/90 text-ink-900">{getSportName(team)}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 pt-10">
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white leading-snug group-hover:text-gold-400 transition-colors">{team.name}</h3>
                    <div className="mt-3 space-y-2 text-sm text-ink-500 dark:text-ink-400">
                      {team.city && <div className="flex items-center gap-2"><MapPin size={14} className="text-gold-500 shrink-0" /><span>{team.city}</span></div>}
                      {team.founded && <div className="flex items-center gap-2"><Calendar size={14} className="text-gold-500 shrink-0" /><span>Founded {team.founded}</span></div>}
                      {team.coach && <div className="flex items-center gap-2"><Users size={14} className="text-gold-500 shrink-0" /><span className="truncate">Coach: {team.coach}</span></div>}
                    </div>
                    {Array.isArray(team.achievements) && team.achievements.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
                        <Trophy size={14} className="text-gold-500" />
                        <span>{team.achievements.length} {team.achievements.length === 1 ? 'honour' : 'honours'}</span>
                      </div>
                    )}
                    <div className="mt-auto pt-5 border-t border-ink-100 dark:border-ink-700 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gold-500 group-hover:text-gold-400 flex items-center gap-1.5">
                        View Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-ink-300 dark:text-ink-600">{team.short_name}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <SearchX size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No teams found</h3>
            <p className="text-ink-400 mt-2">Try adjusting your search or filters.</p>
            <button onClick={() => { setSearch(''); setActiveSport('all'); }} className="btn-outline mt-6">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
