# Goal: Build web games that earn the first dollar

## User Request

Create a game and profit money from it. The goal is to make the first dollar.
It can be multiple games. We are not a well-known company for gaming.
All tools and platforms must be free/freemium.

## Refined Goal

Build and deploy one or more web-based casual games (HTML5/JS) that generate
ad revenue. The games must be playable, fun, and deployed to platforms where
they can reach players organically. Monetization is via game ad networks.
The measurable success criterion is earning at least $1 in total ad revenue
across all games. Multiple small games increase surface area for discovery.

## Acceptance Criteria

- [ ] At least 2 playable web games built (HTML5/JS, no framework dependencies)
- [ ] Each game has a complete gameplay loop (start → play → win/lose → replay)
- [ ] Games deployed to itch.io (for discoverability)
- [ ] Games also deployed to own hosting with ads integrated (GitHub Pages or Vercel)
- [ ] Ad integration working (GameMonetize, Google AdSense, or similar free ad network)
- [ ] E2E tests passing for each game (Playwright)
- [ ] Each game has basic SEO (title, description, OG tags, screenshot)
- [ ] Games are mobile-responsive (most web game traffic is mobile)

## Scope Boundaries

**In scope:**
- Building 2-3 casual web games (e.g., idle/clicker, endless runner, puzzle)
- Deploying to itch.io and a custom hosted site
- Integrating a game ad network (pre-roll, interstitial, or rewarded ads)
- Basic SEO and social sharing meta tags
- E2E testing with Playwright
- Mobile-responsive design

**Out of scope:**
- Backend/server infrastructure (all games are client-side only)
- In-app purchases or payment processing
- Native mobile apps
- Multiplayer/networking
- Paid advertising/marketing budget
- Steam or console deployment

## Applicable Project Conventions

**Quality gate command:**
- `npx playwright test` (E2E tests)

**Commit convention:**
- Conventional commits with role markers: `type(scope): [B/I] description`
- Assisted-by trailer required: `Assisted-by: Claude:Sonnet-4.6`

**Guidelines:**
- Pure HTML/CSS/JS (no build step, no framework dependencies)
- Zero upfront cost — free hosting and tools only
- Each game in its own directory under `games/`
- Mobile-first responsive design

**Rules:**
- Test every feature with E2E tests before marking done
- Commit after each complete feature
- Update progress/YYYY-MM-DD.md after milestones
