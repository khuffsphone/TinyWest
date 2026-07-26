# Tiny West Brain — status log (newest entry first)

Running log of scheduled/manual status check-ins against `khuffsphone/tinywest`. This is
the first entry landed in the repo itself — many prior scheduled runs wrote equivalent
notes only into unmerged draft PRs or the Drive Brain; see "Known issue" below.

## 2026-07-26 — repo unchanged, two real findings surfaced, one process issue flagged

**Repo state:** unchanged since the 2026-07-17 slice build. History is exactly two
commits (`cfb0034` Sunset Riders tribute, `a4c4dd4` 42-second Rampage Express slice).
Working tree clean. `slice/dist/tiny-west.html` rebuilt from source this pass and
re-hashed: 106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` — byte-identical to
`BUILD_RECEIPT_SLICE.md`. No drift. Full Playwright QA (`playtest.mjs`/`qa2.mjs`/
`qa3.mjs`) was not re-run this pass — this container has no `slice/node_modules`; a
same-day prior run already executed the suite green against this exact unchanged tree.

**CONFLICT-002 (new, filed this pass):** verified directly against the canonical Drive
Brain that an active "Iron Trail v6 no-size-cap rebuild" program (effective 2026-07-19)
has revoked the 1.2 MB artifact ceiling that this repo's `CLAUDE.md`/`CONSTANTS.md` still
state as closed. See `CONFLICT-002.md`. `NEEDS_DECISION` (owner-level): is this repo
still canonical, or a frozen prototype the wider project has moved past? No code, canon,
or protected constant changed here.

**GOV-111 (security, owner-actionable, time-sensitive):** the Drive Brain already
tracks an open item (`GOV-111`) about a small `.env.txt` file recreated in the
Drive-synced project folder outside this repo, believed to hold a live ElevenLabs API
key. This pass confirmed the file is still present and that its key material is
already surfaced through Drive's own search/content-indexing — not contingent on
someone deliberately opening the file. That makes this time-sensitive: the key should be
treated as compromised, rotated/revoked at the provider console, the file deleted **and**
purged from Drive trash, and the credential relocated to a non-synced location. This
finding lives in the Drive Brain (`GOV-111`); it is recorded here only as a pointer —
the credential value itself is intentionally not reproduced in this repo.

**Known issue — scheduled check-in cadence:** this status check-in has been firing
roughly hourly since 2026-07-24/25, and (because each run lands on a fresh
scheduler-generated branch) had opened ~95 near-duplicate "status check-in" pull
requests against this repo with zero merges before this entry. This run does not add
another near-duplicate PR body on top of that backlog beyond what's needed to land this
file; the underlying fix (reduce cadence, e.g. daily instead of hourly, or point the
schedule at a stable branch/PR it can update in place) is owner-level and outside what
any single run can do from inside the repo.

## 2026-07-17 — initial 42-second slice build

See `BUILD_RECEIPT_SLICE.md` for the full build receipt, verification evidence, and
adversarial-review summary for the `a4c4dd4` commit.
