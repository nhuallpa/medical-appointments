import { test, expect } from "@playwright/test";

test.describe("US1 — View Monthly Calendar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays the current month and year in the header", async ({ page }) => {
    const now = new Date();
    const label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    await expect(page.getByText(label)).toBeVisible();
  });

  test("shows a 7-column calendar grid", async ({ page }) => {
    const dayHeaders = page.locator("[data-testid='weekday-header']");
    await expect(dayHeaders).toHaveCount(7);
  });

  test("renders day cells for all days of the current month", async ({ page }) => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayCells = page.locator("[data-testid='calendar-day']");
    await expect(dayCells).toHaveCount(daysInMonth);
  });

  test("shows empty calendar with invitation message when no appointments exist", async ({
    page,
  }) => {
    await expect(page.getByText(/add.*appointment/i)).toBeVisible();
  });
});
