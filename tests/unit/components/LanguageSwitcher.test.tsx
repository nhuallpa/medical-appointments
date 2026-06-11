import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "@/components/LanguageSwitcher/LanguageSwitcher";
import { LocaleProvider } from "@/i18n/LocaleContext";
import { LOCALE_STORAGE_KEY } from "@/i18n/locale";

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders an option for each supported language, labeled in its own language", () => {
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Español" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Português" })).toBeInTheDocument();
  });

  it("defaults to English and marks it as the selected option", async () => {
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    expect(await screen.findByRole("combobox")).toHaveValue("en");
  });

  it("switches locale and persists the choice when a language is selected", async () => {
    render(
      <LocaleProvider>
        <LanguageSwitcher />
      </LocaleProvider>
    );

    const select = await screen.findByRole("combobox");
    await userEvent.selectOptions(select, "es");

    expect(select).toHaveValue("es");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("es");
  });
});
