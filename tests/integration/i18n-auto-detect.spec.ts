import { test, expect } from "@playwright/test";

test.describe("US1 — Automatic language detection", () => {
  test.use({ locale: "es-AR" });

  test("renders the UI in Spanish for an es-AR browser locale", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "⚙ Configuración" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Calendario" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Día" })).toBeVisible();

    const now = new Date();
    const monthLabel = now.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
    await expect(page.getByText(monthLabel)).toBeVisible();
  });
});

test.describe("US1 — Automatic language detection", () => {
  test.use({ locale: "pt-BR" });

  test("renders the UI in Portuguese for a pt-BR browser locale", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "⚙ Configurações" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Calendário" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Dia" })).toBeVisible();

    const now = new Date();
    const monthLabel = now.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
    await expect(page.getByText(monthLabel)).toBeVisible();
  });
});

test.describe("US1 — Automatic language detection", () => {
  test.use({ locale: "fr-FR" });

  test("falls back to English for an unsupported browser locale", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "⚙ Settings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Calendar" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Day" })).toBeVisible();

    const now = new Date();
    const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    await expect(page.getByText(monthLabel)).toBeVisible();
  });
});
