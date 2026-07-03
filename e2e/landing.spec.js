// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

// Root of the project on disk (used for file-existence checks)
const PROJECT_ROOT = path.resolve(__dirname, '..');

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

  test('shows six game cards', async ({ page }) => {
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(6);
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

  test('Memory Match card links to correct page', async ({ page }) => {
    const mmCard = page.locator('.game-card[href*="memory-match"]');
    await expect(mmCard).toBeVisible();
    await expect(mmCard).toHaveAttribute('href', /memory-match/);
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

  // ── NEW: Ad SDK script tag present ─────────────────────────────────────
  test('GameMonetize SDK script tag is present', async ({ page }) => {
    const sdkScript = page.locator('script[src*="gamemonetize.com/sdk.js"]');
    await expect(sdkScript).toHaveCount(1);
  });

  // ── NEW: Ad SDK loads or fallback flag is set ───────────────────────────
  test('ad SDK loads or fallback flag is set within 5s', async ({ page }) => {
    await page.waitForFunction(
      () => window.__adReady === true,
      { timeout: 5000 }
    );
    const adReady = await page.evaluate(() => window.__adReady);
    expect(adReady).toBe(true);
  });

  // ── NEW: OG image file exists on disk ──────────────────────────────────
  test('landing OG image file exists', async () => {
    const imgPath = path.join(PROJECT_ROOT, 'assets', 'og-image.png');
    expect(fs.existsSync(imgPath), `Expected ${imgPath} to exist`).toBe(true);
    const stat = fs.statSync(imgPath);
    expect(stat.size).toBeGreaterThan(1000); // at least 1 KB
  });

  // ── NEW: OG image is served (200) by the local dev server ──────────────
  test('landing OG image is accessible via HTTP', async ({ page }) => {
    const resp = await page.request.get('/assets/og-image.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toMatch(/image/);
  });

  // ── NEW: All internal footer/card links resolve to real pages ──────────
  test('all internal links resolve (200) without 404', async ({ page }) => {
    const hrefs = await page.$$eval(
      'a[href]:not([href^="http"])',
      els => els.map(el => el.getAttribute('href')).filter(Boolean)
    );
    for (const href of hrefs) {
      const resp = await page.request.get(href);
      expect(resp.status(), `Link ${href} returned ${resp.status()}`).toBe(200);
    }
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    // Both game cards should still be visible
    const cards = page.locator('.game-card');
    await expect(cards).toHaveCount(6);
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
