# Status log — Tiny West

Rolling status log for scheduled check-ins, so future runs append an entry here
instead of opening a new PR every time. Convention proposed in PR #105, repeated
in #148/#149/#150. This is the first time it's actually landed in a merged file.

## 2026-08-01 — status check-in

- **Build**: `node slice/tools/build.mjs` rebuild is byte-identical to the
  2026-07-17 build receipt — `slice/dist/tiny-west.html`, 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
  No gameplay/engine drift.
- **Repo**: working tree clean on `claude/eager-dirac-y6ytu4` at commit `a4c4dd4`
  (last real content change: the 42-second slice add). No commits since.
- **Test suite**: `playtest.mjs` / `qa2.mjs` / `qa3.mjs` did not run this
  session — no `node_modules`/`package.json` under `slice/` in this sandbox
  (same limitation every prior check-in since at least #149 has hit). Only the
  static rebuild + hash comparison could be verified here.

### Operational issues carried forward (unresolved by owner)

1. **PR backlog**: as of this run there are **46 open, unmerged, draft
   "status check-in" PRs** (`#105`, `#107`–`#150`), none carrying gameplay
   code changes. This entry's PR is meant to be the one that lands the
   `STATUS.md` convention — merge it (or any one of the backlog), then close
   the rest without merging and delete the orphaned `claude/eager-dirac-*`
   branches.
2. **Schedule cadence**: the check-ins have been firing far too often
   (multiple times a day since 2026-07-27), which is what produced the
   backlog above. The schedule itself lives outside this repo/session and
   isn't visible or editable from here — needs owner action on the
   scheduling side (reduce frequency or pause until the backlog is cleared).
3. **GOV-111 — possible credential exposure, unconfirmed 5+ days**: PR #105
   (2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Google
   Drive search-result snippet from a `.env.txt` synced into the Brain
   folder. The key value is not reproduced in this repo or any PR. No
   in-repo confirmation has appeared that it was rotated or the file
   removed. **This cannot be resolved from inside the repo — owner needs to
   rotate/revoke the key directly and confirm.**

No player-facing content, mechanics, or protected constants changed this run.
