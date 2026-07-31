# Tiny West — rolling status log

Convention: scheduled/routine check-ins append one entry here instead of opening a
new "status check-in" PR every run (proposed in #105, restated in #138-#148). See
`README.md` for the Brain index and `BUILD_RECEIPT_SLICE.md` for the last real
build receipt.

## 2026-07-31 — status check-in (this run)

- **Build**: `node slice/tools/build.mjs` rebuilt `slice/dist/tiny-west.html` —
  byte-identical to the 2026-07-17 receipt (106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`). No drift.
- **Repo**: working tree otherwise clean, no gameplay/engine code changed since
  `a4c4dd4` (2026-07-17). `index.html` tribute build untouched.
- **Brain conflict (CONFLICT-001)**: unchanged — rampage-first player-facing
  language, Iron Trail mechanics preserved, subtitle/2D-3D pipeline still
  `NEEDS_DECISION`. See `RECONCILIATION.md`.

### ACTION NEEDED — operational, not game status

1. **Duplicate-PR backlog (~40 open, unmerged).** This scheduled prompt has been
   firing roughly hourly since ~2026-07-22, each run from a fresh memoryless
   branch (`claude/eager-dirac-*`), opening a new draft "status check-in" PR
   (`#107`-`#148`, plus `#11` and `#105`). None have been merged; none carry
   gameplay changes, so closing the backlog loses nothing. **This run
   deliberately did not open PR #149** — it only commits `STATUS.md` to its
   assigned branch (`claude/eager-dirac-1sd8cr`) — to stop growing the pile
   further. Recommended: merge #148 (or #105) to land this `STATUS.md`
   convention, close the rest of the `claude/eager-dirac-*` PRs and delete their
   branches, and slow or pause the schedule driving this prompt.
2. **GOV-111 — possible credential exposure, still unconfirmed after 4+ days.**
   PR #105 (2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a
   Google Drive search-result snippet from a `.env.txt` synced into the Brain
   folder. The key is not reproduced in this repo or any PR. No confirmation
   that it was rotated or the file removed has appeared in any PR since. This
   run did not re-search Drive, to avoid re-exposing the value. **Owner: rotate
   the key directly and confirm** — this can't be resolved from inside the repo.

Next real milestone (unblocked by the above): Sprint 2 per
`BUILD_RECEIPT_SLICE.md` — six-card encounter grammar, anti-repeat selection,
score economy, medals/contracts/seed codes — once human playtest gates are run.
