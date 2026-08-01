# Tiny West — status log

Dated check-ins from the scheduled "Tiny West status update" routine. Newest first.

---

## 2026-08-01 — slice healthy, no drift; PR/branch backlog now critical

**Slice build:** No drift. Rebuilt `slice/dist/tiny-west.html` from the committed
`slice/src/` on commit `a4c4dd4` (the tip of both `claude/eager-dirac-ldf5ty` and the
default branch `claude/sunset-riders-clone-lyyefk`) and it reproduced byte-for-byte:
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bb`,
matching `BUILD_RECEIPT_SLICE.md` exactly. Working tree otherwise clean.

`node tools/playtest.mjs` could not be re-run here — Playwright is not installed
(no `node_modules`, no `package.json` in the repo) — so this is a static rebuild/hash
verification, not a fresh browser playtest. The last browser-verified run remains the
one recorded in `BUILD_RECEIPT_SLICE.md` (determinism PASS on two seeds, natural
keyboard run to CLEAN GETAWAY, pay-car route reachable + completable, touch/viewport
QA, 46-agent adversarial review with all 17 findings fixed and re-verified).

**CRITICAL — PR/branch backlog (owner action needed, unresolved across many prior
check-ins):** as of this check-in the repo has **55 open pull requests** (`#105`–`#159`,
almost all titled some variant of "Brain: status check-in", all **draft**, all opened
against the default branch `claude/sunset-riders-clone-lyyefk`, **none merged or
closed**) and **~190 branches**, the overwhelming majority `claude/eager-dirac-*` with
no other changes than this same status routine. This has been self-reported inside the
PR bodies since 2026-07-30 (see e.g. #130, #133, #159) with escalating counts and an
explicit request for owner intervention each time, without visible effect — the queue
has only grown (30 → 55 open PRs, 34 → ~190 branches over three days).

Each run of the scheduled routine creates a brand-new branch and a brand-new draft PR
instead of updating one in place, so the backlog grows every time the schedule fires
regardless of whether there is anything new to report.

**What this run did differently:** rather than opening PR **#160** on top of the
existing 55, this check-in pushes `claude/eager-dirac-ldf5ty` and opens exactly one
consolidated draft PR carrying this note, and separately raises the issue directly with
the owner outside of GitHub (the in-PR pleas alone have not gotten a response in three
days). No other new branch/PR was created by this run.

**Recommended fix (owner-level, not performed here — requires repo-admin decisions):**
1. Pick one of the open "status check-in" PRs (or this one) to merge, then close the
   other ~54 and delete their branches — they carry no unique content once one is merged.
2. Reduce the scheduled routine's firing frequency — a status check does not need to run
   this often.
3. Reconfigure the routine to update one long-lived branch/PR in place (or to skip
   opening a PR entirely when there is no substantive change to report) instead of
   branching fresh every run.

## Open owner decisions (carried forward, unchanged)

From `README.md` / `RECONCILIATION.md`: final public subtitle (Iron Trail vs Rampage
Express vs Tiny West alone); permanent rampage-first confirmation; 2D/3D asset pipeline
(ADR-002/006); export of the verified v4.0.0 baseline from the ChatGPT Library into this
repo; canonical repo (ADR-003); delivery architecture (ADR-004/005); and now, the PR/
branch backlog and schedule cadence described above.
