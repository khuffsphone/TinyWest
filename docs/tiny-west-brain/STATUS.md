# Status check-in log — Tiny West

Running log of scheduled status check-ins on the repo. Each entry is a snapshot,
not a change: check-ins rebuild and re-test the slice but do not touch gameplay
code unless drift is found.

## 2026-07-29 (this check-in)

**Build**: rebuilt `slice/dist/tiny-west.html` — byte-identical to the 2026-07-17
build receipt (106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`). No source
changes since commit `a4c4dd4` (Rampage Express 42-second slice).

**Tests**: full local suite run this pass (playwright resolved via a temporary
symlink to the environment's global install — nothing committed):
- `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every
  prior check-in), natural keyboard run reaches RESULTS, $269 banked, 0 page errors.
- `qa2.mjs` — touch pads, 4 viewports (1100×760 / 412×915 / 360×640 / 915×412,
  visualViewport-aware), 20 reset cycles — all PASS, no overflow/clipping.
- `qa3.mjs` — pay-car fork reachable via exact injected input and completable
  ($839 banked) — PASS.

No regressions. No gameplay/engine code changed this check-in.

**Repo hygiene — unresolved, flagged again**: as of this check-in there are
**21 open near-duplicate "status check-in" draft PRs** (#105, #107–#126) plus
one unrelated open PR (#11), and zero have been merged since 2026-07-17. This
check-in adds a 22nd. Root cause (reported since #114, unchanged): the
scheduled task that produces these check-ins fires from a fresh, memoryless
`claude/eager-dirac-*` branch each time, so "open a PR only if one doesn't
already exist for this branch" never finds a match against the backlog. A
single unattended run cannot merge/close other PRs or prune branches — those
change shared repo state and are owner-level calls. **This check-in did not
send a push notification**: the finding is unchanged from the immediately
prior check-in (#126, same day) — same root cause, same open items below, one
more duplicate added. Repeating the same alert every run would be fatigue, not
signal; a prior check-in (#117) already escalated this by notification once.

**Carried forward, not independently re-derived this run** (verifying either
would itself add risk or noise — see notes):
- **GOV-111** — a prior check-in reported an `ELEVENLABS_API_KEY` exposed via a
  Drive keyword-search snippet (first surfaced 2026-07-26, PR #92). Not
  re-checked here: re-running that search would itself re-expose the value in
  a transcript. Assume **unremediated** until an owner confirms rotation.
- **CONFLICT-002** — a prior check-in reported a parallel external "Iron Trail
  v6" rebuild program running outside this repo, past this repo's 1.2 MB
  offline-HTML ceiling. Owner-level `NEEDS_DECISION` on which is canonical —
  see `RECONCILIATION.md` for the related (but distinct) CONFLICT-001 ruling
  this repo already operates under.

**Recommendation to owner (unchanged across many check-ins)**: merge one status
check-in PR and close the rest, prune the accumulated `claude/eager-dirac-*`
branches, and slow or pause the schedule that fires this task so it stops
compounding the backlog. Separately: confirm GOV-111 credential rotation, and
rule on CONFLICT-002 canonicality.
