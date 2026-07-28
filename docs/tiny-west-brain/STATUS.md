# Status — 2026-07-28

Scheduled status check-in on the Tiny West slice. No gameplay/engine code changed.

## Build & QA — PASS, no regressions

- `node slice/tools/build.mjs` — `slice/dist/tiny-west.html` rebuilt byte-identical
  to the 2026-07-17 build receipt: 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `node slice/tools/playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS
  (hash `911533983`, matches every prior run), natural keyboard run reaches
  RESULTS with $269 banked, 0 page errors.
- `node slice/tools/qa2.mjs` — touch pads render/start, 4 viewports
  (1100×760 / 412×915 / 360×640 / 915×412) no clipping/overflow, 20 reset
  cycles bounded, 0 errors.
- `node slice/tools/qa3.mjs` — pay-car fork reachable via exact injected
  input and completable, $839 banked (×1.5), 0 errors.
- Added `slice/package.json` pinning `playwright@1.56.1` (matches this
  environment's global install) with `build`/`playtest`/`qa2`/`qa3` npm
  scripts, so the suite is installable from a clean checkout instead of
  requiring a manual symlink into a global install — the gap every prior
  status run since 2026-07-24 has flagged.

No source drift since commit `a4c4dd4` (2026-07-17).

## Standing open items (carried forward, not independently re-derived)

- **GOV-111 — credential exposure.** Prior runs reported an
  `ELEVENLABS_API_KEY` value surfaced in a Google Drive keyword-search
  snippet (a synced `.env.txt`). Not re-checked this run — repeating the
  search would itself re-expose the value into a new transcript. Assume
  **unremediated** until the owner confirms the key was rotated at the
  ElevenLabs console, the file removed from the synced Drive folder, and
  the Drive trash emptied. All paid ElevenLabs generation stays hard-blocked
  until this clears.
- **CONFLICT-002 — external "Iron Trail v6" rebuild program.** A parallel
  build program (`alpha.3.x` gates, several MB, well past this repo's
  1.2 MB/2.5 MB slice ceiling) has reportedly been running outside this
  repo. Whether this repo or that program is canonical is owner-level
  `NEEDS_DECISION`; not re-verified this run.
- **CONFLICT-001** — unchanged; see `RECONCILIATION.md`. Rampage-first
  player language, Iron Trail mechanics, subtitle/pipeline still
  `NEEDS_DECISION`.

## Repo governance — needs owner action

This scheduled check-in has been firing roughly **hourly** since
2026-07-24, each run from a fresh, memoryless `claude/eager-dirac-*`
branch with no visibility into prior runs. As of this run:

- **11 open near-duplicate status-check-in PRs** exist (#105, #107–#116),
  all reporting the same no-drift result, **zero merged**, plus one
  unrelated stale draft (#11, 2026-07-22, GOV-77 juice candidate, also
  unmerged).
- **100+ orphaned `claude/eager-dirac-*` branches** on the remote.
- Because nothing merges, this file gets written and orphaned on a new
  branch every run, and findings can be silently dropped between runs if
  a given run doesn't happen to re-derive them.

Nothing inside a single scheduled run can change the firing cadence — that
is a platform-level schedule outside any tool available in-session. This
run did not merge or close any other PR itself (that changes shared repo
state and is an owner call). A direct notification was sent to the repo
owner about both the credential exposure and this PR/branch backlog, since
10+ prior status PRs recommending the same fix have not resulted in one
yet.

**Recommendation (unchanged): merge one consolidated status PR** — #116
is the most complete to date (adds `slice/package.json`, actually re-runs
the full suite) — **close the other open duplicates, prune the
accumulated branches, and pause or slow the schedule's firing cadence.**
Separately, confirm GOV-111 credential rotation.

See also: `BUILD_RECEIPT_SLICE.md` (original 2026-07-17 build + adversarial
review evidence), `RECONCILIATION.md` (CONFLICT-001 ruling), `CONSTANTS.md`
(protected tuning values).
