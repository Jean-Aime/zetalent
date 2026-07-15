import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { sports } from '../../data/seed';
import { getIcon } from '../../utils/icons';

export function SportsNavStrip() {
  const { t } = useLanguage();

  return (
    <div className="border-b border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-900/40">
      <div className="container-zt py-5">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-400 shrink-0 pr-2 border-r border-ink-100 dark:border-ink-700">Sports</span>
          {sports.map((sport, i) => {
            const Icon = getIcon(sport.icon);
            return (
              <motion.div
                key={sport.slug}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/sports/${sport.slug}`}
                  className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:bg-ink-100 dark:hover:bg-ink-800 transition-all duration-300 shrink-0"
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${sport.color}15`, color: sport.color }}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-ink-700 dark:text-ink-200 group-hover:text-ink-900 dark:group-hover:text-white transition-colors whitespace-nowrap">
                    {t(sport.name)}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
