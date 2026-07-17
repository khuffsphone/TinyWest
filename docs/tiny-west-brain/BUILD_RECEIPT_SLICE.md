# Build receipt — 42-second vertical slice ("Tiny West: Rampage Express")

Date: 2026-07-17 · Repo: `khuffsphone/tinywest` · Branch: `claude/sunset-riders-clone-lyyefk`

## Preflight (per 08 — BUILD §14)

1. **Brain found**: Drive folder `1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`. All 18 documents of
   both sets inventoried and read (IDs in `README.md`).
2. **Conflict stated**: CONFLICT-001 (Iron Trail vs Rampage sets). Applied the
   Reconciliation Note ruling — rampage-first player-facing language, Iron Trail
   mechanics/slice preserved. See `RECONCILIATION.md`.
3. **Repo baseline**: previous commit `cfb0034` (Sunset Riders tribute) preserved untouched.
4. **v4.0.0 recovery attempt**: FAILED — proxy returned 403 for
   `tiny-west-rampage.k-huff.chatgpt.site` (CONNECT denied; per-tool status consulted).
   ChatGPT Library is unreachable from this environment. `CANON_BUILD_DELTA`: the
   verified 130,485-byte baseline is not in this repo. The Drive "candidate"
   `tinywest.html` (`1zCPg0a0AqwMA3hGPaqB9g2jDz7pYv0-a`, 203,884 B) matches this repo's
   tribute `index.html` byte size exactly — it is the tribute re-uploaded, not a lost baseline.
5. **First milestone chosen**: the exact 42-second slice (Phase 1 of the master handoff).

## Artifact

- `slice/dist/tiny-west.html` — 106,552 bytes (< 1.2 MB target)
- SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`
- One file, offline, zero external requests; opens from `file://`.

## What was built

All nine slice beats playable with the five fantasy verbs:
Spur → Chase (fences, law rider, slipstream sync) → Board (36f/18f windows, 72f recycle,
24f leap) → Roof settle (180f, control live) → **Dynamite Relay** (pistol guard, hatch
ambusher, throwable dynamite: bullet-cancel in air or detonate-by-shot near the guard) →
payday expose (two shootable lock pins, no bullet sponge) → cash burst + physical
pickup (82px magnet) → active return (clean <12f / rough <24f / rope fail-safe −15%),
banking on saddle contact → spatial escape fork (teal RIDE OUT vs gold PAY CAR ladder) →
scoped Pay Car extension (Marshal 4HP spread volleys, richer lockbox, 12s cap) →
input-driven escape under pursuit → results (medals 2200/4000/6000/8000, ×1.25/×1.5).

Engine: fixed 60 Hz deterministic sim, mulberry32 seeded PRNG (no sim `Math.random`),
15-state machine with transition logging, logical input layer (keyboard/gamepad/touch,
non-repeat latch, buffer+coyote), 32-color master palette atlas (RLE base64), 4-state
layered WebAudio score + signature SFX (≤10 voices, compressor), versioned localStorage,
`window.TinyWestTest` diagnostics, Sundown→Midnight zone shift at 30 s.

## Verification evidence

- `runDeterminismCheck`: PASS (identical trace hashes, two seeds, incl. touch-device context).
- Natural keyboard run (seed 20260717): full loop to CLEAN GETAWAY, ~24 s expert-paced,
  $269 banked, 0 console errors. Screenshots: `docs/s1_chase.png`, `s5_cash.png`,
  `s8_forkride.png`, `s9_results.png`, `qa_paycar.png`.
- Pay-car route: reachable via exact injected input from the fork (PASS) and completable
  (Marshal + pins + $839 banked, ×1.5 → final 2388, Bronze).
- Viewports 1100×760 / 412×915 / 360×640 / 915×412: no clipping/overflow (visualViewport-aware).
- Touch: pads render, tap starts, 20 reset cycles bounded, focus loss pauses + clears input.

## Adversarial review (46 agents, 2 phases)

17 findings confirmed by 2-vote verification, **all fixed and re-verified**, including:
uncontrollable 30f return leap (→24f), zero-input escape (→input-driven progress +
pursuit pressure), ×1.5 granted on failed pay-car raid (→`payRaided` flag), double input
consumption in `ret`, sim running during results, hidden-enemy targeting, frozen marshal
carried into return, `skipToState` crash on unknown targets, assist toggle dead branch
(assist OFF now = no auto-target), coin floor teleports, unreachable cracked-heart frame,
mobile visualViewport clipping, suspended-audio voice-counter peg, 34px pause button
(→44px), HUD >24px (pay-car timer moved to world space), theft-first "HEIST SHARE" label
(→"RAMPAGE SHARE"), AFK near-miss farming (input-gated). Plus two bugs found in
self-test: lost-keyup key bricking (→`e.repeat`-based latch) and point-blank shots
missing props (→muzzle-origin aiming).

## Known deltas / next actions

- `CANON_BUILD_DELTA`: placeholder art below 07-spec frame counts; 1 of 6 encounter
  cards; no Wanted/Rampage/Overdrive/Fan Fire/High Noon/contracts (full-run systems).
- Owner: export the v4.0.0 Library artifact into the repo; rule on the open ADRs
  (subtitle, 2D/3D pipeline, canonical repo, release target).
- Next milestone: Sprint 2 (six-card grammar, anti-repeat selection, score economy,
  medals/contracts/seed codes) once slice playtest gates are formally run with humans.
