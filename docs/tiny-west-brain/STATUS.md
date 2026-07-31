# Tiny West — rolling status log

Single append-only log for scheduled check-ins on this repo, so each new (memoryless)
run has something merged-adjacent to read instead of re-deriving context from scratch.
Newest entry first. See `README.md` for the Brain index and `RECONCILIATION.md` for
the CONFLICT-001 ruling this repo follows.

---

## 2026-07-31 — status check-in

**Repo/build**: unchanged since commit `a4c4dd4` (2026-07-17), working tree clean.
`node slice/tools/build.mjs` reproduces `slice/dist/tiny-west.html` byte-identical:
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bb`.
Ran the full local suite this pass (Playwright symlinked in from the environment's
global install, nothing committed):

- `playtest.mjs` — smoke PASS, determinism PASS (hash `911533983`, matches every prior
  run since 2026-07-17), natural keyboard run to RESULTS, $269 banked, 0 page errors.
- `qa2.mjs` — pay-car route $837 banked, touch-device determinism, all 4 viewports
  (1100×760 / 412×915 / 360×640 / 915×412) no clipping/overflow, 20 reset cycles clean.
- `qa3.mjs` — pay-car fork reachable via exact input and completable, $839 banked.

No regressions, 14 days running unchanged.

**GOV-111 (ElevenLabs credential exposure) — still open, 5+ days unremediated (since
2026-07-26).** Per the 2026-07-28T08:23Z check-in (see PR #105 comment thread), an
independent full-scope Drive audit found `.env.txt` still present on the Drive-synced
tree after several title-only searches had wrongly suggested it was gone (a false
negative of that search method). One 2026-07-30 run reported a title/fullText search
turning up no `.env*` file, but could not confirm Drive trash was emptied or the old
key revoked at the provider — so that is a *maybe*, not a confirmed close. This run did
not repeat any Drive credential search (avoiding further exposure risk). **Treat as
unremediated**: all paid ElevenLabs generation (voice + non-voice) stays hard-blocked
(DEC-112-4) until the owner directly confirms (1) the key was rotated and the old one
revoked at the ElevenLabs console, (2) `.env.txt` is deleted and Drive trash emptied,
(3) the credential lives somewhere not synced to Drive.

**CONFLICT-002 (repo canonicity) — unchanged, `NEEDS_DECISION`.** An external "Iron
Trail v6" build in the same Brain Drive folder has grown well past this repo's
`< 1.2 MB preferred` ceiling (reported ~4.46–4.48 MB as of 2026-07-30). Whether
`khuffsphone/tinywest` is still the canonical target, or should be marked frozen, is
an owner-level call this repo's `CLAUDE.md`/`CONSTANTS.md` have not yet been updated
to reflect either way.

**PR/branch backlog — the dominant open issue, unchanged in kind, still climbing.**
As of this run there are **34 open, unmerged, draft "status check-in" PRs** (`#105`,
`#107`–`#144`), spanning 2026-07-27 through today, all from this same scheduled prompt
firing repeatedly (roughly hourly) since 2026-07-24. None have been merged. Plus 150+
orphaned `claude/eager-dirac-*` branches on the remote. Per the standing convention in
this thread (and GOV-112 §10, "do not open further duplicate PRs until the cadence is
resolved"), this run does **not** open a 35th duplicate PR. Findings are recorded here
and as a comment on PR #105 instead.

**Recommended owner action (unchanged from every prior check-in in this chain):**
1. Merge PR #105 (test-green, oldest open consolidation) and close the other ~34 open
   duplicates; prune the `claude/eager-dirac-*` branches.
2. Slow or pause the scheduled task's firing cadence (currently ~hourly).
3. Confirm the ElevenLabs credential rotation and `.env.txt` removal directly — this
   cannot be verified with confidence from inside any single sandboxed run.
4. Rule on CONFLICT-002 / ADR-003 (repo canonicity vs. the external Iron Trail v6
   Drive build).
