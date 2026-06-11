import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider, useLocale, useTranslation, type TranslationKey } from "@/i18n/LocaleContext";
import { LOCALE_STORAGE_KEY } from "@/i18n/locale";

function Probe() {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="save">{t("common.save")}</span>
      <span data-testid="missing">{t("not.a.real.key" as TranslationKey)}</span>
      <button onClick={() => setLocale("es")}>set-es</button>
      <button onClick={() => setLocale("pt")}>set-pt</button>
    </div>
  );
}

describe("LocaleProvider", () => {
  const originalLanguages = navigator.languages;
  const originalLanguage = navigator.language;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
    Object.defineProperty(navigator, "languages", { value: originalLanguages, configurable: true });
    Object.defineProperty(navigator, "language", { value: originalLanguage, configurable: true });
  });

  it("detects the browser locale on mount when no preference is stored", async () => {
    Object.defineProperty(navigator, "languages", { value: ["es-AR", "en-US"], configurable: true });

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>
    );

    expect(await screen.findByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("save")).toHaveTextContent("Guardar");
  });

  it("uses a stored locale preference instead of browser detection", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "pt");
    Object.defineProperty(navigator, "languages", { value: ["es-AR"], configurable: true });

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>
    );

    expect(await screen.findByTestId("locale")).toHaveTextContent("pt");
    expect(screen.getByTestId("save")).toHaveTextContent("Salvar");
  });

  it("persists a manual setLocale choice to localStorage and updates translations", async () => {
    Object.defineProperty(navigator, "languages", { value: ["en-US"], configurable: true });

    render(
      <LocaleProvider>
        <Probe />
      </LocaleProvider>
    );

    await screen.findByTestId("locale");

    fireEvent.click(screen.getByText("set-es"));

    expect(screen.getByTestId("locale")).toHaveTextContent("es");
    expect(screen.getByTestId("save")).toHaveTextContent("Guardar");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
  });
});

describe("useTranslation fallback behavior", () => {
  it("falls back to English defaults when used without a LocaleProvider", () => {
    render(<Probe />);

    expect(screen.getByTestId("locale")).toHaveTextContent("en");
    expect(screen.getByTestId("save")).toHaveTextContent("Save");
  });

  it("falls back to the key itself for an unknown translation key", () => {
    render(<Probe />);

    expect(screen.getByTestId("missing")).toHaveTextContent("not.a.real.key");
  });
});
