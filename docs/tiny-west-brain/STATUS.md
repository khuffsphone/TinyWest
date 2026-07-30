# Tiny West — Status

Latest scheduled check-in: **2026-07-30, ~19:40Z** (session on branch `claude/eager-dirac-hcx2og`).

## Repo / build

- Repo unchanged: 2 commits on `claude/sunset-riders-clone-lyyefk` (base), working tree clean.
- `node slice/tools/build.mjs` rebuild is byte-identical to the 2026-07-17 build receipt:
  `slice/dist/tiny-west.html`, 106,552 bytes, SHA-256
  `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.
- Full local suite run this pass (playwright installed fresh in-container — not present by
  default), all green, no regressions:
  - `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches prior runs),
    natural keyboard run to RESULTS, $269 banked, 0 page errors.
  - `qa2.mjs` — pay-car route ($837 banked), touch input + determinism, 4 viewports
    (no clipping/overflow), 20 reset cycles: all PASS.
  - `qa3.mjs` — pay-car fork reachable via exact input and completable ($839 banked): PASS.

## Open, owner-level items (unchanged from prior check-ins; not resolvable from inside a run)

1. **GOV-111 / DEC-112-4 — ElevenLabs credential exposure.** Carried forward as
   **unremediated**. An independent full-scope Drive audit (2026-07-28T06:03Z,
   `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_28.md`) found `.env.txt` still present on the
   Drive-synced tree after several title-only searches had wrongly suggested it was gone —
   treat those earlier "not found" results as false negatives of that search method, not
   remediation. This session did not repeat any Drive credential search (avoiding further
   exposure risk). Assume the key is still exposed and all paid ElevenLabs generation stays
   hard-blocked until the owner directly confirms: key rotated + old key revoked, `.env.txt`
   deleted, Drive trash emptied, credential relocated off any Drive-synced path.
2. **Scheduled-task PR/branch backlog.** This check-in prompt has fired roughly hourly since
   2026-07-24. As of this run: **PR #105** (2026-07-27, test-green) is the designated
   consolidation PR and remains open/unmerged; **30 open near-duplicate status PRs** exist
   (`#105`, `#107`–`#139`), zero merged, plus 150+ orphaned `claude/eager-dirac-*` branches
   on the remote. Per GOV-112 §10 ("do not open further duplicate PRs until the cadence is
   resolved"), this run does **not** open PR #140 — findings are recorded here and as a
   comment on #105 instead. Recommended owner actions (unchanged across ~35+ check-ins):
   - Merge #105 (or one consolidated status PR) and close the rest as duplicates.
   - Prune the accumulated `claude/eager-dirac-*` branches.
   - Slow or pause the scheduled task's firing cadence (currently ~hourly) so future runs
     have a merged baseline to build from instead of re-deriving from scratch every time.
3. **CONFLICT-002 (repo canonicity) — still `NEEDS_DECISION`.** This repo's `CLAUDE.md` /
   `CONSTANTS.md` state a "<1.2 MB preferred" file-budget ceiling as closed/binding; per
   PR #105's history, a newer Brain doc (`00_V6_START_HERE_CURRENT.md`, 2026-07-19) reportedly
   supersedes that ceiling against a ~4.46 MB live external build. Not independently
   re-verified this pass. Owner ruling needed: is `khuffsphone/tinywest` still canonical, or
   should it be marked frozen and the ceiling language reconciled.

## No action taken this pass beyond verification + this note

No canon, gameplay/engine code, or protected constant changed. No Drive writes attempted
(prior runs reported Drive `create_file` failing intermittently from this sandbox; filing
this note in-repo instead, linked from `README.md`).
