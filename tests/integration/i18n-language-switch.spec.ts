import { test, expect } from "@playwright/test";

test.describe("US2 — Manual language switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("switches the UI language immediately without navigation", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Calendar" })).toBeVisible();

    await page.getByRole("combobox", { name: /language/i }).selectOption("es");

    await expect(page.getByRole("tab", { name: "Calendario" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Día" })).toBeVisible();
    await expect(page.getByRole("link", { name: "⚙ Configuración" })).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("persists the chosen language across reloads", async ({ page }) => {
    await page.getByRole("combobox", { name: /language/i }).selectOption("pt");
    await expect(page.getByRole("tab", { name: "Calendário" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("tab", { name: "Calendário" })).toBeVisible();
    await expect(page.getByRole("link", { name: "⚙ Configurações" })).toBeVisible();
  });

  test("preserves appointment form input when the language is switched", async ({ page }) => {
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-18`;

    await page.getByRole("button", { name: new RegExp(`Add appointment on ${dateValue}`) }).click();
    await page.getByLabel(/patient name/i).fill("Carlos Pérez");

    await page.getByRole("combobox", { name: /language/i }).selectOption("es");

    await expect(page.getByLabel(/patient name/i)).toHaveValue("Carlos Pérez");
  });
});
