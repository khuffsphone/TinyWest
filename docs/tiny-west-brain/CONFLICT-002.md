# CONFLICT-002 — this repo vs. the active "v6 no-size-cap rebuild" program

**Status: `NEEDS_DECISION` (owner-level), unresolved.**

## What this is

The canonical Drive Brain (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) now contains a
second, much more active development program — "Tiny West: Iron Trail v6 no-size-cap
rebuild," effective 2026-07-19 (`00_V6_START_HERE_CURRENT.md`,
`1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`, status CURRENT) — running entirely outside this
repo, on a different toolchain. It states the inherited 1.2 MB artifact ceiling is
revoked for that program. It is not a slow-moving parallel track: as of this check-in
(2026-07-27) the Brain shows build/receipt/registry documents from as recently as
2026-07-26 18:55 UTC (`SCB01_REGISTRY_RECONCILIATION_RECEIPT.md`,
`DOC_ID_REGISTRY.json`), following same-day earlier documents
(`BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md`, `ART-11_ROW4_DYNAMITE_POLISH.md`).

Key facts (re-confirmed live against Drive this pass, not just prior notes):

- The v6 program's live gate artifact is well past this repo's size discipline:
  `alpha.3.11-lawroofArt` at 4,460,083 bytes (`DEC-106-1`), with
  `alpha.3.12-presentation` (4,461,370 bytes) since staged in HOLDING for Cowork
  audit per `BLD14_ALPHA3_12_PRESENTATION_RECEIPT.md`. This repo's
  `CLAUDE.md`/`CONSTANTS.md` still state a `< 1.2 MB preferred` / `2.5 MB hard`
  offline-HTML ceiling as closed/binding and make no mention of the v6 program.
- The v6 program's working branch does not exist in this repo
  (`khuffsphone/TinyWest`). This repo has exactly two real commits (`cfb0034`,
  `a4c4dd4`) and no v6 lane.
- No Drive document seen so far says the v6 lane supersedes or revokes this repo —
  the operative scope stays: this repo is not overridden, but it is also not
  confirmed current with the v6 lane's output. Open owner decision: is
  `khuffsphone/tinywest` still the canonical build target, or a frozen 2026-07-17
  prototype the project has since moved past in favor of the v6 lane?

## What this means for this repo

- **No code, canon, or protected constant has been changed in response to this.** Per
  `CLAUDE.md`'s "never silently merge, report conflicts" rule, this is a report, not a
  resolution.
- `slice/dist/tiny-west.html` (106,552 B, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`) remains this
  repo's current build and is unchanged since 2026-07-17.
- Until ruled, this repo keeps developing (if at all) under its existing closed rules
  and size ceiling.

## Provenance note

First surfaced by an earlier scheduled run (PR #87) and re-confirmed live,
independently, by multiple subsequent runs including this one — each run reads the
Drive Brain directly rather than trusting prior PR text, because none of those PRs
merged (see the process note in `STATUS.md`) and PR descriptions are not a durable
record.
