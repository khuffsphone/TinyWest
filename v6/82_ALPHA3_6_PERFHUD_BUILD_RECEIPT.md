# GOV-82 — alpha.3.6 PERF/TELEMETRY HUD: BUILD + ACCEPTANCE RECEIPT
**Author:** Claude Code (builder, single game-build lease — CLOUD session per GOV-75). 2026-07-22.
**Status:** BUILT + builder acceptance run (20/20 gates) → **awaiting Cowork independent audit + owner approval. Not self-certified.**
Scope: doc 59 §3.4 perf-telemetry item, owner-selected as alpha.3.6. Delivered under the **GOV-80 transport protocol** (script + harness + receipt only; the candidate never travels). Tags: `OBSERVED` · deviations disclosed.

## Candidate identity (GOV-80: reproduce, don't transport)
- **File:** `Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html` — **2,472,284 bytes (+4,234), SHA-256 `86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa`**
- **Source:** alpha.3.5 `930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8` (gate target per GOV-81) — SHA-verified pre-build.
- **Builder:** `82_BUILD_ALPHA3_6.py` — deterministic; **pins source AND target SHA** (aborts on any mismatch); 9 anchored edits, each required to occur exactly once; rebuild byte-identical (run twice, same hash; the pinned script re-verifies its own output).

## What it adds (presentation-layer diagnostic; never in the hash)
1. **TW_PERF module** (closure-scoped): a perf HUD with **zero `G.*` access of any kind** (stricter than the juice layer, which reads `G`). Readouts:
   - **FRAME** — last / rolling-avg / rolling-max rAF frame time (120-frame window), measured from the rAF timestamp `frame()` already receives (no new `performance.now()` call sites);
   - **TICKS** — sim ticks executed on the last rAF (accumulator health);
   - **HEAP** — `performance.memory.usedJSHeapSize` in MB (guarded; N/A where unsupported);
   - **DECODE** — the audio engine's own `decodeMs` + family count via the accepted `__TW_SFX_DIAG` hook (read-only);
   - **FP/FCP** — first-paint / first-contentful-paint from `performance.getEntriesByType('paint')` (guarded; N/A where absent).
   Sampling is lazy (every 30th drawn frame); drawn topmost via one render()-tail hook; compact 168×28 panel bottom-left (≈4.8% of screen, 5 px native font).
2. **Toggle:** F3 (capture-phase listener; ignores keys while TW_OPTS rebind capture is active; `preventDefault` on F3 only) + **`__TW.perf`** test hook (`enabled/setEnabled/sample/snapshot`). **Default OFF each load** — diagnostic instrument, not a player setting.
3. Version truth → 6.0.0-alpha.3.6 + tail provenance comment.

## Measured baselines (doc 59 §3.4 — the point of this candidate)
Environment: headless Chromium 1194 (Playwright), cloud container, `file://`, alpha.3.6, live rAF loop ~3.5 s with scripted inputs, audio unlocked:
| Metric | Value |
|---|---|
| Frame time | last 16.7 ms · **avg 16.67 ms** · max 16.8 ms (locked 60 Hz; 1 tick/rAF) |
| JS heap | **12.8 MB** used |
| Audio decode | **91 ms**, 31 families (cf. ~111 ms observed by Cowork on 3.2) |
| First paint / FCP | **40 ms / 168 ms** |
These are the cloud floor; **box (Windows) baselines are still owed** on real hardware per doc 59 — the HUD now makes that a 10-second task (open canonical file, press F3).

## Acceptance results (builder-run; Cowork re-verifies; harness `82_ACCEPT_ALPHA3_6.mjs`)
| # | Gate | Result |
|---|---|---|
| 1 | Candidate identity (`__TW.perf` only in candidate) | **PASS** |
| 2 | Perf HUD default OFF | **PASS** |
| 3 | Juice layer intact (default ON) | **PASS** |
| 4 | **Tick parity vs `930f3a15…`, HUD OFF** — 25 seeds × 320 ticks | **PASS — 8,000 comparisons, 0 mismatches** |
| 5 | HUD hidden by default (0 draws in OFF runs) | **PASS** |
| 6 | **Tick parity vs `930f3a15…`, HUD ON** — 10 seeds × 320 ticks | **PASS — 3,200 comparisons, 0 mismatches** |
| 7 | HUD active during ON parity (non-vacuous: 3,200 draws, live samples) | **PASS** |
| 8 | Determinism (seed 999 × 150 twice, HUD ON) | **PASS** |
| 9 | `renderOnly(60)` hash-neutral, HUD ON | **PASS** |
| 10 | F3 toggles HUD via real key events | **PASS** |
| 11 | Offline, stepped pair | **PASS** — 0 external |
| 12 | 0 console/page errors, stepped pair | **PASS** |
| 13 | Gamepad-guard regression (throwing `getGamepads`, live loop alive) | **PASS** |
| 14 | Live smoke: HUD measuring in real loop | **PASS** — frames=214, draws=211 |
| 15 | Baselines captured | **PASS** (table above) |
| 16 | Live pages: painted, 0 errors, offline | **PASS** |
| 17 | Protected values (ROOF_Y 99 · LANES · LADDER_X 224 · board 36/18 · reload 54 · notch [7,13]) | **PASS** |
| 18 | Version truth 6.0.0-alpha.3.6 | **PASS** |
| 19 | Static scan of added code — **zero `G.*` access**, no sim RNG / `Math.random` / `Date.now` / timers / network | **PASS** |
| 20 | Gamepad guard text intact (GOV-53 prescription) | **PASS** |

Screenshot for the record: `a36_perf_hud.png` (HUD live over a run).

## Deviations disclosed (ALL)
- **D1 — Toggle surface.** F3 + `__TW.perf`, **not** an options-menu row, and **not persisted** (default OFF each load). Deliberate: it is a diagnostic instrument, not a player setting, and this avoids another menu renumbering. If the owner wants a menu row / persistence, that is a small follow-up.
- **D2 — F3 semantics.** `preventDefault` is called on F3 (suppresses any browser default for that key); the listener ignores keys while rebind capture is active; F3 is not offered in the rebind system.
- **D3 — Wall-clock reads, display-only.** TW_PERF's whole purpose is wall-clock measurement (rAF deltas, `performance.memory`, paint entries, the audio engine's own `decodeMs`). None of it feeds the simulation; TW_PERF touches no `G.*` at all (verified by static scan). Prior candidates' "no wall-clock" rule was a *sim-purity* rule; it is honored — disclosed here because the words differ.
- **D4 — Platform coverage of readouts.** `performance.memory` is Chromium-only (HUD shows N/A elsewhere); paint entries may be absent in some `file://` contexts (N/A). Frame/ticks/decode work everywhere.
- **D5 — Numbering.** Registry untouched (cloud session). Intended: **this receipt = GOV-82**, script/harness prefix 82, per GOV-81's `nextIds.GOV=82`. Box/Spark reconciles.
- **D6 — Baseline environment.** Numbers above are the *cloud headless* floor, not the Windows box numbers doc 59 asks for — those are still owed (owner/Cowork, real hardware, canonical `file://`).
- **D7 — Git history copy.** Per GOV-80's optional clause, the candidate + tools are also pushed to `khuffsphone/TinyWest` branch `claude/tinywest-cloud-building-jue13c` (`v6/`, PR #11) for history. The Drive delivery itself is script + harness + receipt only — no candidate upload.

## NOT TESTED (stated plainly)
Real-hardware frame pacing and box baselines (D6); non-Chromium browsers; physical gamepad/touch; F3 behavior inside embedded iframes; HUD legibility on a real display at native scale (owner's eye); long-session heap growth over minutes (the HUD now makes this observable — a soak run is a natural follow-up).

## Handoff
Cowork: stage `82_BUILD_ALPHA3_6.py` from the box, rebuild against your verified `930f3a15…` copy, confirm **`86157cd0…`**, then run your independent parity/regression audit (GOV-80 flow). Owner: approval advances the gate target per DEC-060-2. I am **stopped** until alpha.3.6 is cleared.
