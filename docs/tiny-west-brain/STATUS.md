# Status log — Tiny West slice

Durable running-status file. Update in place; do not fork a new file per check-in.

## 2026-07-30 — build/QA re-verified, no drift; repo-hygiene and governance items carried forward

**Independently re-run this pass** (in this session, on branch `claude/eager-dirac-pnp60h`,
base commit `a4c4dd4`):

- `node slice/tools/build.mjs` — rebuilt `slice/dist/tiny-west.html`, byte-identical to the
  2026-07-17 receipt: 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `node slice/tools/playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS
  (hash `911533983` both runs), natural keyboard run to CLEAN GETAWAY, $269 banked, 0 page errors.
- `node slice/tools/qa2.mjs` — pay-car route ($837 banked), touch pads + determinism on touch,
  four viewports (1100×760/412×915/360×640/915×412) no overflow, 20 reset cycles clean.
- `node slice/tools/qa3.mjs` — pay-car route reachable and completable via exact injected input
  ($839 banked). All green, matching every prior receipt exactly.

No gameplay/engine source changed since `a4c4dd4`. `slice/`, `index.html`, and
`docs/tiny-west-brain/CONSTANTS.md` / `RECONCILIATION.md` are unchanged this pass.

**Note on tooling**: `playwright` is not vendored in this repo (no `package.json`/`node_modules`
under `slice/`); the suites ran only after symlinking the environment's global Playwright
install into `slice/node_modules`. That symlink was removed before committing — it is not part
of this change and should not be assumed present in a clean checkout.

## Carried forward, not independently re-derived this run

These were reported by prior (unmerged) status check-ins on this same schedule. Flagging them
again here rather than re-investigating each from scratch, per the same STATUS.md convention
those PRs established:

- **GOV-111 — ElevenLabs credential exposure (Brain governance, not this repo's code).**
  Per PR #105/#128 (both open, unmerged): an `ELEVENLABS_API_KEY` was found exposed via a plain
  Drive keyword search. A Brain governance note dated 2026-07-26
  (`111_CREDENTIAL_ROTATION_PARTIAL_LIFT_AND_LANE_KICKOFF.md`) records that the owner reported
  rotating the key, but an independent filesystem sweep found a **new** 70-byte
  `.env.txt` in the same Drive-synced folder (`G:\My Drive\tiny west\`) — same byte size as the
  original exposed `.env`, created/modified 21 seconds apart (consistent with a fresh
  paste-and-save, not a leftover). That note explicitly did **not** open the file to check its
  contents, and left voice generation (VOX) hard-blocked until the owner confirms the file holds
  no live credential or moves it off the synced tree. As of PR #128 (2026-07-29) this was still
  reported unremediated. This session did not re-open or re-read that file (same credential
  boundary), so treat this as last confirmed 2026-07-26, not re-verified today.
- **CONFLICT-002** — a parallel external "Iron Trail v6" rebuild program exists in the Brain,
  past this repo's 1.2 MB one-file ceiling, with an owner-level `NEEDS_DECISION` on which is
  canonical. Not independently re-derived this pass; see PR #105 for detail.
- **CONFLICT-001** (this repo) remains as described in `RECONCILIATION.md`: rampage-first
  player-facing language, Iron Trail mechanics preserved, final subtitle and 2D/3D pipeline
  still `NEEDS_DECISION`.

## Repo hygiene — scheduling problem, unresolved

As of this run, GitHub shows **~23 open, near-duplicate "status check-in" draft PRs**
(#105, #107–#128) against base `claude/sunset-riders-clone-lyyefk`, **zero merged since
`a4c4dd4` landed on 2026-07-17**, firing roughly hourly since 2026-07-24 (per #128's count,
100+ orphaned `claude/eager-dirac-*` branches). Root cause (reported since #114, unchanged):
each scheduled run starts from a fresh, memoryless branch off the same base, so "open a PR only
if one doesn't already exist for this branch" always passes against the growing backlog, and
findings (like GOV-111 in #104) have been silently dropped between runs rather than only
repeated.

**This run's change:** rather than opening PR #129 to restate the same recommendation a 24th
time, this session updated `docs/tiny-west-brain/STATUS.md` in place on its branch and did
**not** open a new draft PR. If the owner merges this branch (or any one status branch) into
the base, future scheduled runs will have a real `STATUS.md` to diff against instead of
re-deriving from scratch and re-opening a duplicate.

**Recommendation to owner (unchanged):** merge one status PR (this one, or #105/#128) and close
the rest; prune the `claude/eager-dirac-*` branch backlog; slow or pause the schedule driving
this task, or point it at a single stable branch/PR to update in place; rotate/confirm the
GOV-111 credential; rule on CONFLICT-002.
