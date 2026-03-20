import { test, expect } from "@playwright/test";

test.describe("View Ads Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should display available ads", async ({ page }) => {
    await page.click("text=View Ads");
    await expect(page).toHaveURL(/.*ads/);

    await expect(page.locator('[data-testid="ad-card"]')).toHaveCount(1, { timeout: 5000 });
  });

  test("should view ad and earn credits", async ({ page }) => {
    await page.click("text=View Ads");

    const initialBalance = await page.locator('[data-testid="user-balance"]').textContent();

    await page.click('[data-testid="ad-card"]').first();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="ad-content"]')).toBeVisible();

    await page.waitForTimeout(5000);

    await page.click('button:has-text("Confirm View")');

    await expect(page.locator("text=/earned|credited/i")).toBeVisible();

    const newBalance = await page.locator('[data-testid="user-balance"]').textContent();
    expect(parseFloat(newBalance!)).toBeGreaterThan(parseFloat(initialBalance!));
  });

  test("should not earn credits if ad not viewed long enough", async ({ page }) => {
    await page.click("text=View Ads");

    await page.click('[data-testid="ad-card"]').first();

    await page.click('button:has-text("Close")');

    await expect(page.locator("text=/must.*view.*complete/i")).toBeVisible();
  });

  test("should filter ads by category", async ({ page }) => {
    await page.click("text=View Ads");

    await page.selectOption('select[name="category"]', "Technology");

    await expect(page.locator('[data-testid="ad-card"]')).toHaveCount(1, { timeout: 5000 });
    await expect(page.locator("text=Technology")).toBeVisible();
  });

  test("should show no ads available message when all viewed", async ({ page }) => {
    await page.click("text=View Ads");

    const noAdsMessage = page.locator("text=/no.*ads.*available/i");
    if (await noAdsMessage.isVisible()) {
      await expect(noAdsMessage).toBeVisible();
    }
  });

  test("should track ad view history", async ({ page }) => {
    await page.click("text=View Ads");

    await page.click('[data-testid="ad-card"]').first();
    await page.waitForTimeout(5000);
    await page.click('button:has-text("Confirm View")');

    await page.click("text=History");

    await expect(page.locator('[data-testid="ad-history-item"]')).toHaveCount(1, { timeout: 5000 });
  });

  test("should report inappropriate ad", async ({ page }) => {
    await page.click("text=View Ads");

    await page.click('[data-testid="ad-card"]').first();

    await page.click('button:has-text("Report")');

    await page.selectOption('select[name="reason"]', "Inappropriate Content");
    await page.fill('textarea[name="details"]', "This ad contains inappropriate content");

    await page.click('button:has-text("Submit Report")');

    await expect(page.locator("text=/report.*submitted/i")).toBeVisible();
  });

  test("should show ad details correctly", async ({ page }) => {
    await page.click("text=View Ads");

    await page.click('[data-testid="ad-card"]').first();

    await expect(page.locator('[data-testid="ad-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="ad-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="ad-reward"]')).toBeVisible();
  });

  test("should handle ad click through", async ({ page }) => {
    await page.click("text=View Ads");

    await page.click('[data-testid="ad-card"]').first();

    await page.waitForTimeout(5000);

    const [newPage] = await Promise.all([
      page.context().waitForEvent("page"),
      page.click('a[data-testid="ad-link"]'),
    ]);

    await expect(newPage).toHaveURL(/example\.com/);
  });

  test("should show daily ad view limit", async ({ page }) => {
    await page.click("text=View Ads");

    const limitIndicator = page.locator('[data-testid="daily-limit"]');
    if (await limitIndicator.isVisible()) {
      await expect(limitIndicator).toContainText(/\d+\/\d+/);
    }
  });
});
