# Status log — Tiny West

## 2026-07-28 (second check-in this day) — no drift; scheduling problem now the primary issue

Scheduled status check-in. No gameplay/engine code changed.

- Rebuilt `slice/dist/tiny-west.html` from source: byte-identical to the 2026-07-17
  build receipt (106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`).
- Ran the full suite via a temporary (uncommitted) symlink from `slice/node_modules`
  into the global Playwright install (no `slice/package.json` is checked in yet —
  same gap noted in the prior run):
  - `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every
    prior run including today's earlier check-in), natural keyboard run to
    CLEAN GETAWAY, 0 page errors.
  - `qa2.mjs` — pay-car route, touch input, four viewports, 20 reset cycles: all PASS.
  - `qa3.mjs` — pay-car route reachability + completion: PASS.
- No regression across 11+ days of checks (first verified 2026-07-17, unbroken since).

### Carried forward, not independently re-checked this pass

- **GOV-111** — an earlier run reported a live `ELEVENLABS_API_KEY` value surfaced in
  a Drive keyword-search snippet (key value never reproduced in this repo). Treat as
  **unremediated** until the owner confirms the key was rotated/revoked and the
  exposed file removed from the Drive-synced folder (including emptying trash).
- **CONFLICT-002** — a parallel external "Iron Trail v6 no-size-cap rebuild" program
  was reported running against the Brain outside this repo. Which program/repo is
  canonical is an owner-level `NEEDS_DECISION`, unresolved.
- **Missing `slice/package.json`** — `slice/tools/*.mjs` require Playwright but no
  version is pinned in-repo; every run improvises a local install/symlink. Low risk
  but should be fixed once, not re-discovered every check-in.

### The actual finding this run: the schedule itself, not the slice

The slice has been stable for 11+ days. What has *not* been stable is the automation
running this check-in. As of this run:

- The scheduled task has fired roughly hourly since 2026-07-24 (4+ days), each time
  from a **fresh, memoryless branch** with no access to any prior run's state.
- That has produced **6 open draft PRs** (#105, #107, #108, #109, #110, #111) plus
  **25 already-closed duplicates** (#76–#104, excluding #105) — all titled some
  variant of "status check-in," all reporting essentially the same no-drift result,
  **zero merged**.
- Because nothing ever merges, `STATUS.md` and `CONFLICT-002.md` have been written
  and then orphaned on an unmerged branch upward of 30 times. GOV-111 was itself
  dropped once already (reported in #103/#105, silently absent from the very next
  run, #104) simply because the branch carrying it was never merged and the next
  run had no way to know it existed.
- This run does not open a 7th open PR. It pushes `docs/tiny-west-brain/STATUS.md`
  to `claude/eager-dirac-0p6uv1` and opens the required PR per repo convention, but
  the PR explicitly recommends **not merging it** — merge **#105** (the most complete
  consolidated status PR, 2026-07-27) instead, and close the other five as
  duplicates. Nothing about the checked-in game code needs owner attention; the
  schedule cadence does.

## 2026-07-17 — initial slice build

See `BUILD_RECEIPT_SLICE.md` for the original build receipt and adversarial-review
evidence (46 agents, 17 confirmed findings, all fixed and re-verified).
