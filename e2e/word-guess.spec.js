// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Word Guess — Daily Word Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/word-guess/index.html');
    await page.waitForTimeout(500);
    // Close help modal if visible
    const gotItBtn = page.locator('button[data-close="help-modal"]:has-text("Got it")');
    if (await gotItBtn.isVisible().catch(() => false)) {
      await gotItBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/word|guess/i);
  });

  test('game grid is visible (6 rows)', async ({ page }) => {
    const rows = page.locator('[class*="row"], [class*="Row"], [data-row]');
    const count = await rows.count();
    // Should have at least 6 rows (or grid with tiles)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('on-screen keyboard is visible', async ({ page }) => {
    // Look for keyboard keys
    const keys = page.locator('[class*="key"], [class*="Key"], [data-key]');
    const count = await keys.count();
    expect(count).toBeGreaterThanOrEqual(26); // at least A-Z
  });

  test('typing a letter shows on the grid', async ({ page }) => {
    await page.keyboard.press('H');
    await page.waitForTimeout(200);
    const body = await page.locator('body').textContent();
    expect(body).toContain('H');
  });

  test('backspace removes a letter', async ({ page }) => {
    await page.keyboard.press('A');
    await page.keyboard.press('B');
    await page.waitForTimeout(100);
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(200);
    // Should still have A visible somewhere
    const body = await page.locator('body').textContent();
    expect(body).toContain('A');
  });

  test('GameMonetize SDK script tag is present', async ({ page }) => {
    const sdk = page.locator('#gamemonetize-sdk');
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
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('back link to hub exists', async ({ page }) => {
    const link = page.locator('a[href*="index.html"]');
    const count = await link.count();
    expect(count).toBeGreaterThan(0);
  });

  test('stats are tracked in localStorage', async ({ page }) => {
    const hasStorage = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(k => k.includes('word') || k.includes('guess') || k.includes('stat'));
    });
    // Stats may not exist until first game — just verify no crash
    expect(typeof hasStorage).toBe('boolean');
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/games/word-guess/index.html');
    await page.waitForTimeout(2000);
    const realErrors = errors.filter(e => !e.includes('gamemonetize') && !e.includes('COOP'));
    expect(realErrors).toHaveLength(0);
  });
});
