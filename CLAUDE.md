# CLAUDE.md — Tiny West repository

This repository holds **Tiny West** playable builds.

## Read the Brain first

Canonical remote Brain (source of truth): Google Drive folder
`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`
(https://drive.google.com/drive/folders/1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E)

Local index + protected constants: `docs/tiny-west-brain/`.

**Authority conflict notice (CONFLICT-001, unresolved by owner):** the Brain contains
two parallel 2026-07-17 handoff sets — the underscore-named "Iron Trail" set and the
numbered "Rampage Express" set. Per `11 — STATUS — Brain Reconciliation Note`
(doc `1_NNLFQm5X3JXEo2YZvqKm15qm3MGuTigX6xxGF54JaM`) and the owner's relayed ruling:

- **Rampage-first language** governs reversible player-facing work
  (loop: CHASE → BOARD → BLAST → CASH → RETURN → ESCAPE; subtitle "Rampage Express").
- **Iron Trail's mechanical/technical/slice constraints are preserved** (active chase,
  skillful boarding, discrete Fire, active reload, physical return, spatial escape fork,
  exact 42-second slice, 480×270 Canvas 2D, one offline HTML).
- Final public subtitle and the long-term 2D/3D asset pipeline are `NEEDS_DECISION`
  (owner-level). Do not rebrand, do not introduce runtime 3D.
- Never silently merge the two sets; report conflicts.

**CONFLICT-002 (unresolved by owner):** a separate, Drive/Cowork-only "v6 no-size-cap
rebuild" lane (branch `v6/no-size-cap-rebuild`, not present in this repo) revokes the
1.2 MB ceiling below *for that lane only* — no Drive document extends the revocation
to this repo. Whether `khuffsphone/tinywest` is still canonical relative to that lane
is `NEEDS_DECISION` (owner-level). See `docs/tiny-west-brain/CONFLICT-002.md`.

## What is in this repo

| Path | What | Status |
| --- | --- | --- |
| `index.html` | "Tiny West" Sunset Riders tribute (320×240, React shell, base64 8×8 tiles) | Protected earlier build — do not modify without need |
| `slice/` | **42-second vertical slice** of Rampage Express (480×270, deterministic 60 Hz) | Active development |
| `slice/dist/tiny-west.html` | Built one-file offline slice | Generated — rebuild via `node slice/tools/build.mjs` |
| `docs/tiny-west-brain/` | Brain index, protected constants, reconciliation, build receipts | Keep current |
| `dev/`, `docs/*.png` | Tribute-build pipeline and screenshots | Historical |

The verified `4.0.0-rampage` standalone baseline (130,485 bytes) lives in the owner's
ChatGPT Library (`libfile_08bab9c166a0819195c530ee1c386db5`), NOT in this repo, and was
unreachable from the build environment (proxy 403 to the Sites deployments). Never
claim to have reproduced it; the slice here is a fresh implementation of the audited
42-second slice per the Brain specs.

## Closed rules (binding)

- No held auto-fire; Fire is discrete/edge-triggered on every device.
- Aim assist never selects a prop over an enemy in committed attack wind-up.
- No timer-only chase/return/escape; no hold-button return.
- No permanent combat-stat upgrades. No runtime GLB/FBX/WebGL.
- Deterministic sim: seeded PRNG only; no `Math.random()` in simulation.
- Live HUD ≤ 24 native px; no live overlay > 12% of screen.
- No uncontrollable camera beat > 0.45 s.
- 480×270 canvas backing store; image smoothing off; integer positions.
- One offline HTML distributable, < 1.2 MB preferred, zero external requests.

## Protected tuning constants

See `docs/tiny-west-brain/CONSTANTS.md`. Change only with evidence + a decision note.

## Build & test (slice)

```sh
cd slice
node tools/sprites.mjs preview   # regenerate + preview atlas (tools/previews/atlas.png)
node tools/sprites.mjs emit      # write src/atlas.gen.js
node tools/build.mjs             # write dist/tiny-west.html
node tools/playtest.mjs          # smoke + determinism + natural keyboard run
node tools/qa2.mjs               # touch, viewports, reset cycles
node tools/qa3.mjs               # pay-car route reachability + completion
```

`window.TinyWestTest` is the development diagnostics API (setSeed, startSlice,
injectLogicalInput, runDeterminismCheck, skipToState, exportEventLog, …).

Done means tested: run the build, the determinism check, all input paths, and open the
final HTML offline before claiming completion.
