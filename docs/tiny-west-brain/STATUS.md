# STATUS — 2026-07-31 scheduled check-in

## Slice build/test re-verification

- Rebuilt `slice/dist/tiny-west.html` from source (`node slice/tools/build.mjs`):
  byte-identical to the 2026-07-17 build receipt — 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`
  (see `BUILD_RECEIPT_SLICE.md`).
- Full suite reran and passed: `playtest.mjs` (smoke, determinism check —
  identical trace hashes, natural keyboard run to CLEAN GETAWAY, $269 banked),
  `qa2.mjs` (pay-car branch, touch input/determinism, four viewports, 20 reset
  cycles), `qa3.mjs` (pay-car route reachable + completable, $839 banked, 0
  errors). Zero console errors across all three. No source changes since
  commit `a4c4dd4` (2026-07-17).
- Environment note (repeats prior runs): this container had no `node_modules`
  and no committed `package.json`/lockfile, so `playwright` needed a fresh
  `npm install` before the suite would run. Still worth committing a
  `package.json` + lockfile so this doesn't depend on network access each run.

## Open issues carried forward (owner action needed) — UNCHANGED, STILL OPEN

1. **Scheduled task is still producing duplicate branches/PRs with no
   consolidation, and the backlog has grown.** As of this run there are
   **30 open draft PRs** (#111–#140) against `claude/sunset-riders-clone-lyyefk`,
   every one titled a variant of "status check-in," spanning 2026-07-28 through
   2026-07-30, none merged. This is the same problem first flagged in PR #105
   (2026-07-27) and repeated in essentially every PR since — the recommendation
   ("merge one, close the rest, fix the schedule") keeps being restated because
   each scheduled run starts from a fresh, memoryless branch with no way to
   check whether a prior run's recommendation was acted on. It has not been.
   **This needs an owner-level fix, not another automated PR**: slow the
   schedule (e.g. daily instead of near-hourly), point it at one stable
   branch/PR to update in place instead of branching fresh every run, or
   merge/close the existing backlog so future runs have a clean baseline.
   This run deliberately does **not** attempt to merge or close any of the
   other 30 PRs unilaterally — that's a call for the owner, since it means
   discarding 29 near-duplicate branches' worth of history.
2. **GOV-111 — unremediated credential exposure, still unconfirmed as fixed.**
   First reported in PR #105 (2026-07-27): a direct Drive keyword search
   surfaced the literal value of an `ELEVENLABS_API_KEY=...` line in a search
   snippet from a Drive-synced `.env.txt`. The key itself is not reproduced in
   this repo or in this file. This run did not re-run that Drive search (to
   avoid re-exposing the value again in a transcript) and has no way to verify
   remediation from repo state alone. Carrying this forward as still open
   since there is no evidence anywhere in this repo that it was rotated or
   removed. **Owner action still needed**: rotate/revoke the key at the
   ElevenLabs console, delete the exposed file from the Drive-synced folder,
   empty the Drive trash, and move any credentials to a non-synced location.
   Until this clears, paid ElevenLabs generation should stay blocked per the
   Brain's own governance notes.

## Otherwise

No gameplay/engine changes this run. `CANON_BUILD_DELTA` and `NEEDS_DECISION`
items are unchanged from `RECONCILIATION.md`. CONFLICT-001 ruling (rampage-first
player-facing language, Iron Trail mechanics preserved) remains in force and
unaffected by this check-in.
