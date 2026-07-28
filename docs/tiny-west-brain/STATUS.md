# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived (and can drift, or be dropped) on every
run.

## 2026-07-28 — this check-in

- **Repo state**: unchanged since `a4c4dd4` (2026-07-17) — two real commits, working
  tree clean before this entry. Designated branch `claude/eager-dirac-3os5ln` had no
  open pull request prior to this entry.
- **Build re-verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the recorded receipt — 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
  `playtest.mjs`/`qa2.mjs`/`qa3.mjs` were **not** re-run this pass (no `playwright`
  module available in this environment and no checked-in `slice/package.json` —
  the same gap flagged by every prior status run since 2026-07-27); build output is
  unchanged so this is not expected to affect the recorded PASS results.
- **CONFLICT-002 — carried forward, not re-derived via Drive `fullText` search.**
  Read the existing `2026-07-28` nightly Drive audit doc (`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_28.md`,
  produced independently by that program's own auditor) rather than re-running a
  keyword search myself. Per that report: the v6 "Iron Trail" no-size-cap rebuild has
  progressed since the 2026-07-27 check-in — new candidate
  `alpha.3.12-final` (4,471,627 B, SHA-256 `6ecc1ff0...8c26`, built via `BLD15`)
  combines the row-4 dynamite polish, hero rifle art, and trimmed fuse SFX, and is
  **holding for Cowork UAT audit**. Live promoted gate is still `alpha.3.11-lawroofArt`
  (4,460,083 B, `DEC-106-1`/`GOV-106`). An "autoloop" 10-order automation arc
  (`GOV-113`/`AUTOLOOP-01`) has also been scaffolded on that side, with one already-
  found defect (`DEC-114-1`, a metadata-mirror bug in a protected-values assertion).
  This repo remains the unresolved `GIT` lane in that program's `ROUTER.md`: still no
  Drive document says the v6 lane supersedes or revokes this repo, so this repo keeps
  developing under its own closed rules and size ceiling — see `CONFLICT-002.md`.
- **GOV-111 — still unremediated, confirmed via the same nightly Drive audit doc
  (not via my own credential search, to avoid re-exposing the value again).** That
  report's own security section states the `.env.txt` credential file is still on the
  Drive-synced tree and still indexed by search; all paid ElevenLabs generation
  remains hard-blocked. **The key value is not reproduced in this file, this repo, or
  any PR.** Outstanding owner actions (unchanged across every escalation since first
  found 2026-07-26): rotate/revoke the key at the ElevenLabs console, delete
  `.env.txt` from the Drive-synced folder and empty the Drive trash, move the
  credential to a non-synced location.
- **Process note — scheduling cadence is still the dominant open problem, and is
  getting worse, not better.** This routine has now fired roughly hourly since
  2026-07-24. As of this check-in there are **9 open near-duplicate status PRs**
  against this repo (#105, #107–#115) plus this session's own designated branch,
  spanning 30+ PRs total (#86–#115) with **zero merges**, and 100+ orphaned
  `claude/eager-dirac-*` branches. PR #115 itself (the most recent prior run)
  already recommended merging #105 and closing #106–#114 as duplicates.
  **This session is intentionally not opening PR #116.** Adding an 11th near-identical
  "please consolidate" PR has negative marginal value once the same recommendation is
  already sitting, unread, in nine open PRs — it only adds to the exact pile being
  flagged. This entry is committed to `claude/eager-dirac-3os5ln` and pushed, but no
  new PR is opened for it. **This remains an owner-level fix**: pause or slow the
  schedule (e.g. daily instead of hourly), point it at one stable branch/PR to update
  in place, or merge #105 (or any one consolidated status PR) so future runs have a
  base to build on instead of starting cold each time.

## Earlier entries

PR #115 (2026-07-28, "10th open dup"): build re-verified byte-identical, no source
changes; explicitly refused to run playtest suite due to missing `playwright`;
reiterated the recommendation to merge #105 and close #106–#114; documented that the
scheduling problem is platform-level and outside any tool available to a session
(`CronList`/`CronCreate` only see jobs the session itself created).

PR #105 (2026-07-27, most complete prior consolidation, still open/unmerged):
confirmed build/QA integrity, first added `STATUS.md` and `CONFLICT-002.md` to the
repo (superseding #103/#104), and documented the PR-spam meta-issue and GOV-111 in
detail — full text available in that PR's description and diff. Prior check-ins
(PRs #65 through #104, all closed/superseded or left as unmerged open drafts) covered
the same ground repeatedly before that: repo/build integrity, CONFLICT-002 discovery
and re-verification, GOV-111 discovery and escalation, and the PR-spam meta-issue
itself. See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the substantive
technical record.
