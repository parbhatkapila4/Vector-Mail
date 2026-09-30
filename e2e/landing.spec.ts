import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load the landing page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/VectorMail/i);
  });

  test("should display the main headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/AI Powered Email/i)).toBeVisible();
  });

  test("should navigate to features page", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Features/i })
      .first()
      .click();
    await expect(page).toHaveURL("/features");
  });

  test("should navigate to about page when logged out", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /About/i }).first().click();
    await expect(page).toHaveURL("/about");
  });

  test("should have responsive navigation menu on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.getByText("VectorMail")).toBeVisible();
  });
});

test.describe("Features Page", () => {
  test("should display AI features section", async ({ page }) => {
    await page.goto("/features");
    await expect(page.getByText(/AI-Powered/i)).toBeVisible();
  });

  test("should have a back button", async ({ page }) => {
    await page.goto("/features");
    const backButton = page.getByRole("link", { name: /Back/i }).first();
    await expect(backButton).toBeVisible();
  });
});

test.describe("Authentication", () => {
  test("should redirect signed-out visitors away from a protected route", async ({
    page,
  }) => {
    await page.goto("/mail");
    expect(new URL(page.url()).pathname).toBe("/");
  });

  test("signed-out visitors cannot reach a Clerk sign-in entrance", async ({
    page,
  }) => {
    for (const path of ["/sign-in", "/sign-up", "/sign-in/x.js"]) {
      await page.goto(path);
      expect(new URL(page.url()).pathname).toBe("/");
    }
  });
});
