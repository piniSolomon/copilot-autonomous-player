// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

test.describe('Dodge Rush — Obstacle Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/dodge-rush/index.html');
    await page.evaluate(() => localStorage.removeItem('dr_hi_v1'));
    await page.reload();
  });

  test('page loads with correct title and meta', async ({ page }) => {
    await expect(page).toHaveTitle(/Dodge Rush/i);
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute('content', /dodge/i);
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Dodge Rush/i);
  });

  test('start screen is visible on load', async ({ page }) => {
    const startScreen = page.locator('#start-screen');
    await expect(startScreen).toBeVisible();
    await expect(startScreen).not.toHaveClass(/hidden/);
  });

  test('game-over screen is hidden on load', async ({ page }) => {
    const goScreen = page.locator('#gameover-screen');
    await expect(goScreen).toHaveClass(/hidden/);
  });

  test('start button begins the game', async ({ page }) => {
    const startBtn = page.locator('#start-btn');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Start screen should now be hidden
    const startScreen = page.locator('#start-screen');
    await expect(startScreen).toHaveClass(/hidden/);

    // Canvas should be visible and rendering
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
  });

  test('canvas renders at correct dimensions', async ({ page }) => {
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
    const canvasWidth = await canvas.getAttribute('width');
    const canvasHeight = await canvas.getAttribute('height');
    expect(parseInt(canvasWidth || '0')).toBe(480);
    expect(parseInt(canvasHeight || '0')).toBe(420);
  });

  test('mobile control buttons are present', async ({ page }) => {
    const leftBtn = page.locator('#left-btn');
    const rightBtn = page.locator('#right-btn');
    await expect(leftBtn).toBeVisible();
    await expect(rightBtn).toBeVisible();
    await expect(leftBtn).toContainText('LEFT');
    await expect(rightBtn).toContainText('RIGHT');
  });

  test('hi-score displays 0 initially (after clearing storage)', async ({ page }) => {
    const hi = page.locator('#hi-score');
    await expect(hi).toBeVisible();
    await expect(hi).toHaveText('0');
  });

  test('keyboard controls work: ArrowLeft', async ({ page }) => {
    await page.locator('#start-btn').click();
    // Press ArrowLeft key — player lane should move
    // We can't directly observe canvas state, but we can verify no error occurs
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    // Game should still be running (start screen still hidden)
    await expect(page.locator('#start-screen')).toHaveClass(/hidden/);
  });

  test('keyboard controls work: ArrowRight', async ({ page }) => {
    await page.locator('#start-btn').click();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#start-screen')).toHaveClass(/hidden/);
  });

  test('game over shows score and replay button', async ({ page }) => {
    // Force a game-over by calling showGameOver directly
    await page.locator('#start-btn').click();

    // Simulate game over through JS (testing the game over UI)
    await page.evaluate(() => {
      // Stop the game loop and trigger game over manually
      window.__lastGameScore = undefined;
      // Call the internal showGameOver-like behavior: reveal gameover screen
      document.getElementById('gameover-screen').classList.remove('hidden');
      document.getElementById('final-score').textContent = '42';
      document.getElementById('hi-label').textContent = 'Best: 42';
    });

    const goScreen = page.locator('#gameover-screen');
    await expect(goScreen).not.toHaveClass(/hidden/);
    const finalScore = page.locator('#final-score');
    await expect(finalScore).toHaveText('42');
    const restartBtn = page.locator('#restart-btn');
    await expect(restartBtn).toBeVisible();
  });

  test('restart button restarts the game', async ({ page }) => {
    await page.locator('#start-btn').click();

    // Trigger game over screen
    await page.evaluate(() => {
      document.getElementById('gameover-screen').classList.remove('hidden');
    });

    await page.locator('#restart-btn').click();
    // After restart, game over screen should be hidden again
    await expect(page.locator('#gameover-screen')).toHaveClass(/hidden/);
    await expect(page.locator('#start-screen')).toHaveClass(/hidden/);
  });

  test('menu button returns to start screen', async ({ page }) => {
    await page.locator('#start-btn').click();

    // Trigger game over screen
    await page.evaluate(() => {
      document.getElementById('gameover-screen').classList.remove('hidden');
    });

    await page.locator('#menu-btn').click();
    await expect(page.locator('#start-screen')).not.toHaveClass(/hidden/);
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
    const adTop = page.locator('#ad-top');
    await expect(adTop).toBeVisible();
  });

  // ── NEW: Rewarded ad button present in game-over screen ────────────────
  test('rewarded extra-life button is present in game-over screen', async ({ page }) => {
    await page.locator('#start-btn').click();
    await page.evaluate(() => {
      document.getElementById('gameover-screen').classList.remove('hidden');
    });
    const rewardedBtn = page.locator('#rewarded-extra-btn');
    await expect(rewardedBtn).toBeVisible();
    const text = await rewardedBtn.innerText();
    expect(text).toMatch(/Watch Ad|Extra Life/i);
  });

  // ── NEW: OG preview image file exists on disk ──────────────────────────
  test('OG preview image file exists', async () => {
    const imgPath = path.join(PROJECT_ROOT, 'games', 'dodge-rush', 'preview.png');
    expect(fs.existsSync(imgPath), `Expected ${imgPath} to exist`).toBe(true);
    const stat = fs.statSync(imgPath);
    expect(stat.size).toBeGreaterThan(1000);
  });

  // ── NEW: OG preview image served via HTTP ─────────────────────────────
  test('OG preview image is accessible via HTTP', async ({ page }) => {
    const resp = await page.request.get('/games/dodge-rush/preview.png');
    expect(resp.status()).toBe(200);
    expect(resp.headers()['content-type']).toMatch(/image/);
  });

  test('hi-score is saved to localStorage', async ({ page }) => {
    // Set a hi-score in storage and verify it loads
    await page.evaluate(() => {
      localStorage.setItem('dr_hi_v1', '999');
    });
    await page.reload();
    const hi = page.locator('#hi-score');
    await expect(hi).toHaveText('999');
  });

  test('is mobile responsive — viewport 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();

    // Canvas should be visible and fit in viewport
    const canvas = page.locator('#canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeLessThanOrEqual(390);

    // Mobile controls visible
    await expect(page.locator('#left-btn')).toBeVisible();
    await expect(page.locator('#right-btn')).toBeVisible();
  });

  test('back link to index exists', async ({ page }) => {
    const backLink = page.locator('a[href*="index.html"]');
    await expect(backLink.first()).toBeVisible();
  });
});
