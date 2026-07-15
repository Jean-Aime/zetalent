import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Menu, X, Sun, Moon, ChevronDown, Globe, LogIn, TrendingUp,
} from 'lucide-react';
import { ZTLogo } from '../brand/ZTLogo';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage, localeLabels } from '../../contexts/LanguageContext';
import { navigation, sports, breakingNews } from '../../data/seed';
import { getIcon } from '../../utils/icons';
import { ArrowRight, Check } from 'lucide-react';
import type { Locale } from '../../types';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [langOpen, setLangOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Breaking News Ticker */}
      <div className="bg-ink-950 text-white text-sm py-2 overflow-hidden border-b border-gold-400/20">
        <div className="container-zt flex items-center gap-4">
          <span className="flex items-center gap-1.5 shrink-0 font-bold text-gold-400 text-xs uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            Breaking
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...breakingNews, ...breakingNews].map((n, i) => (
                <Link
                  key={i}
                  to={`/news/${n.slug}`}
                  className="inline-flex items-center gap-2 px-6 text-ink-200 hover:text-gold-400 transition-colors"
                >
                  <TrendingUp size={14} className="text-gold-400" />
                  {t(n.title)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled
            ? 'glass shadow-lg shadow-ink-950/5'
            : 'bg-white dark:bg-ink-950'
        }`}
      >
        <div className="container-zt">
          <div className="flex items-center justify-between h-20 py-3.5">
            <Link to="/" className="shrink-0" aria-label="ZT Media home">
              <ZTLogo size={42} />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) =>
                item.children ? (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => setSportsOpen(true)}
                    onMouseLeave={() => setSportsOpen(false)}
                  >
                    <button className="nav-link flex items-center gap-1">
                      {t(item.label)}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${sportsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {sportsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-64"
                        >
                          <div className="glass rounded-2xl p-2 shadow-xl shadow-ink-950/10">
                            <Link
                              to="/sports"
                              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gold-400/10 transition-colors group"
                            >
                              <span className="font-semibold text-ink-900 dark:text-white">All Sports</span>
                              <ArrowRight size={16} className="text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <div className="h-px bg-ink-100 dark:bg-ink-700 my-1" />
                            {sports.map((sport) => {
                              const Icon = getIcon(sport.icon);
                              return (
                                <Link
                                  key={sport.slug}
                                  to={`/sports/${sport.slug}`}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gold-400/10 transition-colors"
                                >
                                  <span
                                    className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                    style={{ backgroundColor: `${sport.color}20`, color: sport.color }}
                                  >
                                    <Icon size={16} />
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-ink-900 dark:text-white text-sm">{t(sport.name)}</div>
                                    <div className="text-xs text-ink-400">{sport.teamCount} teams</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
                  >
                    {t(item.label)}
                  </NavLink>
                )
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="btn-ghost !px-2"
                  aria-label="Select language"
                >
                  <Globe size={18} />
                  <span className="hidden sm:inline text-xs font-bold uppercase">{locale}</span>
                  <ChevronDown size={14} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-44 z-20"
                      >
                        <div className="glass rounded-xl p-1.5 shadow-xl">
                          {(Object.keys(localeLabels) as Locale[]).map((l) => (
                            <button
                              key={l}
                              onClick={() => { setLocale(l); setLangOpen(false); }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                locale === l
                                  ? 'bg-gold-400/15 text-gold-400 font-semibold'
                                  : 'hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-200'
                              }`}
                            >
                              {localeLabels[l]}
                              {locale === l && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="btn-ghost !px-2" aria-label="Search">
                <Search size={18} />
              </button>

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className="btn-ghost !px-2" aria-label="Toggle theme">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.span>
                </AnimatePresence>
              </button>

              {/* Login */}
              <Link to="/auth" className="hidden sm:inline-flex btn-gold !py-2 !px-4 text-sm">
                <LogIn size={16} />
                <span className="hidden md:inline">Sign In</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="btn-ghost lg:hidden !px-2"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink-950/80 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="flex items-center gap-3 glass rounded-2xl p-4 shadow-2xl">
                <Search size={24} className="text-gold-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news, teams, players..."
                  className="flex-1 bg-transparent text-xl text-white placeholder:text-ink-400 focus:outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="btn-ghost !text-white">
                  <X size={20} />
                </button>
              </div>
              <p className="mt-3 text-center text-sm text-ink-400">
                Press Enter to search or ESC to close
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-ink-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-ink-100 dark:border-ink-700">
                <ZTLogo size={36} />
                <button onClick={() => setMobileOpen(false)} className="btn-ghost !px-2">
                  <X size={22} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navigation.map((item) =>
                  item.children ? (
                    <div key={item.href}>
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gold-500">
                        {t(item.label)}
                      </div>
                      <Link
                        to="/sports"
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 font-medium"
                      >
                        All Sports
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-6 py-2.5 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 text-sm"
                        >
                          {t(child.label)}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-3 rounded-lg text-ink-800 dark:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-800 font-semibold text-base"
                    >
                      {t(item.label)}
                    </Link>
                  )
                )}
              </nav>
              <div className="p-5 border-t border-ink-100 dark:border-ink-700 space-y-3">
                <div className="flex gap-2">
                  {(Object.keys(localeLabels) as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLocale(l)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                        locale === l ? 'bg-gold-400 text-ink-950' : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-gold w-full">
                  <LogIn size={18} /> Sign In
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
