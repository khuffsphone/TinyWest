// 77_ACCEPT_ALPHA3_5.mjs — builder acceptance suite for alpha.3.5 (juice candidate).
// Run: NODE_PATH=/opt/node22/lib/node_modules node 77_ACCEPT_ALPHA3_5.mjs
// Compares candidate vs alpha.3.4 gate target with identical deterministic input
// schedules, juice ON and OFF; determinism; renderOnly neutrality; gamepad-throw
// regression; offline + console/page errors; protected values; menu toggle; live smoke.
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import path from 'path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const BASE = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html');
const CAND = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html');
const SEEDS = Array.from({ length: 25 }, (_, i) => (i * 2654435761 + 12345) >>> 0);
const TICKS = 320;

const results = [];
function report(gate, pass, detail) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${gate} | ${detail}`);
}

// In-page seed runner: identical on both artifacts. Uses __TW.step (tick+render),
// so on the candidate the juice layer is active (observe+draw) during ON runs.
const RUNNER = `(cfg) => {
  const T = window.__TW;
  const sched = (t, k) => {
    const a = [];
    if (t % 97 < 58) a.push('right'); else if (t % 97 < 70) a.push('left');
    if (t % 53 === 11 || t % 53 === 12) a.push('jump');
    if (t % 13 === k) a.push('fire');
    if (t % 211 > 150 && t % 211 < 190) a.push('down');
    if (t % 89 === 40) a.push('up');
    return a;
  };
  T.start(cfg.seed >>> 0);
  const hashes = [];
  let prev = [];
  for (let t = 0; t < cfg.ticks; t++) {
    const want = sched(t, cfg.seed % 13);
    for (const a of prev) if (!want.includes(a)) T.input(a, false);
    for (const a of want) if (!prev.includes(a)) T.input(a, true);
    prev = want;
    T.step(1);
    hashes.push(T.stateHash());
  }
  for (const a of prev) T.input(a, false);
  return hashes;
}`;

async function newGame(browser, url, { noAuto = true, breakGamepads = false } = {}) {
  const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
  const page = await context.newPage();
  const errors = [], extRequests = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR:' + e.message));
  page.on('request', r => {
    const u = r.url();
    if (!u.startsWith('file://') && !u.startsWith('data:')) extRequests.push(u);
  });
  if (noAuto) await page.addInitScript(() => { window.__TW_NO_AUTO = true; });
  if (breakGamepads) await page.addInitScript(() => {
    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => { throw new DOMException('denied by test', 'SecurityError'); }
    });
  });
  await page.goto(url);
  await page.waitForFunction(() => window.__TW && typeof window.__TW.stateHash === 'function');
  return { context, page, errors, extRequests };
}

const browser = await chromium.launch();
try {
  // ---- Gate A: parity, juice ON (candidate default) ----
  {
    const b = await newGame(browser, BASE);
    const c = await newGame(browser, CAND);
    const hasJuiceBase = await b.page.evaluate(() => !!window.__TW.juice);
    const hasJuiceCand = await c.page.evaluate(() => !!window.__TW.juice);
    report('candidate identity', !hasJuiceBase && hasJuiceCand,
      `__TW.juice base=${hasJuiceBase} cand=${hasJuiceCand}`);
    const juiceOn = await c.page.evaluate(() => window.__TW.juice.enabled());
    report('juice default ON', juiceOn === true, `enabled=${juiceOn}`);

    let mismatches = 0, compared = 0;
    for (const seed of SEEDS) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) { compared++; if (hb[t] !== hc[t]) mismatches++; }
    }
    report('tick parity vs 1dcb5a74…, juice ON', mismatches === 0,
      `${SEEDS.length} seeds x ${TICKS} ticks = ${compared} comparisons, ${mismatches} mismatches`);

    const diag = await c.page.evaluate(() => window.__TW.juice.diagnostics());
    const active = diag.counters.shots > 0 && diag.counters.events > 0 && diag.counters.spawned > 0;
    report('juice ACTIVE during ON parity (non-vacuous)', active,
      `shots=${diag.counters.shots} kills=${diag.counters.kills} hurt=${diag.counters.hurt} coins=${diag.counters.coins} lands=${diag.counters.lands} pops=${diag.counters.pops} spawned=${diag.counters.spawned} events=${diag.counters.events}`);

    // ---- Gate B: parity, juice OFF ----
    await c.page.evaluate(() => window.__TW.juice.setEnabled(false));
    let mismOff = 0;
    for (const seed of SEEDS.slice(0, 10)) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) if (hb[t] !== hc[t]) mismOff++;
    }
    const offState = await c.page.evaluate(() => window.__TW.juice.diagnostics());
    report('tick parity vs 1dcb5a74…, juice OFF', mismOff === 0,
      `10 seeds x ${TICKS} ticks, ${mismOff} mismatches; off-diag particles=${offState.particles} enabled=${offState.enabled}`);
    await c.page.evaluate(() => window.__TW.juice.setEnabled(true));

    // ---- Gate C: determinism (same seed twice, candidate) ----
    const h1 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    const h2 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    report('determinism seed 999 x150 twice', JSON.stringify(h1) === JSON.stringify(h2),
      `final ${h1[h1.length - 1]} vs ${h2[h2.length - 1]}`);

    // ---- Gate D: renderOnly hash-neutral with juice ON ----
    const ro = await c.page.evaluate(() => {
      window.__TW.start(4242); for (let i = 0; i < 120; i++) window.__TW.step(1);
      return window.__TW.renderOnly(60);
    });
    report('renderOnly(60) hash-neutral, juice ON', ro.hashNeutral === true,
      `${ro.beforeHash} -> ${ro.afterHash}`);

    // ---- Gate E: menu toggle row (options row 13) ----
    const tog = await c.page.evaluate(() => {
      const T = window.__TW;
      T.title();
      T.menuScreen('options', 13);
      const before = T.profile().settings.juice;
      T.pulse('right', 1);
      const after = T.profile().settings.juice;
      T.pulse('right', 1);
      const restored = T.profile().settings.juice;
      return { before, after, restored, enabledNow: T.juice.enabled() };
    });
    report('JUICE FX menu row toggles + persists via profile',
      tog.before !== false && tog.after === false && tog.restored === true && tog.enabledNow === true,
      JSON.stringify(tog));

    // ---- Gate F: offline + console errors on the no-auto pair ----
    report('offline (stepped pair)', b.extRequests.length === 0 && c.extRequests.length === 0,
      `base ext=${b.extRequests.length} cand ext=${c.extRequests.length}`);
    report('0 console/page errors (stepped pair)', b.errors.length === 0 && c.errors.length === 0,
      `base=${JSON.stringify(b.errors.slice(0, 3))} cand=${JSON.stringify(c.errors.slice(0, 3))}`);
    await b.context.close(); await c.context.close();
  }

  // ---- Gate G: gamepad-throw regression (live loop, candidate) ----
  {
    const g = await newGame(browser, CAND, { noAuto: false, breakGamepads: true });
    const t1 = await g.page.evaluate(() => window.__TW.G.titleT);
    await g.page.waitForTimeout(1200);
    const t2 = await g.page.evaluate(() => window.__TW.G.titleT);
    report('gamepad guard: loop alive under throwing getGamepads',
      t2 > t1 && g.errors.length === 0,
      `titleT ${t1} -> ${t2}; errors=${g.errors.length}`);
    await g.context.close();
  }

  // ---- Gate H: live smoke with rAF loop — juice runs, canvas paints, no errors ----
  {
    const l = await newGame(browser, CAND, { noAuto: false });
    await l.page.evaluate(() => { window.__TW.start(777); });
    await l.page.evaluate(() => {
      const T = window.__TW; let n = 0;
      window.__smokeTimer = setInterval(() => {
        n++;
        T.input('right', n % 8 !== 0);
        T.input('fire', n % 3 === 0);
        if (n % 11 === 0) T.input('jump', true); else T.input('jump', false);
      }, 50);
    });
    await l.page.waitForTimeout(4200);
    await l.page.evaluate(() => { clearInterval(window.__smokeTimer); });
    const diag = await l.page.evaluate(() => window.__TW.juice.diagnostics());
    const shot = await l.page.screenshot({ path: path.join(DIR, 'a35_live_play.png') });
    const painted = shot.length > 8000;
    report('live smoke: juice active in real loop',
      diag.counters.shots > 0 && diag.counters.spawned > 0,
      `shots=${diag.counters.shots} spawned=${diag.counters.spawned} frozenFrames=${diag.counters.frozenFrames} kills=${diag.counters.kills}`);
    report('live smoke: canvas painted, 0 errors', painted && l.errors.length === 0,
      `png=${shot.length}B errors=${JSON.stringify(l.errors.slice(0, 3))}`);
    // options menu screenshot (17 rows)
    await l.page.evaluate(() => { window.__TW.title(); window.__TW.menuScreen('options', 13); });
    await l.page.waitForTimeout(300);
    await l.page.screenshot({ path: path.join(DIR, 'a35_options_menu.png') });
    report('offline+errors (live pages)', l.extRequests.length === 0, `ext=${l.extRequests.length}`);
    await l.context.close();
  }

  // ---- Gate I: protected values (runtime + source text) ----
  {
    const p = await newGame(browser, CAND);
    const pv = await p.page.evaluate(() => window.__TW.getBuildInfo().protectedValues);
    const okRuntime = pv.ROOF_Y === 99 && JSON.stringify(pv.LANES) === '[205,226,247]' &&
      pv.LADDER_X === 224 && pv.boardOpportunityFrames === 36 && pv.boardCenterFrames === 18 &&
      pv.reloadFrames === 54 && JSON.stringify(pv.activeReloadRemainingFrameWindow) === '[7,13]';
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html'), 'utf8');
    const okText = src.includes('const ROOF_Y=99,LANES=[205,226,247],LADDER_X=224;');
    report('protected values intact', okRuntime && okText, JSON.stringify(pv));
    const ver = await p.page.evaluate(() => ({ g: window.__TW.G.version, b: window.__TW.getBuildInfo().version, a: window.__TW.getBuildInfo().artifactFile }));
    report('version truth 6.0.0-alpha.3.5',
      ver.g === '6.0.0-alpha.3.5' && ver.b === '6.0.0-alpha.3.5' && ver.a === 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html',
      JSON.stringify(ver));
    await p.context.close();
  }

  // ---- Gate J: static scan of ADDED code for forbidden patterns ----
  // True added code = each build-script replacement minus its anchor text
  // (comment lines stripped: the module header + provenance comment deliberately
  // NAME the forbidden identifiers as constraints; that is documentation, not use).
  {
    const out = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html'), 'utf8');
    const py = readFileSync(path.join(DIR, '77_BUILD_ALPHA3_5.py'), 'utf8');
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html'), 'utf8');
    // reconstruct added text from the byte-level diff: strip the longest common
    // prefix and suffix of source vs candidate per edit is complex; instead scan
    // candidate minus source by removing every source line verbatim, then strip
    // comments before matching.
    const srcCount = new Map();
    for (const line of src.split('\n')) srcCount.set(line, (srcCount.get(line) || 0) + 1);
    const added = [];
    for (const line of out.split('\n')) {
      const n = srcCount.get(line) || 0;
      if (n > 0) srcCount.set(line, n - 1); else added.push(line);
    }
    // Modified pre-existing lines (version bumps etc.) appear here too; neutralize
    // by removing content that also exists in the source at char level for the
    // known version-only lines, and strip // comments + HTML comments.
    const addedText = added
      .filter(l => !src.includes(l.trim()) || l.trim() === '')
      // provenance HTML-comment data (names the forbidden identifiers as *constraints*):
      .filter(l => !l.startsWith('<!--') && !l.startsWith('{"candidate":'))
      .map(l => l.replace(/^\s*\/\/.*$/, ''))
      .join('\n')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
      // pre-existing G-literal line changed only in its version substring:
      .replace(/version:'6\.0\.0-alpha\.3\.5',mode:'title'[^\n]*/g, "version:'6.0.0-alpha.3.5',mode:'title'");
    if (!py.includes('JUICE_MODULE')) report('scanner sanity', false, 'build script missing');
    const forbidden = [
      [/\bG\.[A-Za-z_$][\w.$]*\s*=[^=]/, 'G.* write'],
      [/\bG\.rng\b/, 'G.rng use'],
      [/\bG\.fxRng\b/, 'G.fxRng use'],
      [/\bMath\.random\b/, 'Math.random'],
      [/\bDate\.now\b/, 'Date.now'],
      [/\bperformance\.now\b/, 'performance.now'],
      [/\bsetTimeout\b|\bsetInterval\b/, 'timer in game code'],
      [/\bfetch\b|XMLHttpRequest|WebSocket/, 'network primitive'],
    ];
    const hits = [];
    for (const [re, name] of forbidden) { const m = addedText.match(re); if (m) hits.push(`${name}: ${m[0]}`); }
    report('static scan of added code (no G writes / sim RNG / wall-clock / timers / network)',
      hits.length === 0, hits.length ? hits.join(' ; ') : `${added.length} added lines clean (PROFILE.settings.juice write is the disclosed toggle)`);
    const guardOk = out.includes('let gp=null;try{gp=navigator.getGamepads?.()[0];}catch(e){gp=null;}') &&
      !/(?<!try\{gp=)navigator\.getGamepads\?\.\(\)\[0\]/.test(out.replace(/let gp=null;try\{gp=navigator\.getGamepads\?\.\(\)\[0\];\}catch\(e\)\{gp=null;\}/g, ''));
    report('gamepad guard present, no unguarded getGamepads', guardOk, 'GOV-53 exact prescription retained');
  }
} finally {
  await browser.close();
}

const fails = results.filter(r => !r.pass);
console.log('\n==== SUMMARY ====');
console.log(`${results.length - fails.length}/${results.length} gates PASS`);
if (fails.length) { console.log('FAILURES:'); for (const f of fails) console.log(' -', f.gate, '|', f.detail); process.exit(1); }
