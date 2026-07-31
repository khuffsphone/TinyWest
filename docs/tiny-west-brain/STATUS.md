# Tiny West — status log

Rolling status check-in log. New entries are appended below (most recent last) so
scheduled check-ins update this one file instead of opening a new PR each time.

## 2026-07-17 — initial slice build

See `BUILD_RECEIPT_SLICE.md` for full detail. `slice/dist/tiny-west.html` built,
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
All nine slice beats playable, determinism verified, adversarial review complete
(17 findings fixed).

## 2026-07-31T17:xxZ — status check-in

Fresh, memoryless session on branch `claude/eager-dirac-m77m3w`. Repo unchanged: two
commits, clean tree, no drift since `a4c4dd4` (2026-07-17, 14 days).

**Build/test — full local suite actually executed, not just hash-compared:**
- `node slice/tools/build.mjs` — `slice/dist/tiny-west.html` rebuilds byte-identical
  to the 2026-07-17 receipt: 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every
  prior run since 2026-07-17), natural keyboard run to RESULTS, $269 banked, 0 page
  errors.
- `qa2.mjs` — pay-car $837, touch input + determinism, 4 viewports
  (1100×760/412×915/360×640/915×412) no clipping/overflow, 20 reset cycles: PASS.
- `qa3.mjs` — pay-car fork reachable via exact input and completable, $839 banked:
  PASS.

All green, no regressions.

**GOV-111 / DEC-112-4 (ElevenLabs credential exposure) — still treated as
unremediated, 5+ days (07-26 → 07-31).** Not independently re-checked this pass
(avoiding further exposure risk, per this thread's standing guidance). Last hard
evidence remains the 2026-07-28T08:23Z check-in's independent full-scope Drive
audit, which found `.env.txt` still present on the Drive-synced tree after earlier
title-only searches had wrongly suggested it was gone. Treat as unremediated until
the owner confirms directly: key rotated + old key revoked, `.env.txt` deleted,
Drive trash emptied, credential relocated off any Drive-synced path.

**CONFLICT-002** — unchanged, `NEEDS_DECISION` (external "Iron Trail v6" Drive
build reportedly ~4.46–4.48 MB vs. this repo's `< 1.2 MB` ceiling). Not
independently re-verified this pass.

**Process:** committed this check-in to `docs/tiny-west-brain/STATUS.md` in-repo
(rolling-log file, linked from `README.md`), pushed to `claude/eager-dirac-m77m3w`.
**Not opening a new PR** — per GOV-112 §10 ("do not open further duplicate PRs
until the cadence is resolved") and the convention established across ~10 prior
check-ins on PR #105: the backlog is **41+ open, unmerged, draft duplicate
"status check-in" PRs** (`#105`, `#107`–`#146`), zero merged, spanning
2026-07-27 through today, plus 150+ orphaned `claude/eager-dirac-*` branches.
This run also pushed a **direct notification to the owner** (outside GitHub, via
the scheduling channel) flagging both open items below, since five-plus days and
~40 in-repo escalations have not produced owner action.

**Recommended owner action, unchanged from every prior check-in in this thread:**
1. Merge one PR (`#105`, test-green, oldest open consolidation) and close the other
   ~40 open duplicates; prune the orphaned branches.
2. Pause or slow the scheduled task's firing cadence (currently ~hourly since
   2026-07-24).
3. Confirm the ElevenLabs key rotation + `.env.txt` removal directly.
4. Rule on CONFLICT-002 / ADR-003 (repo canonicity) and the remaining CONFLICT-001
   `NEEDS_DECISION` items.

### Test plan
- [x] `node slice/tools/build.mjs` — byte-identical rebuild, matches receipt
- [x] `node slice/tools/playtest.mjs` — smoke + determinism + natural run: PASS
- [x] `node slice/tools/qa2.mjs` — touch, viewports, reset cycles: PASS
- [x] `node slice/tools/qa3.mjs` — pay-car route reachability + completion: PASS
- [ ] Owner: confirm ElevenLabs key rotation + `.env.txt` removal from Drive-synced
      tree
- [ ] Owner: merge one PR, close the ~40 other open duplicates, prune branches
- [ ] Owner: pause or slow the scheduled task's firing cadence
- [ ] Owner: rule on CONFLICT-002 / ADR-003
