# Status — 2026-07-28 (scheduled check-in)

## Slice: healthy, no drift

- `node slice/tools/build.mjs` — rebuild byte-identical to the 2026-07-17 receipt:
  106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `node slice/tools/playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hash
  `911533983`, matches every prior run), natural keyboard run reaches RESULTS
  ($269 banked), 0 page errors.
- No source under `slice/` has changed since the 2026-07-17 build. 11+ days,
  30+ independent scheduled re-verifications, zero regressions.
- Known gap (unchanged): `slice/` has no checked-in `package.json`/lockfile, so
  a clean checkout can't run the Playwright-based test tools without a global
  install. Verified this run via a temporary, uncommitted symlink into the
  global Playwright package, same as prior runs. Owner action: pin one.

## Open items carried forward (not independently re-derived this run)

- **GOV-111 — exposed API credential.** A prior scheduled run found an
  `ELEVENLABS_API_KEY` value exposed in a Drive-synced file via a plain
  keyword search (the key text surfaced in the search snippet itself — not a
  deliberate file open). This run does **not** repeat that search, to avoid
  re-exposing the value into another transcript. **Assume unremediated** until
  the owner confirms otherwise. No key value has ever been written to this
  repo. Owner actions needed: rotate/revoke the key at the ElevenLabs console,
  delete the source file from the synced Drive folder, empty Drive trash, and
  keep future credentials off any synced folder. Per Brain governance, all
  paid ElevenLabs generation should stay hard-blocked until this clears.
- **CONFLICT-002 — parallel external rebuild program.** A prior scheduled run
  reported a parallel "Iron Trail v6 no-size-cap rebuild" program active
  outside this repo, with an owner-level `NEEDS_DECISION` on which
  program/repo is canonical going forward. Not independently re-verified this
  run (no new Brain content surfaced). Still open.
- **CONFLICT-001** (Rampage-first vs. Iron Trail naming) — unchanged, see
  `RECONCILIATION.md`. Still `NEEDS_DECISION` at the owner level for final
  subtitle and 2D/3D pipeline.

## Process problem: this scheduled task itself

This is a scheduled check-in that has fired roughly hourly since 2026-07-24.
Each run starts from a fresh, memoryless branch/PR with no visibility into
prior runs. Result: 30+ near-duplicate "status check-in" PRs (#76–#112 at
last count) against this repo, **zero merged**, 100+ orphaned
`claude/eager-dirac-*` branches, and at least one case (between PRs #103 and
#104) where a real finding (GOV-111) was silently dropped for one cycle
because the intervening run's branch was never merged.

This run does not attempt to merge or close other PRs — that decision belongs
to the repo owner, not to an unattended scheduled run. Recommendation,
unchanged from many prior runs: pick one open status PR (e.g. #105, the most
complete to date) to merge, close the rest as duplicates, and either slow the
schedule interval or point it at a stable branch/PR to update in place so
future runs have something merged to build on.

## Bottom line

The playable slice is stable and un-regressed. The two things that actually
need owner attention are the credential exposure (GOV-111, time-sensitive)
and the scheduled-task cadence causing PR/branch spam (process, not urgent
but compounding).
