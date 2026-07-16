import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/api$/, '');
function proxyUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://localhost') || url.startsWith('/')) return url;
  return `${BASE}/api/img-proxy?url=${encodeURIComponent(url)}`;
}

interface Sport { id: string; slug: string; name: string; }
interface Player {
  id: string; slug: string; name: string; team_name: string; sport_slug: string;
  position: string; shirt_number: number; nationality: string; flag: string;
  age: number; photo_url: string; is_featured: boolean;
}

export function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSport, setActiveSport] = useState('all');

  useEffect(() => {
    Promise.all([api.getPlayers(), api.getSports()])
      .then(([p, s]) => { setPlayers(p); setSports(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let r = [...players];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.team_name?.toLowerCase().includes(q) || p.position?.toLowerCase().includes(q) || p.nationality?.toLowerCase().includes(q));
    }
    if (activeSport !== 'all') r = r.filter(p => p.sport_slug === activeSport);
    return r;
  }, [players, search, activeSport]);

  return (
    <div className="pt-8 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" /><span className="section-label">Athletes</span><span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              All <span className="gradient-text">Players</span>
            </h1>
            <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-xl mx-auto">
              Meet the remarkable women defining the future of sports across Rwanda.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search players, teams, positions..." className="input-zt !pl-12 !pr-12" />
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

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((player, i) => (
              <Reveal key={player.id} delay={i * 0.04}>
                <Link to={`/players/${player.slug}`} className="group flex flex-col card-zt overflow-hidden hover-lift hover:shadow-xl">
                  <div className="relative h-72 overflow-hidden bg-ink-100 dark:bg-ink-700">
                    {player.photo_url ? (
                      <img src={proxyUrl(player.photo_url)} alt={player.name} loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800">
                        <span className="font-display text-5xl font-bold text-ink-400">{player.name.slice(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-ink-950 font-display font-bold text-lg shadow-lg">
                      {player.shirt_number || '★'}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        {player.flag && <span className="text-lg leading-none">{player.flag}</span>}
                        <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">{player.position}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-white leading-tight">{player.name}</h3>
                      <p className="text-xs text-ink-300 mt-0.5">{player.team_name || 'Free Agent'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-gold-500 group-hover:text-gold-400 transition-colors">
                      View Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-ink-300 dark:text-ink-600 mb-4" />
            <h3 className="font-display text-xl font-bold text-ink-700 dark:text-ink-200">No players found</h3>
            <p className="text-ink-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
