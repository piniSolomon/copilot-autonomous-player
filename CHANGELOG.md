# Changelog

## Template Version 1.0.0 — 2026-07-03

### Initial Release (Copilot CLI Adaptation)

- Adapted from Claude Code autonomous agents template v1.0.0
- Replaced Ralph Loop with continuous work loop
- Replaced cron with background agent timer pattern
- Replaced Telegram MCP with Discord bot (pending token)
- Replaced `wait_for_reply()` with `ask_user` (2min) → Discord fallback
- Replaced `--dangerously-skip-permissions` with `/autopilot` + `/allow-all`
- All MD-based memory, planning, and self-improvement systems preserved
