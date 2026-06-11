import { test, expect } from "@playwright/test";

const BCP47_TAGS: Record<"en" | "es" | "pt", string> = {
  en: "en-US",
  es: "es-ES",
  pt: "pt-PT",
};

test.describe("US4 — Localized dates", () => {
  for (const code of ["en", "es", "pt"] as const) {
    test(`Calendar header and Day view heading show ${code} month/weekday names`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("combobox", { name: /language|idioma/i }).selectOption(code);

      const now = new Date();
      const monthLabel = now.toLocaleDateString(BCP47_TAGS[code], { month: "long", year: "numeric" });
      await expect(page.getByText(monthLabel)).toBeVisible();

      await page.getByRole("tab", { name: /calendar|calendario|calendário/i }).click();
      const dayTab = page.getByRole("tab", { name: /^(day|día|dia)$/i });
      await dayTab.click();

      const dayLabel = now.toLocaleDateString(BCP47_TAGS[code], {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      await expect(page.getByText(dayLabel)).toBeVisible();
    });
  }
});
