# CONFLICT-001 — applied reconciliation (this repo)

Two parallel 2026-07-17 Brain sets exist (see `README.md`). Neither was deleted.
Full text: Drive doc `1_NNLFQm5X3JXEo2YZvqKm15qm3MGuTigX6xxGF54JaM`
("11 — STATUS — Tiny West Brain Reconciliation Note").

## Working ruling applied to the slice build

| Topic | Ruling |
| --- | --- |
| Player-facing identity | Rampage-first: "Tiny West: Rampage Express", loop CHASE → BOARD → BLAST → CASH → RETURN → ESCAPE. UI says BLAST/CASH/PAY CAR, never "rob/loot/bag". |
| Final subtitle | `NEEDS_DECISION` (Iron Trail vs Rampage Express vs Tiny West alone). No rebranding performed. |
| Mechanics | Iron Trail + Ground Truth preserved: active chase/sync, earned ladder boarding, discrete Fire, active reload, directional aim bias with threat-priority hard rule, physical payday (two lock pins, no bullet sponge), physical cash pickup, active return with clean/rough/rope, spatial escape fork. |
| Runtime | 2D Canvas 480×270 only. No runtime 3D (ADR-002 open). |
| Assets | All imported Drive/Library assets are `ASSET_UNVERIFIED` (per Asset Register v1: nothing is APPROVED_PRODUCTION). The slice uses only original placeholder pixel art authored in-repo on the 32-color master palette. |
| v4.0.0 baseline | Protected in ChatGPT Library (`libfile_08bab9c166a0819195c530ee1c386db5`, 130,485 B). Unreachable from this environment (proxy 403 to both Sites deployments). Not reconstructed from memory; the slice is a fresh spec-driven implementation. `CANON_BUILD_DELTA`: this repo does not contain the v4.0.0 artifact. |
| Drive `tinywest.html` candidate (`1zCPg0a0AqwMA3hGPaqB9g2jDz7pYv0-a`, 203,884 B) | Identified: byte size matches this repo's tribute `index.html` exactly — it is the tribute build re-uploaded, **not** a lost v4.0.0. Compare hashes to confirm before any consolidation. |
| Deployments | Untouched (no publishing performed; requires separate owner authorization). |

## Standing labels

- `CANON_BUILD_DELTA`: slice art frame counts/resolution below 07-spec production targets;
  no Wanted/Rampage/Overdrive/contract systems (full-run scope); pay-car cap 12 s vs
  v4's 15 s-on-80 s-clock mechanism; encounter grammar ships 1 of 6 cards.
- `ASSET_UNVERIFIED`: every Iron Trail "Approved" asset claim (register v1 approves nothing).
- `NEEDS_DECISION`: final subtitle; 2D/3D pipeline; canonical repo; release target.
