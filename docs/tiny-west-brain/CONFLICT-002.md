# CONFLICT-002 — this repo vs. the live "Iron Trail v6 no-size-cap rebuild" (unresolved by owner)

**Filed:** 2026-07-26, by a Claude Code scheduled status-check session on `khuffsphone/tinywest`.
**Status:** `NEEDS_DECISION` (owner-level). Reporting only — nothing below has been merged,
rebranded, or imported into this repo's code.

## What was found

Reading the canonical Drive Brain directly (folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`), not just
this repo's local mirror, surfaces a governing document this repo's `CLAUDE.md` does not reflect:
`00_V6_START_HERE_CURRENT.md` (Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`, created 2026-07-18,
effective 2026-07-19, status **CURRENT**). It opens a **"Tiny West: Iron Trail v6 no-size-cap
rebuild"** program, confirmed live as of 2026-07-26 via the Brain's own nightly audits
(`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_2{1..6}.md`):

- The 1.2 MB single-file ceiling this repo's `CLAUDE.md` / `CONSTANTS.md` still enforce is
  **explicitly revoked** for the v6 line: "Artifact bytes are telemetry only; Chrome startup,
  decoded memory, frame time, determinism, offline integrity, playability, audio quality, rights,
  and human UAT are the gates."
- Current live gate target: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`
  (SHA-256 `da2300a3…`, **4,460,083 bytes**, DEC-106-1/GOV-106) — roughly 42× this repo's slice
  artifact. A newer candidate, `alpha.3.12-presentation` (4,461,370 bytes), is staged and
  HOLDING for independent audit.
- An active multi-lane pipeline (Game-Build/BLD, Art/ART, Audio/SFX+VOX, Design+Research/DSN,
  Scribe/SCB, plus outside reviewer lanes) has been shipping into this v6 line since at least
  2026-07-21 via Drive + local toolchains (Python build scripts, Playwright UAT, ElevenLabs voice,
  Google Flow/Gemini audio) — **not through this git repository.** Governance numbering runs at
  least to GOV-111 / DEC-111-x as of 2026-07-26.
- Nothing in `khuffsphone/tinywest`'s git history (still exactly two commits: the tribute build
  and the 2026-07-17 42-second slice) reflects any of this. The repo has been a frozen snapshot
  since 2026-07-17, while the v6 line has iterated through at least alpha.2 → alpha.3.12 since.

## Why this is a second, larger conflict than CONFLICT-001

CONFLICT-001 (`RECONCILIATION.md`) was a naming/subtitle disagreement between two same-day
documents, with mechanics held constant. CONFLICT-002 is a live authority supersession: a
protected constant this repo still enforces (the byte ceiling) was revoked upstream a week before
this repo's own last commit, and the active build effort has moved far past this repo's scope on
a toolchain this repo doesn't run. Per `CLAUDE.md`'s own rule — "never silently merge the two
sets; report conflicts" — this is reported, not resolved.

## Open owner decision

Is `khuffsphone/tinywest` still meant to be a canonical build target for Tiny West, or is it a
frozen 2026-07-17 prototype (the 42-second slice) the project has since moved past in favor of
the Drive-native v6 pipeline? Until the owner rules:

- This repo's `CLAUDE.md` constants (1.2 MB ceiling, "no runtime 3D", the 42-second slice scope)
  remain binding **for this repo** — not silently overridden by the v6 charter.
- No v6 artifact, constant, or scope change is imported here.
- Scheduled status runs against this repo should re-verify the slice as-is and re-flag this
  conflict rather than attempt to reconcile it unilaterally.

## Related, separate item: GOV-111 (security, open)

The same live Drive Brain records an open, owner-actionable credential-handling item: the
previously-flagged leaked `.env` at the Drive-synced project root is gone, but a same-sized
`.env.txt` was recreated at that path and paid audio generation (SFX and voice) is mechanically
blocked pending the owner confirming it holds no live key or relocating it off every Drive-synced
path. This is corroborated independently by multiple lane receipts in the Brain (most recently
`SFX-62_REMAINING_AUDIO_MANIFEST_AND_CREDENTIAL_BLOCK.md`, 2026-07-26) and is unrelated to
CONFLICT-002's canon question — noted here only because it surfaced via the same primary-source
read and remains unresolved as of the latest audit.
