import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display landing page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText(/modern ppc/i);
  });

  test("should navigate to register page", async ({ page }) => {
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL(/.*register/);
    await expect(page.locator("h2")).toContainText(/create.*account/i);
  });

  test("should navigate to signin page", async ({ page }) => {
    await page.click('a[href="/signin"]');
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.locator("h2")).toContainText(/sign in/i);
  });

  test("should register new user", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const username = `testuser${timestamp}`;

    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="phoneNumber"]', "1234567890");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/\/(dashboard|signin)/);
  });

  test("should show validation errors for invalid registration", async ({ page }) => {
    await page.goto("/register");

    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    const emailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    const passwordInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid);

    expect(emailInvalid || passwordInvalid).toBeTruthy();
  });

  test("should show error for mismatched passwords", async ({ page }) => {
    await page.goto("/register");

    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="username"]', "testuser");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPassword123!");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(500);

    const hasError = await page.locator("text=/password.*match/i").isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test("should sign in existing user", async ({ page }) => {
    await page.goto("/signin");

    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/\/dashboard/);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/signin");

    await page.fill('input[name="email"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);

    const hasError = await page.locator("text=/invalid.*credentials/i").isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });

  test("should logout user", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).toMatch(/\/(signin|$)/);
    }
  });
});

test.describe("Authentication Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should register on mobile", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    const email = `mobile${timestamp}@example.com`;
    const username = `mobileuser${timestamp}`;

    await page.fill('input[name="firstName"]', "Mobile");
    await page.fill('input[name="lastName"]', "User");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="phoneNumber"]', "1234567890");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.fill('input[name="confirmPassword"]', "TestPassword123!");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/\/(dashboard|signin)/);
  });

  test("should sign in on mobile", async ({ page }) => {
    await page.goto("/signin");

    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    const url = page.url();
    expect(url).toMatch(/\/dashboard/);
  });
});
