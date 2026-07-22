# Tiny West: Iron Trail — v6 candidate staging (cloud game-build lease)

This directory is the **delivery channel** for v6 candidates built by the CLOUD
game-build lease session (GOV-75 two-lane split). The Drive Brain
(`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) remains the source of truth; large
artifacts land here because the Drive connector cannot upload multi-MB files
from the cloud session. The box/Spark stages them into the Brain and re-verifies
the SHA-256 recorded in the receipt.

## alpha.3.6 — PERF/TELEMETRY HUD (GOV-82, awaiting Cowork audit + owner approval)

Delivered under the GOV-80 transport protocol: the Drive Brain receives ONLY
`82_BUILD_ALPHA3_6.py` (pins source `930f3a15…` and target SHA) + harness +
receipt; Cowork reproduces the candidate from the script. The copies here are
the optional git-history record.

| File | Role | SHA-256 |
| --- | --- | --- |
| `Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html` | Candidate (2,472,284 B) | `86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa` |
| `82_BUILD_ALPHA3_6.py` | Deterministic builder (source+target SHA pinned) | — |
| `82_ACCEPT_ALPHA3_6.mjs` | Acceptance harness (20 gates) | — |
| `82_ALPHA3_6_PERFHUD_BUILD_RECEIPT.md` | GOV-82 receipt: identity, gates, baselines, deviations | — |
| `a36_perf_hud.png` | HUD live screenshot | — |

## alpha.3.5 — GAME-FEEL JUICE (GOV-78 receipt; audited PASS in GOV-81; gate target advanced to `930f3a15…`)

| File | Role | SHA-256 |
| --- | --- | --- |
| `Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html` | Candidate (2,468,050 B) | `930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8` |
| `Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html` | Byte-exact copy of the immutable source / gate target (2,460,430 B) | `1dcb5a74f787c5b800f049bf35815a2adc54173015f9a33761ddc80ce0360873` |
| `77_BUILD_ALPHA3_5.py` | Deterministic builder (anchored edits, byte-identical rebuild) | — |
| `77_ACCEPT_ALPHA3_5.mjs` | Acceptance harness (Playwright/Chromium, `__TW` API) | — |
| `77_ALPHA3_5_JUICE_BUILD_RECEIPT.md` | GOV-77 receipt: identity, 18-gate results, ALL deviations | — |
| `a35_live_play.png`, `a35_options_menu.png` | Acceptance screenshots | — |

Reproduce: `python3 77_BUILD_ALPHA3_5.py` (aborts unless the source SHA matches;
output is byte-identical), then `node 77_ACCEPT_ALPHA3_5.mjs` with Playwright
available. The candidate is **not self-certified** — Cowork audits, owner approves.
