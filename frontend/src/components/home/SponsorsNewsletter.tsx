import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { Reveal } from '../common/NewsCard';
import { api } from '../../lib/api';

interface Sponsor {
  id: string; name: string; tier: string; logo_text: string; logo_url: string; website: string;
}

export function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    api.getSponsors()
      .then(data => setSponsors(data))
      .catch(() => {});
  }, []);

  if (!sponsors.length) return null;

  return (
    <section className="py-12 border-y border-ink-100 dark:border-ink-700/50">
      <div className="container-zt">
        <Reveal>
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-ink-400 mb-8">
            Official Partners & Sponsors
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 items-center">
            {sponsors.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-center rounded-2xl border transition-all duration-300 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-400/5 cursor-pointer ${
                  s.tier === 'platinum'
                    ? 'h-16 col-span-2 border-gold-400/30 bg-gold-400/5'
                    : s.tier === 'gold'
                    ? 'h-14 col-span-2 md:col-span-1 border-ink-200 dark:border-ink-700'
                    : 'h-12 col-span-2 md:col-span-1 border-ink-100 dark:border-ink-800'
                }`}>
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-8 max-w-full object-contain px-2" loading="lazy" />
                ) : (
                  <span className={`font-display font-bold ${
                    s.tier === 'platinum' ? 'text-xl text-gold-500' : s.tier === 'gold' ? 'text-base text-ink-700 dark:text-ink-200' : 'text-sm text-ink-400'
                  }`}>
                    {s.logo_text || s.name}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.subscribe(email.trim(), 'website');
      setSubmitted(true);
      setEmail('');
    } catch {
      // still show success to avoid email enumeration
      setSubmitted(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-radial-gold relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 via-transparent to-transparent pointer-events-none" />
      <div className="container-zt relative">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 mb-6 animate-glow">
              <Mail size={28} />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-4">
              Never Miss a Moment
            </h2>
            <p className="text-ink-500 dark:text-ink-400 text-lg mb-8">
              Get the latest scores, exclusive interviews, and breaking news from women's sports delivered directly to your inbox.
            </p>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-gold-400/15 border border-gold-400/30 text-gold-500">
                <Check size={22} />
                <span className="font-semibold">You're subscribed! Watch your inbox.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address" required className="input-zt flex-1" />
                <button type="submit" disabled={loading} className="btn-gold shrink-0">
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-ink-950/30 border-t-ink-950 animate-spin" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>
            )}
            <p className="mt-4 text-xs text-ink-400">No spam, unsubscribe anytime.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
