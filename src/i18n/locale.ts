export type Locale = "en" | "es" | "pt";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "es", "pt"];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "medical-appointments.locale";

/**
 * Maps a BCP-47 language tag (e.g. "es-AR", "pt-BR", "en-US", "fr") to a
 * supported Locale, falling back to DEFAULT_LOCALE for unsupported base
 * languages.
 */
export function resolveLocale(tag: string): Locale {
  const base = tag.split("-")[0].toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(base) ? (base as Locale) : DEFAULT_LOCALE;
}

/**
 * Reads navigator.languages / navigator.language and returns the first
 * supported Locale, or DEFAULT_LOCALE if none match or in non-browser
 * environments (SSR).
 */
export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const tag of candidates) {
    if (!tag) continue;
    const base = tag.split("-")[0].toLowerCase();
    if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) {
      return base as Locale;
    }
  }

  return DEFAULT_LOCALE;
}

/** Type-safe check that a stored value is a supported Locale. */
export function isSupportedLocale(value: string | null): value is Locale {
  return value !== null && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
