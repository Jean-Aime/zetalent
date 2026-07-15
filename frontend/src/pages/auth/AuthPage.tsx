import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check, Loader2, ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { ZTLogo } from '../../components/brand/ZTLogo';
import { api } from '../../lib/api';

export function AuthPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { token, user } = await api.login(form.email, form.password);
      localStorage.setItem('zt_token', token);
      localStorage.setItem('zt_user', JSON.stringify(user));
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const accessFeatures = [
    'Manage news, matches, teams and players',
    'Review and publish multi-language content',
    'Upload and organise media assets',
    'Monitor analytics and platform health',
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] grid grid-cols-1 lg:grid-cols-2">
      {/* Brand Panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-ink-950 overflow-hidden">
        <div className="absolute inset-0 bg-radial-gold opacity-40" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(244,180,0,0.08), transparent 50%)' }} />

        <div className="relative">
          <ZTLogo size={48} />
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-400/15 border border-gold-400/30 mb-5"
          >
            <Shield size={16} className="text-gold-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Staff Access Only</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl font-bold text-white leading-tight mb-4"
          >
            ZT Media <span className="gradient-text">Admin Portal</span>
          </motion.h2>
          <p className="text-ink-300 text-lg mb-8 max-w-md">
            The content management system for ZETALENT MEDIA — the digital home of women's sports in Rwanda.
          </p>
          <ul className="space-y-3">
            {accessFeatures.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 text-ink-200"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-ink-950 shrink-0">
                  <Check size={14} />
                </span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative text-sm text-ink-500">
          © 2026 ZETALENT MEDIA. All rights reserved.
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-ink-50 dark:bg-ink-900/40">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <ZTLogo size={44} />
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 mb-4">
                  <Check size={32} />
                </span>
                <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Welcome Back!</h2>
                <p className="text-ink-500 dark:text-ink-400 mt-2 mb-6">You have successfully signed in.</p>
                <Link to="/admin/dashboard" className="btn-gold">
                  Continue to Dashboard <ArrowRight size={18} />
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="lg:hidden flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-gold-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gold-400">Staff Access Only</span>
                </div>

                <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-white mb-2">Sign In</h1>
                <p className="text-ink-500 dark:text-ink-400 mb-8">
                  Enter your credentials to access the admin dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input-zt !pl-12"
                        placeholder="admin@ztmedia.rw"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 dark:text-ink-200 mb-2">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="input-zt !pl-12 !pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-ink-600 dark:text-ink-300 cursor-pointer">
                      <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-gold-400 focus:ring-gold-400" />
                      Remember me
                    </label>
                    <a href="#" className="text-gold-500 hover:text-gold-400 font-medium">Forgot password?</a>
                  </div>

                  <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Please wait...</>
                    ) : (
                      <>Sign In <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-400">
                  Staff access only. Need an account?{' '}
                  <a href="mailto:info@ztmedia.rw" className="text-gold-500 hover:text-gold-400 font-medium">
                    Contact your administrator
                  </a>
                  .
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
