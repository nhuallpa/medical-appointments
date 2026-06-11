"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  detectBrowserLocale,
  isSupportedLocale,
  type Locale,
} from "./locale";
import en, { type Translations } from "./translations/en";
import es from "./translations/es";
import pt from "./translations/pt";

const dictionaries: Record<Locale, Translations> = { en, es, pt };

/** Keys of a translation namespace whose values are strings (arrays are excluded). */
type StringLeafKeys<T> = {
  [K in keyof T & string]: T[K] extends string ? K : never;
}[keyof T & string];

/** Dot-path union of every string leaf in `Translations`, e.g. "common.save". */
export type TranslationKey = {
  [N in keyof Translations & string]: `${N}.${StringLeafKeys<Translations[N]> & string}`;
}[keyof Translations & string];

function getByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in acc) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Translations;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

function createContextValue(locale: Locale, setLocale: (locale: Locale) => void): LocaleContextValue {
  const messages = dictionaries[locale];

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const value = getByPath(messages, key) ?? getByPath(en, key);
    return typeof value === "string" ? interpolate(value, params) : key;
  };

  return { locale, setLocale, messages, t };
}

const defaultContextValue = createContextValue(DEFAULT_LOCALE, () => undefined);

const LocaleContext = createContext<LocaleContextValue>(defaultContextValue);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    setLocaleState(isSupportedLocale(stored) ? stored : detectBrowserLocale());
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  };

  const value = useMemo(() => createContextValue(locale, setLocale), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Active locale and a setter that persists the choice and overrides detection. */
export function useLocale(): { locale: Locale; setLocale: (locale: Locale) => void } {
  const { locale, setLocale } = useContext(LocaleContext);
  return { locale, setLocale };
}

/**
 * `t(key, params?)` resolves a dot-path key against the active locale's
 * dictionary, falling back to English for missing keys, with optional
 * `{placeholder}` interpolation. `messages` exposes the full active
 * dictionary for non-string values (e.g. weekday name arrays).
 */
export function useTranslation(): Pick<LocaleContextValue, "t" | "locale" | "messages"> {
  const { t, locale, messages } = useContext(LocaleContext);
  return { t, locale, messages };
}
