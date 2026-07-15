export function formatDate(dateStr: string, locale: string = 'en'): string {
  const date = new Date(dateStr);
  const localeMap: Record<string, string> = {
    en: 'en-GB',
    fr: 'fr-FR',
    rw: 'en-GB',
  };
  return date.toLocaleDateString(localeMap[locale] ?? 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

export function formatViews(views: number): string {
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return views.toString();
}

export function sportIconName(slug: string): string {
  const map: Record<string, string> = {
    football: 'Circle',
    basketball: 'Dribbble',
    volleyball: 'Volleyball',
    handball: 'Hand',
    athletics: 'Activity',
    tennis: 'CircleDashed',
    rugby: 'CircleDot',
    hockey: 'CircleEqual',
  };
  return map[slug] ?? 'Trophy';
}
