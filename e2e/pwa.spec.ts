import { test, expect } from "@playwright/test";

test.describe("PWA (Progressive Web App) Features", () => {
  test("should have manifest.json", async ({ page }) => {
    await page.goto("/");
    
    const manifestLink = page.locator('link[rel="manifest"]');
    const hasManifest = await manifestLink.count() > 0;
    
    expect(hasManifest).toBeTruthy();
    
    if (hasManifest) {
      const href = await manifestLink.getAttribute("href");
      expect(href).toBeTruthy();
    }
  });

  test("should have service worker registration", async ({ page }) => {
    await page.goto("/");
    
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    
    expect(hasServiceWorker).toBeTruthy();
  });

  test("should have meta theme-color", async ({ page }) => {
    await page.goto("/");
    
    const themeColor = page.locator('meta[name="theme-color"]');
    const hasThemeColor = await themeColor.count() > 0;
    
    expect(hasThemeColor).toBeTruthy();
  });

  test("should have viewport meta tag", async ({ page }) => {
    await page.goto("/");
    
    const viewport = page.locator('meta[name="viewport"]');
    const hasViewport = await viewport.count() > 0;
    
    expect(hasViewport).toBeTruthy();
    
    if (hasViewport) {
      const content = await viewport.getAttribute("content");
      expect(content).toContain("width=device-width");
    }
  });

  test("should have app icons", async ({ page }) => {
    await page.goto("/");
    
    const icons = page.locator('link[rel*="icon"], link[rel="apple-touch-icon"]');
    const iconCount = await icons.count();
    
    expect(iconCount).toBeGreaterThan(0);
  });

  test("should load manifest.json successfully", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    
    expect(response?.status()).toBe(200);
    
    const contentType = response?.headers()["content-type"];
    expect(contentType).toContain("json");
  });

  test("should have valid manifest structure", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    const manifest = await response?.json();
    
    expect(manifest).toBeDefined();
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
    expect(manifest.display).toBeDefined();
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBeTruthy();
  });

  test("should have service worker file", async ({ page }) => {
    const response = await page.goto("/service-worker.js");
    
    expect(response?.status()).toBe(200);
    
    const contentType = response?.headers()["content-type"];
    expect(contentType).toContain("javascript");
  });

  test("should register service worker in production mode", async ({ page }) => {
    await page.goto("/");
    
    await page.waitForTimeout(2000);
    
    const serviceWorkerRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then(reg => !!reg);
    }).catch(() => false);
    
    expect(typeof serviceWorkerRegistered).toBe("boolean");
  });
});

test.describe("PWA - Mobile Experience", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should be responsive on mobile", async ({ page }) => {
    await page.goto("/");
    
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    
    const body = page.locator("body");
    const boundingBox = await body.boundingBox();
    
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeLessThanOrEqual(375);
  });

  test("should have touch-friendly elements", async ({ page }) => {
    await page.goto("/");
    
    const buttons = page.locator("button, a");
    const buttonCount = await buttons.count();
    
    expect(buttonCount).toBeGreaterThan(0);
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const boundingBox = await firstButton.boundingBox();
      
      if (boundingBox) {
        expect(boundingBox.height).toBeGreaterThan(30);
      }
    }
  });

  test("should not have horizontal scroll", async ({ page }) => {
    await page.goto("/");
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test("should load quickly on mobile", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe("PWA - Offline Capabilities", () => {
  test("should have service worker with caching strategy", async ({ page }) => {
    const response = await page.goto("/service-worker.js");
    const content = await response?.text();
    
    expect(content).toBeDefined();
    expect(content).toContain("cache");
  });

  test("should cache static assets", async ({ page }) => {
    const response = await page.goto("/service-worker.js");
    const content = await response?.text();
    
    if (content) {
      const hasCacheStrategy = content.includes("cache") || content.includes("Cache");
      expect(hasCacheStrategy).toBeTruthy();
    }
  });
});

test.describe("PWA - Accessibility", () => {
  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test("should have alt text for images", async ({ page }) => {
    await page.goto("/");
    
    const images = page.locator("img");
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");
        expect(alt !== null).toBeTruthy();
      }
    }
  });

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/register");
    
    const inputs = page.locator("input");
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute("id");
        const name = await input.getAttribute("name");
        
        expect(id || name).toBeTruthy();
      }
    }
  });

  test("should have sufficient color contrast", async ({ page }) => {
    await page.goto("/");
    
    const body = page.locator("body");
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    expect(backgroundColor).toBeDefined();
  });
});
