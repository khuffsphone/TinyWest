# Tiny West — status log

Running log of scheduled status check-ins on this repo. Newest entry on top.

## 2026-07-26

- **Repo state**: branch `claude/eager-dirac-4n4j6q` (designated dev branch), working
  tree clean, no uncommitted changes. Two commits total: `cfb0034` (Sunset Riders
  tribute, protected earlier build) and `a4c4dd4` (42-second Rampage Express slice).
  No open pull request existed for this branch prior to this check-in.
- **Slice build**: reproducible. `node slice/tools/build.mjs` regenerates
  `slice/dist/tiny-west.html` at 106,552 bytes, matching `BUILD_RECEIPT_SLICE.md`.
- **Full QA re-run this session, all green**:
  - `playtest.mjs` — smoke tests pass; `runDeterminismCheck` PASS (hashA == hashB,
    911533983); natural keyboard run (seed 20260717) reaches RESULTS in ~24s in-sim
    with 0 page errors.
  - `qa2.mjs` — touch pads render and start correctly; determinism holds on touch
    device; four viewports (1100×760, 412×915, 360×640, 915×412) show no canvas
    overflow; 20 reset cycles complete clean.
  - `qa3.mjs` — fork → pay-car exact-input route PASS; pay-car fight completes,
    $839 banked.
- **Environment note**: this sandbox has no repo-local `node_modules`/`package.json`;
  `playwright` (required by `playtest.mjs`/`qa2.mjs`/`qa3.mjs`) is only installed
  globally at `/opt/node22/lib/node_modules`. Had to symlink it into
  `slice/node_modules` (gitignored, not committed) to run the QA scripts this cycle.
  A future session in a fresh sandbox will hit the same `ERR_MODULE_NOT_FOUND` and
  need to do the same — or the repo could gain a minimal `package.json` pinning
  `playwright` as a devDependency so `npm install` resolves it directly.
- **Changes this cycle**: none to the slice itself — this was a status/regression
  check, not new development. Only this status log and the PR opened for the
  existing slice commit are new.
- **Open items (unchanged from Brain)**: final public subtitle and the 2D/3D asset
  pipeline remain `NEEDS_DECISION` (owner-level); the verified v4.0.0 standalone
  baseline is still unreachable from this environment (proxy 403 to Sites
  deployments); Sprint 2 (six-card encounter grammar, anti-repeat selection, score
  economy, medals/contracts/seed codes) has not been started.
