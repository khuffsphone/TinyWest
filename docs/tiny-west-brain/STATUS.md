# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived (and can drift) on every run. See the
process note in the 2026-07-27 entry for the current state of that problem.

## 2026-07-27 ~02:24 UTC

- **Repo state**: unchanged since `a4c4dd4` (2026-07-17) — two real commits, working
  tree clean. Branch `claude/eager-dirac-gtijio` (this check-in's designated branch)
  had no open pull request prior to this entry.
- **Build verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the recorded receipt — 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
- **Full QA suite re-run this pass, all green** (symlinked the globally-installed
  `playwright` into `slice/node_modules`, same workaround prior runs used — this
  container still has no repo-local `node_modules`/`package.json`):
  - `playtest.mjs` — smoke checks pass; `runDeterminismCheck` PASS (hashA == hashB,
    `911533983`); natural keyboard run (seed 20260717) reaches RESULTS, 0 page errors.
  - `qa2.mjs` — touch pads render/start correctly, determinism holds on touch device;
    four viewports (1100×760, 412×915, 360×640, 915×412) show no canvas overflow;
    20 reset cycles complete clean.
  - `qa3.mjs` — fork → pay-car exact-input route PASS, fight completes, $839 banked.
- **CONFLICT-002** (`CONFLICT-002.md`, this entry) re-confirmed independently against
  the live Drive Brain — still open, still owner-level `NEEDS_DECISION`. No change to
  this repo's code/canon/protected constants in response.
- **GOV-111 — escalated by a same-day Drive-lane check-in, still unremediated.** A
  2026-07-26 ~13:25 UTC status note in the Drive Brain
  (`STATUS_2026-07-26_GIT_LANE_CHECKIN_GOV111_ESCALATION.md`,
  `1-PfMCJLCQQxcntG-h5dsvPpkGScxeVGL`) reports that an ordinary Drive search — not a
  deliberate file open — returned the **content of `.env.txt`
  (`1xGaMuikFGpsUyySz3Gn_zC4A3DJYN0Dh`, Drive-synced "tiny west" root folder
  `1Z_w_YVIYf-wnzh9otZ7ESJgSxsTtzI9x`) directly in the search results**, and that
  content is a syntactically well-formed live-looking `ELEVENLABS_API_KEY=sk_...`
  line. This check-in independently re-confirmed the same file still exists at the
  same location as of this entry (metadata check only; the key value is not repeated
  in this file or anywhere else in this repo). **This is no longer a
  "don't-open-it-to-be-safe" precaution — Drive's own indexing already surfaces the
  secret to anything that searches that folder.** The 2026-07-26 note's recommended
  owner actions remain outstanding as of this check-in:
  1. Rotate/revoke the key at the ElevenLabs provider console (treat it as
     compromised regardless of prior rotations).
  2. Delete `.env.txt` from the Drive-synced folder **and** empty the Drive trash.
  3. Move the credential to a non-synced path or a local environment variable.
  4. Re-check the rest of the Drive-synced "tiny west" tree for other credential
     material, since this one was found by an ordinary keyword search.
  VOX/paid-SFX generation should stay hard-blocked until this is done, independent of
  any other lane's readiness.
- **Process note — scheduling cadence is still the open meta-issue.** This routine
  has been firing roughly hourly since 2026-07-24, opening numbered draft PR after
  numbered draft PR (at least into the #100s as of this entry) plus 100+ orphaned
  `claude/eager-dirac-*` branches, with zero merges. Prior runs' consolidation
  attempts (closing superseded duplicates, commenting on one surviving PR instead of
  opening new ones) keep getting outpaced by the next hourly firing, because each run
  starts from a fresh scheduler-minted branch with no memory of the last one. This
  entry closes the two currently-open duplicate status PRs (superseded by the PR
  opened from this branch) per that same convention, but the cadence itself is an
  owner-level fix: slow the schedule (e.g. daily instead of hourly), point it at one
  stable branch/PR to update in place, or merge a consolidated status PR so future
  runs have something in the actual repo to build on instead of starting cold.

## Earlier entries

Prior check-ins (PRs #65 through #100, all closed/superseded or still open drafts,
none merged as of this entry) covered the same ground repeatedly: repo/build
integrity, CONFLICT-002 discovery and re-verification, GOV-111 discovery and
escalation, and the PR-spam meta-issue itself. Their PR descriptions are not
reproduced here since none had landed in the repo before this entry; this file and
`CONFLICT-002.md` are the first copies of this record actually saved to the brain
(originally attempted in the PR #99 branch, `claude/eager-dirac-9xjkda`, which never
merged). See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the substantive
technical record.
