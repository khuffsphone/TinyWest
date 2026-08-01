# Status log — Tiny West

Rolling status log for scheduled check-ins, so future runs append an entry here
instead of opening a new PR every time. Convention proposed in PR #105, repeated
in #148/#149/#150, first landed (unmerged) in #151.

## 2026-08-01 — status check-in (this run)

- **Build**: `node slice/tools/build.mjs` rebuild is byte-identical to the
  2026-07-17 build receipt — `slice/dist/tiny-west.html`, 106,552 bytes,
  SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
  No gameplay/engine drift. `git status` clean before and after rebuild.
- **Repo**: working tree clean on `claude/eager-dirac-u9ccfn`, branched from
  `a4c4dd4` (the 42-second slice add, 2026-07-17). No real content commits
  since.
- **Test suite**: `playtest.mjs` failed immediately — `ERR_MODULE_NOT_FOUND:
  playwright` (no `node_modules`/`package.json` under `slice/` in this
  sandbox). `qa2.mjs`/`qa3.mjs` not attempted for the same reason. Only the
  static rebuild + hash comparison could be verified this session — same
  limitation every prior check-in has hit.
- **No new PR opened for this run.** There are already 47 open, unmerged,
  duplicate "status check-in" PRs (`#105`, `#107`–`#151`) carrying this exact
  content pattern and none merged. Opening a 48th would make the backlog this
  entry is flagging worse, not better, so this run's `STATUS.md` update was
  pushed to its branch without an accompanying PR. See PR #151 for the most
  complete write-up and the same operational flags below — merging #151 (or
  any single one of the backlog) and closing the rest is still the
  recommended fix.

### Operational issues carried forward (unresolved by owner)

1. **PR backlog**: **47 open, unmerged, draft "status check-in" PRs**
   (`#105`, `#107`–`#151`) as of this run, none carrying gameplay code
   changes, none merged. Recommend: merge one (`#151` already lands this
   `STATUS.md` file), close the rest without merging, delete the orphaned
   `claude/eager-dirac-*` branches.
2. **Schedule cadence**: check-ins have been firing multiple times a day
   since 2026-07-27, which produced the backlog above. The schedule lives
   outside this repo/session and isn't visible or editable from here — needs
   owner action on the scheduling side (reduce frequency or pause until the
   backlog clears).
3. **GOV-111 — possible credential exposure, unconfirmed 5+ days**: PR #105
   (2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Google
   Drive search-result snippet from a `.env.txt` synced into the Brain
   folder. The key value is not reproduced in this repo or any PR, and this
   run did not re-search Drive (to avoid re-exposing it). No in-repo
   confirmation has appeared that it was rotated or the file removed.
   **This cannot be resolved from inside the repo — owner needs to
   rotate/revoke the key directly and confirm.**

No player-facing content, mechanics, or protected constants changed this run.
