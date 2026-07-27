# CONFLICT-002 — this repo vs. the active "v6 no-size-cap rebuild" program

**Status: `NEEDS_DECISION` (owner-level), unresolved.**

## What this is

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a
second, far more active development program — "Tiny West: Iron Trail v6 no-size-cap
rebuild" — running entirely outside this repo, on a different toolchain (a
multi-lane pipeline coordinated via a `ROUTER.md` contract, with lanes `BLD`
game-build, `ART`, `SFX`/`VOX` audio, `DSN` design, `REV` review/audit, `SCB` registry
scribe, and a newly-registered `GIT` lane pointed at this repo). It states the
inherited 1.2 MB artifact ceiling is revoked for that program.

Independently re-confirmed live against Drive on 2026-07-27 (this run):

- **Live gate**: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`,
  4,460,083 bytes, SHA-256 `da2300a3532152791ee1335e861c15dcbc804547e4b0ce03a9987702ab38c2b0`
  (`DEC-106-1`/`GOV-106`).
- **Holding candidate**: `alpha.3.12-presentation`, 4,461,370 bytes, SHA-256
  `33667491b1e17c211e2ef76d9816bcfc0f007e853df97913833d5ad1f6656079`. Passed 34/34
  Playwright gates (`BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md`) but is **held for one
  respin** (`alpha.3.12-final`) to fold in the newly-accepted `ART-11` row-4 dynamite
  art before it becomes the new gate.
- **Registry reconciliation**: `DOC_ID_REGISTRY.json` was reconciled 2026-07-26
  (`SCB-01`), adding 89 entries and registering `DSN`/`REV`/`SCB`/`GIT`/`GPT`
  namespaces. Next free IDs as of this run: GOV 113 · BLD 15 · DSN 23 · SFX 63 ·
  ART 12 · GPT 2.
- Nightly Brain health audits (`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_2{4,5,6,7}.md`)
  confirm 5/5 protected baseline hashes verified byte-untouched and the workspace
  "HEALTHY / SYNCHRONIZED" apart from the credential exposure in GOV-111 (see
  `STATUS.md`).
- The v6 program's `ROUTER.md` explicitly registers this repo as the **`GIT` lane**
  and records two pending owner calls against it: whether `khuffsphone/tinywest` is
  **canonical or frozen**, and **the hourly scheduled task's PR/branch backlog**
  (see `STATUS.md` — this is the same meta-issue as the PR-spam problem documented
  there, now visible to the v6 program's own governance log too).
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
PR #102, and re-confirmed live again by this run directly against Drive (`ROUTER.md`,
`DOC_ID_REGISTRY.json`, and the 2026-07-27 nightly health report) rather than trusting
prior PR text — none of those PRs merged (see `STATUS.md`), so PR descriptions are not
a durable record; this file and `STATUS.md` are the intended durable one, once merged.
