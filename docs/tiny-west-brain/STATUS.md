# Tiny West — running status log

Newest entry first. This file exists to break a pattern the scheduled check-in has
repeatedly documented: it runs on a fresh, memoryless branch each time, so anything not
actually merged into the repo is re-derived — or silently dropped — on every run. See
"Process note" below; as of this entry it is the dominant open problem, by a wide margin.

## 2026-07-30 ~11:21 UTC

- **Repo/code state: unchanged, healthy.** Two real commits since inception (`cfb0034`
  tribute, `a4c4dd4` slice), working tree clean. `slice/dist/tiny-west.html` rebuilds
  byte-identical from source — 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` — unchanged since the
  2026-07-17 build receipt. `index.html` (protected Sunset Riders tribute) confirmed
  unmodified. Did not re-run the full Playwright QA suite this pass (`playtest.mjs`,
  `qa2.mjs`, `qa3.mjs` — Playwright is not vendored in this repo, `node_modules` absent);
  it has been re-run and reported green by at least the last several check-ins with no
  code changes in between, so a full reinstall-and-rerun added no new information this
  time. Flagging instead: if a real code change is ever made, the next run must install
  Playwright and run the full suite before claiming done, per `CLAUDE.md`.

- **Process note — scheduling cadence is now a severe, active problem, not just noise.**
  This routine has fired roughly hourly for 6+ days. As of this run: **29 open, unmerged,
  draft "status check-in" PRs** (#105 through #133) and **148 orphaned
  `claude/eager-dirac-*` branches**, with **zero merges** to any target branch across all
  of them. This is not cosmetic — it is actively losing information: several prior runs
  (e.g. PR #129) rebuilt/re-tested but silently dropped findings a previous run had
  already surfaced (GOV-111 credential status, CONFLICT-002), because each run starts
  from a fresh branch with no memory of unmerged prior work. At least ten prior PRs
  (#105, #108, #109, #111–#130, #132, #133) already flagged this exact problem and
  recommended fixing the cadence; none have been merged or acted on. Repeating the
  recommendation via a 30th PR is unlikely to be the effective channel — routed a direct
  notification to the owner this run instead.
  **Owner action needed:** (1) pause or slow the schedule (e.g. daily instead of hourly),
  (2) point it at one stable branch/PR to update in place rather than a fresh branch each
  run, (3) merge one consolidated status PR (this one, or an earlier one such as #105/#130)
  and close the rest so future runs have real repo state to build on instead of
  re-deriving it from scratch every time.

- **GOV-111 / CONFLICT-002:** last independently re-checked in the 2026-07-30 ~05:xx UTC
  run (see prior PR bodies, e.g. #130) — not re-verified this pass, to avoid duplicating
  work already done twice today with no repo-visible change to act on. Carry forward:
  GOV-111 (possible residual credential exposure) was not confirmed closed as of that
  check; CONFLICT-002 (parallel "Iron Trail v6" build program in the same Brain folder,
  not indexed in this repo) remains open and unresolved. Neither is acted on here per
  `CLAUDE.md`'s "never silently merge, report conflicts" rule.

## Earlier entries (condensed)

- **PR #130** (2026-07-30 ~05:xx UTC): first run to independently re-check GOV-111 against
  Drive (no exposed file found, but not proof of remediation) and re-confirm CONFLICT-002
  (a newer Iron Trail v6 build detected). Documented 24 open PRs / 100+ branches at the time.
- **PR #129** (2026-07-30 ~04:23 UTC): build/QA-only re-verification, byte-identical
  rebuild, full suite green. Did not check Drive; did not carry forward GOV-111 or
  CONFLICT-002 — the failure mode this file exists to prevent.
- **PR #105** (2026-07-27, supersedes #103/#104): first added `STATUS.md` and
  `CONFLICT-002.md` (never merged). Re-confirmed GOV-111 live against Drive; documented
  the PR-spam meta-issue in detail.
- **PRs #65–#128**: repeated re-verification of the same build/QA integrity, repeated
  (re)discovery of CONFLICT-002 and GOV-111, and repeated flagging of the scheduling
  meta-issue — see `BUILD_RECEIPT_SLICE.md` and `RECONCILIATION.md` for the substantive
  technical record, and the GitHub PR list for the full duplicate backlog.
