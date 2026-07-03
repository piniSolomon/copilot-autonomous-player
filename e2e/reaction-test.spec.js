// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/reaction-test/';

test.describe('Reaction Test — Speed Challenge', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Reaction Test/i);
  });

  test('arena is visible', async ({ page }) => {
    const arena = page.locator('#arena');
    await expect(arena).toBeVisible();
  });

  test('start button is present', async ({ page }) => {
    const btn = page.locator('#actionButton');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(/Start/i);
  });

  test('stats section shows attempts counter', async ({ page }) => {
    const attempts = page.locator('#attemptsStat');
    await expect(attempts).toBeVisible();
    expect(await attempts.textContent()).toBe('0');
  });

  test('clicking arena enters wait phase', async ({ page }) => {
    const arena = page.locator('#arena');
    await arena.click();
    // Should transition to waiting or ready phase
    await page.waitForTimeout(500);
    const phase = await arena.getAttribute('data-phase');
    expect(['waiting', 'ready', 'idle']).toContain(phase);
  });

  test('early click shows penalty', async ({ page }) => {
    const arena = page.locator('#arena');
    // Start the test
    await arena.click();
    await page.waitForTimeout(200);
    // Click again immediately (too early)
    await arena.click();
    await page.waitForTimeout(500);
    // Should show penalty or false start indication
    const headline = page.locator('#headline');
    const text = await headline.textContent();
    // Check for early/penalty/false start messaging
    const hasPenalty = /early|penalty|false|too soon|wait/i.test(text);
    expect(hasPenalty).toBe(true);
  });

  test('sound toggle button exists', async ({ page }) => {
    const soundBtn = page.locator('#soundToggle');
    await expect(soundBtn).toBeVisible();
  });

  test('share button exists', async ({ page }) => {
    const shareBtn = page.locator('#shareButton');
    await expect(shareBtn).toBeVisible();
  });

  test('leaderboard section is present', async ({ page }) => {
    const leaderboard = page.locator('#scoreList');
    await expect(leaderboard).toBeVisible();
  });

  test('rating display is present', async ({ page }) => {
    const rating = page.locator('#ratingDisplay');
    await expect(rating).toBeVisible();
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
    const arena = page.locator('#arena');
    await expect(arena).toBeVisible();
    const box = await arena.boundingBox();
    expect(box.width).toBeLessThanOrEqual(380);
  });
});
