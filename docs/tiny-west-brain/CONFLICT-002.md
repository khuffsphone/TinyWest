# CONFLICT-002 — repo canonical status vs. the live "Iron Trail v6" build line

Filed and independently verified by the scheduled git-lane status check-in
(2026-07-27), directly against the canonical Drive Brain
(`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) — not relayed from a prior run's PR text.

## The conflict

This repo (`khuffsphone/tinywest`) has had no commits since 2026-07-17. `CLAUDE.md`
states, as a **closed binding rule**: "One offline HTML distributable, < 1.2 MB
preferred, zero external requests" — 480×270 Canvas 2D only, no runtime 3D.

The canonical Drive Brain contains a separate, actively developed build line —
**"Tiny West: Iron Trail v6"** — not the same lineage as this repo's slice. Verified
directly this pass:

- `00_V6_START_HERE_CURRENT.md` (Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`),
  status CURRENT, effective 2026-07-19: "The inherited 1.2 MB artifact ceiling is
  revoked. The user did not establish it." Opens the "v6 no-size-cap rebuild" program.
- The live gate progression (per `112_COWORK_AUDIT_ALPHA312_...md`, 2026-07-26) has
  reached alpha.3.12-presentation, **4,461,370 bytes** — roughly 41× this repo's
  ceiling — independently hash-verified by that audit.
- That Drive project runs its own multi-lane process (ART/BLD/SFX/DSN/SCB/REV, a
  `ROUTER.md`, lease files, gate hashes) entirely outside this git repo, with build
  history back to at least 2026-07-18 and active work through 2026-07-26.
- The v6 line's identity language (Spur, dynamite relay, pay car, Sharpshooter) overlaps
  with but is not identical to this repo's Rampage Express / Iron Trail reconciliation
  (CONFLICT-001).

**A cold session reading only this repo's `CLAUDE.md` would enforce a size ceiling the
Brain revoked eight days ago, and would reject every current v6 candidate on sight.**
Per this repo's own "never silently merge, report conflicts" rule, no ceiling change or
canon merge has been made here.

## What this check-in did NOT do

- Did not raise, relax, or otherwise touch the 1.2 MB ceiling or any protected constant
  in this repo.
- Did not port any v6 asset, mechanic, or code into `slice/`.
- Did not treat the v6 line as authoritative over this repo, or vice versa.

## Open owner decision (`NEEDS_DECISION`)

One of:
1. **This repo is canonical** — the v6 Drive line needs to be reconciled into it (a
   large, owner-scoped migration), or
2. **This repo is a frozen 2026-07-17 prototype** the project has since moved past, and
   its `CLAUDE.md` should say so plainly, or
3. Something else the owner specifies.

Until ruled, this repo's slice keeps building to its existing spec (480×270, < 1.2 MB,
Canvas 2D, no runtime 3D) — those constants are unchanged pending the decision above.

## Related, separate item: live credential exposure

See `STATUS.md` (2026-07-27 entry). Independently of CONFLICT-002, the canonical Brain
has an exposed, live ElevenLabs API key sitting in a Drive-synced, Drive-indexed file.
Verified present and unrotated as of this check-in. This is an owner-actionable security
issue, not a canon conflict, and is unrelated to this repo's code.
