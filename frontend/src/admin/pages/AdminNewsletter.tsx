import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Users, CalendarDays, TrendingUp, Search, Download,
  Trash2, X, Check, Globe, Share2,
} from 'lucide-react';
import { api } from '../../lib/api';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  source: 'website' | 'social';
}

const mockSubscribers: Subscriber[] = [
  { id: 'ns1', email: 'newsletter@ztmedia.rw', subscribedAt: '2026-06-02T09:14:00Z', status: 'active', source: 'website' },
  { id: 'ns2', email: 'fan1@gmail.com', subscribedAt: '2026-06-12T14:32:00Z', status: 'active', source: 'website' },
  { id: 'ns3', email: 'marie.umutoni@yahoo.com', subscribedAt: '2026-06-18T08:05:00Z', status: 'active', source: 'social' },
  { id: 'ns4', email: 'eric.mugisha@bk.rw', subscribedAt: '2026-07-01T19:48:00Z', status: 'active', source: 'website' },
  { id: 'ns5', email: 'diane.uwase@gmail.com', subscribedAt: '2026-07-05T11:22:00Z', status: 'unsubscribed', source: 'social' },
  { id: 'ns6', email: 'patrick.k@kigaliqueens.rw', subscribedAt: '2026-07-08T16:10:00Z', status: 'active', source: 'website' },
  { id: 'ns7', email: 'salima.runs@gmail.com', subscribedAt: '2026-07-10T07:40:00Z', status: 'active', source: 'social' },
  { id: 'ns8', email: 'press@rwsf.rw', subscribedAt: '2026-07-12T13:00:00Z', status: 'active', source: 'website' },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const isThisMonth = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers);
  const [search, setSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getSubscribers()
      .then((data) => {
        if (mounted && data.length > 0) {
          setSubscribers(data.map((row) => ({
            id: row.id,
            email: row.email,
            subscribedAt: row.subscribed_at,
            status: row.status === 'unsubscribed' ? 'unsubscribed' : 'active',
            source: row.source === 'social' ? 'social' : 'website',
          })));
        }
      })
      .catch(() => { /* fall back to mock data */ })
      .finally(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!search) return subscribers;
    const q = search.toLowerCase();
    return subscribers.filter(s => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const total = subscribers.length;
  const thisMonth = subscribers.filter(s => isThisMonth(s.subscribedAt)).length;
  const openRate = total > 0
    ? Math.round((subscribers.filter(s => s.status === 'active').length / total) * 100)
    : 0;

  const toggleStatus = (id: string) => {
    const sub = subscribers.find(s => s.id === id);
    if (!sub) return;
    const is_active = sub.status !== 'active';
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: is_active ? 'active' : 'unsubscribed' } : s));
    api.toggleSubscriber(id, is_active).catch(() => {});
  };

  const confirmDelete = (id: string) => {
    setSubscribers(prev => prev.filter(s => s.id !== id));
    setDeleteConfirmId(null);
    api.deleteSubscriber(id).catch(() => {});
  };

  const exportCsv = () => {
    const header = 'Email,Subscribed Date,Status,Source';
    const rows = subscribers.map(s =>
      `"${s.email}","${formatDate(s.subscribedAt)}","${s.status}","${s.source}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Total Subscribers', value: total, icon: Users, accent: 'text-gold-400' },
    { label: 'This Month', value: thisMonth, icon: CalendarDays, accent: 'text-blue-500' },
    { label: 'Open Rate', value: `${openRate}%`, icon: TrendingUp, accent: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">
            Newsletter Subscribers
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gold-400/15 text-gold-500">
            <Mail className="h-3.5 w-3.5" /> {total}
          </span>
        </div>
        <button onClick={exportCsv} className="btn-gold text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
              className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">{stat.label}</p>
                  <p className="font-display text-2xl font-bold text-ink-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-50 dark:bg-ink-700/40">
                  <Icon className={`h-5 w-5 ${stat.accent}`} />
                </div>
              </div>
              {stat.label === 'Open Rate' && (
                <div className="mt-3 h-2 w-full rounded-full bg-ink-100 dark:bg-ink-700/60 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-300" style={{ width: `${openRate}%` }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {loaded ? `${filtered.length} subscriber${filtered.length !== 1 ? 's' : ''}` : 'Loading subscribers…'}
        </p>
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="input-zt pl-10"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-700/50">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Email</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Subscribed</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Status</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">Source</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(sub => (
                <tr key={sub.id} className="border-b border-ink-100 dark:border-ink-700/40 last:border-0 hover:bg-ink-50/60 dark:hover:bg-ink-700/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/10 text-gold-500 shrink-0">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-ink-900 dark:text-white">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-ink-500 dark:text-ink-400">{formatDate(sub.subscribedAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`chip ${sub.status === 'active' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-ink-200/40 dark:bg-ink-600/30 text-ink-500 dark:text-ink-300'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sub.status === 'active' ? 'bg-green-500' : 'bg-ink-400'}`} />
                      {sub.status === 'active' ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-sm text-ink-600 dark:text-ink-300">
                      {sub.source === 'website' ? <Globe className="h-3.5 w-3.5 text-ink-400" /> : <Share2 className="h-3.5 w-3.5 text-ink-400" />}
                      <span className="capitalize">{sub.source}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(sub.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors"
                        title={sub.status === 'active' ? 'Unsubscribe' : 'Re-subscribe'}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(sub.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3">
              <Mail className="h-7 w-7 text-ink-400" />
            </div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No subscribers found</p>
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">Try adjusting your search</p>
          </div>
        )}
      </motion.div>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Subscriber?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                "{subscribers.find(s => s.id === deleteConfirmId)?.email}" will be permanently removed from the mailing list. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">
                  <span className="inline-flex items-center gap-2"><X className="h-4 w-4" /> Cancel</span>
                </button>
                <button onClick={() => confirmDelete(deleteConfirmId)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
