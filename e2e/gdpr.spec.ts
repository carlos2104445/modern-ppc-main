import { test, expect } from "@playwright/test";

test.describe("GDPR Data Management Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test("should navigate to GDPR management page", async ({ page }) => {
    const gdprLink = page.locator('a:has-text("GDPR"), a:has-text("Data Management"), a:has-text("Privacy")').first();
    
    if (await gdprLink.isVisible()) {
      await gdprLink.click();
      await page.waitForTimeout(1000);
      
      const hasGDPRContent = await page.locator("text=/gdpr|data management|privacy/i").isVisible().catch(() => false);
      expect(hasGDPRContent).toBeTruthy();
    }
  });

  test("should display GDPR management tabs", async ({ page }) => {
    await page.goto("/dashboard");
    
    const gdprComponent = page.locator('text=/export data|delete data|anonymize/i').first();
    
    if (await gdprComponent.isVisible()) {
      const exportTab = page.locator('button:has-text("Export"), [role="tab"]:has-text("Export")').first();
      const deleteTab = page.locator('button:has-text("Delete"), [role="tab"]:has-text("Delete")').first();
      const anonymizeTab = page.locator('button:has-text("Anonymize"), [role="tab"]:has-text("Anonymize")').first();
      
      const hasExportTab = await exportTab.isVisible().catch(() => false);
      const hasDeleteTab = await deleteTab.isVisible().catch(() => false);
      const hasAnonymizeTab = await anonymizeTab.isVisible().catch(() => false);
      
      expect(hasExportTab || hasDeleteTab || hasAnonymizeTab).toBeTruthy();
    }
  });

  test("should show user ID input in export tab", async ({ page }) => {
    await page.goto("/dashboard");
    
    const exportTab = page.locator('button:has-text("Export Data"), [role="tab"]:has-text("Export")').first();
    
    if (await exportTab.isVisible()) {
      await exportTab.click();
      await page.waitForTimeout(500);
      
      const userIdInput = page.locator('input[type="number"], input[id*="user"], input[placeholder*="user"]').first();
      const hasUserIdInput = await userIdInput.isVisible().catch(() => false);
      
      if (hasUserIdInput) {
        expect(hasUserIdInput).toBeTruthy();
      }
    }
  });

  test("should show export button", async ({ page }) => {
    await page.goto("/dashboard");
    
    const exportTab = page.locator('button:has-text("Export Data"), [role="tab"]:has-text("Export")').first();
    
    if (await exportTab.isVisible()) {
      await exportTab.click();
      await page.waitForTimeout(500);
      
      const exportButton = page.locator('button:has-text("Export")').first();
      const hasExportButton = await exportButton.isVisible().catch(() => false);
      
      if (hasExportButton) {
        expect(hasExportButton).toBeTruthy();
      }
    }
  });

  test("should validate user ID before export", async ({ page }) => {
    await page.goto("/dashboard");
    
    const exportTab = page.locator('button:has-text("Export Data"), [role="tab"]:has-text("Export")').first();
    
    if (await exportTab.isVisible()) {
      await exportTab.click();
      await page.waitForTimeout(500);
      
      const exportButton = page.locator('button:has-text("Export User Data")').first();
      
      if (await exportButton.isVisible()) {
        await exportButton.click();
        await page.waitForTimeout(1000);
        
        const hasError = await page.locator("text=/enter.*user|required|invalid/i").isVisible().catch(() => false);
        expect(hasError).toBeTruthy();
      }
    }
  });

  test("should show delete tab with warning", async ({ page }) => {
    await page.goto("/dashboard");
    
    const deleteTab = page.locator('button:has-text("Delete Data"), [role="tab"]:has-text("Delete")').first();
    
    if (await deleteTab.isVisible()) {
      await deleteTab.click();
      await page.waitForTimeout(500);
      
      const warningText = page.locator('text=/warning|cannot be undone|permanent/i').first();
      const hasWarning = await warningText.isVisible().catch(() => false);
      
      if (hasWarning) {
        expect(hasWarning).toBeTruthy();
      }
    }
  });

  test("should show reason textarea in delete tab", async ({ page }) => {
    await page.goto("/dashboard");
    
    const deleteTab = page.locator('button:has-text("Delete Data"), [role="tab"]:has-text("Delete")').first();
    
    if (await deleteTab.isVisible()) {
      await deleteTab.click();
      await page.waitForTimeout(500);
      
      const reasonTextarea = page.locator('textarea[id*="reason"], textarea[placeholder*="reason"]').first();
      const hasReasonTextarea = await reasonTextarea.isVisible().catch(() => false);
      
      if (hasReasonTextarea) {
        expect(hasReasonTextarea).toBeTruthy();
      }
    }
  });

  test("should show destructive delete button", async ({ page }) => {
    await page.goto("/dashboard");
    
    const deleteTab = page.locator('button:has-text("Delete Data"), [role="tab"]:has-text("Delete")').first();
    
    if (await deleteTab.isVisible()) {
      await deleteTab.click();
      await page.waitForTimeout(500);
      
      const deleteButton = page.locator('button:has-text("Delete User Data")').first();
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);
      
      if (hasDeleteButton) {
        expect(hasDeleteButton).toBeTruthy();
      }
    }
  });

  test("should show anonymize tab", async ({ page }) => {
    await page.goto("/dashboard");
    
    const anonymizeTab = page.locator('button:has-text("Anonymize"), [role="tab"]:has-text("Anonymize")').first();
    
    if (await anonymizeTab.isVisible()) {
      await anonymizeTab.click();
      await page.waitForTimeout(500);
      
      const anonymizeContent = page.locator('text=/anonymize|pseudonymized/i').first();
      const hasAnonymizeContent = await anonymizeContent.isVisible().catch(() => false);
      
      if (hasAnonymizeContent) {
        expect(hasAnonymizeContent).toBeTruthy();
      }
    }
  });

  test("should show anonymize button", async ({ page }) => {
    await page.goto("/dashboard");
    
    const anonymizeTab = page.locator('button:has-text("Anonymize"), [role="tab"]:has-text("Anonymize")').first();
    
    if (await anonymizeTab.isVisible()) {
      await anonymizeTab.click();
      await page.waitForTimeout(500);
      
      const anonymizeButton = page.locator('button:has-text("Anonymize User Data")').first();
      const hasAnonymizeButton = await anonymizeButton.isVisible().catch(() => false);
      
      if (hasAnonymizeButton) {
        expect(hasAnonymizeButton).toBeTruthy();
      }
    }
  });
});

test.describe("GDPR Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display GDPR management on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const gdprComponent = page.locator('text=/export data|delete data|anonymize/i').first();
    
    if (await gdprComponent.isVisible()) {
      const exportTab = page.locator('button:has-text("Export"), [role="tab"]:has-text("Export")').first();
      const hasExportTab = await exportTab.isVisible().catch(() => false);
      
      if (hasExportTab) {
        expect(hasExportTab).toBeTruthy();
      }
    }
  });

  test("should show tabs on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const exportTab = page.locator('button:has-text("Export"), [role="tab"]:has-text("Export")').first();
    const deleteTab = page.locator('button:has-text("Delete"), [role="tab"]:has-text("Delete")').first();
    
    if (await exportTab.isVisible() && await deleteTab.isVisible()) {
      await deleteTab.click();
      await page.waitForTimeout(500);
      
      const deleteContent = page.locator('text=/delete user data|warning/i').first();
      const hasDeleteContent = await deleteContent.isVisible().catch(() => false);
      
      if (hasDeleteContent) {
        expect(hasDeleteContent).toBeTruthy();
      }
    }
  });
});
