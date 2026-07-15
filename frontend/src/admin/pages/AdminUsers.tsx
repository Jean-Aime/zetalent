import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Plus, Edit3, Trash2, X, Check, Mail, Clock, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { api, getUser } from '../../lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  email: string;
  role: string;
  password: string;
  is_active: boolean;
}

const roleConfig: Record<string, { label: string; description: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', description: 'Full access to all features and settings', bg: 'bg-gold-400/15', text: 'text-gold-600 dark:text-gold-400' },
  admin:       { label: 'Admin',       description: 'Can manage all content and users',         bg: 'bg-blue-500/15',  text: 'text-blue-600 dark:text-blue-400' },
  editor:      { label: 'Editor',      description: 'Can create and publish content',            bg: 'bg-green-500/15', text: 'text-green-600 dark:text-green-400' },
};

const emptyForm: FormState = { name: '', email: '', role: 'editor', password: '', is_active: true };

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const currentUser = getUser();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const rows = await api.getUsers();
      setUsers(rows);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const startAdd = () => { setShowForm(true); setEditingId(null); setFormData(emptyForm); };
  const startEdit = (u: AdminUser) => {
    setEditingId(u.id); setShowForm(false); setDeleteConfirmId(null);
    setFormData({ name: u.name, email: u.email, role: u.role, password: '', is_active: u.is_active });
  };
  const cancelForm = () => { setShowForm(false); setEditingId(null); setFormData(emptyForm); };

  const saveForm = async () => {
    if (!formData.name || !formData.email) return;
    if (!editingId && !formData.password) { setError('Password is required for new users'); return; }
    setSaving(true);
    try {
      if (editingId) {
        const payload: any = { name: formData.name, role: formData.role, is_active: formData.is_active };
        if (formData.password) payload.password = formData.password;
        await api.updateUser(editingId, payload);
      } else {
        await api.createUser({ name: formData.name, email: formData.email, role: formData.role, password: formData.password });
      }
      await load(); cancelForm();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async (id: string) => {
    if (id === currentUser?.id) { setError("You can't delete your own account"); setDeleteConfirmId(null); return; }
    setSaving(true);
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteConfirmId(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const update = (field: keyof FormState, value: unknown) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-white tracking-tight">Users & Roles</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">{users.length} users · {users.filter(u => u.is_active).length} active</p>
        </div>
        <button onClick={startAdd} className="btn-gold text-sm"><Plus className="h-4 w-4" /> Add User</button>
      </motion.div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Role legend */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="card-zt p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-400 dark:text-ink-500 mb-3">Role Permissions</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(roleConfig).map(([key, rc]) => (
            <div key={key} className="flex items-start gap-3">
              <span className={`chip ${rc.bg} ${rc.text} shrink-0`}>{rc.label}</span>
              <p className="text-xs text-ink-500 dark:text-ink-400 leading-snug">{rc.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {(showForm || editingId) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="card-zt p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-ink-900 dark:text-white">{editingId ? 'Edit User' : 'Add New User'}</h3>
                <button onClick={cancelForm} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Jane Doe" className="input-zt" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e => update('email', e.target.value)} placeholder="user@zetalentmedia.com" className="input-zt" disabled={!!editingId} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">Role</label>
                  <select value={formData.role} onChange={e => update('role', e.target.value)} className="input-zt">
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
                    {editingId ? 'New Password (leave blank to keep)' : 'Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input type="password" value={formData.password} onChange={e => update('password', e.target.value)} placeholder={editingId ? 'Leave blank to keep current' : 'Min 8 characters'} className="input-zt pl-10" />
                  </div>
                </div>
              </div>
              {editingId && (
                <div className="flex items-center gap-3">
                  <button onClick={() => update('is_active', !formData.is_active)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${formData.is_active ? 'bg-green-500' : 'bg-ink-300 dark:bg-ink-600'}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{formData.is_active ? 'Active' : 'Suspended'}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100 dark:border-ink-700/50">
                <button onClick={cancelForm} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={saveForm} disabled={saving} className="btn-gold text-sm">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {editingId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="card-zt overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gold-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 dark:text-ink-500 border-b border-ink-100 dark:border-ink-700/50 bg-ink-50/50 dark:bg-ink-800/50">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50 dark:divide-ink-700/30">
                {users.map(user => {
                  const rc = roleConfig[user.role] || roleConfig.editor;
                  const isMe = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="hover:bg-ink-50 dark:hover:bg-ink-700/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400/10 text-gold-500 font-bold text-sm shrink-0">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink-800 dark:text-ink-100 flex items-center gap-2">
                              {user.name}
                              {isMe && <span className="text-[10px] font-bold bg-gold-400/15 text-gold-500 px-2 py-0.5 rounded-full">You</span>}
                            </p>
                            <p className="text-xs text-ink-400 dark:text-ink-500 flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${rc.bg} ${rc.text} whitespace-nowrap`}>
                          <Shield className="h-3 w-3" /> {rc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`chip ${user.is_active ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                          {user.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-400 dark:text-ink-500 whitespace-nowrap">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => editingId === user.id ? cancelForm() : startEdit(user)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-gold-400/10 hover:text-gold-500 transition-colors">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteConfirmId(user.id)} disabled={isMe}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-700/50 mb-3"><Shield className="h-7 w-7 text-ink-400" /></div>
            <p className="text-sm font-medium text-ink-600 dark:text-ink-300">No users found</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="card-zt p-6 max-w-sm w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
              <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-1">Remove User?</h3>
              <p className="text-sm text-ink-500 dark:text-ink-400 mb-5">
                "{users.find(u => u.id === deleteConfirmId)?.name}" will lose all access. This cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="px-5 py-2.5 text-sm font-semibold text-ink-600 dark:text-ink-300 rounded-full hover:bg-ink-100 dark:hover:bg-ink-700 transition-colors">Cancel</button>
                <button onClick={() => confirmDelete(deleteConfirmId)} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
