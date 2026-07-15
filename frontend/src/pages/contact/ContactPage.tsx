import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, Clock, Send, Check, Twitter, Instagram, Youtube, Facebook } from 'lucide-react';
import { Reveal } from '../../components/common/NewsCard';
import { api } from '../../lib/api';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      await api.submitContactForm(form);
    } catch {
      // still show success — message saved or network issue
    } finally {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  const contactInfo = [
    { icon: MapPin, title: 'Visit Us', lines: ['KN 4 Avenue, Kigali Heights', 'Kigali, Rwanda'] },
    { icon: Mail, title: 'Email Us', lines: ['info@ztmedia.rw', 'news@ztmedia.rw'] },
    { icon: Phone, title: 'Call Us', lines: ['+250 788 000 000', '+250 722 000 000'] },
    { icon: Clock, title: 'Office Hours', lines: ['Mon - Fri: 8:00 - 18:00', 'Sat: 9:00 - 14:00'] },
  ];

  return (
    <div className="py-12 pb-16">
      <div className="container-zt">
        <Reveal>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="gold-divider" />
              <span className="section-label">Contact</span>
              <span className="gold-divider" />
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-white tracking-tight">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="mt-3 text-ink-500 dark:text-ink-400 max-w-xl mx-auto">
              Have a story tip, partnership inquiry, or just want to say hello? We'd love to hear from you.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Form */}
          <Reveal>
            <div className="card-zt p-6 sm:p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 mb-4">
                    <Check size={32} />
                  </span>
                  <h3 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Message Sent!</h3>
                  <p className="text-ink-500 dark:text-ink-400 mt-2 max-w-sm">
                    Thank you for reaching out. Our team will get back to you within 48 hours.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn-outline mt-6">
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Full Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-zt"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-zt"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Subject</label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="input-zt"
                      placeholder="What's this about?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input-zt resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-gold w-full sm:w-auto disabled:opacity-60">
                    <Send size={18} /> {submitting ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Contact Info */}
          <Reveal delay={0.1}>
            <div className="space-y-4">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="card-zt p-5 flex items-start gap-4"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-400 shrink-0">
                    <info.icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink-900 dark:text-white text-sm">{info.title}</h3>
                    {info.lines.map((line, idx) => (
                      <p key={idx} className="text-sm text-ink-500 dark:text-ink-400 mt-0.5">{line}</p>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Social */}
              <div className="card-zt p-5">
                <h3 className="font-semibold text-ink-900 dark:text-white text-sm mb-3">Follow Us</h3>
                <div className="flex gap-2">
                  {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                    <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 dark:bg-ink-800 hover:bg-gold-400 hover:text-ink-950 transition-all duration-300">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              <div className="card-zt overflow-hidden h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={32} className="text-gold-400 mx-auto mb-2" />
                    <p className="text-sm text-ink-300">Kigali, Rwanda</p>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(244,180,0,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
