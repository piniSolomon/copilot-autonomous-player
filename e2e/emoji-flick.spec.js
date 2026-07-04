// @ts-check
const { test, expect } = require('@playwright/test');

const GAME_URL = '/games/emoji-flick/index.html';

async function openGame(page) {
  await page.goto(GAME_URL);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(() => Boolean(window.__emojiFlickDebug));
}

async function forcePuzzle(page, answer) {
  await page.evaluate((value) => window.__emojiFlickDebug.setPuzzleByAnswer(value), answer);
}

async function submitGuess(page, guess) {
  await page.locator('#guessInput').fill(guess);
  await page.locator('#submitGuess').click();
}

test.describe('EmojiFlick — Daily Pop Culture Emoji Puzzle', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('ef_')) {
          localStorage.removeItem(key);
        }
      }
      window.__lastShareText = '';
    });
    await openGame(page);
  });

  test('page loads with emoji puzzle displayed', async ({ page }) => {
    await expect(page).toHaveTitle(/EmojiFlick/i);
    const tokens = page.locator('#emojiDisplay .emoji-token');
    expect(await tokens.count()).toBeGreaterThanOrEqual(4);
  });

  test('category badge displays correctly', async ({ page }) => {
    const badge = page.locator('#categoryBadge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/Movie|TV Show|Song/);
  });

  test('can type a guess and submit', async ({ page }) => {
    await forcePuzzle(page, 'The Lion King');
    await submitGuess(page, 'Wrong answer');
    await expect(page.locator('#guessHistory .history-item')).toHaveCount(1);
    await expect(page.locator('#guessHistory')).toContainText('Wrong answer');
  });

  test('wrong guess reveals a hint letter', async ({ page }) => {
    await forcePuzzle(page, 'The Lion King');
    await submitGuess(page, 'No idea');
    await expect(page.locator('#hintLetters .hint-letter.revealed')).toHaveCount(1);
    await expect(page.locator('#hintLetters')).toContainText('T');
  });

  test('fuzzy matching accepts answer without article', async ({ page }) => {
    await forcePuzzle(page, 'The Lion King');
    await submitGuess(page, 'lion king');
    await expect(page.locator('#resultPanel')).toHaveClass(/show/);
    await expect(page.locator('#resultTitle')).toContainText('The Lion King');
  });

  test('correct guess shows celebration and stars', async ({ page }) => {
    await forcePuzzle(page, 'Frozen');
    await submitGuess(page, 'Frozen');
    await expect(page.locator('#starRating')).toContainText('⭐⭐⭐⭐⭐');
    expect(await page.locator('#confetti .confetti-piece').count()).toBeGreaterThan(0);
  });

  test('share button works', async ({ page }) => {
    await forcePuzzle(page, 'Frozen');
    await submitGuess(page, 'Frozen');
    await page.locator('#shareButton').click();
    await expect.poll(async () => page.evaluate(() => window.__lastShareText)).toContain('EmojiFlick Day');
    await expect.poll(async () => page.evaluate(() => window.__lastShareText)).toContain('Frozen');
  });

  test('stats tracked in localStorage', async ({ page }) => {
    await forcePuzzle(page, 'The Lion King');
    await submitGuess(page, 'Nope');
    await submitGuess(page, 'lion king');
    const stats = await page.evaluate(() => JSON.parse(localStorage.getItem('ef_stats') || '{}'));
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.distribution['2']).toBe(1);
    expect(await page.evaluate(() => localStorage.getItem('ef_streak'))).toBe('1');
  });

  test('sound toggle works', async ({ page }) => {
    const toggle = page.locator('#soundToggle');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => document.getElementById('soundToggle').click());
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(() => localStorage.getItem('ef_sound'))).toBe('off');
  });

  test('stats modal opens and shows streak', async ({ page }) => {
    await page.evaluate(() => document.getElementById('statsButton').click());
    await expect(page.locator('#statsModal')).toHaveClass(/show/);
    await expect(page.locator('#statsTitle')).toContainText('EmojiFlick Stats');
    await expect(page.locator('#statsStreak')).toContainText('0');
  });

  test('back link works', async ({ page }) => {
    const href = await page.locator('a.back-link').first().getAttribute('href');
    expect(href).toBe('../../index.html');
    await page.evaluate(() => {
      window.location.assign(document.querySelector('a.back-link').href);
    });
    await expect.poll(() => page.url()).toMatch(/\/(?:index\.html)?$/);
  });

  test('ad SDK loads with fallback timer', async ({ page }) => {
    await expect(page.locator('#gamemonetize-sdk')).toHaveCount(1);
    await page.waitForFunction(() => window.__adReady === true, { timeout: 6500 });
    const status = await page.locator('#adStatus').textContent();
    expect(status).toMatch(/SDK|fallback|timed out|unavailable/i);
  });

  test('mobile viewport remains usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.waitForFunction(() => Boolean(window.__emojiFlickDebug));
    const input = page.locator('#guessInput');
    await expect(input).toBeVisible();
    const box = await input.boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
  });
});
