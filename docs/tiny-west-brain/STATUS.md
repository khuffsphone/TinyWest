# Tiny West — status log

Rolling status check-in log. New entries are appended below (most recent last) so
scheduled check-ins update this one file instead of opening a new PR each time.
**If this file already exists on `main`/the merge target when you read this, append
to it there — do not re-add it from a fresh branch.**

## 2026-07-17 — initial slice build

See `BUILD_RECEIPT_SLICE.md` for full detail. `slice/dist/tiny-west.html` built,
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
All nine slice beats playable, determinism verified, adversarial review complete
(17 findings fixed).

## 2026-07-31 — status check-in (this run)

- Repo clean on `claude/eager-dirac-uh0rlk` @ `a4c4dd4` (no commits since the
  2026-07-17 slice build — game state is unchanged).
- Rebuilt `slice/dist/tiny-west.html` from current `slice/src` via
  `node slice/tools/build.mjs`: **byte-identical** to the 2026-07-17 receipt
  (106,552 bytes, same SHA-256 above). No code drift.
- No gameplay/engine changes this run — verification-only check-in.

### Operational issue — recurring, unresolved, needs owner action

This scheduled prompt has fired repeatedly (roughly hourly to every few hours)
since about 2026-07-22–24, each time from a fresh, memoryless session/branch. As of
this run there are **~40 open, unmerged, draft "status check-in" PRs**
(`#107`–`#147`, plus unrelated `#11` and the first consolidation attempt `#105`),
none of which have ever been merged. Several ask to "merge #105" as the fix — those
requests are themselves just more unmerged duplicates, not a resolution. None of
these PRs carry gameplay code changes, so **closing the backlog loses nothing**.

Recommended owner action (unchanged from prior runs, still not done):
1. Merge one PR that adds this `STATUS.md` convention (e.g. this one, or #105) into
   the `claude/sunset-riders-clone-lyyefk` base so future scheduled runs have a file
   to append to instead of re-deriving from scratch.
2. Close the rest of the `claude/eager-dirac-*` backlog and delete the orphaned
   branches — none contain code changes.
3. Slow or pause the schedule firing this prompt (e.g. daily instead of hourly), or
   point it at a stable branch to update in place, so the backlog stops growing.

### GOV-111 — credential exposure, still unconfirmed after 4+ days

PR #105 (2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Google
Drive keyword-search-result snippet, sourced from a `.env.txt` file synced into the
Brain folder — no deliberate file-open was needed to see it. The key value was not
reproduced in that PR or this repo. Per the Brain's governance notes, all paid
ElevenLabs generation is hard-blocked until this clears. This run did **not**
re-search Drive for it, to avoid re-exposing the value in tool output again — no
confirmation has appeared anywhere in this repo that the key was rotated or the
file removed.

**Owner action needed:** rotate/revoke the key at the ElevenLabs console, delete the
exposed `.env.txt` from the Drive-synced folder, empty Drive trash, and move the
credential to a non-synced location. This cannot be resolved from inside the repo.

One unrelated open draft, PR #11 ("v6 alpha.3.5 game-feel juice candidate (GOV-77)"),
still doesn't match anything in this repo's Brain docs and remains out of scope.
