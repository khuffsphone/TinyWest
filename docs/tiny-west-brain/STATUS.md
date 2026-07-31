# Status log — Tiny West

Rolling log of scheduled status check-ins. Newest entry on top. Each entry is a
docs-only Brain update unless stated otherwise; slice code changes get their own
commit and, where relevant, an updated `BUILD_RECEIPT_SLICE.md`.

## 2026-07-31 — status check-in, no drift; two unresolved owner items carried forward

- Rebuilt `slice/dist/tiny-west.html` from current `slice/src` via `node slice/tools/build.mjs`:
  byte-identical, 106,552 B, SHA-256 `6580961cf51bfed087f63a89558103e7af434f6a3f9784d02006bbd65f720bba`
  — matches `BUILD_RECEIPT_SLICE.md`. Working tree clean before this change; no drift
  since `a4c4dd4` (2026-07-17).
- Full QA (`playtest.mjs`, `qa2.mjs`, `qa3.mjs`) could not run in this session:
  `playwright` is not installed and there is no `package.json`/`node_modules` in the
  repo to install it from. Build-level verification (byte-identical rebuild) is the
  only check performed this run.
- No new gameplay code, no Brain reconciliation changes, no constant changes.

**Carried forward — needs owner action, not fixable by this scheduled run:**

1. **Duplicate-PR backlog.** As of this entry there are **36 open, unmerged, draft**
   "status check-in" PRs (#111–#146), all produced by this same scheduled prompt
   firing every 1–3 hours since roughly 2026-07-22, plus ~40 more already closed
   unmerged. None have ever been merged. This run does **not** open a 37th — see the
   note in this repo's PR (if any) for this date. Recommend: pause or slow the
   schedule that fires this prompt, merge one PR (e.g. the one that lands this
   `STATUS.md` convention), and close the rest — none carry gameplay code changes.
2. **GOV-111 — possible credential exposure, unconfirmed 5+ days.** PR #105
   (2026-07-27) reported an `ELEVENLABS_API_KEY` visible in a Drive search-result
   snippet from a `.env.txt` file synced into the Brain folder, blocking paid
   ElevenLabs generation until resolved. This run did not re-search Drive for it, to
   avoid re-exposing the value in tool output again. Still no in-repo confirmation
   the key was rotated or the file removed from the synced Drive folder — please
   verify directly and rotate the key if not already done.

## 2026-07-17 — Rampage Express 42-second slice built

See `BUILD_RECEIPT_SLICE.md` for the full preflight, build, and adversarial-review
record (commit `a4c4dd4`).
