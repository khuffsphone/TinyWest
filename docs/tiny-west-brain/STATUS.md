# Tiny West — running status log

Newest entry first. This file exists to break a pattern documented below: this
scheduled check-in runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived (and can drift, or be dropped) on every
run.

## 2026-07-27 ~09:xx UTC

- **Repo state**: unchanged since `a4c4dd4` (2026-07-17) — two real commits, working
  tree clean. Branch `claude/eager-dirac-br4pj9` (this check-in's designated branch)
  had no open pull request prior to this entry.
- **Build re-verified from source**: `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the recorded receipt — 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
- **Full test suite re-run, all green**: `playtest.mjs` (smoke pass,
  `runDeterminismCheck` PASS hash `911533983` both runs, natural keyboard run reaches
  RESULTS, $269 banked, 0 page errors), `qa2.mjs` (pay-car route $837 banked, touch
  pads functional with determinism preserved, four viewports render without overflow,
  20 reset cycles clean), `qa3.mjs` (fork→pay-car exact-input route PASS, $839
  banked). Playwright isn't vendored in this repo; ran via a throwaway symlink to the
  environment's global install, removed after the run — nothing checked in.
- **CONFLICT-002 re-confirmed live against Drive this pass** — see `CONFLICT-002.md`.
  Headline: the v6 program's holding candidate `alpha.3.12-presentation` passed an
  independent Cowork audit (34/34 gates, GOV-112) but is held for one respin to fold
  in accepted row-4 art before promotion. Its `ROUTER.md` still lists this repo as an
  unresolved `GIT` lane (canonical-or-frozen `NEEDS_DECISION`).
- **GOV-111 — still unremediated, independently reconfirmed this run (not just
  carried forward from prior PR text).** A direct Drive `fullText` search for the
  ElevenLabs credential's env-var name returned the **literal key value in the search
  result snippet itself** — confirming again that no deliberate file-open is needed;
  ordinary keyword search surfaces it. The exposed file (`.env.txt`, 70 bytes, in the
  Drive-synced "tiny west" root, created 2026-07-26T00:53 UTC) was still present and
  still indexed at the time of this check (2026-07-27). **The key value is not
  reproduced in this file, this repo, or any PR — this note is a fingerprint-only
  record.** Per the Brain's own GOV-111/GOV-112 notes, all paid ElevenLabs generation
  (voice and non-voice) remains hard-blocked pending remediation. Outstanding owner
  actions (unchanged across every escalation so far):
  1. Rotate/revoke the key at the ElevenLabs console — treat it as compromised.
  2. Delete `.env.txt` from the Drive-synced folder **and** empty the Drive trash.
  3. Move the credential to a non-synced path or a local environment variable.
  4. Re-check the rest of the Drive-synced "tiny west" tree for other credential
     material, since this one surfaced via an ordinary keyword search.
  - **Notable this run**: the immediately-prior scheduled run (PR #104) rebuilt and
    re-tested the slice but did **not** re-check Drive, so it did not carry this
    finding forward at all — a live demonstration of the "memoryless branch" failure
    mode described below. This entry re-derives it from a fresh, independent Drive
    check rather than trusting PR text, and it is now merge-ready in `STATUS.md` for
    the first time.
- **Process note — scheduling cadence is still the dominant open problem.** This
  routine has fired roughly hourly since 2026-07-24. Per prior entries' own accounts,
  ~35+ status PRs (#65–#104) have covered the same ground repeatedly with zero
  merges, and 109 orphaned `claude/eager-dirac-*` branches have accumulated as of
  this run. Two duplicate status PRs were open going into this run (#103 and #104,
  both same-day, both draft, neither merged, and #104 already missing #103's GOV-111
  finding) plus #11 (an unrelated real v6 alpha.3.5 feature-candidate PR, still
  awaiting Cowork audit + owner approval). This entry's PR supersedes and closes
  #103 and #104. **This is still an owner-level fix, not something a future scheduled
  run can solve alone**: slow the schedule (daily instead of hourly), point it at one
  stable branch/PR to update in place, or merge this (or any) consolidated status PR
  so the next run has something in the actual repo to build on instead of starting
  cold and risking dropped findings like GOV-111 above.

## Earlier entries

PR #104 (2026-07-27 ~08:23 UTC): build/QA-only re-verification, byte-identical
rebuild, full suite green. Did not check Drive and did not carry forward GOV-111 or
CONFLICT-002 — flagged above as a concrete instance of the memoryless-branch risk.

PR #103 (2026-07-27 ~07:25 UTC, superseded by this entry): confirmed the same build/
QA integrity, first added `STATUS.md` and `CONFLICT-002.md` to the repo (superseding
PR #102), and documented the PR-spam meta-issue and GOV-111 in detail. Prior
check-ins (PRs #65 through #102, all closed/superseded or left as unmerged open
drafts) covered the same ground repeatedly before that: repo/build integrity,
CONFLICT-002 discovery and re-verification, GOV-111 discovery and escalation, and the
PR-spam meta-issue itself. See `CONFLICT-002.md` and `BUILD_RECEIPT_SLICE.md` for the
substantive technical record.
