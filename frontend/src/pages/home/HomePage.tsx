import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Clock, Eye, Ticket } from 'lucide-react';
import { SocialWall } from '../../components/home/SocialWall';
import { FeaturedAthletes } from '../../components/home/FeaturedAthletes';
import { SponsorsSection, NewsletterSection } from '../../components/home/SponsorsNewsletter';
import { NewsCard, Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

const SLIDE_DURATION = 6000;

const heroStats = [
  { label: 'FIFA #', value: '22' }, { label: 'Wins', value: '18' },
  { label: 'Losses', value: '2' }, { label: 'Draws', value: '4' }, { label: 'Goals', value: '61' },
];

interface Article {
  id: string; slug: string; category: string; sport_slug: string;
  image_url: string; published_at: string; views: number;
  is_featured: boolean; is_trending: boolean; is_breaking: boolean;
  translations: Record<string, { title: string; excerpt: string; body: string }>;
}
interface Sport { id: string; slug: string; name: string; color: string; }
interface Team { id: string; slug: string; name: string; city: string; sport_slug: string; logo_url: string; }
interface Match {
  id: string; home_team_name: string; away_team_name: string;
  home_team_logo: string; away_team_logo: string;
  home_score: number | null; away_score: number | null;
  match_date: string; match_time: string; status: string; league_name: string;
}

function getTitle(a: Article) { return a.translations?.en?.title || a.slug; }

/* ─── Hero ─── */
function HomepageHero({ slides }: { slides: Article[] }) {
  const [current, setCurrent] = useState(0);
  const next = useCallback(() => setCurrent(c => (c + 1) % Math.max(slides.length, 1)), [slides.length]);
  const prev = () => setCurrent(c => (c - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1));
  useEffect(() => { const t = setInterval(next, SLIDE_DURATION); return () => clearInterval(t); }, [next]);

  const slide = slides[current];
  if (!slide) return (
    <section className="relative overflow-hidden bg-ink-950 flex items-center justify-center" style={{ minHeight: 520 }}>
      <div className="text-center text-white">
        <h1 className="font-display text-5xl font-bold mb-4">ZT Media</h1>
        <p className="text-ink-300">Women's Sports in Rwanda</p>
        <Link to="/news" className="btn-gold mt-6 inline-flex">Browse News <ArrowRight size={16} /></Link>
      </div>
    </section>
  );

  return (
    <section className="relative overflow-hidden bg-ink-950" style={{ minHeight: 520 }}>
      <AnimatePresence mode="wait">
        <motion.div key={slide.id} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
          {slide.image_url && <img src={slide.image_url} alt={getTitle(slide)} className="h-full w-full object-cover object-top" />}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/70 to-ink-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/30" />
        </motion.div>
      </AnimatePresence>
      <div className="relative container-zt py-16 sm:py-20">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 mb-4">
            <span className="gold-divider" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">{(slide.sport_slug || 'sports').toUpperCase()} · ZT MEDIA</span>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.h1 key={slide.id} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, delay: 0.1 }} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight">
              {getTitle(slide)}
            </motion.h1>
          </AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }} className="mt-8 inline-block">
            <div className="bg-ink-900/80 backdrop-blur-sm border border-ink-700/60 rounded-2xl overflow-hidden">
              <div className="px-5 py-2 border-b border-ink-700/50"><span className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-400">2026 Season Record</span></div>
              <div className="flex divide-x divide-ink-700/60">
                {heroStats.map(stat => (
                  <div key={stat.label} className="flex flex-col items-center px-5 py-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1">{stat.label}</span>
                    <span className="font-display text-2xl font-bold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="mt-7 flex flex-wrap items-center gap-3">
            <Link to={`/news/${slide.slug}`} className="btn-gold group">Read Full Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></Link>
            <Link to="/news" className="btn-outline !border-white/30 !text-white hover:!border-gold-400 hover:!text-gold-400 text-sm">View All News</Link>
          </motion.div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
          <button onClick={prev} className="flex h-9 w-9 items-center justify-center rounded-full glass text-white hover:bg-gold-400 hover:text-ink-950 transition-all"><ChevronLeft size={18} /></button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}>
                <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-7 bg-gold-400' : 'w-2 bg-white/40 hover:bg-white/70'}`} />
              </button>
            ))}
          </div>
          <button onClick={next} className="flex h-9 w-9 items-center justify-center rounded-full glass text-white hover:bg-gold-400 hover:text-ink-950 transition-all"><ChevronRight size={18} /></button>
        </div>
      )}
    </section>
  );
}

/* ─── Sports Strip ─── */
function SportsStrip({ sports }: { sports: Sport[] }) {
  if (!sports.length) return null;
  return (
    <div className="border-b border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-900 sticky top-[73px] z-30">
      <div className="container-zt">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0">
          {sports.map(sport => (
            <Link key={sport.slug} to={`/sports/${sport.slug}`}
              className="flex items-center gap-2 px-4 py-4 text-sm font-semibold text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white border-b-2 border-transparent hover:border-gold-400 transition-all whitespace-nowrap">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sport.color }} />
              {sport.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Latest News ─── */
function LatestNewsSection({ articles }: { articles: Article[] }) {
  const sorted = [...articles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const main = sorted[0];
  const grid = sorted.slice(1, 7);
  if (!main) return null;

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-ink-950">
      <div className="container-zt">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Latest news</h2>
            <Link to="/news" className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 dark:text-ink-300 hover:text-gold-400 border border-ink-200 dark:border-ink-700 rounded-full px-4 py-2 hover:border-gold-400 transition-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          <Reveal delay={0.05}>
            <Link to={`/news/${main.slug}`} className="group flex flex-col h-full">
              <div className="mb-2"><span className="text-xs font-bold uppercase tracking-widest text-gold-500">{(main.sport_slug || '').toUpperCase()}</span></div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white leading-tight group-hover:text-gold-400 transition-colors mb-4 line-clamp-2">{getTitle(main)}</h3>
              <div className="relative flex-1 min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden bg-ink-100 dark:bg-ink-800">
                {main.image_url && <img src={main.image_url} alt={getTitle(main)} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 absolute inset-0" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
                {main.is_breaking && <div className="absolute top-4 left-4"><span className="chip bg-red-500 text-white animate-pulse text-xs">Breaking</span></div>}
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 text-xs text-white/80">
                  <span className="flex items-center gap-1"><Clock size={11} /> {new Date(main.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Eye size={11} /> {(main.views || 0).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4 content-start">
              {grid.map((article, i) => (
                <motion.div key={article.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 + i * 0.06 }}>
                  <Link to={`/news/${article.slug}`} className="group block">
                    <div className="relative h-32 sm:h-36 rounded-xl overflow-hidden bg-ink-100 dark:bg-ink-800 mb-2">
                      {article.image_url && <img src={article.image_url} alt={getTitle(article)} loading="lazy" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 to-transparent" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500 block">{(article.sport_slug || '').toUpperCase()}</span>
                    <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100 leading-snug group-hover:text-gold-400 transition-colors line-clamp-2 mt-0.5">{getTitle(article)}</h4>
                    <p className="text-xs text-ink-400 mt-1">{new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Fixtures & Promo ─── */
function FixturesAndPromo({ matches }: { matches: Match[] }) {
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const scroll = (dir: 'left' | 'right') => scrollRef?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });

  return (
    <section className="py-10 sm:py-14 bg-ink-50 dark:bg-ink-900/50 border-t border-ink-100 dark:border-ink-800">
      <div className="container-zt">
        <Reveal>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white">Fixtures and results</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => scroll('left')} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 dark:border-ink-700 hover:border-gold-400 hover:text-gold-400 transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll('right')} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 dark:border-ink-700 hover:border-gold-400 hover:text-gold-400 transition-all"><ChevronRight size={18} /></button>
              <Link to="/fixtures" className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 dark:text-ink-300 hover:text-gold-400 border border-ink-200 dark:border-ink-700 rounded-full px-4 py-2 hover:border-gold-400 transition-all ml-1">View all <ArrowRight size={14} /></Link>
            </div>
          </div>
        </Reveal>
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            <div ref={setScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {matches.length === 0 ? (
                <div className="flex items-center justify-center w-full py-10 text-ink-400 text-sm">No matches yet — add them in the admin panel.</div>
              ) : matches.map((match, i) => (
                <motion.div key={match.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex-shrink-0 w-[220px] sm:w-[240px]">
                  <Link to="/fixtures" className="group block bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-2xl p-4 hover:border-gold-400/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-ink-400">{match.match_date ? new Date(match.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${match.status === 'live' ? 'bg-red-500/15 text-red-500' : match.status === 'upcoming' ? 'bg-blue-500/15 text-blue-500' : 'bg-ink-100 dark:bg-ink-700 text-ink-400'}`}>
                        {match.status === 'upcoming' ? match.match_time : match.status === 'live' ? 'Live' : 'FT'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {match.home_team_logo && <img src={match.home_team_logo} alt="" className="h-7 w-7 rounded-md shrink-0" />}
                          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate">{match.home_team_name}</span>
                        </div>
                        <span className="font-display text-lg font-bold text-ink-900 dark:text-white tabular-nums shrink-0">{match.home_score ?? '-'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {match.away_team_logo && <img src={match.away_team_logo} alt="" className="h-7 w-7 rounded-md shrink-0" />}
                          <span className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate">{match.away_team_name}</span>
                        </div>
                        <span className="font-display text-lg font-bold text-ink-900 dark:text-white tabular-nums shrink-0">{match.away_score ?? '-'}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
                      <p className="text-[11px] text-ink-400 truncate">{match.league_name}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <Reveal delay={0.2}>
            <div className="hidden lg:flex w-[220px] shrink-0 flex-col justify-between rounded-2xl bg-gold-400 p-6 text-ink-950 relative overflow-hidden">
              <div className="relative">
                <div className="flex items-center gap-2 mb-3"><Ticket size={20} className="text-ink-900" /><span className="text-xs font-bold uppercase tracking-widest">Match Tickets</span></div>
                <p className="font-display text-xl font-bold leading-tight mb-1">KIGALI QUEENS</p>
                <p className="font-display text-lg font-bold">VS <span className="text-ink-700">MUHANGA</span></p>
                <p className="text-xs mt-2 text-ink-700 font-medium">20 July 2026 · 15:00</p>
              </div>
              <div className="relative mt-4">
                <Link to="/fixtures" className="w-full flex items-center justify-center gap-2 bg-ink-950 text-white font-bold text-sm py-3 rounded-xl hover:bg-ink-800 transition-colors">
                  <Ticket size={15} /> Tickets Available
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Trending + Top Teams ─── */
function TrendingAndTeams({ articles, teams }: { articles: Article[]; teams: Team[] }) {
  const trending = articles.filter(a => a.is_trending).slice(0, 5);

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-ink-950 border-t border-ink-100 dark:border-ink-800">
      <div className="container-zt">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div>
            <Reveal>
              <div className="flex items-center gap-3 mb-6"><TrendingUp size={20} className="text-red-500" /><h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Trending Now</h2></div>
            </Reveal>
            {trending.length > 0 ? (
              <div className="space-y-0 divide-y divide-ink-100 dark:divide-ink-800">
                {trending.map((article, i) => <NewsCard key={article.id} article={article} variant="horizontal" index={i} />)}
              </div>
            ) : (
              <p className="text-ink-400 text-sm">No trending articles yet.</p>
            )}
          </div>
          <div>
            <Reveal>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Top Teams</h2>
                <Link to="/teams" className="text-sm font-semibold text-gold-500 hover:text-gold-400 flex items-center gap-1">All Teams <ArrowRight size={14} /></Link>
              </div>
            </Reveal>
            <div className="space-y-3">
              {teams.slice(0, 6).map((team, i) => (
                <Reveal key={team.id} delay={i * 0.07}>
                  <Link to={`/teams/${team.slug}`} className="group flex items-center gap-4 p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60 hover:bg-gold-400/5 border border-transparent hover:border-gold-400/30 transition-all duration-300">
                    <span className="text-sm font-bold text-ink-300 dark:text-ink-600 w-5 text-center">{i + 1}</span>
                    {team.logo_url
                      ? <img src={team.logo_url} alt={team.name} className="h-10 w-10 rounded-xl object-cover" />
                      : <div className="h-10 w-10 rounded-xl bg-ink-200 dark:bg-ink-700 flex items-center justify-center font-bold text-sm text-ink-500">{team.name.slice(0, 2)}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-ink-900 dark:text-white group-hover:text-gold-400 transition-colors truncate">{team.name}</p>
                      <p className="text-xs text-ink-400">{team.city} · {team.sport_slug}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
              {teams.length === 0 && <p className="text-ink-400 text-sm">No teams yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main HomePage ─── */
export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    Promise.all([
      api.getNews({ limit: '20' }),
      api.getSports(),
      api.getTeams(),
      api.getMatches(),
    ]).then(([a, s, t, m]) => {
      setArticles(a);
      setSports(s);
      setTeams(t);
      setMatches(m);
    }).catch(() => {});
  }, []);

  const featuredSlides = articles.filter(a => a.is_featured).slice(0, 4);
  const heroSlides = featuredSlides.length > 0 ? featuredSlides : articles.slice(0, 4);

  return (
    <>
      <HomepageHero slides={heroSlides} />
      <SportsStrip sports={sports} />
      <LatestNewsSection articles={articles} />
      <FixturesAndPromo matches={matches.slice(0, 10)} />
      <TrendingAndTeams articles={articles} teams={teams} />
      <FeaturedAthletes />
      <SocialWall />
      <SponsorsSection />
      <NewsletterSection />
    </>
  );
}
