import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import type { Match } from '../../types';

const sportColors: Record<string, string> = {
  football: '#22c55e',
  basketball: '#f97316',
  volleyball: '#3b82f6',
  handball: '#ef4444',
  athletics: '#a855f7',
};

export function MatchCard({ match, compact = false }: { match: Match; compact?: boolean }) {
  const accent = sportColors[match.sport] ?? '#F4B400';
  const isUpcoming = match.status === 'upcoming';
  const isLive = match.status === 'live';

  if (compact) {
    return (
      <Link
        to={`/fixtures`}
        className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img src={match.homeTeamLogo} alt="" className="h-7 w-7 rounded-md object-cover shrink-0" />
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{match.homeTeamName}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-ink-100 dark:bg-ink-800">
          {isUpcoming ? (
            <span className="text-xs font-bold text-ink-400">vs</span>
          ) : (
            <span className="text-sm font-bold text-ink-900 dark:text-white tabular-nums">
              {match.homeScore} - {match.awayScore}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{match.awayTeamName}</span>
          <img src={match.awayTeamLogo} alt="" className="h-7 w-7 rounded-md object-cover shrink-0" />
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-zt overflow-hidden hover-lift hover:shadow-xl group"
    >
      <div className="h-1" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-400">{match.league}</span>
          {isLive ? (
            <span className="chip bg-red-500 text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> Live
            </span>
          ) : isUpcoming ? (
            <span className="chip bg-blue-500/15 text-blue-500">Upcoming</span>
          ) : (
            <span className="chip bg-ink-100 dark:bg-ink-700 text-ink-500 dark:text-ink-300">Full Time</span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img src={match.homeTeamLogo} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
              <span className="font-semibold text-ink-900 dark:text-white truncate">{match.homeTeamName}</span>
            </div>
            {isUpcoming ? (
              <span className="text-sm font-bold text-ink-400">-</span>
            ) : (
              <span className="text-2xl font-display font-bold text-ink-900 dark:text-white tabular-nums">
                {match.homeScore}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img src={match.awayTeamLogo} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
              <span className="font-semibold text-ink-900 dark:text-white truncate">{match.awayTeamName}</span>
            </div>
            {isUpcoming ? (
              <span className="text-sm font-bold text-ink-400">-</span>
            ) : (
              <span className="text-2xl font-display font-bold text-ink-900 dark:text-white tabular-nums">
                {match.awayScore}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-ink-100 dark:border-ink-700 flex items-center gap-4 text-xs text-ink-400">
          <span className="flex items-center gap-1.5">
            <Calendar size={13} /> {match.date}
          </span>
          {!isUpcoming && match.mvp && (
            <span className="flex items-center gap-1.5 text-gold-500">
              ⭐ MVP: {match.mvp}
            </span>
          )}
        </div>
        {isUpcoming && (
          <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {match.time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={13} /> {match.venue}</span>
          </div>
        )}
        <Link to="/fixtures" className="mt-4 flex items-center justify-between text-sm font-semibold text-gold-500 hover:text-gold-400 transition-colors">
          Match Details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
