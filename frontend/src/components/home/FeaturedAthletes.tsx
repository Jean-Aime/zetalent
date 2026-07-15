import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SectionHeader, Reveal } from '../common/NewsCard';
import { api } from '../../lib/api';

interface Player {
  id: string; slug: string; name: string; team_name: string;
  position: string; shirt_number: number; flag: string;
  photo_url: string; is_featured: boolean;
  stats: { label: string; value: string }[];
}

export function FeaturedAthletes() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    api.getPlayers({ featured: true })
      .then(data => setPlayers(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  if (!players.length) return null;

  return (
    <section className="py-16">
      <div className="container-zt">
        <Reveal>
          <SectionHeader label="Athletes" title="Featured Stars" viewAllHref="/players" />
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {players.map((player, i) => (
            <motion.div key={player.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link to={`/players/${player.slug}`} className="group block card-zt overflow-hidden hover-lift hover:shadow-2xl">
                <div className="relative h-72 overflow-hidden bg-ink-100 dark:bg-ink-700">
                  {player.photo_url ? (
                    <img src={player.photo_url} alt={player.name} loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800">
                      <span className="font-display text-5xl font-bold text-ink-400">{player.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/20 to-transparent" />
                  <div className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-ink-950 font-display font-bold text-lg">
                    {player.shirt_number || '★'}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {player.flag && <span className="text-lg">{player.flag}</span>}
                      <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">{player.position}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white leading-tight">{player.name}</h3>
                    <p className="text-xs text-ink-300 mt-0.5">{player.team_name || 'Free Agent'}</p>
                  </div>
                </div>
                <div className="p-4">
                  {Array.isArray(player.stats) && player.stats.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {player.stats.slice(0, 2).map((stat, idx) => (
                        <div key={idx} className="text-center py-2 rounded-lg bg-ink-50 dark:bg-ink-800/50">
                          <p className="font-display text-lg font-bold text-gold-400">{stat.value}</p>
                          <p className="text-[10px] text-ink-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm font-semibold text-gold-500 group-hover:text-gold-400 transition-colors">
                    View Profile <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
