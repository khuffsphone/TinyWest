# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived (and can drift) on every run. See the
process note in this entry for the current state of that problem.

## 2026-07-27 ~05:10 UTC

- **Repo state**: unchanged since `a4c4dd4` (2026-07-17) — two real commits, working
  tree clean. Branch `claude/eager-dirac-sbepnp` (this check-in's designated branch)
  had no open pull request prior to this entry.
- **Build verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the recorded receipt — 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
- **Full QA suite re-run this pass, all green** (symlinked the globally-installed
  `playwright` into `slice/node_modules`, same workaround prior runs used — this
  container still has no repo-local `node_modules`/`package.json`):
  - `playtest.mjs` — smoke checks pass; `runDeterminismCheck` PASS (hashA == hashB,
    `911533983`); natural keyboard run (seed 20260717) reaches RESULTS, 0 page errors,
    $269 banked.
  - `qa2.mjs` — touch pads render/start correctly, determinism holds on touch device;
    four viewports (1100×760, 412×915, 360×640, 915×412) show no canvas overflow;
    20 reset cycles complete clean.
  - `qa3.mjs` — fork → pay-car exact-input route PASS, fight completes, $839 banked.
- **CONFLICT-002 still open, still owner-level `NEEDS_DECISION`.** A second, far more
  active development program — "Tiny West: Iron Trail v6 no-size-cap rebuild" — is
  running in the canonical Drive Brain outside this repo, with its own multi-megabyte
  artifacts (well past this repo's 1.2 MB ceiling) and no ruling yet on whether this
  repo is still the canonical build target. No code/canon/constant changed here in
  response — see `CONFLICT-002.md` for the full record (unchanged this pass; not
  re-verified live against Drive this cycle beyond confirming the file's content still
  matches the prior entry's claims).
- **GOV-111 — still unremediated, carried forward again.** A Drive-Brain status note
  (`STATUS_2026-07-26_GIT_LANE_CHECKIN_GOV111_ESCALATION.md`,
  `1-PfMCJLCQQxcntG-h5dsvPpkGScxeVGL`) reported that an ordinary Drive search — not a
  deliberate file open — surfaced the plaintext content of `.env.txt`
  (`1xGaMuikFGpsUyySz3Gn_zC4A3DJYN0Dh`, Drive-synced "tiny west" root folder
  `1Z_w_YVIYf-wnzh9otZ7ESJgSxsTtzI9x`), containing a syntactically well-formed
  live-looking `ELEVENLABS_API_KEY=sk_...` line. Multiple prior check-ins have
  re-confirmed the file is still present. **The key value is not reproduced in this
  file, this repo, or any PR.** Outstanding owner actions (unchanged across every
  escalation so far):
  1. Rotate/revoke the key at the ElevenLabs console — treat it as compromised.
  2. Delete `.env.txt` from the Drive-synced folder **and** empty the Drive trash.
  3. Move the credential to a non-synced path or a local environment variable.
  4. Re-check the rest of the Drive-synced "tiny west" tree for other credential
     material, since this one surfaced via an ordinary keyword search.
  VOX/paid-SFX generation should stay hard-blocked until this is done.
- **Process note — scheduling cadence is the dominant open problem, and this run does
  not fix it.** This routine has fired roughly hourly since 2026-07-24, producing 100+
  numbered draft PRs (up to at least #101 as of this entry) and 100+ orphaned
  `claude/eager-dirac-*` branches, with **zero merges**. Each run starts from a fresh
  scheduler-minted branch with no memory of the last one, so consolidation attempts
  (closing superseded duplicates, writing to one surviving PR) keep getting outpaced
  by the next hourly firing before an owner ever merges one. This entry's PR closes
  PR #101 (the previously open duplicate) as superseded, per that same convention —
  but that convention has now failed to stick across at least a dozen prior attempts.
  **This is an owner-level fix, not something a future scheduled run can solve on its
  own**: slow the schedule (e.g. daily instead of hourly), point it at one stable
  branch/PR to update in place instead of minting a new branch every firing, or merge
  a consolidated status PR so the next run has something in the actual repo to build
  on. Flagging this explicitly again since it has not been actioned across ~35 prior
  status runs.

## Earlier entries

Prior check-ins (PRs #65 through #101, all closed/superseded or left as unmerged open
drafts) covered the same ground repeatedly: repo/build integrity, CONFLICT-002
discovery and re-verification, GOV-111 discovery and escalation, and the PR-spam
meta-issue itself. See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the
substantive technical record; this file was first written to a PR branch in #99, then
#101 (neither merged as of this entry) — this entry carries it forward again.
