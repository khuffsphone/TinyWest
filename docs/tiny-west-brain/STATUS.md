# Tiny West — running status log

Newest entry first. This file exists to break a pattern this scheduled check-in has
repeatedly documented: it runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived — and can drift, or be silently dropped —
on every run. See "Process note" below for the current severity of that problem.

## 2026-07-30 ~05:xx UTC

- **Repo/code state: unchanged, healthy.** Two real commits since inception
  (`cfb0034` tribute, `a4c4dd4` slice), working tree clean. `slice/dist/tiny-west.html`
  rebuilds byte-identical from source — 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` — unchanged since
  the 2026-07-17 build receipt. Full local QA suite re-run fresh this pass
  (`playtest.mjs`, `qa2.mjs`, `qa3.mjs`): smoke checks, `runDeterminismCheck` (identical
  hashes across two seeds), natural keyboard run to RESULTS, Pay Car route (fork →
  paycar → escape, $839 banked), touch pads, four viewports (no overflow), 20 reset
  cycles — all **PASS**, zero page errors. Playwright is not vendored in this repo; ran
  via a throwaway install symlinked into `slice/node_modules` and removed after —
  nothing checked in. `index.html` (protected Sunset Riders tribute) confirmed
  unmodified.

- **GOV-111 credential exposure — independently re-checked against Drive, status
  improved but not confirmed closed.** Recap: an `ELEVENLABS_API_KEY` value was found
  exposed via an ordinary Drive keyword search in a `.env` file at
  `G:\My Drive\tiny west\.env` (~2026-07-19). The owner rotated the key (~07-26), but a
  new 70-byte `.env.txt` reappeared in the same Drive-synced folder the same day, so the
  Brain's own governance note (`111_CREDENTIAL_ROTATION_PARTIAL_LIFT_AND_LANE_KICKOFF.md`)
  kept VOX/voice generation **hard-blocked** pending confirmation the file held no live
  credential. As of PR #105 (2026-07-27) it was "still present and still indexed."
  **This run (2026-07-30):** a fresh Drive search — by exact title (`.env`), by
  substring (`env.txt`), and by full-text (`ELEVENLABS_API_KEY`) — found **no such file**
  anywhere in Drive, including the "tiny west" project root and the Brain governance
  subfolder. This is encouraging but **not proof of remediation** — search-index
  absence doesn't rule out a renamed file, a copy in Drive trash, or an indexing lag.
  No key value was read or reproduced at any point (per standing guardrail: no lane
  opens, moves, or echoes a credential file). **Owner action still needed:** confirm
  at the ElevenLabs console that the *previous* key is revoked (not merely superseded),
  confirm Drive trash is empty, and confirm no credential file remains anywhere in the
  synced "tiny west" tree — then the VOX block can be formally lifted.

- **CONFLICT-002 (this repo vs. the "Iron Trail v6 no-size-cap rebuild" program) —
  still open, independently re-confirmed.** The canonical Brain folder (the same one
  this repo's `CLAUDE.md` points to, `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a
  subfolder, `41_CLAUDE_A3_0_1_INDEPENDENT_UAT_VERDICT`, hosting a much more active,
  separate development program: a multi-lane pipeline (`BLD`/`ART`/`SFX`/`DSN`/`REV`/
  `SCB`, coordinated via its own `ROUTER.md`) building multi-megabyte HTML artifacts
  well past this repo's `< 1.2 MB preferred / 2.5 MB hard` ceiling. This subfolder and
  its ~20+ numbered `GOV-*`/dispatch notes are **not** in this repo's local
  `docs/tiny-west-brain/` index, which only mirrors the 18 documents from the two
  2026-07-17 handoff sets. **New this run:** the v6 program's project root now holds
  `Tiny-West-Iron-Trail-v6.0.0-alpha.3.12-final.html` (4,471,627 B, created
  2026-07-27T19:40 UTC) — a later build than the `alpha.3.12-presentation` candidate
  (4,461,370 B) that PR #105 reported as "held for one respin" earlier that same day, so
  that gate has since advanced. That program's router still lists this repo
  (`khuffsphone/tinywest`) as an unresolved `GIT` lane — whether it is canonical or
  frozen remains owner-level `NEEDS_DECISION`. Per `CLAUDE.md`'s "never silently merge,
  report conflicts" rule: **no code, canon, or protected constant in this repo has been
  changed in response.** This is a report, not a resolution.

- **Process note — the scheduling cadence is now the dominant open problem, and it is
  actively destroying information, not just producing noise.** This routine has fired
  roughly hourly since 2026-07-24 (six days). As of this run there are **24 open,
  unmerged, draft "status check-in" PRs** (#105 through #129, plus earlier ones already
  closed/superseded) and **100+ orphaned `claude/eager-dirac-*` branches**, with **zero
  merges** to the actual target branch across all of them. Concretely this run: the
  immediately-prior check-in, PR #129 (opened ~04:23 UTC, less than an hour before this
  one), rebuilt and re-tested the slice but **did not mention GOV-111 or CONFLICT-002 at
  all** — a live repeat of the exact "memoryless branch" failure PR #105 flagged three
  days ago, where a fresh, context-less run silently drops findings a prior run had
  already surfaced. **This is an owner-level fix, not something a future scheduled run
  can solve alone:** slow the cadence (e.g. daily, not hourly), point the schedule at one
  stable branch/PR to update in place instead of a fresh branch each time, and merge one
  consolidated status PR (this one, or #105) so the next run has something real in the
  repo to build on rather than re-deriving — or losing — findings from scratch every
  time.

## Earlier entries (condensed)

- **PR #129** (2026-07-30 ~04:23 UTC): build/QA-only re-verification, byte-identical
  rebuild, full suite green. Did not check Drive; did not carry forward GOV-111 or
  CONFLICT-002.
- **PR #105** (2026-07-27, supersedes #103/#104): first added `STATUS.md` and
  `CONFLICT-002.md` (unmerged — this file recreates that record, since nothing from
  #105 ever landed in the repo). Re-confirmed GOV-111 live against Drive; documented
  the PR-spam meta-issue in detail.
- **PRs #65–#128**: repeated re-verification of the same build/QA integrity, repeated
  (re)discovery of CONFLICT-002 and GOV-111, and repeated flagging of the scheduling
  meta-issue itself — see `BUILD_RECEIPT_SLICE.md` and `RECONCILIATION.md` for the
  substantive technical record, and the PR list on GitHub for the full duplicate
  backlog.
