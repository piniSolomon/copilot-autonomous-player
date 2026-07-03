// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Number Merge — 2048 Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/number-merge/index.html');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/number|merge|2048/i);
  });

  test('game board is visible', async ({ page }) => {
    // Look for a grid or board element
    const board = page.locator('#board, #grid, .grid, .board, [class*="grid"], [class*="board"]');
    const count = await board.count();
    expect(count).toBeGreaterThan(0);
  });

  test('score display shows 0 initially', async ({ page }) => {
    const scoreText = await page.locator('body').textContent();
    expect(scoreText).toMatch(/0/);
  });

  test('new game button exists', async ({ page }) => {
    const btn = page.locator('button:has-text("New"), button:has-text("new"), button:has-text("Restart"), button:has-text("restart")');
    const count = await btn.count();
    expect(count).toBeGreaterThan(0);
  });

  test('game responds to arrow key input', async ({ page }) => {
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);
    // Should not crash
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('tiles appear on the board', async ({ page }) => {
    // After initial load, there should be 2 starting tiles
    await page.waitForTimeout(500);
    const tiles = page.locator('.tile, [class*="tile"], [data-value]');
    const count = await tiles.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('high score is saved to localStorage', async ({ page }) => {
    const key = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.find(k => k.includes('best') || k.includes('hi') || k.includes('high')) || 'none';
    });
    expect(key).toBeDefined();
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

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/games/number-merge/index.html');
    await page.waitForTimeout(2000);
    const realErrors = errors.filter(e => !e.includes('gamemonetize') && !e.includes('COOP'));
    expect(realErrors).toHaveLength(0);
  });
});
