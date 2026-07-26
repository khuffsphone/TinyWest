# CONFLICT-002 — repo Brain vs. canonical Drive Brain: v6 no-size-cap rebuild

Status: **open, unresolved, `NEEDS_DECISION` (owner-level)**. Reported (not resolved) here
per this repo's own CONFLICT-001 rule: "never silently merge the two sets; report conflicts."

## What was found

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) contains a document
not previously inventoried in this repo's local mirror:

- `00_V6_START_HERE_CURRENT.md` (Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`), effective
  **2026-07-19**, status **CURRENT**. Independently re-verified live against Drive this run
  (owner `kylerhuffsphone@gmail.com`, unchanged since 2026-07-19).

That document explicitly **revokes the 1.2 MB artifact ceiling** that this repo's
`CLAUDE.md` and `CONSTANTS.md` still enforce as a closed rule ("File budget | < 1.2 MB
preferred, 2.5 MB hard"). It opens a **"Tiny West: Iron Trail v6 no-size-cap rebuild"**
program that is active and shipping. Cross-checking the canonical Brain again this run
(via the Drive-side `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md`, created 06:14 UTC today by
an autonomous auditor named "Gemini Spark") confirms the program is not just active but has
progressed materially past what CONFLICT-002 first reported on 2026-07-26:

- Current live gate target: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`
  (4,460,083 bytes, DEC-106-1), with a newer candidate `alpha.3.12-presentation.html`
  (4,461,370 bytes) delivered and HOLDING for independent Cowork audit as of this morning.
  This has moved well past the `alpha.3.9-engineAudio` candidate CONFLICT-002 originally
  cited.
- Lives entirely as **Drive artifacts**, on a branch (`v6/no-size-cap-rebuild`) that does
  **not exist** in `khuffsphone/tinywest`.
- Built/audited by a multi-lane pipeline distinct from this git-based Claude Code lane:
  a Game-Build lease holder, an Art lane, an Audio/SFX/VOX lane, a Design+Research lane,
  Claude Cowork for independent UAT, and the Gemini Spark nightly auditor — coordinated
  through Drive governance docs (`GOV-`/`DEC-` numbered decisions), not through this repo.

There is also a separate, unrelated delivery lane in this same repo: PR #11
(`v6/Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html`, 2.4 MB, CLOUD lease, GOV-77) — an
alpha.3.5 game-feel-juice candidate awaiting independent Cowork audit. That PR is further
evidence the v6 no-size-cap program is live and multi-lane, but it is a separate,
already-tracked workstream (its own governance/audit trail) and not itself part of
CONFLICT-002 — noted here only for completeness.

**No canon, code, or protected constant in this repo has been changed** in response to
this. This file only documents the divergence for an owner ruling.

## Open owner question

Is `khuffsphone/tinywest` still a canonical build target, or is it a frozen 2026-07-17
prototype the project has since moved past in favor of the v6 Drive pipeline?

- If **still canonical**: `CLAUDE.md` / `CONSTANTS.md` need the v6 charter reconciled in —
  as of this writing they enforce a byte ceiling the owner revoked on 2026-07-19, while the
  Drive-side program has already shipped past a dozen alpha candidates on top of that
  revocation.
- If **meant to be frozen**: the recurring scheduled check-in routine against this repo is
  probably better turned off or repointed than left running (see process note below).

## Process note (secondary, non-blocking)

This scheduled routine has been firing at roughly hourly cadence against this repo since
2026-07-24, opening a new PR each run because each run lands on a fresh branch name
(`claude/eager-dirac-*`) with no PR pointing at it yet. As of this run: 91+ PRs opened,
0 merged. Recommend either lowering the schedule cadence, pointing it at a stable branch
it can update in place, or pausing it until the v6-authority question above is resolved —
otherwise every future run keeps enforcing the possibly-stale 1.2 MB rule against a Brain
that no longer says that.

## First reported

2026-07-26, PR #87, this repo. Carried forward unresolved by every scheduled run since
(PRs #88–#91 and this one) because no prior status PR has ever been merged, so each run
has had to re-add this file from the last closed/open PR's content rather than build on a
merged copy.
