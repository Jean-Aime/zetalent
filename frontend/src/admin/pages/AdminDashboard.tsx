import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, User, Calendar, Newspaper, Mail, Award,
  TrendingUp, ArrowRight, Clock, Trophy, ChevronRight,
} from 'lucide-react';
import { api, getUser } from '../../lib/api';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');
function proxyUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://localhost') || url.startsWith('/')) return url;
  return `${BASE}/api/img-proxy?url=${encodeURIComponent(url)}`;
}



const quickActions = [
  { label: 'Add Article', to: '/admin/news', icon: Newspaper, desc: 'Publish a new story' },
  { label: 'Add Match', to: '/admin/matches', icon: Calendar, desc: 'Schedule a fixture' },
  { label: 'Add Player', to: '/admin/players', icon: User, desc: 'Register an athlete' },
  { label: 'Add Team', to: '/admin/teams', icon: Users, desc: 'Create a new team' },
];

interface Stats {
  teams: number; players: number; matches: number;
  articles: number; subscribers: number; sponsors: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ teams: 0, players: 0, matches: 0, articles: 0, subscribers: 0, sponsors: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [traffic, setTraffic] = useState<{ days: { label: string; visits: number }[]; total7d: number; changePercent: number | null; totalArticleViews: number } | null>(null);
  const user = getUser();

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    Promise.all([
      api.getTeams(), api.getPlayers(), api.getMatches(),
      api.getAdminNews(), api.getSubscribers(), api.getSponsors(),
    ]).then(([teams, players, matches, articles, subs, sponsors]) => {
      setStats({
        teams: teams.length, players: players.length, matches: matches.length,
        articles: articles.length, subscribers: subs.length, sponsors: sponsors.length,
      });
      // Most recent 5 articles
      const sorted = [...articles].sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ).slice(0, 5);
      setRecentArticles(sorted);
      // Most recent 4 matches (completed + upcoming)
      setRecentMatches([...matches].slice(0, 4));
    }).catch(() => {});
    api.getTraffic().then(setTraffic).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Teams', value: stats.teams, icon: Users, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { label: 'Total Players', value: stats.players, icon: User, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
    { label: 'Total Matches', value: stats.matches, icon: Calendar, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-500' },
    { label: 'Articles', value: stats.articles, icon: Newspaper, iconBg: 'bg-gold-400/10', iconColor: 'text-gold-500' },
    { label: 'Newsletter Subs', value: stats.subscribers, icon: Mail, iconBg: 'bg-cyan-500/10', iconColor: 'text-cyan-500' },
    { label: 'Sponsors', value: stats.sponsors, icon: Award, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-ink-400 dark:text-ink-500 mb-1">{today}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">
              Welcome back, <span className="text-gold-400">{user?.name || 'Admin'}</span>
            </h1>
            <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Here's what's happening across the ZT Media platform today.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-ink-800/60 border border-ink-100 dark:border-ink-700/50 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">All systems operational</span>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-zt p-5 hover:shadow-lg hover:shadow-ink-900/5 hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-ink-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.to}
              className="group card-zt p-5 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-400/10 transition-all duration-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/10 mb-3 group-hover:bg-gold-400 group-hover:scale-110 transition-all duration-300">
                <Icon className="h-5 w-5 text-gold-500 group-hover:text-ink-950 transition-colors" />
              </div>
              <p className="text-sm font-bold text-ink-900 dark:text-white">{action.label}</p>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{action.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-gold-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </motion.div>

      {/* Two-column: Recent Matches + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Matches */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2 card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Recent Matches</h2>
            <Link to="/admin/matches" className="text-xs font-semibold text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
              Manage <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <p className="text-sm text-ink-400 dark:text-ink-500 py-6 text-center">No matches yet</p>
          ) : (
            <div className="space-y-2">
              {recentMatches.map(m => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors">
                  {/* Home */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm font-semibold text-ink-800 dark:text-ink-100 text-right line-clamp-1">{m.home_team_name}</span>
                    {m.home_team_logo ? (
                      <img src={proxyUrl(m.home_team_logo)} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 bg-ink-100 dark:bg-ink-700" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center shrink-0">
                        <Trophy className="h-4 w-4 text-ink-400" />
                      </div>
                    )}
                  </div>
                  {/* Score / Status */}
                  <div className="shrink-0 text-center min-w-[56px]">
                    {m.status === 'completed' ? (
                      <span className="text-sm font-bold text-ink-900 dark:text-white">{m.home_score ?? 0} – {m.away_score ?? 0}</span>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        m.status === 'live' ? 'bg-red-500/10 text-red-500' : 'bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-400'
                      }`}>{m.status}</span>
                    )}
                    <p className="text-[10px] text-ink-400 dark:text-ink-500 mt-0.5">
                      {new Date(m.match_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {/* Away */}
                  <div className="flex items-center gap-2 flex-1">
                    {m.away_team_logo ? (
                      <img src={proxyUrl(m.away_team_logo)} alt="" className="h-8 w-8 rounded-full object-cover shrink-0 bg-ink-100 dark:bg-ink-700" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-ink-200 dark:bg-ink-700 flex items-center justify-center shrink-0">
                        <Trophy className="h-4 w-4 text-ink-400" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-ink-800 dark:text-ink-100 line-clamp-1">{m.away_team_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Traffic */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Traffic</h2>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">Last 7 days</p>
            </div>
            {traffic?.changePercent != null && (
              <span className={`flex items-center gap-1 text-xs font-semibold ${
                traffic.changePercent >= 0 ? 'text-green-500' : 'text-red-400'
              }`}>
                <TrendingUp className="h-3.5 w-3.5" />
                {traffic.changePercent >= 0 ? '+' : ''}{traffic.changePercent}%
              </span>
            )}
          </div>
          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2 h-40 mt-2">
            {(traffic?.days ?? []).map((bar, i) => {
              const max = Math.max(...(traffic?.days ?? []).map(d => d.visits), 1);
              const pct = Math.round((bar.visits / max) * 100);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-full">
                    <motion.div
                      title={`${bar.visits} visits`}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(pct, 4)}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-gold-400/40 to-gold-400 hover:from-gold-400 hover:to-gold-300 transition-colors cursor-pointer"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-ink-400 dark:text-ink-500">{bar.label}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-700/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400 dark:text-ink-500">Page views (7d)</span>
              <span className="font-semibold text-ink-900 dark:text-white">{(traffic?.total7d ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400 dark:text-ink-500">Article reads</span>
              <span className="font-semibold text-ink-900 dark:text-white">{(traffic?.totalArticleViews ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Recent Articles</h2>
            <Link to="/admin/news" className="text-xs font-semibold text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
              Manage news <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50">
                  <th className="pb-3 pr-4 font-semibold">Article</th>
                  <th className="pb-3 pr-4 font-semibold">Category</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold text-right">Views</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {recentArticles.map(article => (
                  <tr key={article.id} className="group hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {article.image_url ? (
                          <img
                            src={proxyUrl(article.image_url)}
                            alt=""
                            className="h-10 w-14 rounded-lg object-cover shrink-0 bg-ink-100 dark:bg-ink-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-14 rounded-lg bg-ink-100 dark:bg-ink-700 shrink-0 flex items-center justify-center">
                            <Newspaper className="h-4 w-4 text-ink-400" />
                          </div>
                        )}
                        <span className="font-medium text-ink-800 dark:text-ink-100 line-clamp-1 max-w-xs">
                          {article.translations?.en?.title || article.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="chip bg-ink-100 dark:bg-ink-700/50 text-ink-600 dark:text-ink-300 capitalize">
                        {article.category?.replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`chip capitalize ${
                        article.status === 'published'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-ink-100 dark:bg-ink-700/50 text-ink-500'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-semibold text-ink-900 dark:text-white">{(article.views || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-3 text-ink-400 dark:text-ink-500 whitespace-nowrap flex items-center gap-1">
                      <Clock className="h-3 w-3 shrink-0" />
                      {new Date(article.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
