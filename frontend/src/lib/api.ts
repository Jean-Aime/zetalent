const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function getToken(): string | null {
  return localStorage.getItem('zt_token');
}

export function getUser(): { id: string; email: string; name: string; role: string } | null {
  const u = localStorage.getItem('zt_user');
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem('zt_token');
  localStorage.removeItem('zt_user');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; email: string; name: string; role: string } }>(
      '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
    ),
  me: () => request<{ user: { id: string; email: string; name: string; role: string } }>('/auth/me'),

  // ── Sports ────────────────────────────────────────────────────────────────
  getSports: () => request<any[]>('/sports'),
  createSport: (data: object) => request('/sports', { method: 'POST', body: JSON.stringify(data) }),
  updateSport: (id: string, data: object) => request(`/sports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSport: (id: string) => request(`/sports/${id}`, { method: 'DELETE' }),

  // ── Teams ─────────────────────────────────────────────────────────────────
  getTeams: (sport?: string) => request<any[]>(`/teams${sport ? `?sport=${sport}` : ''}`),
  createTeam: (data: object) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: string, data: object) => request(`/teams/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTeam: (id: string) => request(`/teams/${id}`, { method: 'DELETE' }),

  // ── Players ───────────────────────────────────────────────────────────────
  getPlayers: (params?: { sport?: string; team?: string; featured?: boolean }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/players${q ? `?${q}` : ''}`);
  },
  createPlayer: (data: object) => request('/players', { method: 'POST', body: JSON.stringify(data) }),
  updatePlayer: (id: string, data: object) => request(`/players/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlayer: (id: string) => request(`/players/${id}`, { method: 'DELETE' }),

  // ── Matches ───────────────────────────────────────────────────────────────
  getMatches: (params?: { sport?: string; status?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/matches${q ? `?${q}` : ''}`);
  },
  createMatch: (data: object) => request('/matches', { method: 'POST', body: JSON.stringify(data) }),
  updateMatch: (id: string, data: object) => request(`/matches/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMatch: (id: string) => request(`/matches/${id}`, { method: 'DELETE' }),

  // ── News ──────────────────────────────────────────────────────────────────
  getNews: (params?: { category?: string; sport?: string; featured?: string; limit?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<any[]>(`/news${q ? `?${q}` : ''}`);
  },
  getAdminNews: () => request<any[]>('/news/admin/all'),
  createArticle: (data: object) => request('/news', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle: (id: string, data: object) => request(`/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteArticle: (id: string) => request(`/news/${id}`, { method: 'DELETE' }),

  // ── Standings ─────────────────────────────────────────────────────────────
  getStandings: (sport?: string) => request<any[]>(`/standings${sport ? `?sport=${sport}` : ''}`),
  createStanding: (data: object) => request('/standings', { method: 'POST', body: JSON.stringify(data) }),
  updateStanding: (id: string, data: object) => request(`/standings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStanding: (id: string) => request(`/standings/${id}`, { method: 'DELETE' }),

  // ── Sponsors ──────────────────────────────────────────────────────────────
  getSponsors: () => request<any[]>('/sponsors'),
  createSponsor: (data: object) => request('/sponsors', { method: 'POST', body: JSON.stringify(data) }),
  updateSponsor: (id: string, data: object) => request(`/sponsors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSponsor: (id: string) => request(`/sponsors/${id}`, { method: 'DELETE' }),

  // ── Social Posts ──────────────────────────────────────────────────────────
  getSocialPosts: (category?: string) => request<any[]>(`/social${category ? `?category=${category}` : ''}`),
  createSocialPost: (data: object) => request('/social', { method: 'POST', body: JSON.stringify(data) }),
  updateSocialPost: (id: string, data: object) => request(`/social/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSocialPost: (id: string) => request(`/social/${id}`, { method: 'DELETE' }),

  // ── Messages ──────────────────────────────────────────────────────────────
  getMessages: () => request<any[]>('/messages'),
  updateMessageStatus: (id: string, status: string) => request(`/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteMessage: (id: string) => request(`/messages/${id}`, { method: 'DELETE' }),
  submitContactForm: (data: { name: string; email: string; subject: string; message: string }) =>
    request('/messages', { method: 'POST', body: JSON.stringify(data) }),

  // ── Newsletter ────────────────────────────────────────────────────────────
  getSubscribers: () => request<any[]>('/newsletter'),
  toggleSubscriber: (id: string, is_active: boolean) => request(`/newsletter/${id}`, { method: 'PATCH', body: JSON.stringify({ is_active }) }),
  deleteSubscriber: (id: string) => request(`/newsletter/${id}`, { method: 'DELETE' }),
  subscribe: (email: string, source?: string) => request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) }),

  // ── Admin Users ───────────────────────────────────────────────────────────
  getUsers: () => request<any[]>('/users'),
  createUser: (data: object) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: object) => request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: 'DELETE' }),
};
