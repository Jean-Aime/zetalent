import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Globe, Bell, Check, Save, Twitter, Instagram, Youtube,
  Facebook, Search,
} from 'lucide-react';

type SettingsTab = 'general' | 'seo' | 'notifications';

interface GeneralSettings {
  platformName: string;
  tagline: string;
  contactEmail: string;
  twitter: string;
  instagram: string;
  youtube: string;
  facebook: string;
  defaultLanguage: 'en' | 'fr' | 'rw';
}

interface SeoSettings {
  metaDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
}

interface NotificationSettings {
  newSubscriber: boolean;
  newComment: boolean;
  matchResult: boolean;
  newArticle: boolean;
  systemUpdates: boolean;
  weeklyReport: boolean;
}

const tabs: { key: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'general', label: 'General', icon: Settings },
  { key: 'seo', label: 'SEO', icon: Search },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [savedTab, setSavedTab] = useState<string | null>(null);

  const [general, setGeneral] = useState<GeneralSettings>({
    platformName: 'ZT Media',
    tagline: 'Zetalent Media — Empowering Women\'s Sports in Rwanda',
    contactEmail: 'info@ztmedia.rw',
    twitter: 'https://twitter.com/ztmedia_rw',
    instagram: 'https://instagram.com/ztmedia_rw',
    youtube: 'https://youtube.com/@ztmediasports',
    facebook: 'https://facebook.com/ztmedia.rw',
    defaultLanguage: 'en',
  });

  const [seo, setSeo] = useState<SeoSettings>({
    metaDescription: 'ZT Media is the premier platform for women\'s sports in Rwanda. Follow football, basketball, volleyball, handball and athletics — news, fixtures, results, and player profiles.',
    ogImage: 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop',
    googleAnalyticsId: 'G-XXXXXXXXXX',
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newSubscriber: true,
    newComment: true,
    matchResult: true,
    newArticle: true,
    systemUpdates: false,
    weeklyReport: true,
  });

  const updateGeneral = (field: keyof GeneralSettings, value: string) => {
    setGeneral(prev => ({ ...prev, [field]: value }));
  };
  const updateSeo = (field: keyof SeoSettings, value: string) => {
    setSeo(prev => ({ ...prev, [field]: value }));
  };
  const updateNotification = (field: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (tab: SettingsTab) => {
    setSavedTab(tab);
    setTimeout(() => setSavedTab(null), 2500);
  };

  const socialFields: { key: keyof GeneralSettings; label: string; icon: React.ComponentType<{ className?: string }>; placeholder: string }[] = [
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/...' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
  ];

  const notificationFields: { key: keyof NotificationSettings; label: string; desc: string }[] = [
    { key: 'newSubscriber', label: 'New Subscriber', desc: 'Email me when someone subscribes to the newsletter' },
    { key: 'newComment', label: 'New Comment', desc: 'Email me when a reader comments on an article' },
    { key: 'matchResult', label: 'Match Result', desc: 'Email me when a match result is published' },
    { key: 'newArticle', label: 'New Article', desc: 'Email me when a new article is published by team members' },
    { key: 'systemUpdates', label: 'System Updates', desc: 'Email me about platform updates and maintenance' },
    { key: 'weeklyReport', label: 'Weekly Report', desc: 'Send a weekly performance summary every Monday' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">
          Platform Settings
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">Manage your platform configuration, SEO, and notification preferences</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-ink-100 dark:border-ink-700/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-gold-400 text-gold-500'
                  : 'border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* GENERAL */}
        {activeTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="card-zt p-6 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Platform Name</label>
                <input type="text" value={general.platformName} onChange={e => updateGeneral('platformName', e.target.value)} className="input-zt" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Contact Email</label>
                <input type="email" value={general.contactEmail} onChange={e => updateGeneral('contactEmail', e.target.value)} className="input-zt" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Tagline</label>
              <input type="text" value={general.tagline} onChange={e => updateGeneral('tagline', e.target.value)} className="input-zt" />
            </div>

            {/* Social media URLs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-3">Social Media</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {socialFields.map(social => {
                  const Icon = social.icon;
                  return (
                    <div key={social.key}>
                      <label className="flex items-center gap-2 text-sm font-medium text-ink-600 dark:text-ink-300 mb-2">
                        <Icon className="h-4 w-4 text-ink-400" /> {social.label}
                      </label>
                      <input type="text" value={general[social.key]} onChange={e => updateGeneral(social.key, e.target.value)} placeholder={social.placeholder} className="input-zt" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Default Language</label>
              <select value={general.defaultLanguage} onChange={e => updateGeneral('defaultLanguage', e.target.value)} className="input-zt sm:w-48">
                <option value="en">English (EN)</option>
                <option value="fr">Français (FR)</option>
                <option value="rw">Kinyarwanda (RW)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
              {savedTab === 'general' && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                  <Check className="h-4 w-4" /> Saved successfully
                </motion.span>
              )}
              <button onClick={() => handleSave('general')} className="btn-gold text-sm">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <motion.div
            key="seo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="card-zt p-6 space-y-5"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Meta Description</label>
              <textarea
                value={seo.metaDescription}
                onChange={e => updateSeo('metaDescription', e.target.value)}
                rows={3}
                maxLength={160}
                className="input-zt resize-none"
              />
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">{seo.metaDescription.length}/160 characters — keep it concise for search engines</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Open Graph Image URL</label>
              <input type="text" value={seo.ogImage} onChange={e => updateSeo('ogImage', e.target.value)} placeholder="https://..." className="input-zt" />
              <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">Recommended: 1200×630px — used for social media link previews</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Google Analytics ID</label>
              <input type="text" value={seo.googleAnalyticsId} onChange={e => updateSeo('googleAnalyticsId', e.target.value)} placeholder="G-XXXXXXXXXX" className="input-zt font-mono" />
            </div>

            {/* OG image preview */}
            {seo.ogImage && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Preview</label>
                <div className="rounded-xl overflow-hidden border border-ink-100 dark:border-ink-700/50 max-w-md">
                  <img src={seo.ogImage} alt="OG preview" className="w-full aspect-[1.91/1] object-cover" loading="lazy" />
                  <div className="p-3 bg-ink-50 dark:bg-ink-800">
                    <p className="text-xs text-ink-400 truncate">{general.platformName}</p>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100 truncate">{general.tagline}</p>
                    <p className="text-xs text-ink-400 dark:text-ink-500 line-clamp-2 mt-0.5">{seo.metaDescription}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
              {savedTab === 'seo' && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                  <Check className="h-4 w-4" /> Saved successfully
                </motion.span>
              )}
              <button onClick={() => handleSave('seo')} className="btn-gold text-sm">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </motion.div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="card-zt p-6 space-y-2"
          >
            <div className="flex items-center gap-2 mb-3 text-sm text-ink-500 dark:text-ink-400">
              <Globe className="h-4 w-4" />
              <span>Configure which email notifications you receive from the platform.</span>
            </div>

            {notificationFields.map(field => (
              <div
                key={field.key}
                className="flex items-center justify-between gap-4 py-3 px-3 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-700/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{field.label}</p>
                  <p className="text-xs text-ink-400 dark:text-ink-500 mt-0.5">{field.desc}</p>
                </div>
                <button
                  onClick={() => updateNotification(field.key, !notifications[field.key])}
                  className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
                    notifications[field.key] ? 'bg-gold-400' : 'bg-ink-200 dark:bg-ink-600'
                  }`}
                  role="switch"
                  aria-checked={notifications[field.key]}
                >
                  <motion.span
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${
                      notifications[field.key] ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}

            <div className="flex items-center justify-end gap-3 pt-4 mt-3 border-t border-ink-100 dark:border-ink-700/50">
              {savedTab === 'notifications' && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
                  <Check className="h-4 w-4" /> Saved successfully
                </motion.span>
              )}
              <button onClick={() => handleSave('notifications')} className="btn-gold text-sm">
                <Save className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
