import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Check } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(244,180,0,0.06), transparent 60%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.jpeg"
            alt="ZeTalent Media"
            className="h-20 w-20 rounded-2xl object-contain mb-4"
          />
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">
            Ze<span className="text-gold-400">Talent</span> Media
          </h1>
          <p className="text-sm text-ink-400 mt-1">Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-ink-900 border border-ink-700/50 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-ink-950 mb-4">
                  <Check size={28} />
                </span>
                <h2 className="font-display text-xl font-bold text-white mb-1">Welcome back!</h2>
                <p className="text-ink-400 text-sm mb-6">Redirecting to dashboard…</p>
                <Link to="/admin/dashboard" className="btn-gold text-sm">
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="font-display text-xl font-bold text-white mb-1">Sign in</h2>
                <p className="text-sm text-ink-400 mb-6">Enter your credentials to continue.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      <AlertCircle size={15} className="shrink-0" /> {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="admin@ztmedia.rw"
                        className="w-full bg-ink-800 border border-ink-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-gold-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-300 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-ink-800 border border-ink-700 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:border-gold-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-bold py-3 rounded-xl transition-colors disabled:opacity-60 mt-2"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait…</> : <>Sign In <ArrowRight size={16} /></>}
                  </button>
                </form>

                <p className="mt-5 text-center text-xs text-ink-500">
                  Staff access only —{' '}
                  <a href="mailto:info@ztmedia.rw" className="text-gold-500 hover:text-gold-400">
                    contact your administrator
                  </a>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
