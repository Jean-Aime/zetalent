import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Inbox, Archive, Trash2, Reply, ArrowLeft,
  X, Clock, ArchiveRestore,
} from 'lucide-react';
import { api } from '../../lib/api';

type MessageStatus = 'unread' | 'read' | 'archived';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  status: MessageStatus;
}

const mockMessages: ContactMessage[] = [
  { id: 'cm1', name: 'Mugisha Eric', email: 'eric.mugisha@gmail.com', subject: 'Partnership Inquiry', body: 'Hello ZT Media team,\n\nI am writing on behalf of RwandaTel to explore a partnership opportunity to support women\'s sports coverage in Rwanda. We believe your platform does incredible work amplifying women athletes, and we would love to discuss how we can collaborate over the next season.\n\nCould we schedule a meeting next week?\n\nBest regards,\nEric Mugisha\nRwandaTel — Sponsorship Manager', date: '2026-07-12T09:30:00Z', status: 'unread' },
  { id: 'cm2', name: 'Diane Uwase', email: 'diane.uwase@rbc.rw', subject: 'Press Accreditation', body: 'Dear team,\n\nI am a journalist with the Rwanda Broadcasting Agency and would like to request press accreditation for the upcoming championship finals at Amahoro Stadium. Please let me know what documentation is required and how I can collect my media pass.\n\nThank you,\nDiane Uwase', date: '2026-07-11T14:15:00Z', status: 'unread' },
  { id: 'cm3', name: 'Patrick Nshuti', email: 'patrick.nshuti@kigaliqueens.rw', subject: 'Match Report Correction', body: 'Hi,\n\nIn your recent article covering the Kigali Queens vs AS Kigali Women match, the final score was listed as 2-0 but it was actually 2-1. Could you please update the report? The third goal scorer was also misattributed — it should be Alice Mukamana, not Nadia Uwase.\n\nThanks for the great coverage!\nPatrick', date: '2026-07-10T18:42:00Z', status: 'read' },
  { id: 'cm4', name: 'Salima Nyiraneza', email: 'salima.runs@gmail.com', subject: 'Athlete Profile Feature', body: 'Hello,\n\nI recently broke the national 5000m record and saw your coverage of women athletes in Rwanda. I would be honored to be featured in an athlete profile. I can share my training story, achievements, and photos.\n\nLooking forward to hearing from you.\nSalima Nyiraneza', date: '2026-07-09T07:20:00Z', status: 'unread' },
  { id: 'cm5', name: 'Claudine Mukamana', email: 'claudine.m@rwsf.rw', subject: 'Event Coverage Request', body: 'Dear ZT Media,\n\nThe Rwanda Women\'s Sports Federation is hosting a grassroots volleyball tournament next month in Musanze. We would love for your team to cover the event. We can arrange transport and accommodation for your reporters.\n\nPlease confirm availability.\n\nClaudine Mukamana\nRWSF — Events Coordinator', date: '2026-07-08T11:05:00Z', status: 'read' },
  { id: 'cm6', name: 'Olivier Habimana', email: 'olivier.habimana@yahoo.com', subject: 'Advertising Opportunity', body: 'Hi there,\n\nI run a local sports apparel brand and I\'m interested in advertising on your platform. Could you send me your media kit and rate card for banner placements and sponsored content?\n\nThanks,\nOlivier Habimana\nKigali Sportswear', date: '2026-07-06T16:30:00Z', status: 'archived' },
];

type FilterTab = 'all' | 'unread' | 'archived';

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const statusBadge: Record<MessageStatus, { label: string; cls: string }> = {
  unread: { label: 'Unread', cls: 'bg-gold-400/15 text-gold-500' },
  read: { label: 'Read', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  archived: { label: 'Archived', cls: 'bg-ink-200/40 dark:bg-ink-600/30 text-ink-500 dark:text-ink-300' },
};

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>(mockMessages);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.getMessages()
      .then((data) => {
        if (mounted && data.length > 0) {
          setMessages(data.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            subject: row.subject,
            body: row.body,
            date: row.date,
            status: (['unread', 'read', 'archived'].includes(row.status) ? row.status : 'unread') as MessageStatus,
          })));
        }
      })
      .catch(() => { /* fall back to mock data already in state */ })
      .finally(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const filtered = useMemo(() => {
    if (filter === 'all') return messages.filter(m => m.status !== 'archived');
    if (filter === 'unread') return messages.filter(m => m.status === 'unread');
    return messages.filter(m => m.status === 'archived');
  }, [messages, filter]);

  const countFor = (tab: FilterTab) =>
    tab === 'all' ? messages.filter(m => m.status !== 'archived').length
      : tab === 'unread' ? unreadCount
        : messages.filter(m => m.status === 'archived').length;

  const selected = messages.find(m => m.id === selectedId) || null;

  const selectMessage = (id: string) => {
    setSelectedId(id);
    // Mark as read when opened
    setMessages(prev => prev.map(m => (m.id === id && m.status === 'unread' ? { ...m, status: 'read' as MessageStatus } : m)));
  };

  const markAsRead = (id: string) => {
    setMessages(prev => prev.map(m => (m.id === id ? { ...m, status: 'read' as MessageStatus } : m)));
    api.updateMessageStatus(id, 'read').catch(() => {});
  };

  const toggleArchive = (id: string) => {
    const next = messages.find(m => m.id === id)?.status === 'archived' ? 'read' : 'archived';
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: next as MessageStatus } : m));
    api.updateMessageStatus(id, next).catch(() => {});
  };

  const confirmDelete = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirmId(null);
    api.deleteMessage(id).catch(() => {});
  };

  const tabs: { key: FilterTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'all', label: 'All', icon: Inbox },
    { key: 'unread', label: 'Unread', icon: Mail },
    { key: 'archived', label: 'Archived', icon: Archive },
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
            Messages
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-gold-400/15 text-gold-500">
            <Mail className="h-3.5 w-3.5" /> {unreadCount} unread
          </span>
        </div>
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {loaded ? `${messages.length} total messages` : 'Loading messages…'}
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`chip transition-all ${filter === tab.key ? 'bg-gold-400 text-ink-950 border border-gold-400' : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-100 dark:border-ink-700/50 hover:bg-gold-400/10'}`}
            >
              <Icon className="h-3.5 w-3.5" /> {tab.label}
              <span className={`ml-1 rounded-full px-1.5 text-[10px] font-bold ${filter === tab.key ? 'bg-ink-950/15' : 'bg-ink-100 dark:bg-ink-700/60'}`}>
                {countFor(tab.key)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-panel layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 lg:gap-6"
      >
        {/* Left: message list */}
        <div className={`bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl overflow-hidden ${selected ? 'hidden lg:block' : 'block'}`}>
          <div className="max-h-[640px] overflow-y-auto no-scrollbar divide-y divide-ink-100 dark:divide-ink-700/40">
            {filtered.map(msg => {
              const isUnread = msg.status === 'unread';
              const isSelected = msg.id === selectedId;
              return (
                <button
                  key={msg.id}
                  onClick={() => selectMessage(msg.id)}
                  className={`w-full text-left px-5 py-4 transition-colors ${isSelected ? 'bg-gold-400/10' : 'hover:bg-ink-50/60 dark:hover:bg-ink-700/20'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread dot */}
                    <span className="mt-1.5 shrink-0">
                      {isUnread ? (
                        <span className="block h-2 w-2 rounded-full bg-gold-400" />
                      ) : (
                        <span className="block h-2 w-2 rounded-full bg-transparent" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${isUnread ? 'font-bold text-ink-900 dark:text-white' : 'font-medium text-ink-700 dark:text-ink-200'}`}>
                          {msg.name}
                        </p>
                        <span className="text-[11px] text-ink-400 dark:text-ink-500 shrink-0">{formatRelative(msg.date)}</span>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${isUnread ? 'font-semibold text-ink-800 dark:text-ink-100' : 'text-ink-600 dark:text-ink-300'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-xs text-ink-400 dark:text-ink-500 truncate mt-0.5">{msg.email}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3">
                  <Inbox className="h-7 w-7 text-ink-400" />
                </div>
                <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No messages here</p>
                <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">This folder is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: message detail */}
        <div className={`bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700/50 rounded-2xl ${selected ? 'block' : 'hidden lg:block'}`}>
          {selected ? (
            <div className="flex flex-col h-full max-h-[640px]">
              {/* Detail header */}
              <div className="flex items-start justify-between gap-4 p-6 border-b border-ink-100 dark:border-ink-700/50">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                      title="Back to list"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className={`chip ${statusBadge[selected.status].cls}`}>{statusBadge[selected.status].label}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">{selected.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sender info */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-ink-100 dark:border-ink-700/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/10 text-gold-500 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-ink-900 dark:text-white">{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-xs text-ink-500 dark:text-ink-400 hover:text-gold-500 transition-colors">{selected.email}</a>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-400 dark:text-ink-500 shrink-0">
                  <Clock className="h-3.5 w-3.5" /> {formatFullDate(selected.date)}
                </span>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-5">
                <p className="text-sm text-ink-700 dark:text-ink-200 leading-relaxed whitespace-pre-line">{selected.body}</p>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center gap-2 p-4 border-t border-ink-100 dark:border-ink-700/50">
                {selected.status === 'unread' && (
                  <button
                    onClick={() => markAsRead(selected.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" /> Mark as Read
                  </button>
                )}
                <button
                  onClick={() => toggleArchive(selected.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"
                >
                  {selected.status === 'archived' ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  {selected.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(selected.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="btn-gold text-sm ml-auto"
                >
                  <Reply className="h-4 w-4" /> Reply
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6 py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-4">
                <Mail className="h-8 w-8 text-ink-400" />
              </div>
              <p className="text-base font-semibold text-ink-700 dark:text-ink-200">Select a message</p>
              <p className="text-sm text-ink-400 dark:text-ink-500 mt-1 max-w-xs">Choose a message from the list to read its full content and take action.</p>
            </div>
          )}
        </div>
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
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Delete Message?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                The message from "{messages.find(m => m.id === deleteConfirmId)?.name}" will be permanently deleted. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
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
