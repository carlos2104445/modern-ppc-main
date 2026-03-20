import { test, expect } from "@playwright/test";

test.describe("Signup Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should complete signup successfully", async ({ page }) => {
    await page.click("text=Sign Up");
    await expect(page).toHaveURL(/.*signup/);

    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="username"]', `testuser${Date.now()}`);
    await page.fill('input[name="fullName"]', "Test User");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");

    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });

    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("should show validation errors for invalid email", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "password123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid.*email/i")).toBeVisible();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "password123");
    await page.fill('input[name="confirmPassword"]', "different123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/password.*match/i")).toBeVisible();
  });

  test("should show error for weak password", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "123");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/password.*weak|short/i")).toBeVisible();
  });

  test("should require terms acceptance", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/accept.*terms/i")).toBeVisible();
  });

  test("should show error for duplicate email", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('input[name="email"]', "existing@example.com");
    await page.fill('input[name="username"]', "newuser");
    await page.fill('input[name="password"]', "SecurePassword123!");
    await page.fill('input[name="confirmPassword"]', "SecurePassword123!");
    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/email.*already.*exists/i")).toBeVisible();
  });
});
