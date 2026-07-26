# CONFLICT-002 — repo Brain vs. active "v6 no-size-cap rebuild" program (unresolved by owner)

Filed 2026-07-26 by a scheduled status check-in against `khuffsphone/tinywest`. Verified
directly against the canonical Drive Brain (not just prior status-note text).

## What's confirmed

- Drive doc `00_V6_START_HERE_CURRENT.md` (`1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`), status
  CURRENT, effective 2026-07-19, states the inherited 1.2 MB artifact ceiling is revoked
  and opens a "Tiny West: Iron Trail v6 no-size-cap rebuild" program.
- `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md` confirms that program is active and
  shipping: current live gate target `alpha.3.11-lawroofArt` (4,460,083 B, `DEC-106-1`),
  with `alpha.3.12-presentation` (4,461,370 B) staged in HOLDING for independent audit.
  Five protected v6 baseline artifacts (v4 rollback → v6 alpha.3.1) hash-verified intact.
- This repo's own `CLAUDE.md` / `CONSTANTS.md` still state the 1.2 MB ceiling
  (< 1.2 MB preferred, 2.5 MB hard) as a **closed rule** and make no mention of the v6
  program. Neither has been updated to reference it.

## What this is NOT

- Not a claim that `khuffsphone/tinywest` is wrong, abandoned, or should be changed.
- Not a rebrand and not an introduction of runtime 3D — the v6 program is described as a
  size-cap change only; no evidence here touches the 2D-canvas / no-3D rule.
- No canon, code, protected constant, or slice behavior has been changed in this repo as
  a result of this finding. This is a report, per this repo's own "never silently merge
  the two [Brain] sets; report conflicts" rule extended to this new discrepancy.

## `NEEDS_DECISION` (owner-level)

Is `khuffsphone/tinywest` still a canonical build target for the Tiny West project, or a
frozen 2026-07-17 prototype the wider project (running across other lanes/environments)
has since moved past under a different size budget? This has been unresolved across
multiple scheduled check-ins on 2026-07-26; it needs an explicit owner ruling, not
another automated pass restating it.

## Sources

- `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx` — 00_V6_START_HERE_CURRENT.md
- `1uCJsLUKVudJEdK0efnaYQpGQSfVyTPwl8Pz-7-X6ybk` — NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md
