# CONFLICT-002 — this repo vs. the v6 no-size-cap rebuild (unresolved, reported 2026-07-26)

**Status:** reported, not resolved. Per CONFLICT-001's own rule, applied here too: never silently
merge, report the conflict and let the owner rule.

## What was found

A scheduled status-check-in session read the canonical Drive Brain directly (not just this folder)
and found a governing document dated **2026-07-19** — two days after this repo's Brain index was
"verified 2026-07-17," and nine days before this report — that this repo has never absorbed:

- `00_V6_START_HERE_CURRENT.md` (Drive ID `1qTbBhgL2FeVYfP0cgaPvFKbxrx7pwEwx`, status CURRENT) opens a
  **"Tiny West: Iron Trail v6 no-size-cap rebuild"** program and states: *"The inherited 1.2 MB
  artifact ceiling is revoked. The user did not establish it. Artifact bytes are telemetry only ...
  If an older document treats 1.2 MB as a release gate ... the current v6 charter governs."*
- This repo's `CLAUDE.md` still lists "< 1.2 MB preferred" as a **Closed rule (binding)**, and
  `CONSTANTS.md` repeats it as "File budget | < 1.2 MB preferred, 2.5 MB hard | canon." Neither file
  has been updated for the v6 correction.
- The v6 line is active and shipping, but lives entirely as Drive artifacts and is not connected to
  `khuffsphone/tinywest`: working branch `v6/no-size-cap-rebuild` (does not exist in this repo),
  immutable alpha.0/alpha.1/alpha.2 foundations, and a current holding candidate
  `v6.0.0-alpha.3.9-engineAudio.html` — 4,396,777 bytes (~41x this repo's 106,552-byte slice),
  39/39 Playwright gates passing, awaiting a separate Claude Cowork UAT pass. Per
  `NIGHTLY_BRAIN_HEALTH_REPORT_2026_07_25` (Drive ID `1gBWiId3VRI-ftZy1EjS6buKdcSlJRzhf8tz_3WiDfRg`,
  audited by a different system, "Gemini Spark"), the BLD/ART/DSN/SFX/VOX lanes are all actively
  shipping into this v6 line — none of it lands in this git repo.
- The original Brain index already flagged, on 2026-07-17, that no authoritative repository/branch
  had been proven for implementation work. That was never resolved. The evidence now suggests
  `khuffsphone/tinywest` is not that repository: the v6 artifacts are produced and evaluated by a
  different toolchain (Google Flow/Gemini for audio, Claude Cowork for UAT) than this git-based
  Claude Code lane.

Full write-up: Drive file `STATUS_GIT_REPO_V6_AUTHORITY_DIVERGENCE_2026-07-26.md`
(ID `1O_tf7QyFIRPHn_LkFfW58K_GWazXVsqG`), filed in the Brain folder alongside this note.

## Open owner decision

Is this repo still a canonical build target for Tiny West, or a frozen 2026-07-17 prototype the
project has since moved past in favor of the v6 Drive-artifact pipeline? Until ruled on:

- `CLAUDE.md` / `CONSTANTS.md` here still enforce the pre-v6 1.2 MB ceiling — a fresh session reading
  only this repo would apply a rule the owner revoked on 2026-07-19.
- No code, canon, or protected constant was changed to resolve this — flagging only, per the
  "never silently merge" rule.
