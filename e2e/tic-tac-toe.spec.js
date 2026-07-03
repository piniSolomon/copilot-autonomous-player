// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/tic-tac-toe/';

test.describe('Tic Tac Toe — Play vs AI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Tic Tac Toe/i);
  });

  test('board is visible with 9 cells', async ({ page }) => {
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const cells = page.locator('#board .cell');
    await expect(cells).toHaveCount(9);
  });

  test('clicking a cell places X', async ({ page }) => {
    const cells = page.locator('#board .cell');
    await cells.first().click();
    await page.waitForTimeout(300);
    // Cell should have 'x' class (marks rendered via CSS)
    await expect(cells.first()).toHaveClass(/\bx\b/);
  });

  test('AI responds after player move', async ({ page }) => {
    const cells = page.locator('#board .cell');
    await cells.nth(4).click(); // Center cell
    await page.waitForTimeout(1000);
    // At least one cell should have 'o' class (AI's mark)
    const aiCells = await page.evaluate(() => {
      return document.querySelectorAll('#board .cell.o').length;
    });
    expect(aiCells).toBeGreaterThanOrEqual(1);
  });

  test('score counters are visible', async ({ page }) => {
    const playerWins = page.locator('#playerWins');
    const aiWins = page.locator('#aiWins');
    const draws = page.locator('#drawsCount');
    await expect(playerWins).toBeVisible();
    await expect(aiWins).toBeVisible();
    await expect(draws).toBeVisible();
  });

  test('new game button exists', async ({ page }) => {
    const btn = page.locator('#newGameButton');
    await expect(btn).toBeVisible();
  });

  test('reset scores button exists', async ({ page }) => {
    const btn = page.locator('#resetButton');
    await expect(btn).toBeVisible();
  });

  test('sound toggle exists', async ({ page }) => {
    const btn = page.locator('#soundToggle');
    await expect(btn).toBeVisible();
  });

  test('share button exists', async ({ page }) => {
    const btn = page.locator('#shareButton');
    await expect(btn).toBeVisible();
  });

  test('difficulty info is displayed', async ({ page }) => {
    const summary = page.locator('#difficultySummary');
    await expect(summary).toBeVisible();
  });

  test('back link to index exists', async ({ page }) => {
    const backLink = page.locator('a[href*="index.html"]');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('Back');
  });

  test('GameMonetize SDK is integrated', async ({ page }) => {
    // SDK may be loaded statically or dynamically
    const hasSDK = await page.evaluate(() => {
      return typeof window.SDK_OPTIONS !== 'undefined' ||
        !!document.querySelector('script[src*="gamemonetize.com/sdk.js"]');
    });
    expect(hasSDK).toBe(true);
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
