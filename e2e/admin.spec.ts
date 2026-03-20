import { test, expect } from "@playwright/test";

test.describe("Admin Workflows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test("should access admin panel", async ({ page }) => {
    await page.click("text=Admin");
    await expect(page).toHaveURL(/.*admin/);

    await expect(page.locator("text=Users")).toBeVisible();
    await expect(page.locator("text=Campaigns")).toBeVisible();
    await expect(page.locator("text=Payments")).toBeVisible();
    await expect(page.locator("text=Settings")).toBeVisible();
  });

  test("should view and manage users", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Users");

    await expect(page.locator('[data-testid="user-table"]')).toBeVisible();

    await page.fill('input[placeholder*="Search"]', "test@example.com");
    await expect(page.locator("text=test@example.com")).toBeVisible();

    await page.click('button:has-text("View")').first();
    await expect(page.locator('[data-testid="user-details"]')).toBeVisible();
  });

  test("should suspend user account", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Users");

    await page.click('button:has-text("Suspend")').first();

    await page.click('button:has-text("Confirm")');

    await expect(page.locator("text=/user.*suspended/i")).toBeVisible();
    await expect(page.locator("text=Suspended")).toBeVisible();
  });

  test("should approve withdrawal requests", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Withdrawals");

    await expect(page.locator('[data-testid="withdrawal-table"]')).toBeVisible();

    await page.click('button:has-text("Approve")').first();

    await page.fill('input[name="transactionId"]', "TXN123456");
    await page.click('button:has-text("Confirm Approval")');

    await expect(page.locator("text=/withdrawal.*approved/i")).toBeVisible();
  });

  test("should reject withdrawal requests", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Withdrawals");

    await page.click('button:has-text("Reject")').first();

    await page.fill('textarea[name="reason"]', "Insufficient documentation");
    await page.click('button:has-text("Confirm Rejection")');

    await expect(page.locator("text=/withdrawal.*rejected/i")).toBeVisible();
  });

  test("should manage admin campaigns", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Admin Campaigns");

    await page.click('button:has-text("Create Campaign")');

    await page.fill('input[name="title"]', "Admin Test Campaign");
    await page.fill('textarea[name="description"]', "Admin campaign description");
    await page.fill('input[name="targetUrl"]', "https://example.com");
    await page.fill('input[name="rewardPerView"]', "0.5");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=/campaign.*created/i")).toBeVisible();
  });

  test("should view platform statistics", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Statistics");

    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-campaigns"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-payouts"]')).toBeVisible();
  });

  test("should update platform settings", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Settings");

    await page.fill('input[name="minWithdrawal"]', "50");
    await page.fill('input[name="maxWithdrawal"]', "10000");
    await page.fill('input[name="platformFee"]', "5");

    await page.click('button:has-text("Save Settings")');

    await expect(page.locator("text=/settings.*updated/i")).toBeVisible();
  });

  test("should enable maintenance mode", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Settings");

    await page.check('input[name="maintenanceMode"]');
    await page.fill('textarea[name="maintenanceMessage"]', "System maintenance in progress");

    await page.click('button:has-text("Save Settings")');

    await expect(page.locator("text=/maintenance.*enabled/i")).toBeVisible();
  });

  test("should view audit logs", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Audit Logs");

    await expect(page.locator('[data-testid="audit-log-table"]')).toBeVisible();

    await page.selectOption('select[name="action"]', "user_suspended");

    await expect(page.locator("text=user_suspended")).toBeVisible();
  });

  test("should manage fraud detection settings", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Fraud Detection");

    await page.fill('input[name="maxDailyViews"]', "100");
    await page.fill('input[name="suspiciousPatternThreshold"]', "5");
    await page.check('input[name="autoSuspend"]');

    await page.click('button:has-text("Save Settings")');

    await expect(page.locator("text=/fraud.*settings.*updated/i")).toBeVisible();
  });

  test("should export user data", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Users");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('button:has-text("Export")'),
    ]);

    expect(download.suggestedFilename()).toContain("users");
  });

  test("should view payment reconciliation", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Payments");

    await page.click("text=Reconciliation");

    await expect(page.locator('[data-testid="reconciliation-table"]')).toBeVisible();

    await page.click('button:has-text("Run Reconciliation")');

    await expect(page.locator("text=/reconciliation.*completed/i")).toBeVisible();
  });

  test("should manage staff members", async ({ page }) => {
    await page.click("text=Admin");
    await page.click("text=Staff");

    await page.click('button:has-text("Add Staff")');

    await page.fill('input[name="email"]', "staff@example.com");
    await page.fill('input[name="name"]', "Staff Member");
    await page.selectOption('select[name="role"]', "moderator");

    await page.click('button:has-text("Add")');

    await expect(page.locator("text=/staff.*added/i")).toBeVisible();
  });
});
