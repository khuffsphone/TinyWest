# Status log — Tiny West

Rolling status check-ins. Newest entry first. This file lives in the repo (not
Drive); the Brain remains the canonical source per `README.md`.

---

## 2026-08-01 — status check-in (this session)

**Repo / build:** clean. No source changes since `a4c4dd4` (Rampage Express
42-second slice). Rebuilt `slice/dist/tiny-west.html` from source this session —
byte-identical to the artifact recorded in `BUILD_RECEIPT_SLICE.md`
(106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`). No drift.

**Tests re-run for real this session** (Playwright + pre-installed Chromium,
resolved via a temporary local symlink to the globally-installed package for
the duration of the run and removed afterward — nothing about this is
committed):

- `tools/playtest.mjs` — smoke PASS, determinism PASS (hashA==hashB=911533983),
  natural keyboard run seed 20260717 to `results` in 23s, 0 page errors.
- `tools/qa2.mjs` — pay-car route PASS ($837 banked), touch determinism PASS,
  4 viewports no-overflow, 20 reset cycles clean, 0 errors.
- `tools/qa3.mjs` — fork→pay-car exact-input route PASS, completable ($839
  banked), 0 errors.

No regressions, no drift from the 2026-07-17 build receipt.

**Two carried-forward operational items, still need owner action:**

1. **Runaway duplicate-PR backlog — now 51 open, unmerged draft PRs.**
   `#105`–`#155` (first one reportedly `#1`, per PR #105's note) against base
   branch `claude/sunset-riders-clone-lyyefk`, none merged, none carrying
   gameplay changes — each adds only a rolling status file on its own
   throwaway `claude/eager-dirac-*` branch, because each scheduled firing
   starts a fresh session on a new branch off the same base commit and
   nothing ever consolidates. This session adds one more PR (unavoidable per
   this session's repo instructions, which require pushing to its assigned
   branch and opening a PR for it) but is flagging this directly to the owner
   via notification, since the same note in prior PR bodies hasn't gotten
   action in over a week. Real work is stuck underneath: PR **#11**
   ("v6 alpha.3.5 game-feel juice candidate", GOV-77, ~19k additions) has been
   open and unmerged since 2026-07-22 awaiting review, buried under the
   status-PR spam. Recommend: merge or close the status-PR pile, delete the
   orphaned `claude/eager-dirac-*` branches, and slow/reconfigure the
   scheduled task itself (daily instead of hourly, or point at one stable
   branch to update in place) — that lives in the scheduler, not in git.
2. **GOV-111 — credential exposure, status unclear.** Prior sessions reported
   (secondhand) an `ELEVENLABS_API_KEY` value visible in a Drive-synced
   `.env.txt` snippet, unconfirmed for 5+ days as of the last check-in. This
   session found a Drive doc dated 2026-07-26,
   `111_CREDENTIAL_ROTATION_PARTIAL_LIFT_AND_LANE_KICKOFF.md`, whose title
   suggests rotation was already partially underway by that date — its
   contents were not opened, to avoid further handling of credential
   material from this session. The owner should confirm current rotation
   status directly rather than treat GOV-111 as still fully unconfirmed.

**Brain conflict status:** unchanged — CONFLICT-001 (Iron Trail vs Rampage
Express sets) still stands per `RECONCILIATION.md`; no new owner ruling
received. `NEEDS_DECISION` items (final subtitle, 2D/3D pipeline, canonical
repo, release target) remain open.
