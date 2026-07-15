import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Locale, LocalizedText } from '../types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const localeLabels: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  rw: 'Kinyarwanda',
};

export { localeLabels };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('zt-locale') as Locale | null) ?? 'en';
  });

  const handleSetLocale = (l: Locale) => {
    setLocale(l);
    localStorage.setItem('zt-locale', l);
  };

  const t = (text: LocalizedText) => text[locale] ?? text.en;

  return (
    <LanguageContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
