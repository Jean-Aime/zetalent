import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Newspaper, Trophy, Users, User, Calendar, BarChart2,
  Image, Share2, Award, Mail, MessageSquare, Shield, Settings, LogOut,
  Bell, Sun, Moon, Menu, X, ChevronDown, Globe,
} from 'lucide-react';
import { ZTLogo } from '../components/brand/ZTLogo';
import { useTheme } from '../contexts/ThemeContext';
import { logout, getUser } from '../lib/api';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  { title: 'OVERVIEW', items: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    title: 'CONTENT',
    items: [
      { to: '/admin/news', label: 'News', icon: Newspaper },
      { to: '/admin/sports', label: 'Sports', icon: Trophy },
      { to: '/admin/teams', label: 'Teams', icon: Users },
      { to: '/admin/players', label: 'Players', icon: User },
      { to: '/admin/matches', label: 'Matches', icon: Calendar },
      { to: '/admin/standings', label: 'Standings', icon: BarChart2 },
    ],
  },
  {
    title: 'MEDIA & SOCIAL',
    items: [
      { to: '/admin/media', label: 'Media Library', icon: Image },
      { to: '/admin/social', label: 'Social Wall', icon: Share2 },
    ],
  },
  {
    title: 'PLATFORM',
    items: [
      { to: '/admin/sponsors', label: 'Sponsors', icon: Award },
      { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
      { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
      { to: '/admin/users', label: 'Users & Roles', icon: Shield },
    ],
  },
  {
    title: 'SETTINGS',
    items: [{ to: '/admin/settings', label: 'Settings', icon: Settings }],
  },
];

function getPageTitle(pathname: string): string {
  const all = navGroups.flatMap(g => g.items);
  const match = all.find(i => i.to === pathname || (i.to !== '/admin' && pathname.startsWith(i.to)));
  if (match) return match.label;
  if (pathname === '/admin') return 'Dashboard';
  return 'Admin Panel';
}

function SidebarContent({ onNavigate, user }: { onNavigate?: () => void; user: ReturnType<typeof getUser> }) {
  return (
    <div className="flex h-full flex-col bg-ink-950">
      <div className="flex items-center px-5 h-16 border-b border-ink-800/60 shrink-0">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <ZTLogo size={36} withText={false} />
          <div className="flex items-center gap-2">
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight text-white">ZT <span className="text-gold-400">MEDIA</span></span>
              <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-ink-500">Zetalent Media</span>
            </div>
            <span className="ml-1 rounded bg-gold-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-ink-950">Admin</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
        {navGroups.map(group => (
          <div key={group.title}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/admin'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border-l-2 ${
                        isActive
                          ? 'border-gold-400 bg-ink-900 text-gold-400'
                          : 'border-transparent text-ink-400 hover:bg-ink-900 hover:text-ink-100'
                      }`
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-ink-800/60 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-900 transition-colors cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/20 text-gold-400 font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
            <p className="text-[11px] text-ink-500 truncate capitalize">{user?.role?.replace('_', ' ') || 'admin'}</p>
          </div>
          <span className="rounded bg-gold-400/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-400">
            {user?.role === 'super_admin' ? 'Owner' : 'Staff'}
          </span>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);
  const currentUser = getUser();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const notifications = [
    { id: 1, text: 'New article published', time: '5m ago' },
    { id: 2, text: 'Match result added: Kigali Queens 2-1', time: '1h ago' },
    { id: 3, text: '12 new newsletter subscribers', time: '3h ago' },
    { id: 4, text: 'Sponsor profile updated: RwandaTel', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent user={currentUser} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
              <SidebarContent onNavigate={() => setMobileOpen(false)} user={currentUser} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-100 dark:border-ink-700/50 bg-white/90 dark:bg-ink-900/90 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline text-sm text-ink-400 dark:text-ink-500">Admin</span>
              <span className="hidden sm:inline text-ink-300 dark:text-ink-600">/</span>
              <h1 className="text-sm font-semibold text-ink-900 dark:text-white truncate">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-white dark:ring-ink-900" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 z-50 rounded-2xl border border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-800 shadow-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 dark:border-ink-700/50">
                        <span className="text-sm font-semibold text-ink-900 dark:text-white">Notifications</span>
                        <span className="rounded-full bg-gold-400/15 px-2 py-0.5 text-[10px] font-bold text-gold-500">{notifications.length} new</span>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.map(n => (
                          <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-700/40 transition-colors border-b border-ink-50 dark:border-ink-700/30 last:border-0">
                            <span className="mt-1.5 h-2 w-2 rounded-full bg-gold-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-ink-800 dark:text-ink-100 leading-snug">{n.text}</p>
                              <p className="text-xs text-ink-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full px-4 py-2.5 text-center text-xs font-semibold text-gold-500 hover:bg-gold-400/10 transition-colors">View all</button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* User menu */}
            <div className="relative">
              <button onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400/20 text-gold-400 font-bold text-sm ring-1 ring-gold-400/30">
                  {currentUser?.name?.charAt(0) || 'A'}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-ink-800 dark:text-ink-100">{currentUser?.name?.split(' ')[0] || 'Admin'}</span>
                <ChevronDown className="hidden sm:block h-4 w-4 text-ink-400" />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 z-50 rounded-2xl border border-ink-100 dark:border-ink-700/50 bg-white dark:bg-ink-800 shadow-xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700/50">
                        <p className="text-sm font-semibold text-ink-900 dark:text-white">{currentUser?.name || 'Admin'}</p>
                        <p className="text-xs text-ink-400">{currentUser?.email || ''}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/admin/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/40 transition-colors">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <Link to="/" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700/40 transition-colors">
                          <Globe className="h-4 w-4" /> View Site
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed top-4 left-[17rem] z-[55] flex h-9 w-9 items-center justify-center rounded-lg bg-ink-800 text-white lg:hidden"
            aria-label="Close menu">
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
