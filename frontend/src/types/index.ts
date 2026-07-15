export type Locale = 'en' | 'fr' | 'rw';

export interface LocalizedText {
  en: string;
  fr: string;
  rw: string;
}

export interface Sport {
  id: string;
  slug: string;
  name: LocalizedText;
  icon: string;
  color: string;
  teamCount: number;
}

export interface NewsCategory {
  id: string;
  slug: string;
  name: LocalizedText;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  image: string;
  imageAlt: string;
  category: string;
  sport: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: number;
  featured: boolean;
  trending: boolean;
  breaking: boolean;
  tags: string[];
  views: number;
}

export interface Team {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  sport: string;
  city: string;
  founded: number;
  stadium: string;
  coach: string;
  primaryColor: string;
  logo: string;
  logoText: string;
  description: LocalizedText;
  achievements: string[];
}

export interface Player {
  id: string;
  slug: string;
  name: string;
  teamId: string;
  teamName: string;
  sport: string;
  position: string;
  shirtNumber: number;
  nationality: string;
  flag: string;
  age: number;
  height: string;
  photo: string;
  bio: LocalizedText;
  achievements: string[];
  stats: { label: LocalizedText; value: string }[];
  social: { platform: string; handle: string }[];
  featured: boolean;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'yellow' | 'red' | 'sub' | 'mvp';
  team: 'home' | 'away';
  player: string;
  detail?: string;
}

export interface Match {
  id: string;
  sport: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'finished';
  league: string;
  matchweek: number;
  events?: MatchEvent[];
  mvp?: string;
}

export interface StandingRow {
  position: number;
  teamId: string;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface SocialPost {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok';
  author: string;
  handle: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  category: 'latest' | 'fan' | 'match' | 'official';
}

export interface Sponsor {
  id: string;
  name: string;
  tier: 'platinum' | 'gold' | 'silver';
  logoText: string;
  website: string;
}

export interface NavigationItem {
  label: LocalizedText;
  href: string;
  children?: { label: LocalizedText; href: string }[];
}
