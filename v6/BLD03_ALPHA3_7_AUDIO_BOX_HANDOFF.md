# BLD-03 — alpha.3.7-audio: BOX-BUILD HANDOFF (canonical build is a box job)
**Author:** Claude Code (cloud game-build session). 2026-07-22. **Status:** cloud stood down; canonical 121/121 build to run on the box. **Not self-certified** — hold for Cowork audit before the CATCH/SYNC mechanic candidate. Intended doc number **BLD-03** (box/Spark reconciles the registry; cloud does not edit `DOC_ID_REGISTRY.json`).

## Why the box, not the cloud
`095-2.ogg` (family `interaction.safe-lock`, take 2) is **unrecoverable via the Google Drive connector**: Drive's own `get_file_metadata` reports **13591 bytes** (== manifest), but `download_file_content` deterministically returns **13594 bytes** across 4 independent fetches — the connector re-encodes this specific file's bytes (+3) and no trim reconciles it. The byte-correct file exists on the box, so the reproduce-on-the-box model (GOV-80) resolves it cleanly. The cloud session therefore hands the canonical build to the box rather than shipping a non-canonical 120/121 artifact.

## Pinned inputs — all committed to this repo, pullable (branch `claude/tinywest-cloud-building-jue13c`, `v6/`)
| Artifact | Repo path | SHA-256 |
| --- | --- | --- |
| Build script (deterministic assembler + wiring) | `v6/BLD03_BUILD_ALPHA3_7_AUDIO.py` | `dde460fca31acd7288d611a5cec0d3f74152293927733db1d97d31e36cadc7fd` |
| Encode manifest (206 clips / 77 families) | `v6/round1_full_encode_manifest.json` | `5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a` |
| Wiring spec (Cowork-checked) | `v6/round1_wiring_spec.json` | `68dd7a038680f0434c19a2a7c31b10bfbcf4b4f2662870b875564857daf00568` |
| Acceptance harness | `v6/BLD03_ACCEPT_ALPHA3_7.mjs` | (see repo) |
| Wiring map / context notes | `v6/BLD03_NOTES.md` | (see repo) |

The build script also embeds these SHAs internally and **aborts on any mismatch**. Source/gate target: alpha.3.6 `86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa` (must be present next to the script, or adjust the path). Partial OGG set (104/121, all SHA-verified) is also committed under `v6/audio/assets/audio/_embed/round1_remaining/` as a fallback — the box uses its own local, complete OGG tree.

## Box run instructions
1. Place the box's local, byte-correct round1_remaining OGGs so that `<ogg-root>/assets/audio/_embed/round1_remaining/<cue>-<take>.ogg` resolves (all 121, including the true `095-2.ogg` = 13591 B, sha `5f7c5217fac9a6a4f3c5809d4559dc06ec07cf3ef0eb386d21431eeba389248f`).
2. Put `Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html` (`86157cd0…`) next to the script.
3. Run **canonically (no `--exclude`)**: `python3 BLD03_BUILD_ALPHA3_7_AUDIO.py --ogg-root <box-ogg-root>`
   - Verifies every clip's `oggSha256`/bytes against the manifest (85 carried extracted from the 3.6 blob + 121 new = 206), regenerates `TW_SAMPLE_DATA` deterministically, applies the 46-family wiring (incl. 006/073/100 with the DEC-085-2 defaults), and emits `Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html`.
   - **Pin `OUT_SHA`/`OUT_BYTES`** in the script to the printed values and re-run to confirm a byte-identical rebuild (GOV-80).
4. Run `node BLD03_ACCEPT_ALPHA3_7.mjs` (Playwright/Chromium): tick-parity vs `86157cd0` audio OFF / ON / no-context; determinism; decode 206 takes / 77 families; ambient-loop conductor; gamepad-guard regression; offline; 0 errors; protected values (ROOF_Y 99 · LANES · LADDER_X 224 · board 36/18 · reload 54 · notch [7,13]).
5. Deliver the candidate (name + bytes + SHA) + this pinned script + a BLD receipt to the Brain; **hold for Cowork's independent audit** before advancing the gate.

## Build design (already implemented in the script)
Read-only emits through the existing bus/limiter graph; audio-local `audioRand` only (never `G.rng`/`G.fxRng`); **audio state stays outside `getSimulationState`/`stateHash`** → tick-parity-clean audio OFF and ON; the 85 carried takes are extracted from the alpha.3.6 blob (SHA-matched, never transported); a render-side `TW_AMB` conductor drives ≤3 ambient loops (tier-7 drop-first); the alpha.3.3 gamepad guard is preserved; protected constants immutable by value.

## Cloud session deviations disclosed
- **D1 — canonical build not run in the cloud** (095-2 connector defect, proven above). No cloud candidate shipped; the `--exclude` path in the script exists only for a labeled non-canonical evidence build and was **not used** per owner direction.
- **D2 — OGG set in the repo is 104/121** (16 more were still inbound via background fetch agents at stand-down; two agents unreported). The box does not depend on these; it uses its local tree.
- **D3 — numbering** recorded as intended BLD-03; registry untouched by the cloud session.

## Cloud stand-down
Cloud game-build session is standing down. Everything the box needs is committed and pushed to `origin/claude/tinywest-cloud-building-jue13c`. No cloud self-certification; the box runs the canonical build and Cowork audits.
