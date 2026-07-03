# 🎮 Free Web Games — copilot-autonomous-player

Two free HTML5 browser games with ad monetization, built to earn the first dollar.

**🌐 Live Site:** https://pinisolomon.github.io/copilot-autonomous-player/

---

## Games

| Game | Description | GitHub Pages | itch.io |
|------|-------------|--------------|---------|
| 🍪 Cookie Kingdom | Idle clicker — bake cookies, buy upgrades | [Play](https://pinisolomon.github.io/copilot-autonomous-player/games/cookie-kingdom/) | [Play on itch.io](https://coinempire-game.itch.io/cookie-kingdom) |
| ⚡ Dodge Rush | Endless obstacle dodge game | [Play](https://pinisolomon.github.io/copilot-autonomous-player/games/dodge-rush/) | [Play on itch.io](https://coinempire-game.itch.io/dodge-rush) |

---

## Architecture

- Pure HTML/CSS/JS — no build step, no framework
- Each game is a self-contained `index.html`
- Ad monetization via **GameMonetize SDK** (`api.gamemonetize.com/sdk.js`)
- GitHub Pages deployment via GitHub Actions

---

## Ad Integration

The games use [GameMonetize](https://gamemonetize.com) SDK:

- **Banner ads** — displayed at top/bottom of each page
- **Interstitial ads** — shown on Dodge Rush game over (via `sdk.showInterstitial()`)
- **Rewarded video ads** — Cookie Kingdom: 2× click power boost; Dodge Rush: extra life

The SDK is loaded asynchronously. If blocked by an ad blocker, a 4-second fallback sets `window.__adReady = true` so the game continues normally.

### To register your game on GameMonetize:
1. Sign up at https://gamemonetize.com
2. Submit your game (use the live GitHub Pages URL)
3. Once approved, the SDK automatically serves real ads (no code change needed)

---

## Deployment

### GitHub Pages (automatic)
Deploys automatically on every push to `main` via GitHub Actions.

Live URL: `https://pinisolomon.github.io/copilot-autonomous-player/`

### itch.io (live ✅)

Both games are published and playable on itch.io:
- **Cookie Kingdom**: https://coinempire-game.itch.io/cookie-kingdom (1200×800 embed)
- **Dodge Rush**: https://coinempire-game.itch.io/dodge-rush (480×600 embed)

Account: `coinempire-game` on itch.io
Game bundles in `tmp/itch-bundles/` (for re-uploading if needed)

---

## Development

```bash
# Install deps
npm install

# Serve locally
npm run serve       # http://localhost:3000

# Run E2E tests
npm test            # 51 Playwright tests
```

---

## Project Structure

```
├── index.html              # Landing page
├── games/
│   ├── cookie-kingdom/
│   │   ├── index.html      # Game (self-contained)
│   │   └── preview.png     # OG social preview image
│   └── dodge-rush/
│       ├── index.html      # Game (self-contained)
│       └── preview.png     # OG social preview image
├── assets/
│   └── og-image.png        # Landing page OG image
├── e2e/                    # Playwright tests
│   ├── landing.spec.js
│   ├── cookie-kingdom.spec.js
│   └── dodge-rush.spec.js
└── .github/workflows/
    └── deploy.yml          # CI/CD: test → deploy to Pages
```

---

*Goal: earn the first $1 in ad revenue. Built autonomously by GitHub Copilot.*
