# CONFLICT-002 — this repo vs. the active "v6 no-size-cap rebuild" program

**Status: `NEEDS_DECISION` (owner-level), unresolved.**

## What this is

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) now contains a
second, much more active development program — "Tiny West: Iron Trail v6 no-size-cap
rebuild," effective 2026-07-19 — running entirely outside this repo, on a different
toolchain. It is not a slow-moving parallel track: as of this check-in (2026-07-26
~22:20 UTC) the Brain shows build/receipt/audit documents from as recently as
**2026-07-26 18:55 UTC**, hours before this check-in ran (`SCB01_REGISTRY_RECONCILIATION_RECEIPT.md`,
`DOC_ID_REGISTRY.json`, plus same-day `BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md` and
`ART-11_ROW4_DYNAMITE_POLISH.md` from earlier the same day).

Key facts (re-confirmed live against Drive this pass, not just prior notes):

- The v6 program's live gate artifact is well past this repo's size discipline — prior
  passes recorded `alpha.3.11-lawroofArt` at 4.46 MB, with `alpha.3.12-presentation`
  since built and receipted (`BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md`, 2026-07-26 01:29 UTC).
  This repo's `CLAUDE.md`/`CONSTANTS.md` still state a `< 1.2 MB preferred` / `2.5 MB hard`
  offline-HTML ceiling as closed/binding.
- The v6 program's working branch (`v6/no-size-cap-rebuild`, per earlier passes' notes)
  **does not exist in this repo** (`khuffsphone/TinyWest`). This repo has exactly two
  real commits (`cfb0034`, `a4c4dd4`) and no v6 lane.
- A dedicated Drive doc, `STATUS_GIT_REPO_V6_AUTHORITY_DIVERGENCE_2026-07-26.md` (per
  PR #98's re-verification), explicitly leaves this repo's canonical status as
  owner-level `NEEDS_DECISION` — it does **not** say the v6 lane supersedes or revokes
  this repo. Treat that as the operative scope: this repo is not overridden, but it is
  also not confirmed current with the v6 lane's output.

## What this means for this repo

- **No code, canon, or protected constant has been changed in response to this.** Per
  `CLAUDE.md`'s "never silently merge, report conflicts" rule, this is a report, not a
  resolution.
- `slice/dist/tiny-west.html` (106,552 B, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`) remains this
  repo's current build and is unchanged since 2026-07-17.
- Open owner decision: is `khuffsphone/tinywest` still the canonical build target, or a
  frozen 2026-07-17 prototype the project has since moved past in favor of the v6 lane?
  Until ruled, this repo keeps developing (if at all) under its existing closed rules
  and size ceiling.

## Provenance note

This conflict was first surfaced by an earlier scheduled run (PR #87) and has been
re-confirmed live, independently, by multiple subsequent runs including this one —
each run reads the Drive Brain directly rather than trusting prior PR text, because
none of those PRs have merged (see the process note in `STATUS.md`) and PR descriptions
are not a durable record.
