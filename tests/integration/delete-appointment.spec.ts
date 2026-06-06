import { test, expect } from "@playwright/test";

test.describe("US4 — Delete a Medical Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Seed one appointment
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-18`;
    await page.getByRole("button", { name: new RegExp(`Add appointment on ${dateValue}`) }).click();
    await page.getByLabel(/patient name/i).fill("Pedro Díaz");
    await page.getByLabel(/professional name/i).fill("Dr. Fernández");
    await page.getByLabel(/time/i).fill("11:00");
    await page.getByRole("button", { name: /save/i }).click();
    await expect(page.getByText("Pedro Díaz")).toBeVisible();
  });

  test("opens detail view when appointment is clicked", async ({ page }) => {
    await page.locator("[data-testid='calendar-day']").getByText("Pedro Díaz").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Pedro Díaz")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("Dr. Fernández")).toBeVisible();
  });

  test("shows confirmation prompt before deleting", async ({ page }) => {
    await page.locator("[data-testid='calendar-day']").getByText("Pedro Díaz").click();
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByRole("button", { name: /confirm/i })).toBeVisible();
  });

  test("removes appointment from calendar after confirmation", async ({ page }) => {
    await page.locator("[data-testid='calendar-day']").getByText("Pedro Díaz").click();
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /confirm/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.locator("[data-testid='calendar-day']").getByText("Pedro Díaz")).not.toBeVisible();
  });

  test("retains appointment when cancel is clicked on confirmation", async ({ page }) => {
    await page.locator("[data-testid='calendar-day']").getByText("Pedro Díaz").click();
    await page.getByRole("button", { name: /delete/i }).click();
    await page.getByRole("button", { name: /^cancel$/i }).click();
    await expect(page.getByRole("button", { name: /confirm/i })).not.toBeVisible();
  });
});
