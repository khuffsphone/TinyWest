# Status — Tiny West ("Rampage Express" slice)

Living status note, updated by the automated repo status-check routine. Supersedes
nothing in `BUILD_RECEIPT_SLICE.md` (the build evidence record); this file just
tracks "is the last verified build still good."

## As of 2026-07-30

**Repo:** `khuffsphone/tinywest`, branch `claude/eager-dirac-aeefxu`, working tree
clean. No source changes since commit `a4c4dd4` (2026-07-17, "Add Rampage Express
42-second vertical slice per Tiny West Brain canon"). Two commits total in history:
`cfb0034` (Sunset Riders tribute, `index.html`) and `a4c4dd4` (the slice).

**Re-verification run today** (Node v22.22.2, Playwright via `chromium` at
`/opt/pw-browsers/chromium`):

| Check | Result |
| --- | --- |
| `node tools/build.mjs` rebuild | Byte-identical to committed `dist/tiny-west.html` |
| SHA-256 of rebuilt artifact | `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` — matches `BUILD_RECEIPT_SLICE.md` exactly |
| Size | 106,552 bytes (well under the 1.2 MB target) |
| `node tools/playtest.mjs` (smoke + determinism + natural keyboard run) | PASS — determinism hashes match across seeds, full loop reached `results`, 0 console errors |
| `node tools/qa2.mjs` (pay-car branch, touch input, 4 viewports, 20 reset cycles) | PASS — no clipping/overflow, no errors |
| `node tools/qa3.mjs` (pay-car route reachability + completion) | PASS — route reachable and completable, $839 banked |

No regressions found. The 42-second slice is in the same verified state as the
2026-07-17 build receipt.

## Open items (unchanged since the Reconciliation Note)

- `NEEDS_DECISION` (owner-level, still open): final public subtitle; 2D/3D asset
  pipeline (ADR-002/006); canonical repo (ADR-003); delivery architecture
  (ADR-004/005); permanent rampage-first confirmation; asset-approval receipts.
- `CANON_BUILD_DELTA` (known, accepted gaps for this milestone): placeholder art
  below 07-spec frame counts; 1 of 6 encounter cards shipped; no
  Wanted/Rampage/Overdrive/Fan Fire/High Noon/contract systems; pay-car cap is
  12 s vs v4's 15-s-on-80-s-clock mechanism.
- The verified `4.0.0-rampage` standalone baseline (130,485 B, ChatGPT Library
  `libfile_08bab9c166a0819195c530ee1c386db5`) remains outside this repo and
  outside this environment's reach (proxy 403 to the Sites deployments as of
  2026-07-17; not re-attempted this run since nothing in the environment changed).
- Next milestone per the build receipt: Sprint 2 (six-card encounter grammar,
  anti-repeat selection, score economy, medals/contracts/seed codes), pending
  human playtest gates on the current slice.

## Bottom line

No action needed. Slice build is healthy, reproducible, and passing all local
QA gates; nothing has moved since the last recorded build receipt. Waiting on
owner-level `NEEDS_DECISION` items before starting Sprint 2 scope.
