# Status log — Tiny West

Rolling log for scheduled status check-ins, per the convention first proposed in
PR #105 (2026-07-27) and repeated in #148/#149: **append one entry here** on future
runs instead of opening a new "status check-in" PR each time.

## 2026-08-01 — routine check-in

- **Slice build: no drift.** `node slice/tools/build.mjs` reproduces
  `slice/dist/tiny-west.html` byte-identical to the 2026-07-17 build receipt —
  106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
- `playtest.mjs` / `qa2.mjs` / `qa3.mjs` did not run this session: `playwright` is
  not installed (no `node_modules` under `slice/`, no `package.json`). Only the
  static rebuild + hash comparison could be verified. This matches what #149
  reported the prior run — the sandbox has not had Playwright available for at
  least the last two check-ins.
- No gameplay/engine/asset changes since `a4c4dd4` (the slice-add commit).

## Outstanding, unresolved across many prior check-ins

**GOV-111 — possible credential exposure, unconfirmed 5+ days (since #105,
2026-07-27).** A Google Drive keyword search surfaced the literal value of an
`ELEVENLABS_API_KEY=...` line in a search-result snippet from a `.env.txt` synced
into the Brain folder. The key value has not been reproduced in this repo or any
PR. No confirmation has appeared in-repo that the owner rotated the key, deleted
the file, or emptied Drive trash. This session did not re-search Drive (to avoid
re-surfacing the value); it is carrying the finding forward unverified, as prior
runs did. **This needs direct owner action outside the repo:** rotate/revoke the
key at the ElevenLabs console, delete the `.env.txt` from the Drive-synced folder,
empty Drive trash, store the credential somewhere non-synced.

**Scheduled check-in PR/branch spam.** As of this run there are **45+ open,
unmerged, draft "status check-in" PRs** (`#107`–`#149`, plus the first
consolidation attempt `#105`), each from its own orphaned `claude/eager-dirac-*`
branch, none carrying gameplay code changes, none merged. This has been flagged
in every check-in since 2026-07-27 with no visible in-repo owner action. Every
run starts from a fresh, memoryless branch off `claude/sunset-riders-clone-lyyefk`,
so nothing persists between runs except what actually gets merged — which is why
this STATUS.md file has had to be re-proposed from scratch multiple times.
**Recommended action (unchanged since #105):** merge one status PR (this one or
#149) to land this file, close the rest of the `claude/eager-dirac-*` backlog
without merging, delete the orphaned branches, and reduce the firing frequency
of the schedule that generates these check-ins.

## Prior entries

Earlier check-ins (2026-07-27 through 2026-07-31) reported the same "no drift"
build result and progressively escalated the two items above; see PR history
`#105`–`#148` for the individual reports. Superseded by this file going forward.
