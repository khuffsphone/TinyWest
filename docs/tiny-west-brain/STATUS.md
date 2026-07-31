# Tiny West — status log

Running log of scheduled status check-ins. Newest entry first. See `README.md` for
Brain authority/index and `BUILD_RECEIPT_SLICE.md` for the original slice build evidence.

## 2026-07-31 — build/QA re-verified, no drift; two unresolved process/security items

- Rebuilt `slice/dist/tiny-west.html` from source: byte-identical to the 2026-07-17
  build receipt (106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`).
- Reran the full local test suite (`playtest.mjs`, `qa2.mjs`, `qa3.mjs`): smoke,
  determinism (hash `911533983` both runs), natural keyboard run (269 banked, 0
  console errors), pay-car route reachability + completion (839 banked, Marshal
  fight resolved), touch input, all four target viewports, 20 reset cycles — all
  PASS, zero page errors. No engine/gameplay code was touched this run.
- **Unresolved — PR/branch spam (owner-level, not fixable from a session).** As of
  this run there are **37 open, unmerged, draft** `claude/eager-dirac-*` status-
  check-in PRs (#11, #105, #107–#141) opened between 2026-07-24 and 2026-07-31,
  each from a fresh, memoryless branch that cannot see prior runs' recommendations.
  This has been flagged in nearly every one of those PRs since #105 (2026-07-27).
  **This run deliberately does not open PR #142** to avoid extending the backlog
  further, and does not merge/close the existing 37 unilaterally since that
  discards branch history that belongs to the repo owner to triage. Needed:
  slow or pause the scheduled task, point it at one stable branch/PR to update in
  place instead of minting a new branch every run, and merge one consolidated
  status PR (or delete the backlog) so future runs have a clean baseline.
- **Unresolved — GOV-111, exposed credential.** An `ELEVENLABS_API_KEY` value was
  found live in a Drive search-result snippet (first reported PR #105,
  2026-07-27; reconfirmed as still unremediated through PR #141, 2026-07-31).
  Not reproduced in this repo. Owner action still needed: rotate/revoke the key
  at the ElevenLabs console, delete the exposed file from the Drive-synced
  folder, empty the Drive trash, move any credentials to a non-synced location.
  Per Brain governance notes, paid ElevenLabs generation stays hard-blocked
  until this clears.
- Gameplay/engine/Brain-canon status otherwise unchanged from `BUILD_RECEIPT_SLICE.md`
  and `RECONCILIATION.md`: CONFLICT-001 ruling in effect, Sprint 2 (six-card
  grammar, medals/contracts/seed codes) not yet started.
