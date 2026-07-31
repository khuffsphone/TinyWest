# Tiny West — status log

Rolling status check-in log. New entries are appended below (most recent last) so
scheduled check-ins update this one file instead of opening a new PR each time.
(This convention was first proposed in PR #144; adopted here since #144 itself
is still unmerged.)

## 2026-07-17 — initial slice build

See `BUILD_RECEIPT_SLICE.md` for full detail. `slice/dist/tiny-west.html` built,
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
All nine slice beats playable, determinism verified, adversarial review complete
(17 findings fixed).

## 2026-07-31 — status check-in

- Repo clean on `claude/sunset-riders-clone-lyyefk` @ `a4c4dd4` (no commits since the
  2026-07-17 slice build).
- Rebuilt `slice/dist/tiny-west.html` from current `slice/src` via
  `node slice/tools/build.mjs`: **byte-identical** to the 2026-07-17 receipt
  (106,552 bytes, same SHA-256 above). No code drift.
- No gameplay/engine changes this run — verification-only check-in.

### Operational issue — escalating, unresolved (owner action needed)

As of this check-in there are **34 open, unmerged, draft "status check-in" PRs**
(#111–#144), all produced by this same scheduled prompt firing repeatedly
(roughly every 1–3 hours) since about 2026-07-22, plus ~40 more already closed
unmerged — none have ever been merged. The backlog is growing by several PRs a
day; "please merge #105" (repeated across many of them) is not a resolution,
since #105 is itself just another unmerged duplicate. Recommend, at the owner's
discretion: pause or slow the check-in schedule, merge exactly one consolidated
status PR (this one, or #144, adopts the single-file-log convention so future
runs stop opening new PRs), and close the rest of the backlog — none carry
gameplay code changes, so closing them loses nothing.

**GOV-111 (credential exposure) — status still unclear, needs owner confirmation.**
PR #105 (2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Drive
search-result snippet from a `.env.txt` file synced into the Brain folder, and
stated all paid ElevenLabs generation is blocked until this clears. This run did
**not** re-search Drive for it, to avoid re-triggering exposure of the value in
tool output/logs again. As of this check-in it has been **4+ days** since that
report with no confirmation visible in-repo that the key was rotated or the file
removed. The owner should verify rotation status directly rather than have future
scheduled runs keep re-querying for it.

One unrelated open draft, **PR #11** ("v6 alpha.3.5 game-feel juice candidate
(GOV-77) — delivery staging for Cowork audit"), still doesn't match anything in
this repo's Brain docs and looks out of scope.
