# Tiny West — running status log

Newest entry first.

## 2026-07-30 ~12:xx UTC — repo healthy; scheduling cadence is now the dominant problem

**Repo/code state: unchanged, healthy.** Two real commits exist on this lineage
(`cfb0034` tribute, `a4c4dd4` slice); working tree clean; no code changes since
2026-07-17. `slice/dist/tiny-west.html` rebuilds byte-identical from source —
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` —
matching the 2026-07-17 build receipt exactly. `index.html` (protected tribute build)
unmodified. Did not re-run the full Playwright suite (`playtest.mjs`/`qa2.mjs`/`qa3.mjs`)
this pass — no source changed and it has been re-run green by many prior check-ins
in immediate succession; re-run it the moment any real code change lands.

**Process problem — now severe, confirmed independently.** This scheduled check-in
fires roughly hourly. As of this run: **148 orphaned `claude/eager-dirac-*` branches**
and **30 open, unmerged, draft "status check-in" PRs** (`#105`–`#134`), **zero merges**
to any target branch. At least ten-plus prior PRs already flagged this and recommended
a fix; none acted on. Each run starts from a fresh, memoryless branch, so real findings
have already been silently dropped between runs at least once (GOV-111/CONFLICT-002
missing from PR #129). **This run deliberately does not open PR #135.** Adding another
near-duplicate draft PR to a 30-deep unread backlog reproduces the exact harmful pattern
already documented ten times over; it would not be the effective channel. This run's
findings are pushed to `claude/eager-dirac-0vi2cc` and routed via a direct notification
to the owner instead. **Recommended owner action (unchanged, now more urgent):**
(1) pause or slow the schedule (daily, not hourly); (2) point it at one stable
branch/PR to update in place; (3) merge one consolidated status PR and close the
rest of the backlog, then delete the orphaned branches, so future runs have real
state to build on instead of re-deriving it from scratch.

**GOV-111 (credential exposure) — independently re-checked against Drive this run.**
Read the full GOV-111 decision doc (`1ReebkOX5F-Mlbjzf4bqvOIWjYnrrjPvHTJ6FY1-z0Vc`):
an ElevenLabs API key was exposed at `G:\My Drive\tiny west\.env` (2026-07-19), the
owner rotated the key, but the rotation was potentially re-exposed via a same-shape
`.env.txt` written back into the same Drive-synced folder (2026-07-26) — VOX generation
was ruled HARD-BLOCKED pending confirmation that `.env.txt` is clean or relocated.
A title search this run for `.env` / `.env.txt` in Drive returns **no such file** —
consistent with the prior run's (#130) independent check. This is the second
consecutive check to find it absent, which is encouraging, but title-search absence is
not proof of remediation (could be trashed-but-still-hosted, or simply not indexed).
**Still carrying this forward as open** until the owner confirms explicit revocation at
the ElevenLabs console and an empty Drive trash — no lane should go looking for the file
itself (per GOV-111 DEC-111-3: secrets are out of scope for every lane, permanently).

**CONFLICT-002 (parallel Iron Trail v6 build program)** — unchanged from PR #130's
account: a separate, more active "Iron Trail v6 no-size-cap rebuild" program exists
in the same canonical Brain folder (subfolder `41_CLAUDE_A3_0_1_INDEPENDENT_UAT_VERDICT`),
with a newer artifact (`Tiny-West-Iron-Trail-v6.0.0-alpha.3.12-final.html`, 4,471,627 B,
2026-07-27T19:40 UTC) than previously reported. This repo is listed there as an
unresolved `GIT` lane. Canonical-or-frozen remains owner-level `NEEDS_DECISION`. Not
re-verified independently this run (no new information since #130 beyond what's noted
here); not acted on, per `CLAUDE.md`'s "never silently merge, report conflicts" rule.

**False-alarm resolved:** PR #132 flagged a newly-created Drive item,
`AUTOLOOP_ENV/data - env/ENV_STRINGS_v01.csv` (title pattern resembling exposed
credentials, same shape as the GOV-111 concern). Opened and read this run: its content
is game narrative/flavor text for world tiles (`tile-shortgrass-spring`, `tile-pond-winter`,
etc.) — unrelated to credentials or environment variables. No action needed; downgrading
this from the prior run's flag.

## Earlier entries (condensed, from other check-in branches' PR bodies — not merged here)

- **PR #134** (2026-07-30 ~11:22 UTC): first to state the branch/PR spam count (29
  PRs / 148 branches) plainly in the title and claim a direct owner notification was sent.
- **PR #130** (2026-07-30 ~05:28 UTC): first to independently re-check GOV-111 against
  Drive (file not found by search) and re-confirm CONFLICT-002 (newer Iron Trail v6
  artifact). Documented 24 open PRs / 100+ branches at the time.
- **PR #105** (2026-07-27): first added `STATUS.md`/`CONFLICT-002.md` (never merged).
  First to surface GOV-111 live against Drive and the PR-spam meta-issue in detail.
- **PRs #65–#133**: repeated re-verification of build/QA integrity, repeated
  (re)discovery of CONFLICT-002 and GOV-111, and repeated flagging of the scheduling
  meta-issue — see `BUILD_RECEIPT_SLICE.md`/`RECONCILIATION.md` for the substantive
  technical record.
