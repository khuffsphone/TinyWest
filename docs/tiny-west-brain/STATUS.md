# Status log (rolling)

Single rolling log for routine status check-ins. Newest entry on top. Superseding the
pattern of one-off status PRs (see "Known issue" below) — append here instead of
opening a new file or PR each run.

## 2026-07-31 — build/QA re-verified, no drift; ⚠ operational issue needs owner action

**Slice build**: `slice/dist/tiny-west.html` rebuilds byte-identical (106,552 B) from
current `slice/src`. Working tree clean, no uncommitted drift. Matches
`BUILD_RECEIPT_SLICE.md` (2026-07-17) exactly — no code changes since that commit
(`a4c4dd4`).

**Automated QA**: ran all three Playwright suites this session (a global `playwright`
was available on the box but not wired into the repo — see gap below):
- `playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hashA == hashB), natural
  keyboard run to CLEAN GETAWAY in 24 s, $269 banked, 0 page errors.
- `qa2.mjs` — pay-car route reachable and completable, touch pads functional,
  determinism holds on touch-device context, four viewports (1100×760, 412×915,
  360×640, 915×412) no overflow, 20 reset cycles bounded, 0 errors.
- `qa3.mjs` — fork→pay-car exact-input route PASS, $839 banked on the pay-car line,
  0 errors.

All green. No regressions found.

**Known gap (repo, not slice logic)**: there is no `package.json` anywhere in this repo,
so `slice/tools/{playtest,qa2,qa3}.mjs` (`import { chromium } from 'playwright'`) cannot
resolve `playwright` in a fresh checkout — Node ESM does not fall back to a global
install for bare specifiers. This session only got the suites running by symlinking a
pre-installed global `playwright` into `slice/node_modules` for the duration of the
run, then removing the symlink before committing (not part of this change). Past
status PRs (e.g. #116, "playwright pinned") claimed to fix this but nothing merged —
the repo default branch still has no manifest. **Recommend**: commit a minimal
`slice/package.json` pinning `playwright` as a devDependency next time code changes
are in scope, so `npm install && node tools/playtest.mjs` works from clean.

**⚠ Operational issue — needs owner action, not something this run can fix:**
This exact prompt ("give a status update, save it to the Brain") is firing on a
schedule far more often than a status update needs, and each firing spins up a new
session on a brand-new branch that dutifully pushes a commit and opens a new PR against
the repo's default branch (`claude/sunset-riders-clone-lyyefk`). Result, as of this
run: **30 open, unmerged, draft "status check-in" PRs (#113–#142)**, plus **41 more
already closed unmerged (#1–#42)** going back to 2026-07-22 — roughly hourly for the
first two days, tapering to every 1–3 hours since. None have been merged. Many of the
recent PR titles are themselves prior sessions flagging this same backlog and asking
the owner to "merge #105, close the rest" — **PR #105 does not exist** in this repo
(the PR/issue number sequence jumps from #42 to #113; nothing in between is a PR), so
that instruction has been unfollowable for the ~20+ runs that repeated it. There is
also one unrelated open draft, **PR #11** ("v6 alpha.3.5 game-feel juice candidate
(GOV-77) — delivery staging for Cowork audit"), which doesn't match anything in this
repo's Brain docs and looks out of scope for Tiny West — worth a look.

Recommend: (1) reduce the schedule's firing frequency — a build with no code changes
in two weeks doesn't need hourly check-ins; (2) pick one recent duplicate PR to merge
(or none, since none carry code changes — just close the rest) to stop the backlog
growing; (3) have the owner glance at PR #11's provenance.

This run did not close or merge any existing PRs — that's a call for the repo owner,
not something to do unilaterally from an unattended scheduled run.

## 2026-07-17 — slice shipped

See `BUILD_RECEIPT_SLICE.md` for the full build receipt (first playable 42-second
Rampage Express slice, adversarial review, verification evidence).
