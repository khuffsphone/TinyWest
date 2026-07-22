# BLD-02 — alpha.3.7-audio EMBED-BUILDER SCAFFOLD: PREP RECEIPT (no build performed)
**Author:** Claude Code (builder, single game-build lease — CLOUD session per GOV-75). 2026-07-22.
**Status:** PREP ONLY per owner instruction. **Nothing was built, no candidate exists, the scaffold refuses to run by design.** Holding until: Cowork checks the encode manifest · owner approves the build + confirms the gate target · the SFX-52 wiring spec lands. Tags: `PROPOSAL` · `OBSERVED` (manifest schema).
**Numbering:** BLD lane per GOV-83 §B (BLD-01 = perf-HUD receipt; this = **BLD-02**, next BLD-03). Registry untouched by me — box applies.

## What was read
GOV-54 rev 2 (embed architecture: encode-once, OGG→WebAudio, bus/limiter ≤16 voices, audio-local PRNG, audio state outside `simulationState`, priority ranking, procedural fallback for unapproved cues) · GOV-58 (3.2-audio audit: the proven 6-region embed shape) · GOV-72 (corrected 3.5→audio scope) · GOV-80 (transport) · GOV-83 (BLD-01 PASS; lane namespaces; audio lane "still encoding") · the Audio lane's **draft** `round1_full_encode_manifest.json` (schema inspection below) · the alpha.3.6 source anchors (`TW_SAMPLE_DATA` single-line blob; unique `const GATE={…};` statement).

## Draft manifest observed (NOT pinned — draft, awaiting Cowork check)
`round1_full_encode_manifest.json`, 211,629 B, sha256 `5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a` (Drive id `1V4_dlYGBjjPD1fFvqTqVcNWg6m8OASgc`, created 2026-07-22T20:50Z).
- Schema: top keys `manifest/generatedBy/encoder/encoderNote/authority/scope/deviations/assemblerRules/summary/clips`; clip keys `engineKey (nullable) / cueId / take / manifestKey / oggFile / oggBytes / oggSha256 / sourceWav / sourceProcessedSha256 / requestId / prompt / tier / tierName / deferredTier / loop / flags / durationSeconds / encodedChannels / sourceChannels / peakDbfs / wiringStatus`.
- Content: **206 clips / 77 families** — 85 carried (`wired_alpha3_2`, 31 engineKeys) + **121 newly encoded, ALL `engineKey:null` / `awaiting_callsite`** (46 new families); 18 `deferredTier`, 23 `loop`; encoder pinned (ffmpeg 6.0 libvorbis −q:a 4 −ac 1, binary SHA recorded); authority = the frozen review-decisions JSON (`a7048a15…`, approved-takes-only parse rule); disclosed deviation: 15 stereo sources encoded mono.
- **Consequence the scaffold enforces:** without a wiring spec, an embed adds zero audible content (the 85 carried takes are already in the shipping blob). Assembler rule 1 (never auto-group null-engineKey clips) is enforced in code.

## Deliverable: `BLD02_BUILD_ALPHA3_7_AUDIO.py` (scaffold, compile-verified, run-refused)
- **Three sentinel pins abort execution** until legitimately filled: `AUTHORIZATION` (owner approval note), `MANIFEST_SHA256` (Cowork-checked manifest bytes), `WIRING_SHA256` (Cowork-checked wiring JSON, or explicit `NONE` for embed-only). Guard demonstrated: running it today aborts with the hold message and writes nothing.
- **Encode-once honored:** never encodes; verifies every included clip's `oggBytes` + `oggSha256` against the manifest before embedding (GOV-54 gate).
- **Deterministic assembler:** regenerates the entire `const TW_SAMPLE_DATA={…};` statement from the manifest (keys sorted, takes sorted by `(cueId, take)`, raw base64 exactly like the shipped blob) and splices by whole-line replacement of the unique anchor; all other edits anchored-exactly-once; version truth + provenance comment included; source pinned to the presumed gate target alpha.3.6 `86157cd0…` (one-line update if the gate differs at approval).
- **Wiring input (SFX-52-derived JSON, schema documented in the scaffold header):** `extendKeys` (new takes onto already-wired engineKeys — pure data change) and `newEngineKeys` (gate function + insert-only anchored call sites). Enforced: manifestKeys must exist; no key collisions; new keys must have call sites (no dead bytes); replacements must contain their anchor (insert-only); **added text is screened against `G.*` writes / `G.rng` / `G.fxRng` / `Math.random` / `Date.now` / timers / network** — gates may read `G` (existing GATE functions do) but never write.
- Emits the telemetry the receipt will need: families/clips embedded, excluded-awaiting-callsite list, OGG byte totals.

## What is still owed before the build (not by me)
1. **Cowork:** check the encode manifest (then I pin `MANIFEST_SHA256`).
2. **Owner:** approve the audio-embed build; confirm gate target (86157cd0 presumed) and the version slot (`alpha.3.7-audio` presumed).
3. **Audio/Design lanes:** the **SFX-52 wiring spec** (engineKey assignments, gates, call-site anchors for the 46 new families — including loop-cue handling: `loop:true` clips need `AudioBufferSourceNode.loop` treatment per assembler rule 3, which is engine-side work the wiring spec must scope).
4. **OGG delivery path:** the OGGs live on the box (`assets/audio/_embed/…`). Build runs on the box against the Drive-synced tree, or the OGG set reaches the cloud via git (GOV-80 fallback for non-reproducible binaries; ~3.4 MB total). Either works — the scaffold takes `--ogg-root`.

## Acceptance plan (at build time, per GOV-54 + the 82_ACCEPT pattern)
Tick parity vs the gate target, audio OFF **and** ON **and** no-context **and** suspended (≥25 seeds × 320); determinism; decode-complete with all takes; startup decode-time + peak memory via the alpha.3.6 perf HUD (now purpose-built for this); worst-case mix bound; offline; 0 errors; gamepad-guard regression; protected values; excluded-clip list matches the wiring spec exactly.

## Deviations disclosed
- **D1 —** Scaffold assumes the gate advances to `86157cd0…` (GOV-83 §A "on owner approval" — not yet owner-confirmed); pinned as PRESUMED and trivially updatable.
- **D2 —** Version slot `alpha.3.7-audio` presumed (never owner-named); parameterized.
- **D3 —** Script filename uses the BLD-lane prefix (`BLD02_…`) rather than bare `NN_` — GOV-83 moved build receipts out of the GOV namespace; box/Spark may rename at reconciliation.
- **D4 —** The draft manifest was read for schema only; its SHA is deliberately **not** pinned (it may be superseded before Cowork's check).
- **D5 —** Delivery per GOV-80: scaffold + this receipt to the Brain (small text, background agent); copies pushed to git for history. No candidate exists to transport.

## Hold state
I am **holding**: no build, no run, no further candidates. Next action is mine only after the three "owed" items above land and the owner says go.
