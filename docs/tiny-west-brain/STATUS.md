# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo gets re-derived (and can drift or be silently dropped)
on every run. As of this entry, **none of the prior status PRs have merged**, so this
file itself is being re-added rather than appended to.

## 2026-07-28 (this run)

- **Repo state**: unchanged since commit `a4c4dd4` (2026-07-17) — two commits, working
  tree clean. Branch `claude/eager-dirac-q0khmu` (this check-in's designated branch)
  had no open pull request prior to this entry.
- **Build re-verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the 2026-07-17 receipt — 106,552
  bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
  No drift.
- **Full test suite re-run, all green** (Playwright not vendored in-repo; used via a
  throwaway symlink to the environment's global install, removed after the run —
  nothing checked in): `playtest.mjs` (smoke PASS, `runDeterminismCheck` PASS, hash
  `911533983` both seeds, natural keyboard run reaches RESULTS with $269 banked, 0
  page errors), `qa2.mjs` (pay-car route $837 banked, touch pads functional, four
  viewports render with no overflow, 20 reset cycles clean), `qa3.mjs` (fork→pay-car
  exact-input route PASS, $839 banked). All figures match the 2026-07-17 receipt and
  every subsequent re-verification (#105, #107) exactly — no regression across 11+
  days of repeated checks.
- **GOV-111 (exposed `ELEVENLABS_API_KEY` in Drive-synced `.env.txt`) — NOT
  independently re-checked this run.** Carried forward from #101–#107: reconfirmed as
  recently as the #105 check-in (2026-07-27) via a direct Drive keyword search that
  surfaced the literal key value in the search snippet itself. This run did not query
  Drive again (avoiding another unnecessary read of a live secret); status should be
  assumed **unremediated** until an owner confirms otherwise. Outstanding actions,
  unchanged across every escalation so far:
  1. Rotate/revoke the key at the ElevenLabs console — treat it as compromised.
  2. Delete `.env.txt` from the Drive-synced folder **and** empty the Drive trash.
  3. Move the credential to a non-synced path or a local environment variable.
  4. Re-check the rest of the Drive-synced "tiny west" tree for other credential
     material, since this one surfaced via an ordinary keyword search.
- **CONFLICT-002 (parallel external "v6 no-size-cap rebuild" program) — carried
  forward, not independently re-checked this run.** See `CONFLICT-002.md`. Last
  reconfirmed live 2026-07-27 (#105): holding candidate `alpha.3.12-presentation`
  passed an independent audit (34/34 gates, `GOV-112`) but was held for one respin;
  the v6 program's `ROUTER.md` still lists this repo as an unresolved `GIT` lane
  (canonical-or-frozen `NEEDS_DECISION`).
- **Process note — scheduling cadence is still the dominant open problem, and it has
  gotten worse, not better.** This routine has fired roughly hourly since
  2026-07-24/25. As of this run: **31 status/check-in PRs (#76–#107 plus this one)**
  against this repo, spanning four days, **zero merged**. The repo's default branch
  (`claude/sunset-riders-clone-lyyefk`) currently has 100+ orphaned
  `claude/eager-dirac-*` remote branches. Two PRs were already open going into this
  run — **#105** (2026-07-27, most complete: STATUS.md + CONFLICT-002.md + GOV-111 +
  build/QA re-verification) and **#107** (2026-07-27, later, build/QA + a
  differently-named status file, no GOV-111/CONFLICT-002 content — a second concrete
  instance of a run dropping findings that a sibling run carried). This is an
  owner-level fix, not something a future scheduled run can solve alone: slow the
  schedule (e.g. daily instead of hourly), point it at one stable branch/PR to update
  in place, or merge one consolidated status PR (recommend **#105**) so the next run
  has something in the actual repo to build on instead of starting cold every time.

## Earlier entries

PR #107 (2026-07-27 ~23:23 UTC): build/QA-only re-verification, byte-identical
rebuild, full suite green; added a separately-named status file
(`STATUS_2026-07-27.md`) instead of this one, since this file did not yet exist on
its base branch. Did not carry forward GOV-111 or CONFLICT-002.

PR #105 (2026-07-27 ~09:24 UTC, still open, recommended merge target): confirmed
build/QA integrity, added this file and `CONFLICT-002.md` to the repo for the first
time, independently reconfirmed GOV-111 via live Drive search, and documented the
PR-spam meta-issue in detail (superseded #103/#104).

PRs #65 through #104 (all closed unmerged, superseded, or left as stale open drafts):
covered the same ground repeatedly — repo/build integrity, CONFLICT-002 discovery and
re-verification, GOV-111 discovery and escalation, and the PR-spam meta-issue itself.
See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the substantive technical
record.
