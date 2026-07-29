# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: the
scheduled "status update" task runs on a fresh, memoryless `claude/eager-dirac-*`
branch each time, so anything not actually merged into the repo is re-derived (and
can drift, or be silently dropped) on every run. This is the first time this file
lands on `main` via a merge — every prior attempt to add it (PRs #101–#126) is still
sitting unmerged.

## 2026-07-29 ~23:2x UTC

**Build re-verified from source**: `node slice/tools/build.mjs` reproduces
`slice/dist/tiny-west.html` byte-identical to the 2026-07-17 receipt — 106,552 bytes,
SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. Working
tree was clean before this change; no source drift since commit `a4c4dd4`.

**Full local test suite re-run this pass, all green** (Playwright isn't vendored in
this repo; ran via a throwaway `node_modules/playwright` symlink to the environment's
global install, removed after — nothing checked in):
- `playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hash `911533983`, matches
  every prior check-in), natural keyboard run reaches RESULTS, $269 banked, 0 page
  errors.
- `qa2.mjs` — pay-car route $837 banked, touch pads functional, four viewports
  (1100×760 / 412×915 / 360×640 / 915×412) render with no overflow/clipping, 20 reset
  cycles clean.
- `qa3.mjs` — fork→pay-car exact-input route PASS, $839 banked.

No regressions. No gameplay/engine code changed this check-in.

**Repo hygiene — verified directly against GitHub this run, materially worse, not
independently re-escalated by notification.** As of this check-in: **22 open
near-duplicate "status check-in" draft PRs** (#105, #107–#127), zero merged since
2026-07-17, spanning 2026-07-27 through 2026-07-29 with the schedule firing roughly
every 1–3 hours. All 8 closed predecessors (#98–#104, #106) were self-closed as
superseded, never merged — so no prior finding in any of them is actually in `main`
until this PR. Root cause (reported since #114, unchanged): the scheduled task opens
a fresh branch every run, so "open a PR only if one doesn't already exist for this
branch" trivially always passes. A single unattended run cannot merge/close other
PRs or prune branches on its own initiative — that changes shared repo state and
prior careful runs correctly treated it as an owner-level call; this run does the
same. A push notification was sent this run (see below) because the backlog has now
gone three full days with zero owner engagement (no PR merged, closed, or commented
by the owner) and carries a live unremediated credential exposure alongside it —
that combination crosses the bar for a fresh alert even though the underlying facts
are individually already on record.

**GOV-111 — carried forward, not independently re-derived this run.** A prior
check-in (first surfaced 2026-07-26, PR #92; re-confirmed live 2026-07-27, PR #105)
reported an ElevenLabs API key exposed in plaintext via an ordinary Drive keyword
search snippet (`.env.txt`, Drive-synced "tiny west" root). This run did not repeat
that search — doing so would itself re-expose the value in this transcript. Assume
**unremediated** until an owner confirms rotation; three days elapsed with no visible
action.

**CONFLICT-002 — carried forward, not independently re-derived this run.** A prior
check-in (PR #105) reported a parallel external "Iron Trail v6 no-size-cap rebuild"
program running outside this repo on a different toolchain/pipeline, past this
repo's 1.2 MB offline-HTML ceiling, with its own `ROUTER.md` listing this repo as an
unresolved `GIT` lane. Owner-level `NEEDS_DECISION` on canonicality; no ruling since.
Full detail in the unmerged `CONFLICT-002.md` from PR #105 (not present on `main`
yet — this run did not recreate it, to avoid adding a third unverified copy; the
owner should pull it from #105 when consolidating).

**Recommendation to owner (unchanged across ~25 check-ins, restated because nothing
has been actioned in 3 days):**
1. Merge this PR (or any one status check-in PR) and close the rest of the
   `claude/eager-dirac-*` backlog; prune the branches.
2. Pause or slow the schedule driving this task — hourly is producing a duplicate
   almost every run with no code to review each time.
3. Rotate/revoke the ElevenLabs key referenced in GOV-111 and remove `.env.txt` from
   the Drive-synced folder (including Drive trash).
4. Rule on CONFLICT-002 canonicality (this repo vs. the external v6 program).

## Earlier entries

See the unmerged history in PRs #98–#126 for the full incremental record (repo/build
integrity checks, CONFLICT-002 discovery and re-verification, GOV-111 discovery and
escalation, and the PR-spam meta-issue itself). Superseded by this entry going
forward; future check-ins should append above this section rather than re-deriving
from PR text.
