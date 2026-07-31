# Tiny West — rolling status log

Single rolling log for scheduled status check-ins on this repo, so each new run has
something merged-adjacent to read instead of re-deriving from scratch. Newest entry
first. See `README.md` for the Brain index and `RECONCILIATION.md` for CONFLICT-001.

## 2026-07-31 — no drift, full suite green; two unresolved owner items carried forward

**Repo/slice**: unchanged since commit `a4c4dd4` (2026-07-17) — 14 days, working tree
clean. `node slice/tools/build.mjs` reproduces `slice/dist/tiny-west.html`
byte-identical: 106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. Full suite run
fresh this pass (global Playwright install symlinked in, nothing committed to the
repo): `playtest.mjs` (smoke PASS, determinism hash `911533983` — matches every prior
check-in since 2026-07-17, natural run to RESULTS, $269 banked, 0 page errors),
`qa2.mjs` (pay-car $837, touch determinism, 4 viewports no clipping, 20 reset cycles),
`qa3.mjs` (pay-car fork reachable + completable, $839 banked). All PASS, no
regressions. `index.html` (protected tribute build) unmodified.

**GOV-111 (ElevenLabs credential exposure) — treat as unremediated.** The 2026-07-30
06:26 UTC Nightly Brain Health Report (independent audit lane) confirmed the key was
still active in `.env.txt` on the Drive-synced tree and kept paid generation
HARD-BLOCKED (DEC-112-4). A same-day later GitHub check-in reported not finding the
file via a title-only search — but that method already produced known false
negatives earlier this same week (2026-07-28T08:23Z check-in caught one). This run
did not repeat any Drive credential search itself, to avoid further exposure risk.
Bottom line: 5 days (2026-07-26 → 2026-07-31) with no independently-confirmed owner
remediation. Recommend the owner directly confirm: key rotated + old key revoked at
the ElevenLabs console, `.env.txt` deleted, Drive trash emptied, credential relocated
off any Drive-synced path.

**GitHub backlog — still growing, not adding another duplicate PR.** As of this run,
34+ open draft "status check-in" PRs (`#105`, `#107`–`#144`), zero merged, since
2026-07-24 (~9 days), plus 150+ orphaned `claude/eager-dirac-*` branches. Per
GOV-112 §10 and the unbroken precedent of prior check-ins in this file/PR #105's
thread: not opening a new PR this run. Findings posted as a comment on PR #105
instead. Recommended fix is unchanged and owner-level: merge one PR (e.g. #105,
test-green) and close the rest, prune branches, and slow/pause the scheduled task's
firing cadence.

**CONFLICT-002 (repo canonicity) — unchanged, `NEEDS_DECISION`.** The external Drive
"Iron Trail" pipeline is the de facto active/owner-blessed line (live gate target
`Tiny-West-Iron-Trail-v6.0.0-alpha.3.12-final.html`, 4,471,627 bytes, GOV-116),
well past this repo's `<1.2 MB preferred` ceiling and under the "Iron Trail" name
rather than this repo's "Rampage Express" ruling. This repo has had zero commits in
14 days. ADR-003 (authoritative repo) remains open.

## 2026-07-17 — see `BUILD_RECEIPT_SLICE.md`

Initial 42-second slice build, full adversarial review, all findings fixed. Baseline
for every check-in above.
