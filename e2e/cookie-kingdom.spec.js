// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

test.describe('Cookie Kingdom — Idle Clicker', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so each test starts fresh
    await page.goto('/games/cookie-kingdom/index.html');
    await page.evaluate(() => localStorage.removeItem('ck_save_v1'));
    await page.reload();
  });

  test('page loads with correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Cookie Kingdom/i);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /cookie/i);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Cookie Kingdom/i);
  });

  test('displays initial score of 0', async ({ page }) => {
    const count = page.locator('#cookie-count');
    await expect(count).toBeVisible();
    await expect(count).toHaveText('0');
  });

  test('clicking the cookie increases the count', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    await expect(cookieBtn).toBeVisible();

    // Click 5 times
    for (let i = 0; i < 5; i++) {
      await cookieBtn.click();
    }

    const count = page.locator('#cookie-count');
    const value = await count.textContent();
    // Default click power is 1, so after 5 clicks we should have >= 5
    const numValue = parseFloat(value || '0');
    expect(numValue).toBeGreaterThanOrEqual(5);
  });

  test('all-time counter increments with clicks', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    for (let i = 0; i < 3; i++) {
      await cookieBtn.click();
    }
    const allTime = page.locator('#all-time-count');
    const val = await allTime.textContent();
    expect(parseFloat(val || '0')).toBeGreaterThanOrEqual(3);
  });

  test('shop renders upgrade items', async ({ page }) => {
    const shopItems = page.locator('.upgrade-item');
    const count = await shopItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can purchase an upgrade when affordable', async ({ page }) => {
    // Inject enough cookies to buy cheapest upgrade (Magic Cursor = 15)
    await page.evaluate(() => {
      const SAVE_KEY = 'ck_save_v1';
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
      s.cookies = 1000;
      s.allTime = 1000;
      localStorage.setItem(SAVE_KEY, JSON.stringify(s));
    });
    await page.reload();

    // Click "Magic Cursor" upgrade
    const cursorUpgrade = page.locator('.upgrade-item[data-id="cursor"]');
    await expect(cursorUpgrade).not.toHaveClass(/locked/);
    await cursorUpgrade.click();

    // After buying, owned count should appear
    await expect(page.locator('.upgrade-item[data-id="cursor"] .upgrade-owned')).toBeVisible();
  });

  // ── NEW: GameMonetize SDK script tag present ────────────────────────────
  test('GameMonetize SDK script tag is present', async ({ page }) => {
    const sdkScript = page.locator('script[src*="gamemonetize.com/sdk.js"]');
    await expect(sdkScript).toHaveCount(1);
  });

  // ── UPDATED: ad SDK loads or fallback flag is set ──────────────────────
  test('ad SDK loads or fallback flag is set within 5s', async ({ page }) => {
    await page.waitForFunction(
      () => window.__adReady === true,
      { timeout: 5000 }
    );
    const adReady = await page.evaluate(() => window.__adReady);
    expect(adReady).toBe(true);
  });

  test('ad placeholder is present in DOM', async ({ page }) => {
    // Ad banner should exist
    const adTop = page.locator('#ad-top');
    await expect(adTop).toBeVisible();
  });

  // ── NEW: Rewarded ad button present ────────────────────────────────────
  test('rewarded ad button (2x boost) is present', async ({ page }) => {
    const btn = page.locator('#rewarded-btn');
    await expect(btn).toBeVisible();
    const text = await btn.innerText();
    expect(text).toMatch(/Watch Ad|2×|ACTIVE/i);
  });

  // ── NEW: OG preview image file exists on disk ──────────────────────────
  test('OG preview image file exists', async () => {
    const imgPath = path.join(PROJECT_ROOT, 'games', 'cookie-kingdom', 'preview.png');
    expect(fs.existsSync(imgPath), `Expected ${imgPath} to exist`).toBe(true);
    const stat = fs.statSync(imgPath);
    expect(stat.size).toBeGreaterThan(1000);
  });

  // ── NEW: OG preview image served via HTTP ─────────────────────────────
  test('OG preview image is accessible via HTTP', async ({ page }) => {
    const resp = await page.request.get('/games/cookie-kingdom/preview.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toMatch(/image/);
  });

  test('save and load persists progress', async ({ page }) => {
    // Directly write a known state to localStorage, then reload to test the load path
    await page.evaluate(() => {
      localStorage.setItem('ck_save_v1', JSON.stringify({
        cookies: 42,
        allTime: 42,
        cps: 0,
        clickPower: 1,
        upgrades: {},
      }));
    });

    await page.reload();
    const count = page.locator('#cookie-count');
    const val = parseFloat((await count.textContent()) || '0');
    // Value should be ~42 (cps ticks may add a tiny bit more)
    expect(val).toBeGreaterThanOrEqual(42);
  });

  test('per-second display exists', async ({ page }) => {
    const cps = page.locator('#cps-display');
    await expect(cps).toBeVisible();
    await expect(cps).toContainText('per second');
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    // Cookie button should be visible and not overflow
    const btn = page.locator('#cookie-btn');
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  });

  test('back link to index exists', async ({ page }) => {
    const backLink = page.locator('a[href*="index.html"]');
    await expect(backLink).toBeVisible();
  });
});
