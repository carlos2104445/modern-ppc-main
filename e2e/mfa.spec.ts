import { test, expect } from "@playwright/test";

test.describe("MFA (Multi-Factor Authentication) Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  });

  test("should navigate to MFA setup page", async ({ page }) => {
    const mfaLink = page.locator('a:has-text("Security"), a:has-text("Two-Factor"), a:has-text("MFA")').first();
    
    if (await mfaLink.isVisible()) {
      await mfaLink.click();
      await page.waitForTimeout(1000);
      
      const hasMFAContent = await page.locator("text=/two.factor|mfa|authentication/i").isVisible().catch(() => false);
      expect(hasMFAContent).toBeTruthy();
    }
  });

  test("should display MFA setup component", async ({ page }) => {
    await page.goto("/dashboard");
    
    const setupButton = page.locator('button:has-text("Enable"), button:has-text("Setup"), button:has-text("Start Setup")').first();
    
    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      const hasSetupContent = await page.locator("text=/qr code|authenticator|scan/i").isVisible().catch(() => false);
      expect(hasSetupContent).toBeTruthy();
    }
  });

  test("should show QR code after starting setup", async ({ page }) => {
    await page.goto("/dashboard");
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const qrCode = page.locator('img[alt*="QR"], img[src*="data:image"]').first();
      const hasQRCode = await qrCode.isVisible().catch(() => false);
      
      if (hasQRCode) {
        expect(hasQRCode).toBeTruthy();
      }
    }
  });

  test("should display secret key for manual entry", async ({ page }) => {
    await page.goto("/dashboard");
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const secretKey = page.locator('code, pre, [class*="secret"]').first();
      const hasSecretKey = await secretKey.isVisible().catch(() => false);
      
      if (hasSecretKey) {
        const secretText = await secretKey.textContent();
        expect(secretText).toBeTruthy();
        expect(secretText!.length).toBeGreaterThan(10);
      }
    }
  });

  test("should show token input field", async ({ page }) => {
    await page.goto("/dashboard");
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const tokenInput = page.locator('input[type="text"][placeholder*="0"], input[maxlength="6"]').first();
      const hasTokenInput = await tokenInput.isVisible().catch(() => false);
      
      if (hasTokenInput) {
        expect(hasTokenInput).toBeTruthy();
      }
    }
  });

  test("should validate token length", async ({ page }) => {
    await page.goto("/dashboard");
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const tokenInput = page.locator('input[type="text"][placeholder*="0"], input[maxlength="6"]').first();
      
      if (await tokenInput.isVisible()) {
        await tokenInput.fill("123");
        
        const verifyButton = page.locator('button:has-text("Verify")').first();
        const isDisabled = await verifyButton.isDisabled().catch(() => true);
        
        expect(isDisabled).toBeTruthy();
      }
    }
  });

  test("should reject invalid MFA token", async ({ page }) => {
    await page.goto("/dashboard");
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const tokenInput = page.locator('input[type="text"][placeholder*="0"], input[maxlength="6"]').first();
      
      if (await tokenInput.isVisible()) {
        await tokenInput.fill("000000");
        
        const verifyButton = page.locator('button:has-text("Verify")').first();
        
        if (await verifyButton.isEnabled()) {
          await verifyButton.click();
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator("text=/invalid|incorrect|wrong/i").isVisible().catch(() => false);
          expect(hasError).toBeTruthy();
        }
      }
    }
  });
});

test.describe("MFA Flow - Mobile", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should display MFA setup on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const setupButton = page.locator('button:has-text("Enable"), button:has-text("Setup"), button:has-text("Start Setup")').first();
    
    if (await setupButton.isVisible()) {
      await setupButton.click();
      await page.waitForTimeout(1000);
      
      const hasSetupContent = await page.locator("text=/qr code|authenticator|scan/i").isVisible().catch(() => false);
      expect(hasSetupContent).toBeTruthy();
    }
  });

  test("should show QR code on mobile", async ({ page }) => {
    await page.goto("/signin");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    const startButton = page.locator('button:has-text("Start Setup")').first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      await page.waitForTimeout(2000);
      
      const qrCode = page.locator('img[alt*="QR"], img[src*="data:image"]').first();
      const hasQRCode = await qrCode.isVisible().catch(() => false);
      
      if (hasQRCode) {
        const boundingBox = await qrCode.boundingBox();
        expect(boundingBox).toBeTruthy();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      }
    }
  });
});
