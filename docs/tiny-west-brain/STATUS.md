# Tiny West — rolling status log

Convention: scheduled status check-ins append an entry here instead of opening a
new PR every run. See `08 — BUILD` / Reconciliation Note (via `RECONCILIATION.md`)
for the authority order this log defers to. Newest entry first.

Note: this file was not present on the merged base branch as of this entry, even
though the same rolling-log convention appears in several open, unmerged
`claude/eager-dirac-*` branches (see "Operational problem" below) — those branches
were never merged, so nothing they added has landed. This entry starts the file
fresh on `claude/eager-dirac-u15d9s`.

---

## 2026-08-01 — routine check-in (this session)

**Repo / build:** clean working tree on `claude/eager-dirac-u15d9s`, at commit
`a4c4dd4` (same tip as `claude/sunset-riders-clone-lyyefk`). No source changes
this run. `slice/dist/tiny-west.html` is byte-identical to the 2026-07-17 build
receipt (`BUILD_RECEIPT_SLICE.md`): 106,552 bytes, SHA-256
`6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`. No drift.

**Tests:** ran all three slice suites for real this session, against a temporary
`slice/node_modules/playwright` symlink to the sandbox's global Playwright
install (removed again before commit — not part of the repo):
- `tools/playtest.mjs` — smoke PASS (all 5 checks), `runDeterminismCheck` PASS
  (hashA == hashB == 911533983), natural keyboard run reached `results` in 24s
  sim time with $269 banked, 0 page errors.
- `tools/qa2.mjs` — pay-car route PASS ($837 banked), touch-device determinism
  PASS, all four viewports (1100×760 / 412×915 / 360×640 / 915×412) no overflow,
  20 reset cycles clean, 0 errors.
- `tools/qa3.mjs` — fork→pay-car exact-input route PASS, completable ($839
  banked), 0 errors.

No code changes this run — status/verification only, per the CLAUDE.md "done
means tested" rule.

**Operational problem (carried forward, unresolved — flag this to the owner):**
as of this entry there are **49+ open, unmerged, draft "status check-in" PRs**
(`#105` through `#152`, base `claude/sunset-riders-clone-lyyefk`), none merged,
none carrying gameplay changes. Each scheduled firing gets a fresh session on a
new `claude/eager-dirac-*` branch forked from the same base commit, so nothing
accumulates and every run re-opens the same conversation. Prior unmerged
branches report this has been flagged in every check-in since 2026-07-27 (first
raised in #105) with no visible owner action in-repo yet. The firing schedule
itself lives outside this repo/session and is not visible or editable from here.
Recommended action (unchanged since #105): merge this PR or one prior status PR,
close the rest of the `claude/eager-dirac-*` backlog unmerged, delete the
orphaned branches, and reduce/fix the schedule generating these check-ins.

**GOV-111 — possible credential exposure — still unconfirmed.** Prior unmerged
branches (first: PR #105, 2026-07-27) report an `ELEVENLABS_API_KEY` value
visible in a Google Drive search-result snippet from a `.env.txt` synced into
the Brain folder. This session did not independently reproduce or verify that
claim (only reviewed it secondhand via GitHub PR file contents from prior,
unmerged automated runs) — treat it as unconfirmed, not established fact. No
confirmation has been seen in any PR that the file was removed or the key
rotated. This cannot be resolved from inside the repo — it needs the owner to
check the Drive folder directly, and if a real key is exposed, rotate/revoke it
and remove the file from the synced folder.

---

## 2026-07-17 — slice build landed

See `BUILD_RECEIPT_SLICE.md` for the full preflight, artifact, and verification
record for the 42-second Rampage Express vertical slice (commit `a4c4dd4`).
