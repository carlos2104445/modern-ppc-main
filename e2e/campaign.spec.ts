import { test, expect } from "@playwright/test";

test.describe("Create Campaign Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should create campaign successfully", async ({ page }) => {
    await page.click("text=Create Campaign");
    await expect(page).toHaveURL(/.*campaign.*create/);

    await page.fill('input[name="title"]', "Test Campaign");
    await page.fill('textarea[name="description"]', "This is a test campaign description");
    await page.fill('input[name="targetUrl"]', "https://example.com");
    await page.fill('input[name="budget"]', "100");
    await page.fill('input[name="dailyBudget"]', "10");

    await page.selectOption('select[name="country"]', "Ethiopia");
    await page.selectOption('select[name="ageRange"]', "18-35");

    await page.setInputFiles('input[type="file"]', "./test-assets/test-ad.jpg");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/campaign.*created.*successfully/i")).toBeVisible();

    await expect(page).toHaveURL(/.*campaigns/);

    await expect(page.locator("text=Test Campaign")).toBeVisible();
  });

  test("should show validation errors for empty required fields", async ({ page }) => {
    await page.click("text=Create Campaign");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/title.*required/i")).toBeVisible();
    await expect(page.locator("text=/description.*required/i")).toBeVisible();
    await expect(page.locator("text=/budget.*required/i")).toBeVisible();
  });

  test("should show error for invalid URL", async ({ page }) => {
    await page.click("text=Create Campaign");

    await page.fill('input[name="title"]', "Test Campaign");
    await page.fill('input[name="targetUrl"]', "not-a-valid-url");
    await page.fill('input[name="budget"]', "100");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/invalid.*url/i")).toBeVisible();
  });

  test("should show error for insufficient budget", async ({ page }) => {
    await page.click("text=Create Campaign");

    await page.fill('input[name="title"]', "Test Campaign");
    await page.fill('input[name="targetUrl"]', "https://example.com");
    await page.fill('input[name="budget"]', "5");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/minimum.*budget/i")).toBeVisible();
  });

  test("should preview campaign before submission", async ({ page }) => {
    await page.click("text=Create Campaign");

    await page.fill('input[name="title"]', "Test Campaign");
    await page.fill('textarea[name="description"]', "Test Description");
    await page.fill('input[name="targetUrl"]', "https://example.com");
    await page.fill('input[name="budget"]', "100");

    await page.click('button:has-text("Preview")');

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator("text=Test Campaign")).toBeVisible();
    await expect(page.locator("text=Test Description")).toBeVisible();
  });

  test("should save campaign as draft", async ({ page }) => {
    await page.click("text=Create Campaign");

    await page.fill('input[name="title"]', "Draft Campaign");
    await page.fill('input[name="targetUrl"]', "https://example.com");
    await page.fill('input[name="budget"]', "100");

    await page.click('button:has-text("Save as Draft")');

    await expect(page.locator("text=/saved.*draft/i")).toBeVisible();

    await page.click("text=Drafts");
    await expect(page.locator("text=Draft Campaign")).toBeVisible();
  });

  test("should edit existing campaign", async ({ page }) => {
    await page.click("text=My Campaigns");

    await page.click('button:has-text("Edit")').first();

    await page.fill('input[name="title"]', "Updated Campaign Title");
    await page.fill('input[name="budget"]', "200");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/campaign.*updated/i")).toBeVisible();

    await expect(page.locator("text=Updated Campaign Title")).toBeVisible();
  });

  test("should pause and resume campaign", async ({ page }) => {
    await page.click("text=My Campaigns");

    await page.click('button:has-text("Pause")').first();
    await expect(page.locator("text=/campaign.*paused/i")).toBeVisible();
    await expect(page.locator("text=Paused")).toBeVisible();

    await page.click('button:has-text("Resume")').first();
    await expect(page.locator("text=/campaign.*resumed/i")).toBeVisible();
    await expect(page.locator("text=Active")).toBeVisible();
  });

  test("should delete campaign", async ({ page }) => {
    await page.click("text=My Campaigns");

    await page.click('button:has-text("Delete")').first();

    await page.click('button:has-text("Confirm")');

    await expect(page.locator("text=/campaign.*deleted/i")).toBeVisible();
  });

  test("should view campaign statistics", async ({ page }) => {
    await page.click("text=My Campaigns");

    await page.click("text=Test Campaign").first();

    await expect(page.locator("text=/impressions/i")).toBeVisible();
    await expect(page.locator("text=/clicks/i")).toBeVisible();
    await expect(page.locator("text=/ctr/i")).toBeVisible();
    await expect(page.locator("text=/spent/i")).toBeVisible();
  });
});
