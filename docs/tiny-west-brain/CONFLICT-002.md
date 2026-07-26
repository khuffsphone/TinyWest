# CONFLICT-002 — this repo vs. the live "v6 Iron Trail" Drive pipeline (unresolved by owner)

**Filed:** 2026-07-26, by a Claude Code scheduled status-check session on `khuffsphone/tinywest`.
**Status:** `NEEDS_DECISION` (owner-level). Reporting only — nothing below has been merged or acted on.

## What was found

Reading the canonical Drive Brain directly (not just this repo's local mirror) turned up a
governing document this repo's `CLAUDE.md` does not reflect: `00_V6_START_HERE_CURRENT.md`
(Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`, effective 2026-07-19, status CURRENT), which opens
a **"Tiny West: Iron Trail v6 no-size-cap rebuild"** program. Verified live in the Drive Brain
folder (`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) as of 2026-07-26:

- The 1.2 MB single-file ceiling this repo's `CLAUDE.md`/`CONSTANTS.md` still enforce is
  **explicitly revoked** for the v6 line ("Artifact bytes are telemetry only").
- Current live gate target: `Tiny-West-Iron-Trail-v6.0.0-alpha.3.11-lawroofArt.html`
  (SHA-256 `da2300a3…`, **4,460,083 bytes**, DEC-106-1/GOV-106).
- New evaluation candidate staged and HOLDING for independent Cowork audit:
  `alpha.3.12-presentation.html` (SHA-256 `33667491…`, 4,461,370 bytes, BLD-14, 34/34 Playwright
  gates PASS per builder, per `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md`).
- An active multi-lane pipeline (Game-Build/BLD, Art/ART, Audio/SFX+VOX, Design+Research/DSN,
  Scribe/SCB, plus a GPT reviewer lane) is shipping into this v6 line entirely through Drive +
  local toolchains (Playwright, Blender, Google Flow/Gemini for audio) — **not through this git
  repository**. Governance notes run at least to GOV-111 / DEC-111-x.
- This repo's connected-repository check (`32_ALPHA3_INSTRUMENTATION_RECEIPT.json`, 2026-07-18)
  already recorded `"sourceControl.status": "OPEN"` — the claimed v6 baseline git commit was never
  found in `khuffsphone/TinyWest`, i.e. this repo was never confirmed as v6's authoritative repo.

## Why this is a second, larger conflict than CONFLICT-001

CONFLICT-001 (see `RECONCILIATION.md`) was a naming/subtitle disagreement between two documents
dated the same day, with mechanics held constant. CONFLICT-002 is a live authority supersession:
a binding protected constant (the byte ceiling) has been revoked upstream, and the actual current
build effort has moved ~41x past the artifact size this repo's slice targets, on a toolchain this
repo doesn't run. Per `CLAUDE.md`'s own CONFLICT-001 clause — "never silently merge the two sets;
report conflicts" — this is reported, not resolved.

## Open owner decision

Is `khuffsphone/tinywest` still meant to be a canonical build target for Tiny West, or is it a
frozen 2026-07-17 prototype (the 42-second slice) that the project has since moved past in favor
of the Drive-native v6 pipeline? Until the owner rules:

- This repo's `CLAUDE.md` constants (1.2 MB ceiling, "no runtime 3D", the 42-second slice scope)
  remain binding **for this repo** — they are not silently overridden by the v6 charter.
- No v6 artifact, constant, or scope change is imported into this repo.
- Scheduled status runs against this repo should keep re-verifying the slice as-is and re-flag
  this conflict rather than attempt to reconcile it unilaterally.

## Related, separate item: GOV-111 (security)

See `STATUS_2026-07-26.md` for a live, owner-actionable secret-handling finding surfaced in the
same Drive Brain (VOX/paid-SFX generation hard-blocked pending confirmation that a recreated
`.env.txt` in the Drive-synced tree holds no live credential). Unrelated to CONFLICT-002's canon
question but discovered via the same primary-source check.
