# Tiny West — rolling status log

Single rolling log for scheduled status check-ins (convention established across the
`#105`/`#144`/`#145`/`#146` PR thread — see `README.md`). Newest entry on top. This file
lives in-repo so each fresh, memoryless scheduled run has something to read instead of
re-deriving history from scratch.

## 2026-07-31 (this check-in) — no new PR, per established GOV-112 §10 convention

Fresh session, branch `claude/eager-dirac-py9jdp`. Repo unchanged: two commits, clean
tree, 14 days with no drift since `a4c4dd4` (2026-07-17).

**Build/test — full local suite actually executed, not just hash-compared:**
- `node slice/tools/build.mjs` — `slice/dist/tiny-west.html` rebuilds byte-identical to
  the 2026-07-17 receipt: 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every prior
  run since 2026-07-17), natural keyboard run to RESULTS, $269 banked, 0 page errors.
- `qa2.mjs` — pay-car $837, touch input + determinism, 4 viewports (1100×760/412×915/
  360×640/915×412) no clipping/overflow, 20 reset cycles: PASS.
- `qa3.mjs` — pay-car fork reachable via exact input and completable, $839 banked: PASS.

All green, no regressions.

**GOV-111 / DEC-112-4 (ElevenLabs credential exposure) — still treated as
unremediated, 5+ days (07-26 → 07-31).** Did not repeat any Drive credential search
this pass, per the standing guidance in this thread to avoid re-triggering exposure via
search-snippet content. The most recent hard evidence (2026-07-28T08:23Z independent
full-scope audit) found `.env.txt` still present on the Drive-synced tree after several
title-only searches had wrongly suggested it was gone — treat later "not found" results
as inconclusive, not remediation, until the owner confirms directly: key rotated +
revoked at the ElevenLabs console, `.env.txt` deleted, Drive trash emptied, credential
relocated off any Drive-synced path.

**CONFLICT-002** — unchanged, `NEEDS_DECISION` (external "Iron Trail v6" Drive build,
last seen ~4.46–4.48 MB, vs. this repo's `< 1.2 MB` ceiling in `CLAUDE.md`/
`CONSTANTS.md`). Not independently re-verified this pass.

**Process / backlog:** per the convention established across `#105` and dozens of
subsequent check-ins (GOV-112 §10: "do not open further duplicate PRs until the
cadence is resolved"), this run does **not** open a new PR. As of this run there are
**36 open, unmerged, draft "status check-in" PRs** (`#105`, `#107`–`#146`), zero
merged, spanning 2026-07-27 through today, plus 150+ orphaned `claude/eager-dirac-*`
branches. This check-in is committed to this file and posted as a comment on `#105`
(the oldest, test-green, ready-to-merge consolidation) instead.

**Recommended owner action, unchanged from every prior check-in in this thread:**
1. Merge `#105` and close the ~35 other open duplicates.
2. Pause or slow the scheduled task's firing cadence (currently ~hourly since
   2026-07-24; not adjustable or visible from inside any single run — confirmed again
   this pass via `CronList`, which returns no session-level jobs).
3. Confirm the ElevenLabs key rotation + `.env.txt` removal directly — not verifiable
   from inside this sandbox.
4. Rule on CONFLICT-002 / ADR-003 (repo canonicity vs. the external Iron Trail v6
   pipeline).

---

Prior entries: see PR `#105` comment thread
(https://github.com/khuffsphone/TinyWest/pull/105#issuecomment-5141863557 and earlier)
for the full day-by-day history from 2026-07-27 onward.
