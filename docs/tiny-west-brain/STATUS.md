# Tiny West — status log

Running log for scheduled status check-ins. Append new entries at the top.
Prior entries (this run's own branch has none — see "Known issue" below for why).

## 2026-07-28 — routine check-in

**Game state: no drift.** `node slice/tools/build.mjs` reproduces
`slice/dist/tiny-west.html` byte-identical to the 2026-07-17 build receipt —
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
No source changes since commit `a4c4dd4` (the vertical-slice commit). Repo working
tree otherwise clean.

`playtest.mjs` / `qa2.mjs` / `qa3.mjs` not run — this environment has no `playwright`
module and no checked-in `slice/package.json` pinning it as a devDependency. This is
the same gap every status run has flagged since 2026-07-27; still unresolved.

Carried forward without re-deriving (see prior PRs #104–#115 for original sourcing):

- **GOV-111** — an `ELEVENLABS_API_KEY` was previously reported exposed via a Google
  Drive keyword-search snippet. Not re-checked this run (repeating the search would
  itself re-expose the value in tool output). **Assume unremediated** until the owner
  confirms rotation in the ElevenLabs console and removal from Drive.
- **CONFLICT-002** — a parallel external "Iron Trail v6 no-size-cap rebuild" program
  was previously reported to exist outside this repo. Owner-level `NEEDS_DECISION`,
  not re-verified this run.

## Known issue: this check-in is not actually reaching the brain

This scheduled task creates a fresh `claude/eager-dirac-*` branch every firing (this
run: `claude/eager-dirac-7eqlo5`), with no memory of prior runs. As of this run there
are **115 PRs opened against this repo since 2026-07-24, zero merged**, and 100+
orphaned branches. Every prior run's `STATUS.md` — including the GOV-111 and
CONFLICT-002 findings above — lives only on an unmerged branch/PR, not in the actual
brain. This file will suffer the same fate unless a human merges one of these PRs.

**This run is deliberately not opening PR #116.** Ten near-duplicate open PRs already
carry this identical no-drift finding (#105, #107–#115). Adding another does not help
the owner and adds to the cleanup burden. The branch is pushed so the content exists
if wanted, but no new PR was filed.

**What would actually fix this**, for the owner:
1. Merge one PR (recommend the most complete one, e.g. #105) to land `STATUS.md` in
   the base branch so future runs have something to append to instead of re-deriving.
2. Close the rest of the duplicates (#106–#115) and prune the `claude/eager-dirac-*`
   branches.
3. Slow or pause this scheduled task's firing cadence — it is currently firing
   roughly hourly.
4. Confirm GOV-111 credential rotation status one way or the other so it stops being
   carried forward as "assume unremediated" indefinitely.
