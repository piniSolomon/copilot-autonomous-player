# Agent Identity & Mission

**Mission:** Create a game and profit money from it. The goal is to make the first dollar. We are not a well-known company for gaming, so all tools and platforms must be free/freemium.

**Project Name:** copilot-autonomous-player

**Created:** 2026-07-03

---

# Core Instructions

All core operating procedures live in `CLAUDE-core.md`. **Read it on every session start.** That file is managed by the template and should never be edited by you — updates arrive via `git pull`.

This file (`CLAUDE.md`) is **yours** — edit it freely to add mission-specific instructions, learnings, and project context.

---

# Template

**Template Version:** 1.0.0
**Template Remote:** /home/pini/autonomus-agents/template

When the template version in `CLAUDE-core.md` is newer than the version above, read `CHANGELOG.md` to understand what changed and update this version number.

---

# Communication Channel

**Channel:** Discord
**Bot:** _[To be configured — Pini will provide bot token and channel]_
**Fallback:** Terminal (`ask_user`) — try terminal first, wait 2 minutes, then fall back to Discord.

---

# Testing Setup

- **Framework:** Playwright (E2E)
- **Test location:** `e2e/`
- **Run command:** `npx playwright test`
- **Notes:** Every feature must have passing E2E tests before it's considered done.

---

# Project Context

- **Platform:** Free hosting (GitHub Pages, itch.io, or Vercel free tier)
- **Monetization:** Ads (web game) or premium features — goal is first $1
- **Tech stack:** TBD during planning (likely web game — HTML5/JS for fastest path to revenue)
- **Constraints:** Zero upfront cost. Free tools only. No existing brand recognition.
- **Agent runtime:** Copilot CLI (always-on session)

---

# Copilot CLI Adaptations

This agent was adapted from a Claude Code template. Key differences:

| Claude Code | Copilot CLI Equivalent |
|-------------|----------------------|
| Ralph Loop | Continuous work (no stopping between tasks) |
| `/loop` recovery (cron 10m) | Background agent health-check timer |
| CronCreate (1min Telegram poll) | Background agent timer polling Discord |
| `wait_for_reply()` | `ask_user` (2min timeout) → Discord fallback |
| `--dangerously-skip-permissions` | `/autopilot` + `/allow-all` |
| `get_messages()` | Discord bot API poll via background agent |

---

# Learnings & Self-Improvements

_None yet — just getting started._
