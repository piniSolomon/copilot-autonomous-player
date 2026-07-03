// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/simon-says/';

test.describe('Simon Says — Pattern Memory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Simon Says/i);
  });

  test('board has 4 colored buttons', async ({ page }) => {
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const pads = page.locator('#board .pad');
    await expect(pads).toHaveCount(4);
  });

  test('start button is visible', async ({ page }) => {
    const btn = page.locator('#startButton');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(/Start/i);
  });

  test('round number starts at 0', async ({ page }) => {
    const round = page.locator('#roundNumber');
    await expect(round).toBeVisible();
    expect(await round.textContent()).toBe('0');
  });

  test('high score starts at 0', async ({ page }) => {
    const hs = page.locator('#highScoreValue');
    await expect(hs).toBeVisible();
    expect(await hs.textContent()).toBe('0');
  });

  test('clicking start begins the game', async ({ page }) => {
    await page.click('#startButton');
    await page.waitForTimeout(500);
    // Phase pill should change from 'ready' to 'watch' or similar
    const pill = page.locator('#phasePill');
    const phase = await pill.getAttribute('data-phase');
    expect(phase).not.toBe('ready');
  });

  test('difficulty mode buttons exist', async ({ page }) => {
    const modeGroup = page.locator('#modeGroup');
    await expect(modeGroup).toBeVisible();
    const buttons = modeGroup.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('sound toggle exists', async ({ page }) => {
    const btn = page.locator('#soundToggle');
    await expect(btn).toBeVisible();
  });

  test('share button exists', async ({ page }) => {
    const btn = page.locator('#shareButton');
    await expect(btn).toBeVisible();
  });

  test('back link to index exists', async ({ page }) => {
    const backLink = page.locator('a[href*="index.html"]');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('Back');
  });

  test('GameMonetize SDK is integrated', async ({ page }) => {
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
