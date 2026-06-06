import { test, expect } from "@playwright/test";

test.describe("US3 — Add a Medical Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens form with date pre-filled when a day cell add button is clicked", async ({
    page,
  }) => {
    const now = new Date();
    const dayLabel = `Add appointment on ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-15`;
    await page.getByRole("button", { name: dayLabel }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("saves appointment and it appears on the calendar", async ({ page }) => {
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-20`;

    await page.getByRole("button", { name: new RegExp(`Add appointment on ${dateValue}`) }).click();

    await page.getByLabel(/patient name/i).fill("María López");
    await page.getByLabel(/professional name/i).fill("Dr. García");
    await page.getByLabel(/time/i).fill("10:30");

    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("María López")).toBeVisible();
  });

  test("shows validation errors when submitting empty form", async ({ page }) => {
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10`;

    await page.getByRole("button", { name: new RegExp(`Add appointment on ${dateValue}`) }).click();
    await page.getByRole("button", { name: /save/i }).click();

    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("closes form when Cancel is clicked", async ({ page }) => {
    const now = new Date();
    const dateValue = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-10`;

    await page.getByRole("button", { name: new RegExp(`Add appointment on ${dateValue}`) }).click();
    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
