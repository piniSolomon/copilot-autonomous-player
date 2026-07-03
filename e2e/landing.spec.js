// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title and SEO meta tags', async ({ page }) => {
    await expect(page).toHaveTitle(/Free Web Games/i);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /games/i);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Free Web Games/i);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /copilot-autonomous-player/);
  });

  test('shows two game cards', async ({ page }) => {
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(2);
  });

  test('Cookie Kingdom card links to correct page', async ({ page }) => {
    const ckCard = page.locator('.game-card[href*="cookie-kingdom"]');
    await expect(ckCard).toBeVisible();
    await expect(ckCard).toHaveAttribute('href', /cookie-kingdom/);
  });

  test('Dodge Rush card links to correct page', async ({ page }) => {
    const drCard = page.locator('.game-card[href*="dodge-rush"]');
    await expect(drCard).toBeVisible();
    await expect(drCard).toHaveAttribute('href', /dodge-rush/);
  });

  test('has structured data (JSON-LD)', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    const content = await jsonLd.textContent();
    expect(content).toContain('WebSite');
  });

  test('ad placeholder is present', async ({ page }) => {
    const adHeader = page.locator('#ad-header');
    await expect(adHeader).toBeVisible();
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    // Both game cards should still be visible
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
      const box = await card.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }
  });

  test('clicking Cookie Kingdom card navigates to game', async ({ page }) => {
    const ckCard = page.locator('.game-card[href*="cookie-kingdom"]');
    await ckCard.click();
    await expect(page).toHaveURL(/cookie-kingdom/);
    await expect(page).toHaveTitle(/Cookie Kingdom/i);
  });

  test('clicking Dodge Rush card navigates to game', async ({ page }) => {
    const drCard = page.locator('.game-card[href*="dodge-rush"]');
    await drCard.click();
    await expect(page).toHaveURL(/dodge-rush/);
    await expect(page).toHaveTitle(/Dodge Rush/i);
  });
});
