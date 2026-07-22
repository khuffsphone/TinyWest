# GOV-77 — alpha.3.5 GAME-FEEL JUICE: BUILD + ACCEPTANCE RECEIPT
**Author:** Claude Code (builder, single game-build lease — CLOUD session per GOV-75). 2026-07-22.
**Status:** BUILT + builder acceptance run (18/18 gates) → **awaiting Cowork independent audit + owner approval. Not self-certified.**
Scope: GOV-69 juice candidate, renumbered to alpha.3.5 by the GOV-72 scope correction + GOV-75 two-lane split (audio encode+embed deferred to the box). Tags: `OBSERVED` · deviations disclosed.

## Candidate identity
- **File:** `Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html`
- **Bytes:** 2,468,050 (+7,620 vs source) · **SHA-256:** `930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8`
- **Source:** alpha.3.4 `1dcb5a74f787c5b800f049bf35815a2adc54173015f9a33761ddc80ce0360873` (gate target) — SHA-verified pre-build, byte-untouched after (re-hashed post-suite).
- **Builder:** `tools/77_BUILD_ALPHA3_5.py` — deterministic; 17 anchored edits, each required to occur exactly once (abort otherwise); rebuild is byte-identical (run twice, same hash).

## What it adds (all presentation-layer, never in the hash)
1. **TW_JUICE module** (closure-scoped, inserted before `render()`): a **read-only observer of `G`** with **zero `G.*` writes** and its **own fixed-seed xorshift32 decorative RNG** (never `G.rng`/`G.fxRng`, no wall-clock reads, no timers). Detects per-render-frame deltas (shots, kills, hits, hp drop, loot/bank/coin gains, roof/horse landings, score gains) and drives:
   - **muzzle flash** (render-layer starburst at gun tip, world canvas) + subtle screen brightness kick;
   - **dust particles** (hoof dust while riding, landing puffs) and **coin sparkles** (loot/bank gains) in juice-owned arrays (cap 160);
   - **damage-vignette pulse** on player hit (red edge pulse, decaying);
   - **score-pops** ("+N" under the HUD score, threshold ≥50/frame, cap 6);
   - **additive screen shake** (impulse+decay, offsets added to the world blit);
   - **render hit-stop**: `frame()` gate skips `render()` calls for ≤4 frames on kill/hurt — **the deterministic tick sequence is never altered** (ticks continue; only presentation pacing changes; self-limiting: frozen frames cannot re-trigger while frozen). `__TW.step()`/`renderOnly()` bypass the gate, so harness stepping is unaffected.
2. **JUICE FX options row** (row 13, between PALETTE and REBIND KEYS) bound to `PROFILE.settings.juice` (default ON, persisted with the profile; explicit `false` survives access-preset application because presets spread-merge). Menu row pitch 13→12 px to seat 17 rows.
3. **Component gating respects existing accessibility toggles:** extra shake + hit-stop obey SCREEN SHAKE; muzzle screen-kick + vignette pulse obey FLASH (reducedFlash); everything obeys the JUICE FX master row.
4. **`__TW.juice` test hook** — `enabled()/setEnabled(v)/diagnostics()` (counters prove juice activity during parity runs; inert-observational, same class as `__TW_SFX_DIAG`, strip at RC).
5. Version truth → 6.0.0-alpha.3.5 (`G.version`, `TW_BUILD_INFO.version`/`artifactFile`, `<title>`) + tail provenance comment.

## Acceptance results (builder-run; Cowork re-verifies; harness `tools/77_ACCEPT_ALPHA3_5.mjs`, Playwright/Chromium, `__TW` API, deterministic input schedule identical on both artifacts)
| # | Gate | Result |
|---|---|---|
| 1 | Candidate identity (`__TW.juice` present only in candidate) | **PASS** |
| 2 | Juice default ON | **PASS** |
| 3 | **Tick parity vs `1dcb5a74…`, juice ON** — 25 seeds × 320 ticks, per-tick `stateHash` | **PASS — 8,000 comparisons, 0 mismatches** |
| 4 | Juice ACTIVE during ON parity (non-vacuous) | **PASS** — shots=237 kills=6 lands=48 pops=94 particles spawned=715 events=295 |
| 5 | **Tick parity vs `1dcb5a74…`, juice OFF** — 10 seeds × 320 ticks | **PASS — 3,200 comparisons, 0 mismatches** |
| 6 | Determinism (seed 999 × 150, run twice) | **PASS** — identical per-tick hashes |
| 7 | `renderOnly(60)` hash-neutral with juice ON | **PASS** |
| 8 | JUICE FX menu row toggles + persists via profile | **PASS** (ON→OFF→ON via real menu input path) |
| 9 | Offline — request interception, both artifacts | **PASS** — 0 external requests |
| 10 | Console/page errors, stepped pair | **PASS** — 0 |
| 11 | **Gamepad-guard regression** (throwing `getGamepads` injected, live rAF loop) | **PASS** — loop alive (titleT 2→73), 0 errors |
| 12 | Live smoke (real rAF loop, scripted inputs ~4 s) | **PASS** — juice active (shots/spawned>0; hit-stop observed frozenFrames>0 on kill in a prior identical run), canvas painted, 0 errors |
| 13 | Offline/errors, live pages | **PASS** — 0 |
| 14 | Protected values | **PASS** — ROOF_Y 99 · LANES [205,226,247] · LADDER_X 224 · board 36/18 · reload 54 · notch [7,13] (runtime `TW_BUILD_INFO.protectedValues` + source text) |
| 15 | Version truth 6.0.0-alpha.3.5 | **PASS** |
| 16 | Static scan of added code — no `G.*` writes / `G.rng` / `G.fxRng` / `Math.random` / `Date.now` / `performance.now` / timers / network | **PASS** (only writes: `PROFILE.settings.juice` — the disclosed toggle, same class as existing shake/flash/grain toggles) |
| 17 | Gamepad guard text intact, no unguarded `getGamepads` anywhere | **PASS** — GOV-53 exact prescription retained |
| 18 | Byte-identical rebuild from `77_BUILD_ALPHA3_5.py` | **PASS** — re-run → same SHA |

Screenshots for the record: `a35_live_play.png` (in-run, HUD intact), `a35_options_menu.png` (17-row menu, JUICE FX row).

## Deviations disclosed (GOV-58 lesson — ALL of them)
- **D1 — Lease held by a CLOUD session.** GOV-52 rev 3 §0 hard-gates the lease to the Windows box; the owner's GOV-75 ruling supersedes it (two-lane split: cloud = game lease, box = art lane). Authority order #1 (owner's latest explicit instruction) applied; lineage disclosed here.
- **D2 — Candidate delivery path.** The Drive connector's inbound path worked byte-exact (oversized MCP results spool to disk; source SHA verified). The **outbound** path cannot carry a 2.4 MB artifact (inline-content upload only; token-channel constraint). The candidate is therefore delivered **byte-exact to GitHub** `khuffsphone/TinyWest`, branch `claude/tinywest-cloud-building-jue13c`, `v6/` (draft PR opened), **with SHA-256 above as the end-to-end integrity check**; the box/Spark should stage it into the Drive Brain and re-verify the SHA. The build script, acceptance harness, and this receipt are uploaded to Drive directly (small text). A byte-exact copy of the alpha.3.4 source is included in `v6/` so the build reproduces from the repo alone (copy, not an edit — protected artifact untouched in Drive).
- **D3 — Doc numbering (registry untouched).** Per instruction, `DOC_ID_REGISTRY.json` was NOT edited. Intended numbers: **this receipt = GOV-77**, build script prefix 77; **GOV-76 remains reserved for the art lane's render receipt** (GOV-75). Box/Spark reconciles; Spark's append-only debt continues to accumulate (GOV-61 items → GOV-77).
- **D4 — Menu layout.** Options row pitch 13→12 px (17 rows). The pre-existing pointer hit-map for options rows (top rows only, stale /23 divisor from the 8-row era) is unchanged — observed 3.4 behavior, out of scope here; keyboard covers all rows. Flagged for a future housekeeping pass.
- **D5 — LOW MOTION preset does not force juice off.** Juice components follow the existing toggles (shake-gated / flash-gated), and the JUICE FX master row is available, but the access presets don't name `juice`, so the preset alone leaves particle/score-pop juice on. If the owner wants preset coupling, that is a one-line follow-up — owner's call.
- **D6 — Decorative RNG choice.** GOV-69 allowed "separate decorative RNG **or** time-based values"; I chose a **fixed-seed xorshift32** (deterministic, reproducible, no wall-clock) rather than time-based. Juice visuals repeat run-to-run; they are not coupled to the sim seed.
- **D7 — Tuning guardrails picked by builder** (not in the handoff): score-pop threshold ≥50/frame and cap 6; particle cap 160; hit-stop cap 4 render frames; shake cap 6. Chosen for restraint and bounded cost; owner may retune.

## NOT TESTED (stated plainly)
Physical gamepad/touch hardware; audio interplay beyond the untouched existing paths; long-session localStorage quota; CVD palette interaction with juice colors (juice uses fixed golds/tans/red — not palette-remapped, same class as D3 of GOV-71); real-display frame pacing / visual taste of hit-stop and shake (headless only — **owner's eye required**); iframe-embedded distribution beyond the injected-throw gamepad test.

## Handoff
Cowork: independent audit of `930f3a15…`. Owner: approval (gate target advances per DEC-060-2 on clearance). I am **stopped** until alpha.3.5 is cleared. Next in queue after clearance: the deferred alpha.3.x audio encode+embed on the box (GOV-72 corrected scope), and the art-lane `alpha.3.x-art` embed under this lease once GOV-76 art clears.
