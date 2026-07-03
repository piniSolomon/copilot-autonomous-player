// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/brick-breaker/';

test.describe('Brick Breaker — Breakout Arcade', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Brick Breaker/i);
  });

  test('game canvas is visible', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

  test('start overlay is visible initially', async ({ page }) => {
    const overlay = page.locator('#overlay');
    await expect(overlay).toBeVisible();
  });

  test('start button begins the game', async ({ page }) => {
    const startBtn = page.locator('#overlayPrimary');
    await startBtn.click();
    await page.waitForTimeout(500);
    // Overlay should be hidden
    const overlay = page.locator('#overlay');
    await expect(overlay).toBeHidden();
  });

  test('score starts at 0', async ({ page }) => {
    const score = page.locator('#scoreValue');
    await expect(score).toBeVisible();
    expect(await score.textContent()).toBe('0');
  });

  test('level indicator shows level 1', async ({ page }) => {
    const level = page.locator('#levelValue');
    await expect(level).toBeVisible();
    const text = await level.textContent();
    expect(text).toContain('1');
  });

  test('lives display is visible', async ({ page }) => {
    const lives = page.locator('#livesValue');
    await expect(lives).toBeVisible();
  });

  test('sound toggle exists', async ({ page }) => {
    const btn = page.locator('#soundToggle');
    await expect(btn).toBeVisible();
  });

  test('pause toggle exists', async ({ page }) => {
    const btn = page.locator('#pauseToggle');
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
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });
});
