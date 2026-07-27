# CONFLICT-002 — repo canonical status vs. the live "Iron Trail v6" build line

Filed by the scheduled git-lane check-in (now registered by the Brain's own governance
as lane `GIT`, per Drive doc `112_COWORK_AUDIT_ALPHA312_ART11_SFX62_DSN21-22_AND_DISPATCH.md`
DEC-112-9). Verified directly against the canonical Drive Brain
(`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`), not relayed secondhand.

## The conflict

This repo (`khuffsphone/tinywest`) has had no commits since 2026-07-17. Its `CLAUDE.md`
states, as a **closed binding rule**: "One offline HTML distributable, < 1.2 MB preferred,
zero external requests" — 480×270 Canvas 2D only, no runtime 3D.

The canonical Drive Brain contains a separate, actively developed build line —
**"Tiny West: Iron Trail v6"** — that is *not* the same lineage as this repo's slice:

- `00_V6_START_HERE_CURRENT.md` (2026-07-19) explicitly **revokes** the size ceiling this
  repo still enforces.
- The live gate artifact as of 2026-07-26 is
  `Tiny-West-Iron-Trail-v6.0.0-alpha.3.12-presentation.html`, **4,461,370 bytes** — roughly
  41× this repo's ceiling — independently hash-verified in
  `112_COWORK_AUDIT_ALPHA312_ART11_SFX62_DSN21-22_AND_DISPATCH.md`.
- That Drive project runs its own multi-lane process (ART/BLD/SFX/DSN/SCB/REV, a
  `ROUTER.md`, lease files, gate hashes) entirely outside this git repo, with build
  history back to at least 2026-07-18 and active work through 2026-07-26.
- The v6 line uses fantasy-verb identity language ("Spur", dynamite relay, pay car,
  Sharpshooter mechanic) that overlaps with — but is not identical to — this repo's
  Rampage Express / Iron Trail reconciliation (CONFLICT-001).

**A cold session reading only this repo's `CLAUDE.md` would enforce a size ceiling the
Brain explicitly killed nine days ago, and would reject every current v6 candidate on
sight.** Per this repo's own "never silently merge, report conflicts" rule, no ceiling
change or canon merge has been made here.

## What this check-in did NOT do

- Did not raise, relax, or otherwise touch the 1.2 MB ceiling or any protected constant
  in this repo.
- Did not port any v6 asset, mechanic, or code into `slice/`.
- Did not treat the v6 line as authoritative over this repo, or vice versa.

## Open owner decision (`NEEDS_DECISION`)

One of:
1. **This repo is canonical** — the v6 Drive line needs to be reconciled into it (a large,
   owner-scoped migration), or
2. **This repo is a frozen 2026-07-17 prototype** the project has since moved past, and its
   `CLAUDE.md` should say so plainly, or
3. Something else the owner specifies.

Until ruled, this repo's slice keeps building to its existing spec (480×270, < 1.2 MB,
Canvas 2D, no runtime 3D) — those constants are unchanged pending the decision above.

## Related, separate item: live credential exposure

Independently of CONFLICT-002, the canonical Brain currently has an exposed, **live**
ElevenLabs API key sitting in a Drive-synced, Drive-indexed file. This is an
owner-actionable security issue, not a canon conflict — see
`STATUS_2026-07-27.md` for what this check-in verified directly. It blocks all paid
audio generation in the Drive-side project and is unrelated to this repo's code.
