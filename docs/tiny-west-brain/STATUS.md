# Tiny West Brain — status log

Running log of scheduled git-lane status check-ins on `khuffsphone/tinywest`. Newest
entry first. Each entry is independently verified against the canonical Drive Brain
where it touches Brain-side claims — not just copied from a prior check-in's PR text.

---

## 2026-07-27 — repo stable; two unresolved owner items reconfirmed live

**Repo / slice health — no regressions.** Working tree was clean before this check-in
(2 commits: `cfb0034` tribute, `a4c4dd4` 42-second Rampage Express slice). Rebuilt
`slice/dist/tiny-west.html` from source: byte-identical to the 2026-07-17 build receipt
— 106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
`git status` clean after rebuild, no generated-file drift. Full Playwright QA suite
(`playtest.mjs`/`qa2.mjs`/`qa3.mjs`) not re-run this pass — no source has changed since
the last recorded green run this week; the rebuild-parity check above is sufficient to
confirm no drift.

**CONFLICT-002 — confirmed independently, still open.** See `CONFLICT-002.md`. The
canonical Drive Brain runs an active "Tiny West: Iron Trail v6" build line that revoked
this repo's 1.2 MB ceiling on 2026-07-19 and has a current live gate candidate of
~4.46 MB (`alpha.3.12-presentation`), built and audited entirely outside this git repo.
This repo has had no commits since 2026-07-17 and its docs still enforce the old
ceiling. `NEEDS_DECISION` (owner-level): is `khuffsphone/tinywest` still canonical, or a
frozen prototype the project has moved past. No code or constants changed here — report
only.

**Security — live credential exposure, still unresolved.** Independently re-verified
against the Drive Brain directly (a Drive keyword search over the project folder, not a
deliberate file open): a `.env.txt` file in the Drive-synced "tiny west" project root
(created 2026-07-26T01:11 UTC, unchanged since) still returns a well-formed
`ELEVENLABS_API_KEY=...` line directly in ordinary search-result snippets — meaning
Drive's own indexing surfaces the key text without anyone needing to open the file. The
Brain's own governance notes (`GOV-111`, `GOV-112`, both 2026-07-26) record this same
finding and call it live and unremediated; this check-in confirms the file is **still
present, unmoved, and unchanged** as of now, over 24 hours after it was first flagged.
The key value itself is not reproduced here or anywhere in this repo. Owner-actionable,
not something this repo or routine can fix:
1. Rotate **and revoke** the key at the ElevenLabs console (rotation without revocation
   is not remediation — and per GOV-111/112, a same-shaped file has already reappeared
   in the synced folder once after an earlier rotation).
2. Delete `.env.txt` from the Drive-synced folder and empty the Drive trash (a trashed
   file is still hosted).
3. Store the replacement outside any Drive-synced path (e.g. a user environment
   variable) and repoint the SFX tooling at it.
4. Re-run a keyword search over the tree to confirm nothing else holds credential
   material.

**Process note — PR cadence.** This scheduled routine has opened roughly 100
near-duplicate "status check-in" PRs since 2026-07-24/25 against this repo, essentially
all drafts, zero merged (each run starts from a fresh scheduler-generated branch with no
memory of prior runs, so nothing consolidates). The Brain's own external audit
(`112_COWORK_AUDIT_...md`) independently flagged the same problem and instructed this
repo's registered "GIT" lane not to open further duplicate PRs until the cadence is
resolved. Per that instruction, this check-in pushes its branch and this status update
but does **not** open a new PR. Two PRs already sit open unmerged from prior runs
(#99, #100 as of this check-in). Recommended owner action (unchanged from prior
check-ins): merge one PR as the consolidated baseline, close the rest of the backlog,
and reduce the schedule's cadence (daily or event-triggered instead of hourly).

### Open items for the owner (nothing else changed here)

- **Security (most urgent):** rotate + revoke the ElevenLabs key and move it off the
  Drive-synced path.
- **CONFLICT-002:** rule on this repo's canonical status vs. the v6 build line.
- **PR cadence:** merge one consolidated status PR, close the rest, reduce schedule
  frequency.
