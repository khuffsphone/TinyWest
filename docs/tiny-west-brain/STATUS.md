# Status — 2026-07-31 scheduled check-in

Scheduled "status update, save to brain" run. No gameplay/engine changes; this is a
re-verification pass. Full context: `README.md`, `RECONCILIATION.md`,
`BUILD_RECEIPT_SLICE.md`.

## Build/QA re-verification

- `node slice/tools/build.mjs` — rebuild byte-identical to the 2026-07-17 receipt:
  106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- Unlike several recent runs, this run actually installed `playwright@1.56.1`
  (`npm install playwright@1.56.1 --no-save`; no committed `package.json` exists on
  this branch's base, so it is not persisted) and **ran the real suite**, not just
  cited the old receipt:
  - `playtest.mjs` — smoke, determinism (hashA==hashB), natural keyboard run to
    RESULTS ($269 banked): all PASS, 0 page errors.
  - `qa2.mjs` — pay-car branch, touch input + determinism, 4 viewports (no
    clipping/overflow), 20 reset cycles: all PASS, 0 errors.
  - `qa3.mjs` — pay-car route reachable via exact fork input and completable
    ($839 banked): PASS, 0 errors.
- No source drift: `game.js` / `atlas.gen.js` unchanged since `a4c4dd4` (2026-07-17).

## Open items carried forward (unresolved by owner)

1. **GOV-111 — unremediated credential exposure**, first reported PR #105
   (2026-07-27), reconfirmed as still open in PR #141 (2026-07-31 00:25 UTC): an
   `ELEVENLABS_API_KEY` value was surfaced directly in a Google Drive keyword-search
   snippet (Brain-adjacent Drive folder). **The key value is not reproduced here.**
   This run did **not** re-run that Drive search, to avoid re-exposing the value
   again — status is carried forward from #105/#141, not independently re-checked.
   Owner action needed: rotate/revoke the key at the ElevenLabs console, delete the
   exposed file from the Drive-synced folder, empty Drive trash, move any credential
   to a non-synced location.
2. **Scheduled-task branch/PR spam.** This routine has fired repeatedly (roughly
   hourly to every few hours) since at least 2026-07-24, each run starting from a
   fresh, memoryless branch (`claude/eager-dirac-*`) with no visibility into prior
   runs. As of this run there are **33 open, unmerged, draft "status check-in" PRs**
   (#105, #111–#141) against base branch `claude/sunset-riders-clone-lyyefk`
   (this repo's `HEAD`/default branch — there is no separate `main`), and zero have
   ever been merged. This run intentionally does not merge or close any of the other
   32 PRs — discarding 32 near-duplicate branches is an owner-level call, not one a
   scheduled run should make unilaterally. Recommended owner action: merge exactly
   one status PR (e.g. #105, the earliest with a still-accurate build receipt) as
   the new baseline, close the rest, and either slow the schedule's cadence or point
   it at one stable branch/PR to update in place so future runs stop re-deriving
   the same findings from scratch.

## Next milestone (unchanged)

Sprint 2 per `BUILD_RECEIPT_SLICE.md` — six-card encounter grammar, anti-repeat
selection, score economy, medals/contracts/seed codes — pending human playtest
gates and the owner's open `NEEDS_DECISION` items (final subtitle, 2D/3D pipeline,
canonical repo/branch, release target).
