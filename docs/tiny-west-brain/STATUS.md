# Tiny West — status log

Rolling status check-in log. New entries are appended below (most recent last) so
scheduled check-ins update this one file instead of opening a new PR each time.

## 2026-07-17 — initial slice build

See `BUILD_RECEIPT_SLICE.md` for full detail. `slice/dist/tiny-west.html` built,
106,552 bytes, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`.
All nine slice beats playable, determinism verified, adversarial review complete
(17 findings fixed).

## 2026-07-31 — status check-in

- Repo clean on `claude/eager-dirac-acp7u5` @ `a4c4dd4` (no commits since the
  2026-07-17 slice build).
- Rebuilt `slice/dist/tiny-west.html` from current `slice/src` via
  `node slice/tools/build.mjs`: **byte-identical** to the 2026-07-17 receipt
  (106,552 bytes, same SHA-256 above). No code drift.
- No gameplay/engine changes this run — this is a verification-only check-in.

### Operational issue — flagged repeatedly, still unresolved (owner action needed)

This run found **42 open, unmerged, draft "status check-in" PRs** (#107–#146, plus
unrelated #11 and #105), all produced by this same scheduled prompt firing
repeatedly (every 1–3 hours) since about 2026-07-22. **None have ever been
merged.** Several PRs in the backlog ask to "merge #105" or similar as the fix —
those are themselves just more unmerged duplicates, not a resolution. This entry
does not change that pattern by itself; a human needs to either pause/slow the
schedule that fires this prompt, or merge one PR (ideally one that adopts this
`STATUS.md` convention) and close the rest — none carry gameplay code changes, so
closing them loses nothing.

**GOV-111 (credential exposure) — still unconfirmed, now 4+ days.** PR #105
(2026-07-27) reported an `ELEVENLABS_API_KEY` value visible in a Drive
search-result snippet from a `.env.txt` file synced into the Brain folder, and
stated all paid ElevenLabs generation is blocked until this clears. This run did
**not** re-search Drive for it, to avoid re-exposing the value in tool output
again. No confirmation has appeared in this repo that the key was rotated or the
file removed. **The owner should rotate/revoke the key directly and confirm here
once done** — this cannot be resolved from inside the repo.

One unrelated open draft, **PR #11** ("v6 alpha.3.5 game-feel juice candidate
(GOV-77) — delivery staging for Cowork audit"), still doesn't match anything in
this repo's Brain docs and remains out of scope per prior runs' notes.
