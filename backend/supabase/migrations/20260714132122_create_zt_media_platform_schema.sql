-- ZT Media Platform — Core Schema (PostgreSQL compatible)

CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text DEFAULT 'Trophy',
  color text DEFAULT '#F4B400',
  team_count int DEFAULT 0,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  season text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short_name text,
  city text,
  founded int,
  stadium text,
  coach text,
  primary_color text DEFAULT '#F4B400',
  logo_url text,
  description text,
  achievements jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  position text,
  shirt_number int,
  nationality text,
  flag text,
  age int,
  height text,
  photo_url text,
  bio text,
  achievements jsonb DEFAULT '[]'::jsonb,
  stats jsonb DEFAULT '[]'::jsonb,
  social_links jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  league_id uuid REFERENCES leagues(id) ON DELETE SET NULL,
  home_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  home_team_name text NOT NULL,
  away_team_name text NOT NULL,
  home_team_logo text,
  away_team_logo text,
  home_score int,
  away_score int,
  match_date date NOT NULL,
  match_time text,
  venue text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  league_name text,
  matchweek int DEFAULT 0,
  mvp text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS match_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE,
  minute int NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('goal', 'yellow', 'red', 'sub', 'mvp')),
  team_side text NOT NULL CHECK (team_side IN ('home', 'away')),
  player_name text NOT NULL,
  detail text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS standings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id uuid REFERENCES sports(id) ON DELETE CASCADE,
  league_id uuid REFERENCES leagues(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  position int NOT NULL,
  team_name text NOT NULL,
  team_logo text,
  played int DEFAULT 0,
  won int DEFAULT 0,
  drawn int DEFAULT 0,
  lost int DEFAULT 0,
  goals_for int DEFAULT 0,
  goals_against int DEFAULT 0,
  goal_difference int DEFAULT 0,
  points int DEFAULT 0,
  form jsonb DEFAULT '[]'::jsonb,
  season text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  sport_slug text,
  author text NOT NULL,
  author_avatar text,
  image_url text,
  image_alt text,
  published_at timestamptz DEFAULT now(),
  read_time int DEFAULT 3,
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  is_breaking boolean DEFAULT false,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published')),
  tags jsonb DEFAULT '[]'::jsonb,
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES news_articles(id) ON DELETE CASCADE,
  locale text NOT NULL CHECK (locale IN ('en', 'fr', 'rw')),
  title text NOT NULL,
  excerpt text NOT NULL,
  body text NOT NULL,
  UNIQUE(article_id, locale),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('twitter', 'instagram', 'facebook', 'youtube', 'tiktok')),
  author text NOT NULL,
  handle text,
  avatar_url text,
  content text NOT NULL,
  image_url text,
  likes int DEFAULT 0,
  comments int DEFAULT 0,
  shares int DEFAULT 0,
  category text DEFAULT 'latest' CHECK (category IN ('latest', 'fan', 'match', 'official')),
  posted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text DEFAULT 'silver' CHECK (tier IN ('platinum', 'gold', 'silver')),
  logo_text text,
  logo_url text,
  website text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  source text DEFAULT 'website' CHECK (source IN ('website', 'social')),
  subscribed_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  body text NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  password_hash text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_sport ON teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_sport ON players(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport_id);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON news_articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);
CREATE INDEX IF NOT EXISTS idx_news_articles_sport ON news_articles(sport_slug);
CREATE INDEX IF NOT EXISTS idx_news_translations_article ON news_translations(article_id);
CREATE INDEX IF NOT EXISTS idx_standings_sport ON standings(sport_id);
CREATE INDEX IF NOT EXISTS idx_standings_league ON standings(league_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
