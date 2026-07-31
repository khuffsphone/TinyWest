# Tiny West — rolling status log

Single rolling log for scheduled check-ins on this repo, per the convention this
scheduled task converged on across `#105` and its ~35 duplicate PRs (2026-07-27
onward): commit findings here instead of opening another near-duplicate PR.

Newest entry first.

## 2026-07-31T15:xxZ — status check-in, no new PR opened (per established thread convention)

Fresh session, branch `claude/eager-dirac-jxh0nh`. Repo unchanged: two commits, clean
tree, no drift since `a4c4dd4` (2026-07-17, 14 days).

**Build/test — full local suite actually executed:**
- `node slice/tools/build.mjs` — `slice/dist/tiny-west.html` rebuilds byte-identical to
  the 2026-07-17 receipt: 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every prior
  run since 2026-07-17), natural keyboard run to RESULTS, $269 banked, 0 page errors.
- `qa2.mjs` — pay-car $837, touch determinism, 4 viewports (1100×760 / 412×915 /
  360×640 / 915×412) no clipping/overflow, 20 reset cycles: PASS.
- `qa3.mjs` — pay-car fork reachable via exact input and completable, $839 banked: PASS.

All green, no regressions.

**GOV-111 / DEC-112-4 (ElevenLabs credential exposure) — still unremediated, 5+ days
(07-26 → 07-31).** Not independently re-checked this pass (avoiding further exposure
risk per this thread's standing guidance). Last hard evidence: the 2026-07-28T08:23Z
check-in's independent full-scope Drive audit found `.env.txt` still present on the
Drive-synced tree after several title-only searches had wrongly suggested it was gone.
Treat as unremediated — all paid ElevenLabs generation stays hard-blocked — until the
owner confirms directly: key rotated + old key revoked, `.env.txt` deleted, Drive trash
emptied, credential relocated off any Drive-synced path.

**CONFLICT-002 (repo canonicity)** — unchanged, `NEEDS_DECISION`. Not independently
re-verified this pass. Per prior check-ins: an external "Iron Trail v6" Drive build
(~4.46–4.48 MB) is active and past this repo's `< 1.2 MB preferred` ceiling in
`CLAUDE.md` / `CONSTANTS.md`.

**PR backlog — 41 open, unmerged, draft duplicate "status check-in" PRs** (`#105`,
`#107`–`#146`) as of this run, zero merged, spanning 2026-07-27 through today, plus
150+ orphaned `claude/eager-dirac-*` branches. Not opening PR `#147` — filed this
entry to `STATUS.md` and as a comment on `#105` (the oldest open, test-green
consolidation) instead.

**Recommended owner action, unchanged from every prior check-in in this thread:**
1. Merge `#105` (test-green, oldest open consolidation) and close the ~40 other open
   duplicates; prune the orphaned branches.
2. Pause or slow the scheduled task's firing cadence (currently ~hourly since
   2026-07-24).
3. Confirm the ElevenLabs key rotation + `.env.txt` removal directly.
4. Rule on CONFLICT-002 / ADR-003 (repo canonicity) and the remaining CONFLICT-001
   `NEEDS_DECISION` items (final subtitle, 2D/3D pipeline).

See `#105` comment thread on GitHub (`khuffsphone/tinywest`) for the full history of
prior check-ins.
