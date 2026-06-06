import { test, expect } from "@playwright/test";

test.describe("US2 — Navigate Between Months", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("advances to next month when next is clicked", async ({ page }) => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextLabel = next.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    await page.getByRole("button", { name: /next month/i }).click();
    await expect(page.getByText(nextLabel)).toBeVisible();
  });

  test("returns to previous month when prev is clicked", async ({ page }) => {
    const now = new Date();
    const currentLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    await page.getByRole("button", { name: /next month/i }).click();
    await page.getByRole("button", { name: /previous month/i }).click();
    await expect(page.getByText(currentLabel)).toBeVisible();
  });

  test("returns to current month when Today is clicked", async ({ page }) => {
    const now = new Date();
    const currentLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    await page.getByRole("button", { name: /next month/i }).click();
    await page.getByRole("button", { name: /next month/i }).click();
    await page.getByRole("button", { name: /today/i }).click();
    await expect(page.getByText(currentLabel)).toBeVisible();
  });

  test("today's date cell is highlighted after clicking Today", async ({ page }) => {
    await page.getByRole("button", { name: /next month/i }).click();
    await page.getByRole("button", { name: /today/i }).click();

    const todayCells = page.locator("[data-testid='calendar-day'][data-today='true']");
    await expect(todayCells).toHaveCount(1);
  });
});
