# Tiny West: Iron Trail — v6 candidate staging (cloud game-build lease)

This directory is the **delivery channel** for v6 candidates built by the CLOUD
game-build lease session (GOV-75 two-lane split). The Drive Brain
(`1BqzAbj37oSNyIU6075OnHlzUNdzMiq1E`) remains the source of truth; large
artifacts land here because the Drive connector cannot upload multi-MB files
from the cloud session. The box/Spark stages them into the Brain and re-verifies
the SHA-256 recorded in the receipt.

## alpha.3.5 — GAME-FEEL JUICE (GOV-77, awaiting Cowork audit + owner approval)

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
