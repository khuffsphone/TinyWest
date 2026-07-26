# CONFLICT-002 — repo Brain vs. canonical Drive Brain: v6 no-size-cap rebuild

Status: **open, unresolved, `NEEDS_DECISION` (owner-level)**. Reported (not resolved) here
per this repo's own CONFLICT-001 rule: "never silently merge the two sets; report conflicts."

## What was found

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a document
not previously inventoried in this repo's local mirror:

- `00_V6_START_HERE_CURRENT.md` (Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`), effective
  **2026-07-19**, status **CURRENT**.

That document explicitly **revokes the 1.2 MB artifact ceiling** that this repo's
`CLAUDE.md` and `CONSTANTS.md` still enforce as a closed rule ("File budget | < 1.2 MB
preferred, 2.5 MB hard"). It opens a **"Tiny West: Iron Trail v6 no-size-cap rebuild"**
program that is active and shipping:

- Current holding candidate: `v6.0.0-alpha.3.9-engineAudio.html`, ~4.3 MB, 39/39
  Playwright gates passing (per the Drive doc's own report).
- Lives entirely as **Drive artifacts**, on a branch (`v6/no-size-cap-rebuild`) that does
  **not exist** in `khuffsphone/tinywest`.
- Built/audited by a different toolchain than this git-based Claude Code lane: Google
  Flow/Gemini for audio, Claude Cowork for UAT, a separate "Gemini Spark" nightly auditor.

**No canon, code, or protected constant in this repo has been changed** in response to
this. This file only documents the divergence for an owner ruling.

## Open owner question

Is `khuffsphone/tinywest` still a canonical build target, or is it a frozen 2026-07-17
prototype the project has since moved past in favor of the v6 Drive pipeline?

- If **still canonical**: `CLAUDE.md` / `CONSTANTS.md` need the v6 charter reconciled in —
  as of this writing they enforce a byte ceiling the owner revoked 9 days ago (2026-07-19).
- If **meant to be frozen**: the hourly scheduled check-in routine against this repo is
  probably better turned off or repointed than left running (see process note below).

## Process note (secondary, non-blocking)

This scheduled routine has been firing roughly hourly against this repo since
2026-07-24, opening a new PR each run because each run lands on a fresh branch name
(`claude/eager-dirac-*`) with no PR pointing at it yet. As of this run: **30+ PRs opened,
0 merged, most closed unmerged, several still open** (#83–#87 at last count). Recommend
either lowering the schedule cadence, pointing it at a stable branch it can update in
place, or pausing it until the v6-authority question above is resolved — otherwise every
future run keeps enforcing the possibly-stale 1.2 MB rule against a Brain that no longer
says that.

## First reported

2026-07-26, PR #87, this repo. Carried forward unresolved by subsequent scheduled runs
until an owner ruling lands.
