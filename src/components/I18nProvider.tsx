"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  translations,
  defaultLocale,
  detectLocale,
} from "@/lib/i18n";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (typeof translations)[Locale];
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "qookix-locale";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const initial = detectLocale();
    setLocaleState(initial);
    document.documentElement.lang = initial === "zh" ? "zh-CN" : "en";
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
    const t = translations[next];
    document.title = t.metadata.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t.metadata.description);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "zh" ? "en" : "zh";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
      const t = translations[next];
      document.title = t.metadata.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", t.metadata.description);
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, setLocale, toggleLocale, t: translations[locale] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
