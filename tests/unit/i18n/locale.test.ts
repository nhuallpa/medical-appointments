import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveLocale, detectBrowserLocale, isSupportedLocale, DEFAULT_LOCALE } from "@/i18n/locale";

describe("resolveLocale", () => {
  it("resolves base languages directly", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("es")).toBe("es");
    expect(resolveLocale("pt")).toBe("pt");
  });

  it("maps regional variants to their base language", () => {
    expect(resolveLocale("es-AR")).toBe("es");
    expect(resolveLocale("es-MX")).toBe("es");
    expect(resolveLocale("pt-BR")).toBe("pt");
    expect(resolveLocale("pt-PT")).toBe("pt");
    expect(resolveLocale("en-GB")).toBe("en");
    expect(resolveLocale("en-US")).toBe("en");
  });

  it("falls back to English for unsupported languages", () => {
    expect(resolveLocale("fr")).toBe("en");
    expect(resolveLocale("de-DE")).toBe("en");
  });
});

describe("isSupportedLocale", () => {
  it("returns true for supported locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("es")).toBe(true);
    expect(isSupportedLocale("pt")).toBe(true);
  });

  it("returns false for unsupported or null values", () => {
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale(null)).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });
});

describe("detectBrowserLocale", () => {
  const originalLanguages = navigator.languages;
  const originalLanguage = navigator.language;

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "languages", { value: originalLanguages, configurable: true });
    Object.defineProperty(navigator, "language", { value: originalLanguage, configurable: true });
  });

  it("returns the base language of the first supported entry in navigator.languages", () => {
    Object.defineProperty(navigator, "languages", { value: ["es-AR", "en-US"], configurable: true });
    expect(detectBrowserLocale()).toBe("es");
  });

  it("falls back through navigator.languages to find a supported entry", () => {
    Object.defineProperty(navigator, "languages", { value: ["fr-FR", "pt-BR"], configurable: true });
    expect(detectBrowserLocale()).toBe("pt");
  });

  it("returns DEFAULT_LOCALE when no entries are supported", () => {
    Object.defineProperty(navigator, "languages", { value: ["fr-FR", "de-DE"], configurable: true });
    expect(detectBrowserLocale()).toBe(DEFAULT_LOCALE);
  });

  it("falls back to navigator.language when navigator.languages is empty", () => {
    Object.defineProperty(navigator, "languages", { value: [], configurable: true });
    Object.defineProperty(navigator, "language", { value: "pt-PT", configurable: true });
    expect(detectBrowserLocale()).toBe("pt");
  });
});
