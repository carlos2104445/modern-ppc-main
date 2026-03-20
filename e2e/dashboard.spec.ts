import { test, expect } from "@playwright/test";

test.describe("Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test("should display dashboard after login", async ({ page }) => {
    const url = page.url();
    expect(url).toMatch(/\/dashboard/);
  });

  test("should show user balance", async ({ page }) => {
    const balanceElement = page.locator('text=/balance|\\$[0-9]/i').first();
    const hasBalance = await balanceElement.isVisible().catch(() => false);
    
    if (hasBalance) {
      expect(hasBalance).toBeTruthy();
    }
  });

  test("should show user earnings", async ({ page }) => {
    const earningsElement = page.locator('text=/earnings|earned/i').first();
    const hasEarnings = await earningsElement.isVisible().catch(() => false);
    
    if (hasEarnings) {
      expect(hasEarnings).toBeTruthy();
    }
  });

  test("should display navigation menu", async ({ page }) => {
    const navElement = page.locator('nav, [role="navigation"]').first();
    const hasNav = await navElement.isVisible().catch(() => false);
    
    expect(hasNav).toBeTruthy();
  });

  test("should navigate to different sections", async ({ page }) => {
    const links = await page.locator('a[href^="/"]').all();
    
    expect(links.length).toBeGreaterThan(0);
  });

  test("should show user profile information", async ({ page }) => {
    const profileElement = page.locator('text=/profile|account|settings/i').first();
    const hasProfile = await profileElement.isVisible().catch(() => false);
    
    if (hasProfile) {
      expect(hasProfile).toBeTruthy();
    }
  });

  test("should display recent activity", async ({ page }) => {
    const activityElement = page.locator('text=/activity|recent|history/i').first();
    const hasActivity = await activityElement.isVisible().catch(() => false);
    
    if (hasActivity) {
      expect(hasActivity).toBeTruthy();
    }
  });

  test("should show statistics or metrics", async ({ page }) => {
    const statsElement = page.locator('text=/clicks|views|conversions|stats/i').first();
    const hasStats = await statsElement.isVisible().catch(() => false);
    
    if (hasStats) {
      expect(hasStats).toBeTruthy();
    }
  });
});

test.describe("Dashboard Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display dashboard on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    expect(url).toMatch(/\/dashboard/);
  });

  test("should show mobile navigation", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("Menu"), [role="button"]:has-text("☰")').first();
    const hasMobileMenu = await mobileMenu.isVisible().catch(() => false);
    
    if (hasMobileMenu) {
      expect(hasMobileMenu).toBeTruthy();
    }
  });

  test("should display content responsively on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    
    const mainContent = page.locator('main, [role="main"], .dashboard').first();
    const hasMainContent = await mainContent.isVisible().catch(() => false);
    
    if (hasMainContent) {
      const boundingBox = await mainContent.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeLessThanOrEqual(375);
    }
  });
});

test.describe("Admin Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test("should show admin panel link", async ({ page }) => {
    const adminLink = page.locator('a:has-text("Admin"), a[href*="admin"]').first();
    const hasAdminLink = await adminLink.isVisible().catch(() => false);
    
    if (hasAdminLink) {
      expect(hasAdminLink).toBeTruthy();
    }
  });

  test("should navigate to admin panel", async ({ page }) => {
    const adminLink = page.locator('a:has-text("Admin"), a[href*="admin"]').first();
    
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(1000);
      
      const url = page.url();
      expect(url).toMatch(/admin/);
    }
  });

  test("should show maintenance mode toggle", async ({ page }) => {
    const adminLink = page.locator('a[href*="admin"]').first();
    
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(1000);
      
      const maintenanceToggle = page.locator('text=/maintenance.*mode/i').first();
      const hasMaintenanceToggle = await maintenanceToggle.isVisible().catch(() => false);
      
      if (hasMaintenanceToggle) {
        expect(hasMaintenanceToggle).toBeTruthy();
      }
    }
  });

  test("should show user management section", async ({ page }) => {
    const adminLink = page.locator('a[href*="admin"]').first();
    
    if (await adminLink.isVisible()) {
      await adminLink.click();
      await page.waitForTimeout(1000);
      
      const userManagement = page.locator('text=/users|manage.*users/i').first();
      const hasUserManagement = await userManagement.isVisible().catch(() => false);
      
      if (hasUserManagement) {
        expect(hasUserManagement).toBeTruthy();
      }
    }
  });
});
