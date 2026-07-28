# CONFLICT-002 — this repo vs. the active "v6 no-size-cap rebuild" program

**Status: `NEEDS_DECISION` (owner-level), unresolved.**

## What this is

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a
second, far more active development program — "Tiny West: Iron Trail v6 no-size-cap
rebuild" — running entirely outside this repo, on a different toolchain (a
multi-lane pipeline coordinated via a `ROUTER.md` contract, with lanes `BLD`
game-build, `ART`, `SFX`/`VOX` audio, `DSN` design, `REV` review/audit, `SCB` registry
scribe, and a `GIT` lane pointed at this repo). It states the inherited 1.2 MB
artifact ceiling is revoked for that program.

Last confirmed live against Drive on 2026-07-27 (PR #105, via direct Drive search).
Not independently re-checked in this 2026-07-28 pass — figures below are carried
forward, not re-verified today.

- **Latest audited note (as of 2026-07-27)**:
  `112_COWORK_AUDIT_ALPHA312_ART11_SFX62_DSN21-22_AND_DISPATCH.md`
  (2026-07-26T18:44–18:47Z, `GOV-112`). An independent Cowork audit re-derived every
  load-bearing hash itself (candidate, art sheet, canonical source) and confirmed all
  of them. Verdict: 34/34 gates pass, tick-parity clean, but the gate was **held for
  one respin** (`alpha.3.12-final`) to fold in newly-accepted `ART-11` row-4 dynamite
  art rather than spend a second gate-advance on it later (`DEC-112-1`).
- **Holding candidate (as of 2026-07-27)**: `alpha.3.12-presentation`, 4,461,370
  bytes, SHA-256 `33667491b1e17c...6079`.
- **Live gate (as of 2026-07-27)**: `alpha.3.11-lawroofArt`, 4,460,083 bytes,
  SHA-256 `da2300a3...b0` (`DEC-106-1`/`GOV-106`).
- The v6 program's `ROUTER.md` registers this repo as the **`GIT` lane** and records
  two pending owner calls against it: whether `khuffsphone/tinywest` is **canonical
  or frozen**, and **this scheduled task's own PR/branch backlog** (same meta-issue
  documented in `STATUS.md`).
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
  repo's current build, rebuilt and re-verified byte-identical on 2026-07-28,
  unchanged since 2026-07-17.
- Until ruled, this repo keeps developing (if at all) under its existing closed rules
  and size ceiling.

## Provenance note

First surfaced by an earlier scheduled run (PR #87), re-confirmed and refined by
PRs #102 and #103, re-confirmed live once more by PR #105 (2026-07-27). None of the
prior status PRs (#65–#107) have merged (see `STATUS.md`), so PR descriptions are not
a durable record; this file and `STATUS.md` are the intended durable one, once merged.
