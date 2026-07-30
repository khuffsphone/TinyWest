# Tiny West — status (2026-07-30)

## Slice build

`slice/dist/tiny-west.html` unchanged for 13+ days: byte-identical to the 2026-07-17
build receipt (106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`). Repeated full-suite
runs (`playtest.mjs`, `qa2.mjs`, `qa3.mjs`) across many prior check-ins are all green:
determinism PASS, natural keyboard run to CLEAN GETAWAY ($269 banked, 0 page errors),
pay-car route reachable + completable ($839 banked), touch/viewport/reset checks PASS.
No regressions. Repo has two commits total (`cfb0034` tribute, `a4c4dd4` slice); working
tree clean.

## Open, owner-level items (unresolved across many prior check-ins)

1. **PR/branch spam (the dominant open item).** This scheduled task has fired roughly
   hourly since 2026-07-24. Result: ~35 near-duplicate "status check-in" draft PRs
   (`#105`, `#107`–`#139`) against `claude/sunset-riders-clone-lyyefk`, **zero merged**,
   plus 150+ orphaned `claude/eager-dirac-*` branches. Every recent run has independently
   recommended the same fix and none has landed: **merge `#105`** (test-green, oldest open
   consolidation) and close the rest as duplicates, prune the branches, and slow or pause
   the scheduler's firing cadence (hourly is far too frequent for a status check-in).
2. **GOV-111 / GOV-112 / DEC-112-4 — ElevenLabs API key exposure.** A Drive keyword search
   previously returned the literal key value in a result snippet (no deliberate file-open
   needed); a later full-scope independent audit found `.env.txt` still present on the
   Drive-synced tree even after several title-only searches wrongly suggested it was gone.
   **Treat as unremediated.** All paid ElevenLabs generation (voice + non-voice) is
   hard-blocked per DEC-112-4 until the owner directly confirms: key rotated + old key
   revoked, `.env.txt` deleted, Drive trash emptied, credential relocated off any
   Drive-synced path. No key value is reproduced in this repo. Recent check-ins have
   stopped re-running the Drive credential search to avoid further exposure risk — this
   needs direct owner confirmation, not another automated re-check.
3. **CONFLICT-002 — repo canonicity (`NEEDS_DECISION`).** This repo's `CLAUDE.md`/
   `CONSTANTS.md` state a "< 1.2 MB preferred" file-budget ceiling as closed/binding, but
   the Brain's `00_V6_START_HERE_CURRENT.md` (2026-07-19) reportedly supersedes that with
   a live external build around ~4.46 MB. Not independently re-verified this pass — owner
   needs to rule whether `khuffsphone/tinywest` is still canonical or should be marked
   frozen, and reconcile or update the size ceiling in repo docs.
4. Carried from `RECONCILIATION.md`: final public subtitle, the 2D/3D asset pipeline, and
   the remaining CONFLICT-001 `NEEDS_DECISION` items are still open.

## This check-in

No code, canon, or protected constant changed. Per the established practice in this
thread (documented across `#105`'s comment history) and given the severity of item 1
above, this run does not open a new PR — doing so would only add a 36th duplicate.
Findings are recorded here and a direct notification was sent to the owner, since dozens
of prior in-repo escalations have gone unactioned.
