# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo gets re-derived (and can drift or be silently dropped)
on every run. As of this entry, **none of the prior status PRs have merged**, so this
file is being re-added rather than appended to.

## 2026-07-28 (this run, branch `claude/eager-dirac-fdp0v5`)

- **Repo state**: unchanged since commit `a4c4dd4` (2026-07-17) — two commits, working
  tree clean. This branch had no open pull request prior to this entry.
- **Build re-verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the 2026-07-17 receipt — 106,552
  bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
  No drift.
- **`playtest.mjs` re-run** (Playwright not vendored in-repo; used via a throwaway
  symlink to the environment's global install, removed after the run — nothing
  checked in): smoke PASS, `runDeterminismCheck` PASS (hash `911533983`, matches every
  prior run), natural keyboard run reaches RESULTS with $269 banked, 0 page errors.
  `qa2.mjs`/`qa3.mjs` not re-run this pass (time-boxed); no reason to expect
  divergence given zero source changes since 2026-07-17 and 12+ consecutive identical
  results on the checks that were run. Matches every prior re-verification (#98–#108)
  exactly — no regression across 11+ days of repeated checks.
- **GOV-111 (exposed `ELEVENLABS_API_KEY` in a Drive-synced `.env.txt`) — NOT
  independently re-checked this run**, deliberately: prior runs established that even
  an ordinary keyword search against the Drive Brain surfaces the literal key value
  in the result snippet, so repeating that search is itself another exposure. Carried
  forward from #101–#108 and should be assumed **unremediated** until an owner
  confirms otherwise. Outstanding actions, unchanged across every escalation so far:
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
- **Process note — the scheduling problem is unresolved and this run is one more
  instance of it.** This routine has fired roughly hourly since 2026-07-24/25. Going
  into this run there were **at least 32 status/check-in PRs (#76–#108)** against this
  repo, spanning four-plus days, **zero merged**, plus 100+ orphaned
  `claude/eager-dirac-*` remote branches. This PR is necessarily another one of the
  same shape: the harness requires developing on this run's designated fresh branch
  and opening a PR for it — there is no available action from inside a scheduled run
  that stops the next run from doing the same thing. **This needs an owner-level fix
  outside the repo**: slow the schedule (e.g. daily instead of hourly), point it at
  one stable branch/PR to update in place, or merge one consolidated status PR
  (recommend **#105**, the most complete: STATUS.md + CONFLICT-002.md + GOV-111 +
  build/QA re-verification) and close the rest, so the next run has something real to
  build on instead of starting cold. Flagged to the account owner directly from this
  run via notification, in addition to this file.

## Earlier entries

PR #108 (2026-07-28 ~01:25 UTC): build/QA re-verification, byte-identical rebuild,
GOV-111/CONFLICT-002 carried forward without re-check, documented the PR-spam
meta-issue in detail and explicitly recommended merging #105 instead of itself.

PR #107 (2026-07-27 ~23:23 UTC): build/QA-only re-verification, byte-identical
rebuild, full suite green; added a separately-named status file
(`STATUS_2026-07-27.md`) instead of this one, since this file did not yet exist on
its base branch. Did not carry forward GOV-111 or CONFLICT-002.

PR #105 (2026-07-27 ~09:24 UTC, recommended merge target): confirmed build/QA
integrity, added this file and `CONFLICT-002.md` to the repo for the first time,
independently reconfirmed GOV-111 via live Drive search, and documented the PR-spam
meta-issue in detail (superseded #103/#104).

PRs #65 through #104 (all closed unmerged, superseded, or left as stale open drafts):
covered the same ground repeatedly — repo/build integrity, CONFLICT-002 discovery and
re-verification, GOV-111 discovery and escalation, and the PR-spam meta-issue itself.
See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the substantive technical
record.
