# CONFLICT-002 — this repo vs. the active "v6 no-size-cap rebuild" program

**Status: `NEEDS_DECISION` (owner-level), unresolved.**

## What this is

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a
second, far more active development program — "Tiny West: Iron Trail v6 no-size-cap
rebuild" — running entirely outside this repo, on a different toolchain (a
multi-lane pipeline coordinated via a `ROUTER.md` contract, with lanes `BLD`
game-build, `ART`, `SFX`/`VOX` audio, `DSN` design, `REV` review/audit, `SCB` registry
scribe, and a `GIT` lane pointed at this repo, plus a `GOV`-numbered governance/audit
thread and, as of late 2026-07-27, its own "autoloop" automation arc). It states the
inherited 1.2 MB artifact ceiling is revoked for that program.

Re-confirmed 2026-07-28 by reading that program's own independently-produced nightly
audit doc (`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_28.md`, executed 2026-07-28T06:03 UTC
by its "Gemini Spark" auditor) rather than by re-deriving from a live Drive search:

- **Live gate** (current promoted baseline): `alpha.3.11-lawroofArt`, 4,460,083 bytes,
  SHA-256 `da2300a3...b0` (`DEC-106-1`/`GOV-106`) — unchanged from 2026-07-27.
- **New evaluation candidate**: `alpha.3.12-final`, 4,471,627 bytes, SHA-256
  `6ecc1ff0...8c26` (built via `BLD15`, combining the ART-11 row-4 dynamite polish,
  ART-10 hero rifle art, and SFX-61 trimmed fuse loop). Staged in Drive root,
  **holding for Cowork UAT audit** — not yet promoted.
- Prior holding candidate `alpha.3.12-presentation` (4,461,370 B) passed its own
  34/34-gate Cowork audit (`GOV-112`) but was held for the row-4 respin folded into
  `alpha.3.12-final` above.
- **New this pass**: an "autoloop" 10-order automation arc (`GOV-113`/`AUTOLOOP-01`)
  has been scaffolded at that program's project root. Its first executed order
  surfaced a real defect (`DEC-114-1`): a protected-values gate assertion reads a
  frozen metadata object literal instead of live constants — flagged there as a
  mirror-integrity bug to fix in a future QA-harness generalization, not something
  actioned in this repo.
- The v6 program's `ROUTER.md` still registers this repo as the **`GIT` lane** with
  two pending owner calls: whether `khuffsphone/tinywest` is **canonical or frozen**,
  and **this scheduled task's own PR/branch backlog** (documented in `STATUS.md`).
- This repo's `CLAUDE.md`/`CONSTANTS.md` still state a `< 1.2 MB preferred` /
  `2.5 MB hard` offline-HTML ceiling as closed/binding and make no mention of the v6
  program. No Drive document says the v6 lane supersedes or revokes this repo — the
  operative scope stays: this repo is not overridden, but it is also not confirmed
  current with the v6 lane's output.

## What this means for this repo

- **No code, canon, or protected constant has been changed in response to this.** Per
  `CLAUDE.md`'s "never silently merge, report conflicts" rule, this is a report, not
  a resolution.
- `slice/dist/tiny-west.html` (106,552 B, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`) remains this
  repo's current build, rebuilt and re-verified byte-identical this run, unchanged
  since 2026-07-17.
- Until ruled, this repo keeps developing (if at all) under its existing closed rules
  and size ceiling.

## Provenance note

First surfaced by an earlier scheduled run (PR #87), re-confirmed and refined by
PRs #102 and #103, re-confirmed again by PR #104 (build/QA only — that run did not
re-check Drive), and re-confirmed live once more by PR #105 directly against Drive.
This entry (2026-07-28) re-confirms via that program's own nightly audit document
rather than a fresh keyword search. None of the prior status PRs (#65–#115) have
merged (see `STATUS.md`), so PR descriptions are not a durable record; this file and
`STATUS.md` are the intended durable one, once merged.
