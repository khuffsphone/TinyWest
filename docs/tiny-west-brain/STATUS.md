# Tiny West — status log

Running log of scheduled status check-ins on the 42-second Rampage Express slice.
Newest entry first.

## 2026-07-28 — re-verified, no drift (11+ days) — recommend merging #105, fixing schedule

**Build/QA:** Rebuilt `slice/dist/tiny-west.html` from source: byte-identical to the
2026-07-17 build receipt (106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`). Re-ran the full
suite this pass (not just build+smoke):

- `playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hash `911533983`, matches
  every prior run), natural keyboard run reaches RESULTS with $269 banked, 0 page errors.
- `qa2.mjs` — touch input, all four tested viewports (no clipping/overflow), 20 reset
  cycles: all PASS.
- `qa3.mjs` — pay-car route reachable and completable ($839 banked): PASS.

No gameplay/engine code has changed since the 2026-07-17 build receipt. Zero drift
across every re-check run 2026-07-24 through today.

**Operational note (`slice/tools/*.mjs` require Playwright):** this checkout has no
`slice/package.json`/`node_modules`, so `playwright` doesn't resolve out of the box —
it's only available as a global install (`/opt/node22/lib/node_modules/playwright`).
This run verified the suite by temporarily symlinking that global package into
`slice/node_modules/playwright` for the duration of the test commands, then removing
the symlink again (nothing under `slice/node_modules` is committed). Still-open owner
action: pin a real `slice/package.json` with a `playwright` devDependency so a clean
checkout doesn't need this workaround.

**GOV-111** (reported by prior scheduled runs: a Drive keyword search allegedly
surfaces a plaintext `ELEVENLABS_API_KEY` from a `.env.txt` in the Drive-synced project
folder) — **not independently re-checked this run.** Repeating the keyword search is
itself another exposure per prior runs' own reasoning, and this run has no other way to
confirm current Drive state. Carried forward as **assumed unremediated** pending an
owner confirmation of key rotation. If real: rotate/revoke at the ElevenLabs console,
delete the file from Drive, empty Drive trash, keep future credentials off any synced
folder.

**CONFLICT-002** (reported by prior scheduled runs: a separate, externally-driven "Iron
Trail v6 no-size-cap rebuild" program may be active against the same Brain, with an
owner-level `NEEDS_DECISION` on whether this repo or that program is canonical) — **not
independently re-verified this run** (would require reading Drive documents this run
did not open). Treat as open pending owner ruling; see `RECONCILIATION.md` for the
already-resolved CONFLICT-001 (Iron Trail vs. Rampage Express language/mechanics),
which is a separate question from CONFLICT-002 (which repo/program is authoritative).

**Process problem (unchanged, now spanning 4+ days):** this scheduled "status update"
task has been firing roughly hourly since 2026-07-24, each run starting from a fresh
`claude/eager-dirac-*` branch with no memory of prior runs. That has produced 30+
near-duplicate draft PRs (#76–#111 as of this run) against `khuffsphone/TinyWest`,
**zero merges**, and 100+ orphaned remote branches. Several of the most recent PRs
(#105, #108, #109) already carry this same recommendation and it has not yet been
acted on. Restating it because nothing in a single scheduled run can fix it:

- **Recommend merging PR #105** (2026-07-27, most complete: build/QA re-verification
  + `STATUS.md` + `CONFLICT-002.md` + independently-reconfirmed GOV-111) and closing
  the other open duplicates (#107, #108, #109, #110, and this one) once it's in.
- **Owner-level fix needed:** slow the schedule that fires this task (e.g. daily
  instead of hourly), or point it at one stable branch/PR to update in place instead
  of minting a new branch every run.
- This run is notifying the owner directly (outside the PR) about the schedule
  cadence and the unresolved GOV-111 exposure, since the prior 30+ PR-body write-ups
  have not visibly resulted in action.

## 2026-07-17 — initial build

See `BUILD_RECEIPT_SLICE.md` for the full preflight, build, and adversarial-review
evidence for the original 42-second slice build.
