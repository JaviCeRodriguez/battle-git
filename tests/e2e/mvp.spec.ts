import { expect, test } from "@playwright/test";

test("landing exposes the demo CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Battle Git" })).toBeVisible();
  await expect(page.getByTestId("demo-cta")).toBeVisible();
});

test("demo dashboard shows mock player and repositories", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Dev_Pixel")).toBeVisible();
  await expect(page.getByText("battle-ui")).toBeVisible();
  await expect(page.getByText("Como mejorar tus stats")).toBeVisible();
});

test("battle renders canvas and skip reveals result", async ({ page }) => {
  await page.goto("/demo/battle");
  await expect(page.getByTestId("battle-canvas")).toBeVisible();
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByTestId("battle-result")).toContainText("wins");
});

test("beta gate shows invite form", async ({ page }) => {
  await page.goto("/beta");
  await expect(page.getByRole("heading", { name: "Canjear invitacion" })).toBeVisible();
  await expect(page.getByPlaceholder("BATTLE-GIT-FOUNDERS")).toBeVisible();
});
