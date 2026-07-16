import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, MapPin, Calendar, Cake, Ruler, Twitter, Instagram, ArrowRight, Loader2 } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
function proxyUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) return url;
  return `${API_BASE}/img-proxy?url=${encodeURIComponent(url)}`;
}

interface Player {
  id: string; slug: string; name: string; team_id: string; team_name: string;
  sport_slug: string; position: string; shirt_number: number;
  nationality: string; flag: string; age: number; height: string;
  photo_url: string; bio: string; is_featured: boolean;
  achievements: string[]; stats: { label: string; value: string }[];
  social_links: { platform: string; handle: string }[];
}

export function PlayerDetailPage() {
  const { slug } = useParams();
  const [player, setPlayer] = useState<Player | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;
    api.getPlayers().then(all => {
      setPlayer(all.find((p: Player) => p.slug === slug) ?? null);
    }).catch(() => setPlayer(null));
  }, [slug]);

  if (player === undefined) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-10 w-10 animate-spin text-gold-400" /></div>;
  if (player === null) return <Navigate to="/players" replace />;

  const bio = typeof player.bio === 'string' ? player.bio : '';
  const achievements: string[] = Array.isArray(player.achievements) ? player.achievements : [];
  const stats: { label: string; value: string }[] = Array.isArray(player.stats) ? player.stats : [];
  const socialLinks: { platform: string; handle: string }[] = Array.isArray(player.social_links) ? player.social_links : [];

  return (
    <div className="pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="pt-6">
            <Link to="/players" className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 dark:text-ink-300 hover:text-gold-400 transition-colors">
              ← Back to Players
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 lg:gap-12">
            {/* Photo */}
            <div className="relative">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }} className="relative rounded-3xl overflow-hidden h-[400px] bg-ink-100 dark:bg-ink-700 shadow-xl">
                {player.photo_url ? (
                  <img src={proxyUrl(player.photo_url)} alt={player.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-ink-200 to-ink-300 dark:from-ink-700 dark:to-ink-800">
                    <span className="font-display text-7xl font-bold text-ink-400">{player.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 font-display font-bold text-xl shadow-lg">
                  {player.shirt_number || '★'}
                </div>
                {player.is_featured && (
                  <div className="absolute top-4 right-4">
                    <span className="chip bg-gold-400/90 text-ink-950 backdrop-blur shadow-lg"><Trophy size={12} /> Featured</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                {player.flag && <span className="text-3xl leading-none">{player.flag}</span>}
                <span className="text-sm font-semibold text-ink-500 dark:text-ink-300 uppercase tracking-wider">{player.nationality}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight leading-[1.1]">{player.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-ink-600 dark:text-ink-300">
                <span className="font-semibold text-gold-500">{player.position}</span>
                {player.team_name && <><span className="text-ink-300 dark:text-ink-600">•</span><span className="font-medium">{player.team_name}</span></>}
              </div>
              <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-ink-600 dark:text-ink-300">
                {player.age && <span className="inline-flex items-center gap-2"><Cake size={16} className="text-gold-500" /><span className="font-semibold">{player.age}</span><span className="text-ink-400">years old</span></span>}
                {player.height && <span className="inline-flex items-center gap-2"><Ruler size={16} className="text-gold-500" /><span className="font-semibold">{player.height}</span></span>}
              </div>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-6">
                  {socialLinks.map((s, i) => {
                    const Icon = s.platform === 'twitter' ? Twitter : s.platform === 'instagram' ? Instagram : null;
                    if (!Icon) return null;
                    return (
                      <a key={i} href={`https://${s.platform}.com/${s.handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-gold-400 hover:text-ink-950 transition-all">
                        <Icon size={18} />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Stats */}
        {stats.length > 0 && (
          <Reveal delay={0.1}>
            <section className="mt-14">
              <div className="flex items-center gap-3 mb-6"><span className="gold-divider" /><span className="section-label">Performance</span></div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white mb-6">Career Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="card-zt p-5 text-center">
                    <p className="font-display text-3xl font-bold text-gold-400">{stat.value}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400 uppercase tracking-wider mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* Bio + Achievements */}
        {(bio || achievements.length > 0) && (
          <Reveal delay={0.1}>
            <section className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
              {bio && (
                <div>
                  <div className="flex items-center gap-3 mb-6"><span className="gold-divider" /><span className="section-label">Profile</span></div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white mb-6">Biography</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {bio.split('\n').filter(p => p.trim()).map((para, i) => (
                      <motion.p key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="text-base sm:text-lg text-ink-700 dark:text-ink-200 leading-[1.8] mb-6">{para}</motion.p>
                    ))}
                  </div>
                </div>
              )}
              {achievements.length > 0 && (
                <aside className="lg:sticky lg:top-24 lg:self-start">
                  <div className="card-zt p-6">
                    <div className="flex items-center gap-2 mb-5"><Trophy size={20} className="text-gold-400" /><h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Achievements</h3></div>
                    <ul className="space-y-3">
                      {achievements.map((ach, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-500"><Trophy size={13} /></span>
                          <span className="text-sm font-medium text-ink-700 dark:text-ink-200 leading-snug">{ach}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </section>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-12 pt-8 border-t border-ink-100 dark:border-ink-700 flex flex-wrap items-center gap-4 text-sm text-ink-400">
            {player.nationality && <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-gold-500" /> {player.nationality}</span>}
            {player.team_name && <span className="inline-flex items-center gap-1.5"><Calendar size={14} className="text-gold-500" /> {player.team_name}</span>}
            <Link to="/players" className="ml-auto inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-400 font-semibold">All Players <ArrowRight size={14} /></Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
