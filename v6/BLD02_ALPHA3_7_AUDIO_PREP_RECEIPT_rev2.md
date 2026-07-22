# BLD-02 rev 2 — alpha.3.7-audio SCAFFOLD UPDATE: manifest pinned · gate confirmed · defer-guard added
**Author:** Claude Code (builder, single game-build lease — CLOUD session per GOV-75). 2026-07-22.
**Status:** PREP rev 2 — **still HOLDING; nothing built; the scaffold still refuses to run.** Supersedes the §"still owed" and hold sections of BLD-02 rev 1 (Drive ids `1loWQNzP3ncHCH_Q6ktM4qlisJqc1l9dq` scaffold rev 1, `1tVe7AM5ozu6GmiKA_buivjKwEpxVRdZ8` receipt rev 1); rev-1 architecture/schema sections remain accurate.

## What changed (per owner relay, 2026-07-22)
1. **Gate CONFIRMED advanced to alpha.3.6 `86157cd0…`** — the scaffold's source pin is no longer "presumed."
2. **Encode manifest PASSED Cowork audit → PINNED:** `MANIFEST_SHA256 = 5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a` (206 clips / 77 families — matches my independent inspection).
3. **Wiring scope cleared by owner:** 43 clean new families = 6 gate-ext + 1 fill (cue 004 `weapon.revolver.cylinder_spin` → reloadSpin) + 36 new events, plus carry the 85 embedded takes. The SFX-52 wiring JSON must cover exactly this scope; `WIRING_SHA256` stays unpinned until it exists and is Cowork-checked.
4. **Three double-booked cues DEFERRED pending owner ruling — now hard-blocked in code:** `guard_deferred()` aborts any wiring that touches cue **006** (`player.reload.revolver`), **073** (`horse.landing`), or **100** (`destruction.crate`) while `DEFER_RULING == "PENDING-OWNER-RULING"`. Verified by unit test: the guard trips on a real cue-006 clip; with no wiring the planner assigns exactly 31 families / 85 clips and excludes 121 — the deferred cues cannot enter a build silently.
5. **OGG delivery path (owner-recommended):** commit the 121 `round1_remaining` OGGs + the manifest to the repo; I pull and run the deterministic assembler in the cloud (`--ogg-root` on the git checkout). Fallback stays: run this one candidate on the box. Awaiting the OGG commit (Audio lane / box — I cannot stage box files).

## Remaining before build (unchanged in kind, narrower in scope)
(a) `AUTHORIZATION` pin — **owner's explicit go** + version-slot confirmation (`alpha.3.7-audio` presumed); (b) OGGs reachable (repo commit recommended above); (c) SFX-52 wiring JSON, Cowork-checked → pin `WIRING_SHA256`. Deferred-cue ruling is only needed if/when the owner wants 006/073/100 wired — the build can ship without them.

## Verification of this rev
Scaffold rev 2 compiles; run-refusal demonstrated again (AUTHORIZATION abort, no output file); defer-guard unit-tested against the real manifest. Delivered per GOV-80 (small text via background agent; git history copy on PR #11 branch). Rev-2 Drive titles carry a `_rev2` suffix to avoid same-name ambiguity in the Brain folder — box/Spark may retire the rev-1 files at reconciliation.

## Hold state
**Holding.** No build occurs until the owner says go and pins (a)–(c) are legitimately filled.
