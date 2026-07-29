# Status — Tiny West (running log)

This file is the local-repo landing spot for scheduled status check-ins. It is not a
replacement for the canonical Drive Brain; see `README.md` for the document inventory
and authority order.

## 2026-07-29T19:2xZ check-in (this entry)

Scheduled status check-in. **No gameplay/engine code changed.**

- Rebuilt `slice/dist/tiny-west.html` from source: byte-identical to the 2026-07-17
  build receipt — 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift since
  commit `a4c4dd4`.
- Ran the full local suite: `playtest.mjs` (smoke PASS, determinism PASS — hash
  `911533983`, matches every prior run; natural keyboard run reaches RESULTS, $269
  banked, 0 page errors), `qa2.mjs` (touch pads, 4 viewports, 20 reset cycles — all
  PASS, no overflow), `qa3.mjs` (pay-car route reachable via exact fork input and
  completable, $839 banked — PASS).

### Open items carried forward (not independently re-derived this run)

- **GOV-111 / DEC-112-4 — ElevenLabs credential exposure.** First reported
  2026-07-26 (PR #92): a Drive keyword search returned the literal
  `ELEVENLABS_API_KEY=...` value in a result snippet, and a `.env.txt` file sat on a
  Drive-synced path. Several later title-only searches (2026-07-27) found no
  `.env.txt` and were read as encouraging — but the 2026-07-28T08:23Z check-in
  cross-checked an independent full-scope audit (`NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_28.md`,
  run 06:03Z) that found the file still present on the synced tree and flagged it as
  the workspace's one hard security blocker. **Treat as unremediated.** All paid
  ElevenLabs generation (voice and non-voice) remains hard-blocked pending owner
  confirmation: key rotated + revoked at the provider, `.env.txt` deleted, Drive
  trash emptied, credential relocated off any Drive-synced path. No credential value
  is reproduced in this repo or in any commit/PR from this lane.
- **CONFLICT-002 — repo canonicity vs. an external v6 program.** This repo's
  `CLAUDE.md` / `CONSTANTS.md` state a "< 1.2 MB preferred, 2.5 MB hard" file-budget
  ceiling as closed/binding for the slice. Per prior check-ins, the Brain's newer
  `00_V6_START_HERE_CURRENT.md` (2026-07-19) reportedly supersedes that ceiling, and
  a live external build (`alpha.3.12`) is ~4.46 MB — well over it. Whether
  `khuffsphone/tinywest` is still the canonical repo for this project, or should be
  marked frozen against that external v6 program, is `NEEDS_DECISION` (owner-level).
  This check-in did not re-verify the Drive-side documents; treat as unresolved.
- **CONFLICT-001** (Iron Trail vs. Rampage Express language) — unchanged, see
  `RECONCILIATION.md`. No new owner ruling on final subtitle or 2D/3D pipeline.

### Process note — scheduling cadence and PR backlog (unchanged since ~2026-07-24)

This scheduled task has fired roughly hourly since 2026-07-24. Each run starts from a
fresh, memoryless `claude/eager-dirac-*` branch, so the "open a PR only if one doesn't
exist for this branch" check never finds a match — the result is 100+ orphaned
branches and, as of this check-in, **21 open near-duplicate "status check-in" pull
requests** (#105, #107–#125), all reporting the same no-drift result, **zero merged**.
PR #105 (2026-07-27) is the test-green, ready-to-merge consolidation that later
check-ins have repeatedly pointed at.

This run did **not** open a new duplicate PR. Per the Brain's own governance note
(GOV-112 §10, referenced by earlier check-ins: "do not open further duplicate PRs
until the cadence is resolved"), this run's findings were instead posted as a comment
on PR #105 and recorded here. This run also did not merge, close, or comment-resolve
any of the other open PRs, and did not prune branches — those change shared repo
state and remain owner-level actions.

**Recommended owner actions (unchanged, restated for consolidation):**
1. Confirm ElevenLabs key rotation and remove `.env.txt` from any Drive-synced path.
2. Merge PR #105 (or another single consolidated status PR) and close the rest as
   duplicates; prune the accumulated `claude/eager-dirac-*` branches.
3. Slow or pause this scheduled task's firing cadence (currently ~hourly) so future
   runs have a merged baseline to build on instead of re-deriving from scratch.
4. Rule on CONFLICT-002 (repo canonicity) and the still-open CONFLICT-001 items
   (final subtitle, 2D/3D pipeline).

## Prior entries

See PR #105 and its comment thread (2026-07-27 through 2026-07-28) for the fuller
history of check-ins, including the GOV-111 discovery, the GOV-112 lane dispatch, and
the point at which the PR-spam pattern was first diagnosed.
