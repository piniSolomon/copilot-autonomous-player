// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/flappy-bird/';

test.describe('Flappy Bird — Tap to Fly', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Flappy Bird/i);
  });

  test('game canvas is visible', async ({ page }) => {
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

  test('menu overlay is visible initially', async ({ page }) => {
    const overlay = page.locator('#menuOverlay');
    await expect(overlay).toBeVisible();
  });

  test('best score display starts at 0', async ({ page }) => {
    const best = page.locator('#bestStat');
    await expect(best).toBeVisible();
    expect(await best.textContent()).toBe('0');
  });

  test('games counter starts at 0', async ({ page }) => {
    const games = page.locator('#gamesStat');
    await expect(games).toBeVisible();
    expect(await games.textContent()).toBe('0');
  });

  test('sound toggle exists', async ({ page }) => {
    const btn = page.locator('#soundToggle');
    await expect(btn).toBeVisible();
  });

  test('game over overlay has share button', async ({ page }) => {
    const shareBtn = page.locator('#shareBtn');
    await expect(shareBtn).toHaveCount(1);
  });

  test('game over overlay has play again button', async ({ page }) => {
    const btn = page.locator('#playAgainBtn');
    await expect(btn).toHaveCount(1);
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
