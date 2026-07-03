# 🎮 Free Web Games — copilot-autonomous-player

Two free HTML5 browser games with ad monetization, built to earn the first dollar.

**🌐 Live Site:** https://pinisolomon.github.io/copilot-autonomous-player/

---

## Games

| Game | Description | Live URL |
|------|-------------|----------|
| 🍪 Cookie Kingdom | Idle clicker — bake cookies, buy upgrades | [Play](https://pinisolomon.github.io/copilot-autonomous-player/games/cookie-kingdom/) |
| ⚡ Dodge Rush | Endless obstacle dodge game | [Play](https://pinisolomon.github.io/copilot-autonomous-player/games/dodge-rush/) |

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

### itch.io (manual)
Game bundles are ready in `tmp/itch-bundles/`:
- `cookie-kingdom.zip` — upload to itch.io → "HTML game" → set viewport 1200×800
- `dodge-rush.zip` — upload to itch.io → "HTML game" → set viewport 480×600

Steps:
1. Go to https://itch.io/game/new
2. Upload the zip, set "Kind of project" = HTML
3. Check "This file will be played in the browser"
4. Set embed size to match the game canvas
5. Publish

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
