# CONFLICT-002 — external v6 rebuild program (owner-level, NEEDS_DECISION)

Not part of the original CONFLICT-001 reconciliation (see `RECONCILIATION.md`). Filed
by a scheduled status check-in after discovering, via the canonical Drive Brain, that a
second build effort has been running in parallel to this repo.

## What was found (as of the 2026-07-26 check, PR #92 — not re-verified live since)

- A Drive-side "v6 no-size-cap rebuild" program has progressed materially past this
  repo's 42-second slice. Live gate target reported as `alpha.3.11-lawroofArt`
  (4.46 MB), with `alpha.3.12-presentation` already delivered and awaiting Cowork audit.
- This repo's `CLAUDE.md` / `CONSTANTS.md` still enforce a single-file ceiling of
  1.2 MB — a constraint the owner is reported to have revoked on 2026-07-19 for that
  external program, but which has not been revised in this repo.
- Net effect: two active build efforts exist against the same Brain, under different
  size/scope constraints, and it is not decided from inside this repo which one is
  canonical going forward.

## Open question (owner-level `NEEDS_DECISION`)

Is `khuffsphone/tinywest` still the canonical repo for Tiny West / Rampage Express, or
has it been superseded by the external v6 program and should be treated as a frozen
2026-07-17 prototype?

## Status

Unresolved. Carried forward by every status check-in since 2026-07-26 without being
re-derived each time (re-checking the live Drive state is not free and this run's job
is to report, not to keep re-auditing an already-filed item). See `STATUS.md` for the
running log of check-ins that have carried this forward.
