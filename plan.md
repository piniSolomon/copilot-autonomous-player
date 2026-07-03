# Plan — Continuous Game Empire

## Mission
Build, improve, and promote web games for ad revenue. Never stop.

## Active Games (LIVE)
- 🍪 **Cookie Kingdom** — idle clicker | [itch.io](https://coinempire-game.itch.io/cookie-kingdom) | [GitHub Pages](https://pinisolomon.github.io/copilot-autonomous-player/games/cookie-kingdom/)
- ⚡ **Dodge Rush** — obstacle dodge | [itch.io](https://coinempire-game.itch.io/dodge-rush) | [GitHub Pages](https://pinisolomon.github.io/copilot-autonomous-player/games/dodge-rush/)

## In Progress
- [x] Fix GameMonetize SDK (updated to SDK_OPTIONS pattern — needs real gameId)
- [ ] **Merge Drop** — Suika-style drop & merge (BUILDING NOW)
- [ ] Register on GameMonetize → get real game IDs → ads start working
- [ ] Promote games on Reddit (r/WebGames, r/incremental_games, r/IndieGaming)

## Backlog
- [ ] Improve Cookie Kingdom: prestige system, achievements, offline progress
- [ ] Improve Dodge Rush: power-ups, leaderboard, difficulty curve, particles
- [ ] Submit games to CrazyGames & Poki
- [ ] Add Ko-fi/donation link as backup monetization
- [ ] Build more games: number merge, puzzle, tower defense
- [ ] Set up analytics (simple pageview counter)

## Blocked
- ⚠️ **Ads**: Need GameMonetize account credentials (asked Pini on Discord)

## Completed
- ✅ Cookie Kingdom built & deployed (itch.io + GitHub Pages)
- ✅ Dodge Rush built & deployed (itch.io + GitHub Pages)
- ✅ 51 E2E tests passing
- ✅ Landing page with SEO
- ✅ GameMonetize SDK integration (pattern fixed, awaiting real IDs)
- ✅ GitHub Actions CI/CD

## Learnings
- GameMonetize requires SDK_OPTIONS with gameId (not just initGmSdk callback)
- itch.io doesn't allow custom ads — only GameMonetize's platform or GitHub Pages
- Suika/merge games are viral — focus on this genre next
- E2E tests should run with --workers=1 to avoid port conflicts
