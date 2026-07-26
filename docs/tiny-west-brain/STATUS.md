# Tiny West — status (2026-07-26, consolidated)

This file replaces the growing pile of dated, near-duplicate "status check-in" notes
that earlier scheduled runs were each committing to their own throwaway branch (see
**Process incident** below). Future scheduled status runs should overwrite this file
in place rather than adding a new dated file, unless the change is substantive.

## Repo state

- History: 2 commits (`cfb0034` tribute `index.html`, `a4c4dd4` the 42-second slice).
  Working tree clean.
- `node slice/tools/build.mjs` rebuild is **byte-identical** to the 2026-07-17 build
  receipt: `slice/dist/tiny-west.html`, 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
  No source has changed since that build; no regression risk.
- `tools/playtest.mjs` / `qa2.mjs` / `qa3.mjs` were not re-run this pass — this
  container has no `slice/node_modules` (no `package.json`/Playwright available here).
  Since no source changed, the last recorded green run
  (`docs/tiny-west-brain/BUILD_RECEIPT_SLICE.md`) still stands as current evidence.

## CONFLICT-002 (new — verified directly against the Drive Brain this pass)

Earlier scheduled runs reported, without independent verification, that Brain activity
had moved on from this repo's 2026-07-17 snapshot. This pass read the Drive Brain
folder directly and confirms it:

- A `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md` (Drive doc
  `1uCJsLUKVudJEdK0efnaYQpGQSfVyTPwl8Pz-7-X6ybk`, written 2026-07-26 06:15 UTC by an
  autonomous "Gemini Spark" auditor) shows an active **"Tiny West: Iron Trail v6
  no-size-cap rebuild"** program, run entirely outside this GitHub repo by a separate
  local "BLD" (Game-Build) Claude Code lane against the Drive Brain directly.
- Current **live gate target**: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`,
  4,460,083 bytes (DEC-106-1 / GOV-106).
- A newer candidate, `alpha.3.12-presentation.html`, 4,461,370 bytes, is staged in Drive
  root HOLDING for independent audit (receipt `BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md`,
  Drive doc `1-yZlNPTS3hId-808FBCcdSfQ5twFdSCW`; claims 34/34 Playwright acceptance
  gates PASS).
- That program's file-size ceiling has been raised well past this repo's binding rule
  (`< 1.2 MB preferred, 2.5 MB hard`, `CLAUDE.md` / `CONSTANTS.md`) — the live gate is
  ~3.7x this repo's hard cap.
- `NEEDS_DECISION` (owner-level, per this repo's own "never silently merge, report
  conflicts" rule): is `khuffsphone/tinywest` still the canonical repo for Tiny West, or
  is it a frozen 2026-07-17 prototype that the live project has since moved past? No
  code, canon, or protected constant in this repo was changed to chase the v6 line —
  doing so would silently pick a side of an owner-level conflict.
- Separately noted in the Brain (GOV-111): a recreated `.env.txt` in the Drive-synced
  project folder is blocking paid audio generation pending owner
  confirmation/relocation. Not inspected here (credential-adjacent, out of this
  routine's scope).

## Process incident: scheduled-status PR churn

This scheduled "give a status update" routine has been running frequently (roughly
hourly) since 2026-07-22, and **each run starts a brand-new session with no memory of
prior runs**, so each one creates its own branch, its own near-duplicate commit, and
(per the standing repo/harness instructions) its own draft PR.

As of this run: **97 such PRs have been opened, 0 merged, 95 already closed** (by the
owner, presumably during manual cleanup) and only 1 (`#95`) plus one unrelated feature
PR (`#11`, the v6 "game-feel juice" candidate) remain open.

This run intentionally **did not open PR #98**: `#95` already carries materially the
same "status check-in" payload for today, and opening another near-duplicate would
only add to the pile the owner has been manually clearing. This run's commit is pushed
to its own branch (`claude/eager-dirac-krqpfz`) so the update is durably saved, but no
new PR was raised for it.

**Recommendation:** either merge one status PR (this one's branch or `#95`) to actually
land a `STATUS.md` in the default branch so future runs have something to update in
place instead of re-deriving from scratch, or reduce/disable this schedule's cadence —
the underlying repo state changes far slower than hourly.
