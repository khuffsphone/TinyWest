# Status log — Tiny West

Rolling status check-ins. Newest entry first. This file lives in the repo (not
Drive); the Brain remains the canonical source per `README.md`.

---

## 2026-08-01 — status check-in (this session)

**Repo / build:** clean. No source changes since `a4c4dd4` (Rampage Express
42-second slice). `slice/dist/tiny-west.html` SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` — byte-identical
to the artifact recorded in `BUILD_RECEIPT_SLICE.md`. No rebuild needed.

**Tests re-run for real this session** (Playwright + pre-installed Chromium;
`playwright` isn't declared as a project dependency anywhere in this repo, so
it was resolved via a temporary local symlink to the globally-installed
package for the duration of the run and removed afterward — nothing about
this is committed):
- `tools/playtest.mjs` — smoke PASS, determinism PASS (hashA==hashB=911533983),
  natural keyboard run seed 20260717 to `results` in 37s, 0 page errors.
- `tools/qa2.mjs` — pay-car route PASS ($837 banked), touch determinism PASS,
  4 viewports no-overflow, 20 reset cycles clean, 0 errors.
- `tools/qa3.mjs` — fork→pay-car exact-input route PASS, completable ($839
  banked), 0 errors.

No regressions, no drift from the 2026-07-17 build receipt.

**Two carried-forward operational items — still need owner action, not
resolvable from inside this session (both flagged in every check-in since
2026-07-22 / 2026-07-27 respectively; escalating via direct notification
this run since GitHub PR bodies alone have not gotten owner action in over a
week):**

1. **Runaway duplicate-PR backlog, still growing.** As of this check-in there
   are **~50 open, unmerged, draft** "status check-in" PRs (`#105`–`#154`,
   first one `#1` on 2026-07-22) against base branch
   `claude/sunset-riders-clone-lyyefk`, none merged, none carrying gameplay
   changes — each adds only a rolling status file on its own throwaway
   `claude/eager-dirac-*` branch. Each scheduled firing spins up a fresh
   session on a new branch off the same base commit, so nothing ever
   consolidates. This session adds one more PR (unavoidable per this
   session's repo instructions, which require pushing to its assigned branch
   and opening a PR for it). Recommend: merge one status PR (or none — they
   carry no code), close the rest, delete the orphaned `claude/eager-dirac-*`
   branches, and fix the cadence/config of the scheduled task itself (that
   lives in the scheduler, not in git). Separately, **PR #11**
   (`v6 alpha.3.5 game-feel juice candidate`, GOV-77, 19,006 additions, 2.4 MB
   build artifact) has been open and unmerged since 2026-07-22 awaiting a
   Cowork independent audit + owner approval — real work, stalled for 10+
   days, buried under the status-PR spam.
2. **GOV-111 — possible credential exposure, still unconfirmed after 5+
   days.** Prior sessions have reported (secondhand, via earlier automated PR
   bodies) that an `ELEVENLABS_API_KEY` value may be visible in a
   Drive-synced `.env.txt` snippet, first raised 2026-07-27. This session
   again searched the local filesystem for any `.env.txt` and found none —
   the file, if it exists, is not present in this container/repo checkout,
   consistent with it living only in the synced Drive folder. Still cannot
   independently confirm or deny the claim from here. If real, this needs the
   key rotated/revoked and the file removed from the Drive sync directly by
   the owner; it is not fixable from inside this repo.

**Brain conflict status:** unchanged — CONFLICT-001 (Iron Trail vs Rampage
Express sets) still stands per `RECONCILIATION.md`; no new owner ruling
received. `NEEDS_DECISION` items (final subtitle, 2D/3D pipeline, canonical
repo, release target) remain open.
