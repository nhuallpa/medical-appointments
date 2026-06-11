import { test, expect } from "@playwright/test";

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

test.describe("US1 — Day View Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("switches to the Day tab and shows time slots for today using the default schedule", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: /day/i }).click();
    await expect(page.getByRole("button", { name: /previous day/i })).toBeVisible();
    await expect(page.getByText("08:00")).toBeVisible();
  });

  test("navigates to the next day and back to today", async ({ page }) => {
    await page.getByRole("tab", { name: /day/i }).click();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowLabel = tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    await page.getByRole("button", { name: /^next day$/i }).click();
    await expect(page.getByText(tomorrowLabel)).toBeVisible();

    await page.getByRole("button", { name: /go to today/i }).click();

    const todayLabel = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    await expect(page.getByText(todayLabel)).toBeVisible();
  });

  test("creates an appointment from a slot's add control and shows it in that slot", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: /day/i }).click();

    await page.getByRole("button", { name: /add appointment at 08:00/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/^date/i)).toHaveValue(todayKey());
    await expect(page.getByLabel(/time/i)).toHaveValue("08:00");

    await page.getByLabel(/patient name/i).fill("Carlos Pérez");
    await page.getByLabel(/professional name/i).fill("Dr. Sosa");
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Carlos Pérez")).toBeVisible();
  });

  test("switches back to Calendar and shows the monthly grid", async ({ page }) => {
    await page.getByRole("tab", { name: /day/i }).click();
    await page.getByRole("tab", { name: /calendar/i }).click();

    const dayHeaders = page.locator("[data-testid='weekday-header']");
    await expect(dayHeaders).toHaveCount(7);
  });

  test("selecting a date on the Calendar and switching to Day shows that date", async ({
    page,
  }) => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), 15);
    const targetLabel = target.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    await page.getByRole("button", { name: `Select ${todayKey().slice(0, 8)}15` }).click();
    await page.getByRole("tab", { name: /day/i }).click();

    await expect(page.getByText(targetLabel)).toBeVisible();
  });
});
