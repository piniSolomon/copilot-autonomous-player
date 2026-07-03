// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/snake/';

test.describe('Snake — Classic Arcade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Snake/i);
  });

  test('game canvas is visible', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

  test('start overlay is visible initially', async ({ page }) => {
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeVisible();
  });

  test('start button begins the game', async ({ page }) => {
    await page.click('#start-btn');
    await page.waitForTimeout(300);
    // Start overlay should be hidden after clicking start
    const overlay = page.locator('#start-overlay');
    await expect(overlay).toBeHidden();
  });

  test('score starts at 0', async ({ page }) => {
    const score = page.locator('#score-value');
    await expect(score).toBeVisible();
    expect(await score.textContent()).toBe('0');
  });

  test('speed level starts at 1', async ({ page }) => {
    const speed = page.locator('#speed-value');
    await expect(speed).toBeVisible();
    expect(await speed.textContent()).toBe('1');
  });

  test('new game button exists', async ({ page }) => {
    const btn = page.locator('#new-game-btn');
    await expect(btn).toBeVisible();
  });

  test('pause button exists', async ({ page }) => {
    const btn = page.locator('#pause-btn');
    await expect(btn).toBeVisible();
  });

  test('sound button exists', async ({ page }) => {
    const btn = page.locator('#sound-btn');
    await expect(btn).toBeVisible();
  });

  test('share button exists on game over', async ({ page }) => {
    const shareBtn = page.locator('#share-btn');
    // Share button is in gameover overlay, should exist in DOM
    await expect(shareBtn).toHaveCount(1);
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
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
  });
});
