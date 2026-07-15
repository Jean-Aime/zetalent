import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUser, api } from '../../lib/api';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (!token || !user) { setChecking(false); return; }
    api.me()
      .then(() => setValid(true))
      .catch(() => { localStorage.removeItem('zt_token'); localStorage.removeItem('zt_user'); })
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-ink-950">
        <div className="h-10 w-10 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
      </div>
    );
  }

  if (!valid) return <Navigate to="/auth" state={{ from: location }} replace />;
  return <>{children}</>;
}
