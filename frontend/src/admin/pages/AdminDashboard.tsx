import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, User, Calendar, Newspaper, Mail, Award,
  TrendingUp, ArrowRight, Clock,
  Trophy, FileText, Image as ImageIcon, ChevronRight,
} from 'lucide-react';
import { api, getUser } from '../../lib/api';

const trafficBars = [
  { day: 'Mon', height: 45 }, { day: 'Tue', height: 62 }, { day: 'Wed', height: 38 },
  { day: 'Thu', height: 78 }, { day: 'Fri', height: 90 }, { day: 'Sat', height: 100 }, { day: 'Sun', height: 72 },
];

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
  const [topArticles, setTopArticles] = useState<any[]>([]);
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
      const sorted = [...articles].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      setTopArticles(sorted);
    }).catch(() => {});
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
                <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
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

      {/* Two-column: Activity + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:col-span-2 card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Recent Activity</h2>
            <button className="text-xs font-semibold text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {[
              { icon: Newspaper, text: 'News articles managed via Admin News', time: 'Live' },
              { icon: Trophy, text: 'Match results updated via Admin Matches', time: 'Live' },
              { icon: User, text: 'Player profiles managed via Admin Players', time: 'Live' },
              { icon: ImageIcon, text: 'Sponsors managed via Admin Sponsors', time: 'Live' },
              { icon: FileText, text: 'Standings updated via Admin Standings', time: 'Live' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-4 rounded-xl px-3 py-3 hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors">
                  <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-700/50">
                      <Icon className="h-4 w-4 text-ink-500 dark:text-ink-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <p className="text-sm text-ink-800 dark:text-ink-100 leading-snug">{item.text}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-ink-900 dark:text-white">Traffic</h2>
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">Last 7 days</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-green-500">
              <TrendingUp className="h-3.5 w-3.5" /> +24%
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-40 mt-2">
            {trafficBars.map(bar => (
              <div key={bar.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.height}%` }}
                    transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-gold-400/40 to-gold-400 hover:from-gold-400 hover:to-gold-300 transition-colors cursor-pointer"
                  />
                </div>
                <span className="text-[10px] font-medium text-ink-400 dark:text-ink-500">{bar.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-700/50 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400 dark:text-ink-500">Total visits</span>
              <span className="font-semibold text-ink-900 dark:text-white">48,320</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400 dark:text-ink-500">Avg. duration</span>
              <span className="font-semibold text-ink-900 dark:text-white">3m 42s</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-400 dark:text-ink-500">Bounce rate</span>
              <span className="font-semibold text-ink-900 dark:text-white">38%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Articles */}
      {topArticles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="card-zt p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-ink-900 dark:text-white">Top Articles</h2>
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
                  <th className="pb-3 pr-4 font-semibold text-right">Views</th>
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {topArticles.map(article => (
                  <tr key={article.id} className="group hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {article.image_url && <img src={article.image_url} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" loading="lazy" />}
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
                    <td className="py-3 pr-4 text-right">
                      <span className="font-semibold text-ink-900 dark:text-white">{(article.views || 0).toLocaleString()}</span>
                    </td>
                    <td className="py-3 pr-4 text-ink-400 dark:text-ink-500 whitespace-nowrap">
                      {new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
