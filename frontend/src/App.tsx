import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/common/RequireAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/home/HomePage';

/* ── Public pages (lazy) ── */
const NewsPage        = lazy(() => import('./pages/news/NewsPage').then(m => ({ default: m.NewsPage })));
const ArticlePage     = lazy(() => import('./pages/news/ArticlePage').then(m => ({ default: m.ArticlePage })));
const SportsIndex     = lazy(() => import('./pages/sports/SportPages').then(m => ({ default: m.SportsIndexPage })));
const SportDetail     = lazy(() => import('./pages/sports/SportPages').then(m => ({ default: m.SportDetailPage })));
const TeamsPage       = lazy(() => import('./pages/teams/TeamsPage').then(m => ({ default: m.TeamsPage })));
const TeamDetail      = lazy(() => import('./pages/teams/TeamDetailPage').then(m => ({ default: m.TeamDetailPage })));
const PlayersPage     = lazy(() => import('./pages/players/PlayersPage').then(m => ({ default: m.PlayersPage })));
const PlayerDetail    = lazy(() => import('./pages/players/PlayerDetailPage').then(m => ({ default: m.PlayerDetailPage })));
const FixturesPage    = lazy(() => import('./pages/fixtures/FixturesPage').then(m => ({ default: m.FixturesPage })));
const StandingsPage   = lazy(() => import('./pages/standings/StandingsPage').then(m => ({ default: m.StandingsPage })));
const AboutPage       = lazy(() => import('./pages/about/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage     = lazy(() => import('./pages/contact/ContactPage').then(m => ({ default: m.ContactPage })));
const AuthPage        = lazy(() => import('./pages/auth/AuthPage').then(m => ({ default: m.AuthPage })));

/* ── Admin pages (lazy) ── */
const AdminLayout     = lazy(() => import('./admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard  = lazy(() => import('./admin/pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminNews       = lazy(() => import('./admin/pages/AdminNews').then(m => ({ default: m.AdminNews })));
const AdminSports     = lazy(() => import('./admin/pages/AdminSports').then(m => ({ default: m.AdminSports })));
const AdminTeams      = lazy(() => import('./admin/pages/AdminTeams').then(m => ({ default: m.AdminTeams })));
const AdminPlayers    = lazy(() => import('./admin/pages/AdminPlayers').then(m => ({ default: m.AdminPlayers })));
const AdminMatches    = lazy(() => import('./admin/pages/AdminMatches').then(m => ({ default: m.AdminMatches })));
const AdminStandings  = lazy(() => import('./admin/pages/AdminStandings').then(m => ({ default: m.AdminStandings })));
const AdminMedia      = lazy(() => import('./admin/pages/AdminMedia').then(m => ({ default: m.AdminMedia })));
const AdminSponsors   = lazy(() => import('./admin/pages/AdminSponsors').then(m => ({ default: m.AdminSponsors })));
const AdminNewsletter = lazy(() => import('./admin/pages/AdminNewsletter').then(m => ({ default: m.AdminNewsletter })));
const AdminSocial     = lazy(() => import('./admin/pages/AdminSocial').then(m => ({ default: m.AdminSocial })));
const AdminMessages   = lazy(() => import('./admin/pages/AdminMessages').then(m => ({ default: m.AdminMessages })));
const AdminUsers      = lazy(() => import('./admin/pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminSettings   = lazy(() => import('./admin/pages/AdminSettings').then(m => ({ default: m.AdminSettings })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-gold-400/30 border-t-gold-400 animate-spin" />
        <p className="text-sm text-ink-400">Loading...</p>
      </div>
    </div>
  );
}

const S = (C: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}><C /></Suspense>
);

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public site ── */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/news" element={S(NewsPage)} />
              <Route path="/news/:slug" element={S(ArticlePage)} />
              <Route path="/sports" element={S(SportsIndex)} />
              <Route path="/sports/:slug" element={S(SportDetail)} />
              <Route path="/teams" element={S(TeamsPage)} />
              <Route path="/teams/:slug" element={S(TeamDetail)} />
              <Route path="/players" element={S(PlayersPage)} />
              <Route path="/players/:slug" element={S(PlayerDetail)} />
              <Route path="/fixtures" element={S(FixturesPage)} />
              <Route path="/standings" element={S(StandingsPage)} />
              <Route path="/about" element={S(AboutPage)} />
              <Route path="/contact" element={S(ContactPage)} />
              <Route path="/auth" element={S(AuthPage)} />
            </Route>

            {/* ── Admin panel ── */}
            <Route path="/admin" element={<RequireAuth>{S(AdminLayout)}</RequireAuth>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={S(AdminDashboard)} />
              <Route path="news" element={S(AdminNews)} />
              <Route path="sports" element={S(AdminSports)} />
              <Route path="teams" element={S(AdminTeams)} />
              <Route path="players" element={S(AdminPlayers)} />
              <Route path="matches" element={S(AdminMatches)} />
              <Route path="standings" element={S(AdminStandings)} />
              <Route path="media" element={S(AdminMedia)} />
              <Route path="sponsors" element={S(AdminSponsors)} />
              <Route path="newsletter" element={S(AdminNewsletter)} />
              <Route path="social" element={S(AdminSocial)} />
              <Route path="messages" element={S(AdminMessages)} />
              <Route path="users" element={S(AdminUsers)} />
              <Route path="settings" element={S(AdminSettings)} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
