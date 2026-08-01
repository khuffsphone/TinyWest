# Tiny West — rolling status log

Convention: scheduled status check-ins append an entry here instead of opening a
new PR every run. See `08 — BUILD` / Reconciliation Note for the authority order
this log defers to. Newest entry first.

---

## 2026-08-01 — routine check-in (this session)

**Repo / build:** clean working tree on `claude/eager-dirac-eu54m5` (forked from
`claude/sunset-riders-clone-lyyefk` @ `a4c4dd4`). Rebuilt `slice/dist/tiny-west.html`
from source: **byte-identical** to the 2026-07-17 build receipt — 106,552 bytes,
SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.

**Tests:** this sandbox has no `slice/node_modules`, but a symlink to the
sandbox's global `playwright` install (`/opt/node22/lib/node_modules`) let all
three suites run for real this session (removed again before commit — not part
of the repo):
- `playtest.mjs` — smoke PASS, `runDeterminismCheck` PASS (hashA==hashB),
  natural keyboard run reached `results` in 37s sim time, 0 page errors.
- `qa2.mjs` — pay-car route PASS, touch-device determinism PASS, all four
  viewports no-overflow, 20 reset cycles clean, 0 errors.
- `qa3.mjs` — fork→pay-car exact-input route PASS, completable ($839 banked), 0 errors.

No code changes this run — status/verification only.

**Operational problem (carried forward, unresolved):** as of this entry there are
**48+ open, unmerged, draft "status check-in" PRs** (`#105`, `#107`–`#151`) against
base `claude/sunset-riders-clone-lyyefk`, none merged, none carrying gameplay
changes. Each scheduled firing gets a fresh session on a new `claude/eager-dirac-*`
branch forked from the same base commit, so nothing accumulates and every run
re-opens the same conversation. This has been flagged in every check-in since
2026-07-27 (first raised in #105) with no visible owner action in-repo. The
firing schedule itself lives outside this repo/session and is not visible or
editable from here.

**GOV-111 — possible credential exposure — still unconfirmed.** PR #105
(2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Google Drive
search-result snippet from a `.env.txt` synced into the Brain folder. Not
reproduced here or in any PR. No confirmation seen that it was rotated or the
file removed. This cannot be resolved from inside the repo — needs the owner to
rotate/revoke the key directly and confirm.

**Recommended action (unchanged since #105):** merge this or one prior status
PR, close the rest of the `claude/eager-dirac-*` backlog unmerged and delete the
orphaned branches, and reduce/fix the schedule generating these check-ins on the
owner side. Separately: rotate the ElevenLabs key per GOV-111 and confirm.

---

## 2026-07-17 — slice build landed

See `BUILD_RECEIPT_SLICE.md` for the full preflight, artifact, and verification
record for the 42-second Rampage Express vertical slice (commit `a4c4dd4`).
