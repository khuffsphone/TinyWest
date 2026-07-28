# Status log — scheduled check-ins

Running log of scheduled "status update" check-ins on this repo. Each entry is
written by an independent, memoryless session — see the process note below
before trusting anything here as a live signal rather than a snapshot.

## 2026-07-28 — build/QA fully re-verified; env gap fixed; two open items unchanged

**Repo:** two commits (`cfb0034` tribute, `a4c4dd4` slice), working tree clean
before this entry. No code, constants, or canon changed.

**Build:** `node slice/tools/build.mjs` reproduces `slice/dist/tiny-west.html`
byte-identical to the 2026-07-17 receipt — 106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.

**Test suite — run in full for the first time in several check-ins**, because
this session closed a gap every prior status run since 2026-07-24 had flagged:
there was no repo-local `slice/package.json`, so `playwright` (a devDependency
the test scripts import directly) wasn't installable in a clean checkout. Added
`slice/package.json` pinning `playwright@1.56.1` (matches the version already
present in this environment's global install) plus `npm`/`build`/`playtest`/
`qa2`/`qa3` scripts, ran `npm install` (browser download skipped — Chromium
is already provided by the environment), and re-ran everything against the
rebuilt artifact:

- `playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hash `911533983`,
  matches every prior recorded run), natural keyboard run reaches RESULTS with
  $269 banked, 0 page errors.
- `qa2.mjs` — pay-car route reachable, touch pads render/start, all 4 tested
  viewports (1100×760 / 412×915 / 360×640 / 915×412) show no canvas overflow,
  20 reset cycles bounded, 0 errors.
- `qa3.mjs` — pay-car route completable end to end ($839 banked), 0 errors.

No regressions: every result matches the 2026-07-17 `BUILD_RECEIPT_SLICE.md`
evidence and every prior status entry's numbers exactly.

**Open item 1 — GOV-111, credential exposure, still unremediated.** Checked
against the Brain's own 2026-07-28 06:04 UTC nightly health report (Drive doc
`19fAK6LqQa0ORgti6BzXu0GT1L6yc5IVaAVo3eoMeXvQ`) rather than re-deriving via a
Drive keyword search (which would itself re-expose the value in a fresh
transcript): the report's own executive summary lists "1 Hard Security
Blocker: Credential File on Synced Tree" and names the fix directly — move
`.env.txt` off the Drive-synced tree (`G:\My Drive\tiny west\.env.txt`). All
paid ElevenLabs generation stays hard-blocked (DEC-112-4) until that happens.
**No key value is reproduced in this repo or in this entry.** This has now
been reported unremediated across many consecutive audit cycles (nightly
Brain reports 07-25 through 07-28, plus ~10+ prior status check-in PRs on this
repo). Owner action needed: rotate/revoke the key at the ElevenLabs console,
delete the file, empty Drive trash, relocate any future credential off a
synced path.

**Open item 2 — CONFLICT-002, external program, still active, this repo's
status still `NEEDS_DECISION`.** The same 2026-07-28 nightly report confirms
an active "Tiny West: Iron Trail v6" rebuild program running entirely outside
this repo: live gate target is `alpha.3.11-lawroofArt` (4,460,083 B, exceeds
this repo's 1.2 MB/2.5 MB budget in `CONSTANTS.md`), with a new
`alpha.3.12-final` candidate (BLD-15, 4,471,627 B) now staged and holding for
a Cowork UAT audit, plus a newly-installed "autoloop" arc (GOV-113/AUTOLOOP-01)
that has itself registered a `GIT` lane pointing at this repo. No Drive
document says that program's decisions apply here; whether `khuffsphone/tinywest`
is still the canonical repo or a frozen 2026-07-17 prototype remains
owner-level `NEEDS_DECISION`. See `CONFLICT-002.md`. No canon, code, or
protected constant changed here as a result.

**Process note — please read before opening or merging anything else.** This
scheduled check-in fires far more often than once a day (roughly hourly since
2026-07-24) and, before this entry, produced **10 open near-duplicate draft
PRs** (#105, #107–#115) plus **~35 more already closed as duplicates**
(#65–#104, #106), all reporting essentially this same no-drift result, from
a fresh memoryless branch every time, with **zero ever merged**. Every one of
those PRs independently reached the same recommendation without it being
acted on: merge one (most recently recommended: #105 or #115), close the
rest, and slow or redirect the schedule so future runs build on merged state
instead of re-deriving (and occasionally dropping) the same two open items
every cycle. This session did not merge or close any other PR itself — that
changes shared repo state and is an owner call, not something an unattended
run should decide unilaterally. It did send a direct notification about this
and about GOV-111, since the volume of duplicate PRs alone hadn't resulted in
action across 10+ days of identical recommendations.

## Prior entries

Every status check-in before this one (PRs #65 through #115) was opened on a
disposable `claude/eager-dirac-*` branch and never merged, so none of that
history exists in the repo itself — only in each PR's description on GitHub.
This entry is the first to land in the repo's default branch (assuming it or
a successor PR is the one that gets merged); treat everything above as the
only in-repo record until an owner reconciles the PR backlog.
