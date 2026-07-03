// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3123/games/memory-match/';

test.describe('Memory Match — Card Matching Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('page title is set', async ({ page }) => {
    await expect(page).toHaveTitle(/Memory Match/i);
  });

  test('board is visible with cards', async ({ page }) => {
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const cards = page.locator('#board .card');
    // Normal mode: 4x4 = 16 cards
    await expect(cards).toHaveCount(16);
  });

  test('clicking a card flips it', async ({ page }) => {
    const card = page.locator('#board .card').first();
    await card.click();
    // Card should have 'flipped' class after click
    await expect(card).toHaveClass(/flipped/);
  });

  test('mismatched cards flip back', async ({ page }) => {
    const cards = page.locator('#board .card');
    // Click first two cards
    await cards.nth(0).click();
    await cards.nth(1).click();
    // Wait for mismatch animation
    await page.waitForTimeout(1500);
    // If they are not a match, they should flip back (no 'matched' class)
    // At least one of them should not be flipped anymore (unless they happen to match)
    const firstFlipped = await cards.nth(0).evaluate(el => el.classList.contains('flipped'));
    const secondFlipped = await cards.nth(1).evaluate(el => el.classList.contains('flipped'));
    // If both still flipped, they matched; otherwise at least one flipped back
    if (firstFlipped && secondFlipped) {
      // They matched — both should have 'matched' class
      await expect(cards.nth(0)).toHaveClass(/matched/);
    } else {
      // Mismatch — both should have flipped back
      expect(firstFlipped).toBe(false);
      expect(secondFlipped).toBe(false);
    }
  });

  test('moves counter increments', async ({ page }) => {
    const movesEl = page.locator('#moves');
    const initialMoves = await movesEl.textContent();
    expect(initialMoves).toBe('0');
    // Click two cards to make a move
    const cards = page.locator('#board .card');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await page.waitForTimeout(200);
    const afterMoves = await movesEl.textContent();
    expect(parseInt(afterMoves)).toBeGreaterThanOrEqual(1);
  });

  test('timer element is present', async ({ page }) => {
    const timer = page.locator('#timer');
    await expect(timer).toBeVisible();
    const text = await timer.textContent();
    expect(text).toMatch(/\d{2}:\d{2}/);
  });

  test('difficulty buttons switch modes', async ({ page }) => {
    const board = page.locator('#board');
    // Switch to Easy (4x3 = 12 cards)
    await page.click('button[data-mode="easy"]');
    await page.waitForTimeout(500);
    const easyCards = page.locator('#board .card');
    await expect(easyCards).toHaveCount(12);
    await expect(board).toHaveAttribute('data-mode', 'easy');

    // Switch to Hard (6x4 = 24 cards)
    await page.click('button[data-mode="hard"]');
    await page.waitForTimeout(500);
    const hardCards = page.locator('#board .card');
    await expect(hardCards).toHaveCount(24);
    await expect(board).toHaveAttribute('data-mode', 'hard');
  });

  test('new game button resets the board', async ({ page }) => {
    // Make some moves
    const cards = page.locator('#board .card');
    await cards.nth(0).click();
    await cards.nth(1).click();
    await page.waitForTimeout(200);

    // Click new game
    await page.click('#new-game-btn');
    await page.waitForTimeout(500);

    // Moves should reset
    const moves = await page.locator('#moves').textContent();
    expect(moves).toBe('0');
    // Cards should be back (16 for normal)
    await expect(page.locator('#board .card')).toHaveCount(16);
  });

  test('star rating is displayed', async ({ page }) => {
    const stars = page.locator('#stars');
    await expect(stars).toBeVisible();
  });

  test('winning shows overlay', async ({ page }) => {
    // Switch to Easy mode for faster completion
    await page.click('button[data-mode="easy"]');
    await page.waitForTimeout(500);

    // Use JS to force-match all pairs programmatically
    await page.evaluate(() => {
      // Access the game's internal state to find matching pairs
      const cards = document.querySelectorAll('#board .card');
      // Gather emoji values from card-front spans
      const emojiMap = {};
      cards.forEach((card, i) => {
        const front = card.querySelector('.card-front');
        const emoji = front ? front.textContent.trim() : '';
        if (!emojiMap[emoji]) emojiMap[emoji] = [];
        emojiMap[emoji].push(i);
      });
      // Expose pairs for the test
      window.__testPairs = Object.values(emojiMap);
    });

    const pairs = await page.evaluate(() => window.__testPairs);

    // Click each pair
    for (const pair of pairs) {
      if (pair.length >= 2) {
        const cards = page.locator('#board .card');
        await cards.nth(pair[0]).click();
        await page.waitForTimeout(100);
        await cards.nth(pair[1]).click();
        await page.waitForTimeout(800);
      }
    }

    // Win overlay should appear
    const winOverlay = page.locator('#win-overlay');
    await expect(winOverlay).toBeVisible({ timeout: 5000 });
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
    const board = page.locator('#board');
    await expect(board).toBeVisible();
    const box = await board.boundingBox();
    expect(box.width).toBeLessThanOrEqual(380);
  });
});
