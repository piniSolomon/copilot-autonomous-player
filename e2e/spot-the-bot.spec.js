// @ts-check
const { test, expect } = require('@playwright/test');

const GAME_URL = '/games/spot-the-bot/index.html';

async function openGame(page) {
  await page.goto(GAME_URL);
  await page.waitForLoadState('domcontentloaded');
}

async function solveChallenge(page) {
  const guesses = ['ai', 'human', 'ai', 'human', 'ai'];
  for (let i = 0; i < guesses.length; i += 1) {
    await page.locator(`button[data-index="${i}"][data-guess="${guesses[i]}"]`).click();
  }
  await expect(page.locator('#resultsPanel')).toBeVisible();
}

test.describe('Spot the Bot — Daily challenge', () => {
  test('page loads with title and hero copy', async ({ page }) => {
    await openGame(page);
    await expect(page).toHaveTitle(/Spot the Bot/i);
    await expect(page.locator('h1')).toHaveText(/Spot the Bot/i);
    await expect(page.locator('#dayLabel')).toContainText('Day');
  });

  test('shows all 5 daily text samples', async ({ page }) => {
    await openGame(page);
    await expect(page.locator('.sample-card')).toHaveCount(5);
  });

  test('every sample has AI and Human buttons', async ({ page }) => {
    await openGame(page);
    await expect(page.locator('.guess-btn[data-guess="ai"]')).toHaveCount(5);
    await expect(page.locator('.guess-btn[data-guess="human"]')).toHaveCount(5);
  });

  test('clicking a guess updates progress', async ({ page }) => {
    await openGame(page);
    await page.locator('button[data-index="0"][data-guess="ai"]').click();
    await expect(page.locator('#progressText')).toHaveText(/1\/5 guessed/i);
    await expect(page.locator('button[data-index="0"][data-guess="ai"]')).toBeDisabled();
  });

  test('results reveal after all 5 guesses', async ({ page }) => {
    await openGame(page);
    await solveChallenge(page);
    await expect(page.locator('#finalScore')).toContainText('/5 correct');
    await expect(page.locator('.sample-card.revealed')).toHaveCount(5);
  });

  test('reveal shows explanations and answer labels', async ({ page }) => {
    await openGame(page);
    await solveChallenge(page);
    await expect(page.locator('.explanation').first()).toBeVisible();
    await expect(page.locator('.answer-label').first()).toContainText(/Actually/i);
  });

  test('share button copies formatted result to clipboard', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedResult = text;
          }
        }
      });
    });
    await openGame(page);
    await solveChallenge(page);
    await page.locator('#shareButton').evaluate((el) => el.click());
    await expect(page.locator('#shareButton')).toContainText('Copied');
    const copied = await page.evaluate(() => window.__copiedResult || '');
    expect(copied).toMatch(/Spotted! Day \d+ 🔍/);
    expect(copied).toMatch(/[🤖🧠]{5}/u);
  });

  test('stats are tracked in localStorage after completion', async ({ page }) => {
    await openGame(page);
    await solveChallenge(page);
    const stats = await page.evaluate(() => ({
      stats: JSON.parse(localStorage.getItem('stb_stats') || '{}'),
      streak: localStorage.getItem('stb_streak'),
      lastDay: localStorage.getItem('stb_last_day'),
      dayKeys: Object.keys(localStorage).filter((key) => key.startsWith('stb_day_'))
    }));
    expect(stats.stats.totalPlayed).toBe(1);
    expect(Number(stats.streak)).toBeGreaterThanOrEqual(1);
    expect(stats.lastDay).not.toBeNull();
    expect(stats.dayKeys.length).toBe(1);
  });

  test('reloading restores the saved daily challenge state', async ({ page }) => {
    await openGame(page);
    await solveChallenge(page);
    const originalScore = await page.locator('#finalScore').textContent();
    await page.reload();
    await expect(page.locator('#resultsPanel')).toBeVisible();
    await expect(page.locator('#finalScore')).toHaveText(originalScore || '');
    await expect(page.locator('.sample-card.revealed')).toHaveCount(5);
  });

  test('sound toggle updates persisted preference', async ({ page }) => {
    await openGame(page);
    const toggle = page.locator('#soundToggle');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.evaluate((el) => el.click());
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    const stored = await page.evaluate(() => localStorage.getItem('stb_sound'));
    expect(stored).toBe('off');
  });

  test('back link works', async ({ page }) => {
    await openGame(page);
    await Promise.all([
      page.waitForURL(/\/index\.html$|\/$/),
      page.locator('#backLink').evaluate((el) => el.click())
    ]);
    await expect(page).toHaveURL(/\/index\.html$|\/$/);
    await expect(page).toHaveTitle(/Free Web Games/i);
  });

  test('GameMonetize SDK config and script tag exist', async ({ page }) => {
    await openGame(page);
    const config = await page.evaluate(() => ({
      gameId: window.SDK_OPTIONS && window.SDK_OPTIONS.gameId,
      hasHandler: typeof (window.SDK_OPTIONS && window.SDK_OPTIONS.onEvent) === 'function'
    }));
    expect(config.gameId).toBe('sb_spot_the_bot_01');
    expect(config.hasHandler).toBe(true);
    await expect(page.locator('#gamemonetize-sdk')).toHaveCount(1);
  });

  test('ad-ready fallback flips within 6 seconds', async ({ page }) => {
    await openGame(page);
    await page.waitForFunction(() => window.__adReady === true, { timeout: 6000 });
    const ready = await page.evaluate(() => window.__adReady);
    expect(ready).toBe(true);
  });

  test('mobile viewport keeps the layout usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGame(page);
    await expect(page.locator('.sample-card')).toHaveCount(5);
    const firstCard = await page.locator('.sample-card').first().boundingBox();
    expect(firstCard.width).toBeLessThanOrEqual(390);
  });
});
