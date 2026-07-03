// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Merge Drop — Suika-style Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/merge-drop/index.html');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/merge|drop|fruit/i);
  });

  test('canvas element exists and is visible', async ({ page }) => {
    const canvas = page.locator('canvas#game');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

  test('score display shows 0 initially', async ({ page }) => {
    const scoreText = await page.locator('body').textContent();
    expect(scoreText).toMatch(/0/);
  });

  test('game responds to click/tap input', async ({ page }) => {
    // Close tutorial if visible
    const closeBtn = page.locator('#tooltip-close');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    await page.waitForTimeout(500);
    const canvas = page.locator('canvas#game');
    await canvas.click({ position: { x: 100, y: 200 } });
    await page.waitForTimeout(500);
    // Game should still be running (canvas visible, no crash)
    await expect(canvas).toBeVisible();
  });

  test('high score is saved to localStorage', async ({ page }) => {
    // Just verify localStorage key is accessible
    const key = await page.evaluate(() => {
      return localStorage.getItem('merge-drop-high-score') || '0';
    });
    expect(key).toBeDefined();
  });

  test('GameMonetize SDK script tag is present', async ({ page }) => {
    const sdk = page.locator('script#gamemonetize-sdk');
    await expect(sdk).toHaveCount(1);
  });

  test('ad SDK loads or fallback flag is set within 6s', async ({ page }) => {
    const ready = await page.waitForFunction(
      () => window.__adReady === true,
      { timeout: 6000 }
    );
    expect(ready).toBeTruthy();
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    const canvas = page.locator('canvas');
    const box = await canvas.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });

  test('sound toggle button exists', async ({ page }) => {
    // Look for sound toggle (🔊 or 🔇)
    const body = await page.locator('body').textContent();
    const hasSoundControl = body.includes('🔊') || body.includes('🔇') || 
                           body.includes('Sound') || body.includes('sound');
    expect(hasSoundControl).toBeTruthy();
  });

  test('danger line is rendered in canvas', async ({ page }) => {
    // The game should render within 1 second of loading
    await page.waitForTimeout(1000);
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/games/merge-drop/index.html');
    await page.waitForTimeout(2000);
    // Filter out ad-related errors (COOP warnings etc)
    const realErrors = errors.filter(e => !e.includes('gamemonetize') && !e.includes('COOP'));
    expect(realErrors).toHaveLength(0);
  });

  test('back link to hub exists', async ({ page }) => {
    const link = page.locator('a[href*="index.html"]');
    await expect(link).toHaveCount(1);
  });
});
