# CONFLICT-002 — this repo vs. the active external "Iron Trail v6" program

Unlike CONFLICT-001 (two parallel Brain document sets, see `RECONCILIATION.md`),
this is a conflict between **this repo's own frozen 2026-07-17 slice** and a
**separate, actively-developed build program** living in the same Drive Brain
folder tree, verified live against the Brain's 2026-07-28 06:04 UTC nightly
health report (doc `19fAK6LqQa0ORgti6BzXu0GT1L6yc5IVaAVo3eoMeXvQ`).

## What's active outside this repo

- Program name: "Tiny West: Iron Trail v6" no-size-cap rebuild (effective
  2026-07-19).
- Current live gate target: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`
  — 4,460,083 bytes (DEC-106-1 / GOV-106).
- Newest candidate: `alpha.3.12-final.html` — 4,471,627 bytes (BLD-15),
  combining row-4 dynamite art polish, hero rifle fire art, and a trimmed fuse
  SFX loop; staged in the Drive root, holding for a Cowork UAT audit.
- New infrastructure: an "autoloop" 10-order arc (GOV-113/AUTOLOOP-01) was
  installed at the project root on 2026-07-27, and its own routing has
  registered a `GIT` lane pointed at "this repo" — i.e. the external program
  now has a standing intent to eventually touch `khuffsphone/tinywest`, not
  just its own separate build tree.

## Why this conflicts with this repo's stated constraints

This repo's `CLAUDE.md` and `docs/tiny-west-brain/CONSTANTS.md` state a
1.2 MB preferred / 2.5 MB hard ceiling for the one offline HTML distributable,
sourced from the Iron Trail/Rampage canon this repo built its 42-second slice
from. The external v6 program's live gate and every recent candidate exceed
that ceiling by roughly 4×, under an explicit no-size-cap revocation that
applies to *that* program's own build tree.

## What is and isn't decided

- **Not decided by any Drive document found so far:** whether the v6
  program's size-cap revocation, or any of its build decisions, apply to or
  supersede this repo. No document claims `khuffsphone/tinywest` has been
  deprecated, and no document claims it remains the sole canonical target
  either.
- **`NEEDS_DECISION` (owner-level, unchanged since first reported 2026-07-26):**
  is this repo still the canonical build target, or a frozen 2026-07-17
  prototype the wider project has since moved past? Until an owner rules on
  this, no code, canon, or protected constant in this repo should be changed
  to match the external program's scale or direction.
- This repo's own 42-second slice (`slice/`) remains unaffected either way:
  it was built to the Iron Trail/Rampage canon's *slice-phase* constraints,
  which are a documented subset of, not a contradiction of, the full v6
  program's eventual scope.

## Standing action

Report only — do not silently merge, adopt, or rebuild against the v6
program's larger scale without an explicit owner ruling. Re-verify against the
Brain's nightly health report (or successor) before assuming this conflict's
facts are still current; the external program's candidates have moved on
every audit cycle logged so far (07-25 through 07-28).
