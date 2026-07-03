// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/color-merge/';

test.describe('Color Merge — Match & Combine Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Color Merge/i);
  });

  test('board is visible with 25 cells', async ({ page }) => {
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    // 5x5 grid = 25 cells
    const cells = page.locator('#cell-layer > *');
    const count = await cells.count();
    expect(count).toBe(25);
  });

  test('score starts at 0', async ({ page }) => {
    const score = page.locator('#score-value');
    await expect(score).toBeVisible();
    expect(await score.textContent()).toBe('0');
  });

  test('next ball queue is visible', async ({ page }) => {
    const queue = page.locator('#queue-active');
    await expect(queue).toBeVisible();
  });

  test('clicking an empty cell places a ball', async ({ page }) => {
    // Use JS dispatch to avoid overlay interception
    await page.evaluate(() => {
      const cell = document.querySelector('#cell-layer .cell.empty');
      if (cell) cell.click();
    });
    await page.waitForTimeout(800);
    // After placing, at least one cell should have 'occupied' class
    const occupiedCells = await page.evaluate(() => {
      return document.querySelectorAll('#cell-layer .occupied').length;
    });
    expect(occupiedCells).toBeGreaterThanOrEqual(1);
  });

  test('new game button resets', async ({ page }) => {
    // Place a ball first via JS
    await page.evaluate(() => {
      const cell = document.querySelector('#cell-layer .cell.empty');
      if (cell) cell.click();
    });
    await page.waitForTimeout(300);

    // Click new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Score should be 0
    const score = page.locator('#score-value');
    expect(await score.textContent()).toBe('0');
  });

  test('sound button exists', async ({ page }) => {
    const soundBtn = page.locator('#sound-btn');
    await expect(soundBtn).toBeVisible();
  });

  test('share button exists', async ({ page }) => {
    const shareBtn = page.locator('#share-btn');
    await expect(shareBtn).toBeVisible();
  });

  test('undo button exists', async ({ page }) => {
    const undoBtn = page.locator('#undo-btn');
    await expect(undoBtn).toBeVisible();
  });

  test('back link to index exists', async ({ page }) => {
    const backLink = page.locator('a[href*="index.html"]');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('Back');
  });

  test('GameMonetize SDK script is present', async ({ page }) => {
    const sdk = page.locator('script[src*="gamemonetize.com/sdk.js"]');
    await expect(sdk).toHaveCount(1);
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const box = await board.boundingBox();
    expect(box.width).toBeLessThanOrEqual(380);
  });
});
