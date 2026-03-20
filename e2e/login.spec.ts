import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await page.click("text=Login");
    await expect(page).toHaveURL(/.*login/);

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.click("text=Login");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid.*credentials/i")).toBeVisible();
  });

  test("should show error for non-existent user", async ({ page }) => {
    await page.click("text=Login");

    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid.*credentials/i")).toBeVisible();
  });

  test("should show validation error for invalid email format", async ({ page }) => {
    await page.click("text=Login");

    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid.*email/i")).toBeVisible();
  });

  test("should show error for empty fields", async ({ page }) => {
    await page.click("text=Login");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/required/i")).toBeVisible();
  });

  test("should persist session after page refresh", async ({ page }) => {
    await page.click("text=Login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    await page.reload();

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("text=Dashboard")).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    await page.click("text=Login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);

    await page.click('button:has-text("Logout")');

    await expect(page).toHaveURL(/.*\/(login|home|$)/);
  });

  test("should redirect to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/.*login/);
  });

  test("should show forgot password link", async ({ page }) => {
    await page.click("text=Login");

    await expect(page.locator("text=/forgot.*password/i")).toBeVisible();
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.click("text=Login");

    const passwordInput = page.locator('input[name="password"]');

    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.click('button[aria-label*="password"]');

    await expect(passwordInput).toHaveAttribute("type", "text");
  });
});
