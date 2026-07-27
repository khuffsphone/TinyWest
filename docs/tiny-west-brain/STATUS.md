# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived (and can drift) on every run.

## 2026-07-27 ~07:20 UTC

- **Repo state**: unchanged since `a4c4dd4` (2026-07-17) — two real commits, working
  tree clean. Branch `claude/eager-dirac-06fptg` (this check-in's designated branch)
  had no open pull request prior to this entry.
- **Build re-verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the recorded receipt — 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
- **QA re-run this pass**: `playtest.mjs` — smoke checks pass, `runDeterminismCheck`
  PASS (hashA == hashB, `911533983`), natural keyboard run (seed 20260717) reaches
  RESULTS, 0 page errors, $269 banked, 24 s run. (`qa2.mjs`/`qa3.mjs` not re-run this
  pass — no code changed since the last full run recorded in PR #102's entry below,
  which covered them and reported all green.)
- **CONFLICT-002 re-confirmed live against Drive this pass** (not just carried
  forward) — see `CONFLICT-002.md` for the full record. Headline deltas since the
  last entry: the v6 program's holding candidate is now `alpha.3.12-presentation`
  (passed 34/34 gates, held for an `ART-11` row-4 art respin before promotion), and
  its own `ROUTER.md` governance file has independently registered this repo as a
  `GIT` lane with two pending owner calls: canonical-or-frozen status, and this
  scheduled task's own PR/branch backlog (see the process note below — the v6
  program's governance log has now flagged the same meta-issue this file has been
  flagging for ~35 runs).
- **GOV-111 — still unremediated, carried forward again.** The 2026-07-27 nightly
  Brain health report (`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_27.md`) restates the
  finding first surfaced 2026-07-26: an ordinary Google Drive keyword search — not a
  deliberate file open — surfaces the plaintext content of `.env.txt` in the
  Drive-synced "tiny west" root folder, containing a syntactically well-formed
  `ELEVENLABS_API_KEY=...` line. **The key value is not reproduced in this file, this
  repo, or any PR.** All paid generation (voice AND non-voice) is reported
  hard-blocked by the Brain's own governance (`DEC-112-4`) until this clears.
  Outstanding owner actions (unchanged across every escalation so far):
  1. Rotate/revoke the key at the ElevenLabs console — treat it as compromised.
  2. Delete `.env.txt` from the Drive-synced folder **and** empty the Drive trash.
  3. Move the credential to a non-synced path or a local environment variable.
  4. Re-check the rest of the Drive-synced "tiny west" tree for other credential
     material, since this one surfaced via an ordinary keyword search.
- **Process note — scheduling cadence is still the dominant open problem.** This
  routine has fired roughly hourly since 2026-07-24. Per PR #102's own account,
  ~35 prior runs (PRs #65–#101) covered the same ground repeatedly with zero merges,
  and 100+ orphaned `claude/eager-dirac-*` branches accumulated. As of this run only
  two PRs are open in the repo (#102, this check-in's immediate predecessor; and #11,
  an unrelated real v6 alpha.3.5 feature-candidate PR) — the closing-as-superseded
  convention has kept the *open* PR count low, but it has not stopped the routine
  from re-deriving and re-writing the same findings on a fresh, memoryless branch
  every firing, and nothing has landed in the repo's default branch yet. This entry's
  PR supersedes and closes #102. **This is still an owner-level fix, not something a
  future scheduled run can solve alone**: slow the schedule (daily instead of
  hourly), point it at one stable branch/PR to update in place, or merge this (or
  any) consolidated status PR so the next run has something in the actual repo to
  build on instead of starting cold. Flagging again since it has not been actioned
  across ~35+ prior status runs.

## Earlier entries

PR #102 (2026-07-27 ~05:10 UTC, superseded by this entry): confirmed the same build/
QA integrity (byte-identical rebuild, full `playtest`/`qa2`/`qa3` green), first added
this file and `CONFLICT-002.md` to the repo, and documented the PR-spam meta-issue in
detail. Prior check-ins (PRs #65 through #101, all closed/superseded or left as
unmerged open drafts) covered the same ground repeatedly before that: repo/build
integrity, CONFLICT-002 discovery and re-verification, GOV-111 discovery and
escalation, and the PR-spam meta-issue itself. See `CONFLICT-002.md` and
`BUILD_RECEIPT_SLICE.md` for the substantive technical record.
