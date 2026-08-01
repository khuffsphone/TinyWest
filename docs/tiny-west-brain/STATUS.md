# Status log — rolling

Convention (proposed in PR #105, adopted here): scheduled status check-ins append
one dated entry below instead of opening a new PR each run. See `README.md` for
the Brain index and `BUILD_RECEIPT_SLICE.md` for the original slice build record.

## 2026-08-01 — status check-in

- **Build**: `slice/dist/tiny-west.html` rebuilt from source via `node tools/build.mjs`.
  106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba` —
  byte-identical to the 2026-07-17 build receipt. No drift in engine/gameplay code.
- **QA**: `playwright` is not installed in this environment (no `node_modules`,
  no `package.json` under `slice/`), so `playtest.mjs` / `qa2.mjs` / `qa3.mjs`
  could not be executed this run. This matches the constraint noted in prior
  check-ins; only the static rebuild + hash comparison could be verified.
- **Repo**: working tree clean on `claude/eager-dirac-cgve5y`, two commits ahead
  of the tribute baseline (`cfb0034` tribute, `a4c4dd4` slice). No code changes
  made this run — this is a status-only entry.

### Outstanding — needs owner action

1. **GOV-111 (possible credential exposure), unconfirmed since 2026-07-27 (PR #105).**
   An `ELEVENLABS_API_KEY` value was reportedly visible in a Google Drive
   search-result snippet from a `.env.txt` synced into the Brain folder. The key
   itself has not been reproduced in any PR or in this repo, and no run has
   re-searched Drive for it since, to avoid re-exposing the value. **No
   confirmation has appeared that the key was rotated or the file removed.**
   This is now 5 days outstanding. Owner should rotate/revoke the key directly
   and confirm here — this cannot be resolved from inside the repo.
2. **Duplicate draft PR backlog.** As of this run there are **44 open, unmerged,
   draft "status check-in" PRs** (`#107`–`#148`, plus unrelated `#11` and the
   first consolidation attempt `#105`) against `claude/sunset-riders-clone-lyyefk`,
   none of which carry gameplay code changes (each is a rebuild-verify + status
   note, like this one). This run adds a 45th rather than resolve the backlog,
   since closing/merging others' PRs is outside this task's scope without
   explicit owner sign-off. **Recommended:** merge one status PR (this one or
   #148) to land this `STATUS.md` convention, close the rest of the
   `claude/eager-dirac-*` backlog and delete the orphaned branches, and
   reduce/pause the schedule that fires this prompt so it stops growing.

Both items have been flagged in every check-in since 2026-07-27 with no owner
action visible in-repo. Flagging again here per the `STATUS.md` convention
rather than opening more prose in the PR body.
