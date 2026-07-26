# CONFLICT-002 — v6 "no-size-cap" build lane vs. this repo's 1.2 MB ceiling

Filed 2026-07-26, based on a direct read of the live Drive Brain (not on the text of
earlier unmerged status PRs against this repo, which had begun to compound each
other's claims — see "Provenance note" below).

## What's real

- `00_V6_START_HERE_CURRENT.md` (Drive, status CURRENT, effective 2026-07-19) does
  exist and does say, verbatim, that "the inherited 1.2 MB artifact ceiling is
  revoked... artifact bytes are telemetry only." Corroborated by
  `46_FOLLOWUP_TO_GPT_SIZE_AND_TERMINOLOGY.md` (owner-confirmed same date).
- That lane is active: `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_26.md` puts the live gate
  target at **alpha.3.11-lawroofArt** (4,460,083 B, DEC-106-1), with
  **alpha.3.12-presentation** (4,461,370 B, BLD-14) staged in HOLDING — audited PASS
  by an independent Cowork pass but **held for one respin** (`GOV-112`, DEC-112-1,
  2026-07-26T18:44), not yet promoted.
- Its working branch is `v6/no-size-cap-rebuild`, built via a Drive/Cowork toolchain
  (Google Flow/Gemini + Claude Cowork), **not** this repo's git/Node toolchain.

## What's not established

- `v6/no-size-cap-rebuild` **does not exist in `khuffsphone/tinywest`.** A dedicated
  Drive doc, `STATUS_GIT_REPO_V6_AUTHORITY_DIVERGENCE_2026-07-26.md`, says so
  explicitly and flags it as unresolved.
- No Drive document names `khuffsphone/tinywest` — or any other GitHub repo — as the
  authoring source for the v6/alpha.3.x lane. Whether this repo is still canonical or
  a frozen 2026-07-17 prototype is an **owner-level `NEEDS_DECISION`**, restated
  across many check-ins with no ruling yet.

## Ruling applied to this repo (unchanged)

This repo's `CLAUDE.md`/`CONSTANTS.md` 1.2 MB-preferred / 2.5 MB-hard ceiling is
**not** touched by this conflict: the revocation governs a different, Drive-only build
lane. No canon, code, or protected constant changed here. `slice/dist/tiny-west.html`
remains 106,552 B, byte-identical to the 2026-07-17 build receipt.

## Provenance note

A chain of prior scheduled status-check PRs against this repo (see `STATUS.md`)
surfaced this conflict starting around PR #87 and re-stated it, with growing detail,
in nearly every run since — each working from the previous PR's *text* rather than
re-reading the Drive Brain, because none of those PRs ever merged and each scheduled
run starts from a clean branch. This entry was produced by re-verifying directly
against the primary Drive documents cited above, and narrows the earlier claims: the
size-cap revocation and the active v6 build are real, but the inference that it
applies to (or supersedes) this repo does not hold up — no document says that.

## GOV-111 — live credential file (tracked, not repo-local)

`111_CREDENTIAL_ROTATION_PARTIAL_LIFT_AND_LANE_KICKOFF.md` (2026-07-26T01:00) and the
2026-07-26 nightly health report both confirm a 70-byte `.env.txt` reappeared at
`G:\My Drive\tiny west\.env.txt` after a prior key rotation. VOX/paid audio generation
is **hard-blocked** (DEC-111-1) pending owner confirmation it's clean or relocation
off the Drive-synced tree. As of the newest dated document, this is **still
unresolved** — no deletion, relocation, or provider-side revocation recorded. This is
outside this repo (no such file exists in this git tree) but is recorded here because
it's a live, owner-actionable risk against the same Drive account this Brain lives in.
The credential value itself is intentionally not reproduced anywhere in this repo.

`NEEDS_DECISION` (owner-level): rotate/relocate the Drive `.env.txt`; rule on
`khuffsphone/tinywest`'s canonical status relative to the v6 lane.
