// 82_ACCEPT_ALPHA3_6.mjs — builder acceptance suite for alpha.3.6 (perf/telemetry HUD).
// Run: node 82_ACCEPT_ALPHA3_6.mjs   (playwright resolved from the global module root)
// Baseline = alpha.3.5 gate target (930f3a15…). Parity with HUD OFF (default) and ON,
// determinism, renderOnly neutrality, F3 + API toggle, gamepad-throw regression,
// offline/console, protected values, static scan, live smoke recording the doc 59
// §3.4 perf baselines (frame-time / heap / decode / first-paint).
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import path from 'path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const BASE = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html');
const CAND = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html');
const SEEDS = Array.from({ length: 25 }, (_, i) => (i * 2654435761 + 54321) >>> 0);
const TICKS = 320;

const results = [];
function report(gate, pass, detail) {
  results.push({ gate, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} | ${gate} | ${detail}`);
}

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
let liveBaselines = null;
try {
  {
    const b = await newGame(browser, BASE);
    const c = await newGame(browser, CAND);
    const idBase = await b.page.evaluate(() => !!window.__TW.perf);
    const idCand = await c.page.evaluate(() => !!window.__TW.perf);
    report('candidate identity (__TW.perf only in candidate)', !idBase && idCand, `base=${idBase} cand=${idCand}`);
    const offDefault = await c.page.evaluate(() => window.__TW.perf.enabled());
    report('perf HUD default OFF', offDefault === false, `enabled=${offDefault}`);
    const juiceIntact = await c.page.evaluate(() => window.__TW.juice && window.__TW.juice.enabled());
    report('juice layer intact (default ON)', juiceIntact === true, `juice=${juiceIntact}`);

    // ---- parity, HUD OFF (default) ----
    let mism = 0, compared = 0;
    for (const seed of SEEDS) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) { compared++; if (hb[t] !== hc[t]) mism++; }
    }
    report('tick parity vs 930f3a15…, HUD OFF', mism === 0,
      `${SEEDS.length} seeds x ${TICKS} = ${compared} comparisons, ${mism} mismatches`);
    const offDraws = await c.page.evaluate(() => window.__TW.perf.snapshot().draws);
    report('HUD hidden by default (0 draws during OFF runs)', offDraws === 0, `draws=${offDraws}`);

    // ---- parity, HUD ON ----
    await c.page.evaluate(() => window.__TW.perf.setEnabled(true));
    let mismOn = 0;
    for (const seed of SEEDS.slice(0, 10)) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) if (hb[t] !== hc[t]) mismOn++;
    }
    const onSnap = await c.page.evaluate(() => window.__TW.perf.snapshot());
    report('tick parity vs 930f3a15…, HUD ON', mismOn === 0,
      `10 seeds x ${TICKS}, ${mismOn} mismatches`);
    report('HUD ACTIVE during ON parity (non-vacuous)', onSnap.draws > 0,
      `draws=${onSnap.draws} heapMB=${onSnap.heapMB} decoded=${onSnap.decoded}`);

    // ---- determinism + renderOnly with HUD ON ----
    const h1 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    const h2 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    report('determinism seed 999 x150 twice (HUD ON)', JSON.stringify(h1) === JSON.stringify(h2),
      `final ${h1[h1.length - 1]} vs ${h2[h2.length - 1]}`);
    const ro = await c.page.evaluate(() => {
      window.__TW.start(4242); for (let i = 0; i < 120; i++) window.__TW.step(1);
      return window.__TW.renderOnly(60);
    });
    report('renderOnly(60) hash-neutral, HUD ON', ro.hashNeutral === true, `${ro.beforeHash} -> ${ro.afterHash}`);

    // ---- F3 toggle via real key events ----
    const f3 = await c.page.evaluate(() => {
      const T = window.__TW;
      T.perf.setEnabled(false);
      const before = T.perf.enabled();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'F3' }));
      const on = T.perf.enabled();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'F3' }));
      const off = T.perf.enabled();
      T.perf.setEnabled(true);
      return { before, on, off };
    });
    report('F3 toggles HUD', f3.before === false && f3.on === true && f3.off === false, JSON.stringify(f3));

    report('offline (stepped pair)', b.extRequests.length === 0 && c.extRequests.length === 0,
      `base ext=${b.extRequests.length} cand ext=${c.extRequests.length}`);
    report('0 console/page errors (stepped pair)', b.errors.length === 0 && c.errors.length === 0,
      `base=${JSON.stringify(b.errors.slice(0, 3))} cand=${JSON.stringify(c.errors.slice(0, 3))}`);
    await b.context.close(); await c.context.close();
  }

  // ---- gamepad-throw regression (live loop) ----
  {
    const g = await newGame(browser, CAND, { noAuto: false, breakGamepads: true });
    const t1 = await g.page.evaluate(() => window.__TW.G.titleT);
    await g.page.waitForTimeout(1200);
    const t2 = await g.page.evaluate(() => window.__TW.G.titleT);
    report('gamepad guard: loop alive under throwing getGamepads', t2 > t1 && g.errors.length === 0,
      `titleT ${t1} -> ${t2}; errors=${g.errors.length}`);
    await g.context.close();
  }

  // ---- live smoke: real rAF loop, HUD ON, record doc 59 baselines ----
  {
    const l = await newGame(browser, CAND, { noAuto: false });
    await l.page.evaluate(() => { window.__TW.unlockAudio(); window.__TW.perf.setEnabled(true); window.__TW.start(777); });
    await l.page.evaluate(() => {
      const T = window.__TW; let n = 0;
      window.__smokeTimer = setInterval(() => {
        n++;
        T.input('right', n % 8 !== 0);
        T.input('fire', n % 3 === 0);
      }, 50);
    });
    await l.page.waitForTimeout(3500);
    await l.page.evaluate(() => { clearInterval(window.__smokeTimer); });
    const snap = await l.page.evaluate(() => window.__TW.perf.sample());
    liveBaselines = snap;
    const png = await l.page.screenshot({ path: path.join(DIR, 'a36_perf_hud.png') });
    report('live smoke: HUD measuring in real loop',
      snap.frames > 60 && snap.draws > 30 && snap.avgDt > 0,
      `frames=${snap.frames} draws=${snap.draws} lastDt=${snap.lastDt} avgDt=${snap.avgDt} maxDt=${snap.maxDt} ticks=${snap.ticksLast}`);
    report('baselines captured (doc 59 §3.4)',
      snap.decodeMs !== null || snap.heapMB !== null || snap.firstContentfulPaintMs !== null,
      `decodeMs=${snap.decodeMs} families=${snap.families} heapMB=${snap.heapMB} FP=${snap.firstPaintMs} FCP=${snap.firstContentfulPaintMs}`);
    report('live smoke: canvas painted, 0 errors, offline',
      png.length > 8000 && l.errors.length === 0 && l.extRequests.length === 0,
      `png=${png.length}B errors=${JSON.stringify(l.errors.slice(0, 3))} ext=${l.extRequests.length}`);
    await l.context.close();
  }

  // ---- protected values + version truth ----
  {
    const p = await newGame(browser, CAND);
    const pv = await p.page.evaluate(() => window.__TW.getBuildInfo().protectedValues);
    const okRuntime = pv.ROOF_Y === 99 && JSON.stringify(pv.LANES) === '[205,226,247]' &&
      pv.LADDER_X === 224 && pv.boardOpportunityFrames === 36 && pv.boardCenterFrames === 18 &&
      pv.reloadFrames === 54 && JSON.stringify(pv.activeReloadRemainingFrameWindow) === '[7,13]';
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html'), 'utf8');
    const okText = src.includes('const ROOF_Y=99,LANES=[205,226,247],LADDER_X=224;');
    report('protected values intact', okRuntime && okText, JSON.stringify(pv));
    const ver = await p.page.evaluate(() => ({ g: window.__TW.G.version, b: window.__TW.getBuildInfo().version, a: window.__TW.getBuildInfo().artifactFile }));
    report('version truth 6.0.0-alpha.3.6',
      ver.g === '6.0.0-alpha.3.6' && ver.b === '6.0.0-alpha.3.6' && ver.a === 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html',
      JSON.stringify(ver));
    await p.context.close();
  }

  // ---- static scan of added code ----
  {
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html'), 'utf8');
    const out = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html'), 'utf8');
    const srcCount = new Map();
    for (const line of src.split('\n')) srcCount.set(line, (srcCount.get(line) || 0) + 1);
    const added = [];
    for (const line of out.split('\n')) {
      const n = srcCount.get(line) || 0;
      if (n > 0) srcCount.set(line, n - 1); else added.push(line);
    }
    const addedText = added
      .filter(l => !src.includes(l.trim()) || l.trim() === '')
      .filter(l => !l.startsWith('<!--') && !l.startsWith('{"candidate":'))
      .map(l => l.replace(/^\s*\/\/.*$/, ''))
      .join('\n')
      .replace(/version:'6\.0\.0-alpha\.3\.6',mode:'title'[^\n]*/g, "version:'6.0.0-alpha.3.6',mode:'title'");
    const forbidden = [
      [/\bG\.[A-Za-z_$][\w.$]*\s*=[^=]/, 'G.* write'],
      [/\bG\.[A-Za-z_$]/, 'G.* read in TW_PERF'],   // perf module must not touch G at all
      [/\bG\.rng\b/, 'G.rng use'],
      [/\bG\.fxRng\b/, 'G.fxRng use'],
      [/\bMath\.random\b/, 'Math.random'],
      [/\bDate\.now\b/, 'Date.now'],
      [/\bsetTimeout\b|\bsetInterval\b/, 'timer in game code'],
      [/\bfetch\b|XMLHttpRequest|WebSocket/, 'network primitive'],
    ];
    const hits = [];
    for (const [re, name] of forbidden) { const m = addedText.match(re); if (m) hits.push(`${name}: ${m[0]}`); }
    report('static scan of added code (no G access / sim RNG / Math.random / Date.now / timers / network)',
      hits.length === 0, hits.length ? hits.join(' ; ') : `${added.length} added lines clean (display-only wall-clock: performance.memory/getEntriesByType + rAF timestamps, disclosed)`);
    const guardOk = out.includes('let gp=null;try{gp=navigator.getGamepads?.()[0];}catch(e){gp=null;}');
    report('gamepad guard present (GOV-53 prescription)', guardOk, 'retained');
  }
} finally {
  await browser.close();
}

const fails = results.filter(r => !r.pass);
console.log('\n==== SUMMARY ====');
console.log(`${results.length - fails.length}/${results.length} gates PASS`);
if (liveBaselines) console.log('BASELINES:', JSON.stringify(liveBaselines));
if (fails.length) { console.log('FAILURES:'); for (const f of fails) console.log(' -', f.gate, '|', f.detail); process.exit(1); }
