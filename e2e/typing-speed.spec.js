// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/typing-speed/';

test.describe('Typing Speed — WPM Challenge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Typing Speed/i);
  });

  test('typing surface is visible', async ({ page }) => {
    const surface = page.locator('#typingSurface');
    await expect(surface).toBeVisible();
  });

  test('text display shows content', async ({ page }) => {
    const display = page.locator('#textDisplay');
    await expect(display).toBeVisible();
    const text = await display.textContent();
    expect(text.length).toBeGreaterThan(0);
  });

  test('WPM stat starts at 0', async ({ page }) => {
    const wpm = page.locator('#wpmStat');
    await expect(wpm).toBeVisible();
    expect(await wpm.textContent()).toBe('0');
  });

  test('accuracy starts at 100%', async ({ page }) => {
    const acc = page.locator('#accuracyStat');
    await expect(acc).toBeVisible();
    expect(await acc.textContent()).toBe('100%');
  });

  test('mode buttons are visible', async ({ page }) => {
    const modeButtons = page.locator('#modeButtons button');
    const count = await modeButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('duration buttons are visible', async ({ page }) => {
    const durButtons = page.locator('#durationButtons button');
    const count = await durButtons.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('restart button exists', async ({ page }) => {
    const btn = page.locator('#restartButton');
    await expect(btn).toBeVisible();
  });

  test('sound toggle exists', async ({ page }) => {
    const btn = page.locator('#soundToggle');
    await expect(btn).toBeVisible();
  });

  test('progress bar is visible', async ({ page }) => {
    const bar = page.locator('#progressFill');
    await expect(bar).toBeVisible();
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
    const surface = page.locator('#typingSurface');
    await expect(surface).toBeVisible();
  });
});
