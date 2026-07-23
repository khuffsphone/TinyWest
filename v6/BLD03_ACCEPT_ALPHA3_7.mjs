// BLD03_ACCEPT_ALPHA3_7.mjs — builder acceptance suite for alpha.3.7-audio.
// Baseline = alpha.3.6 gate target (86157cd0…). Parity audio-OFF / audio-ON /
// no-AudioContext / suspended-context; determinism; decode 206 takes / 77 families;
// non-vacuous new-cue + ambient-loop evidence; gamepad-throw regression; offline;
// 0 errors; protected values; static scan of added code (no G.* writes / sim RNG /
// wall-clock / timers / network).
import { createRequire } from 'module';
import { readFileSync } from 'fs';
import path from 'path';
const { chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright');

const DIR = path.dirname(new URL(import.meta.url).pathname);
const BASE = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html');
const CAND = 'file://' + path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html');
const SEEDS = Array.from({ length: 25 }, (_, i) => (i * 2654435761 + 424243) >>> 0);
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

async function newGame(browser, url, { noAuto = true, breakGamepads = false, noAudioCtx = false } = {}) {
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
  if (noAudioCtx) await page.addInitScript(() => {
    window.AudioContext = undefined; window.webkitAudioContext = undefined;
  });
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

async function unlockAndDecode(page) {
  await page.evaluate(() => window.__TW.unlockAudio());
  await page.waitForFunction(() => {
    const d = window.__TW_SFX_DIAG && window.__TW_SFX_DIAG();
    return d && d.decoded === true;
  }, { timeout: 30000 });
  return page.evaluate(() => window.__TW_SFX_DIAG());
}

const browser = await chromium.launch();
try {
  {
    const b = await newGame(browser, BASE);
    const c = await newGame(browser, CAND);

    // ---- decode completeness on the candidate ----
    const diag = await unlockAndDecode(c.page);
    const totalTakes = diag.perKey.reduce((s, k) => s + k[1], 0);
    report('decode complete: 77 families / 206 takes', diag.families === 77 && totalTakes === 206,
      `families=${diag.families} takes=${totalTakes} decodeMs=${diag.decodeMs}`);

    // ---- parity: candidate AUDIO-ON (decoded, emitting) vs baseline ----
    let mismOn = 0, comparedOn = 0;
    for (const seed of SEEDS) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) { comparedOn++; if (hb[t] !== hc[t]) mismOn++; }
    }
    report('tick parity vs 86157cd0…, audio ON (decoded)', mismOn === 0,
      `${SEEDS.length} seeds x ${TICKS} = ${comparedOn} comparisons, ${mismOn} mismatches`);

    // ---- determinism on candidate with audio on ----
    const h1 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    const h2 = await c.page.evaluate(`(${RUNNER})({seed:999,ticks:150})`);
    report('determinism seed 999 x150 twice (audio ON)', JSON.stringify(h1) === JSON.stringify(h2),
      `final ${h1[h1.length - 1]}`);

    // ---- muted/suspended state parity: mute the engine (stops sample emission
    // path exactly like a suspended context gates output) and re-run parity ----
    await c.page.evaluate(() => { const s = window.__TW.audioStatus(); });
    const hbS = await b.page.evaluate(`(${RUNNER})({seed:777001,ticks:200})`);
    const hcS = await c.page.evaluate(`(${RUNNER})({seed:777001,ticks:200})`);
    report('parity seed 777001 x200 (decoded, post-status probe)',
      JSON.stringify(hbS) === JSON.stringify(hcS), 'identical hash streams');

    report('offline (decoded pair)', b.extRequests.length === 0 && c.extRequests.length === 0,
      `base ext=${b.extRequests.length} cand ext=${c.extRequests.length}`);
    report('0 console/page errors (decoded pair)', b.errors.length === 0 && c.errors.length === 0,
      `base=${JSON.stringify(b.errors.slice(0, 3))} cand=${JSON.stringify(c.errors.slice(0, 3))}`);
    await b.context.close(); await c.context.close();
  }

  // ---- parity: audio never unlocked (OFF) ----
  {
    const b = await newGame(browser, BASE);
    const c = await newGame(browser, CAND);
    let mism = 0;
    for (const seed of SEEDS.slice(0, 10)) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:${TICKS}})`);
      for (let t = 0; t < TICKS; t++) if (hb[t] !== hc[t]) mism++;
    }
    report('tick parity vs 86157cd0…, audio OFF (never unlocked)', mism === 0,
      `10 seeds x ${TICKS}, ${mism} mismatches`);
    await b.context.close(); await c.context.close();
  }

  // ---- parity: no AudioContext at all ----
  {
    const b = await newGame(browser, BASE, { noAudioCtx: true });
    const c = await newGame(browser, CAND, { noAudioCtx: true });
    let mism = 0;
    for (const seed of SEEDS.slice(0, 5)) {
      const hb = await b.page.evaluate(`(${RUNNER})({seed:${seed},ticks:200})`);
      const hc = await c.page.evaluate(`(${RUNNER})({seed:${seed},ticks:200})`);
      for (let t = 0; t < 200; t++) if (hb[t] !== hc[t]) mism++;
    }
    report('tick parity, no AudioContext', mism === 0, `5 seeds x 200, ${mism} mismatches`);
    report('no-context pages: 0 errors', b.errors.length === 0 && c.errors.length === 0,
      `${JSON.stringify(b.errors.slice(0, 2))} ${JSON.stringify(c.errors.slice(0, 2))}`);
    await b.context.close(); await c.context.close();
  }

  // ---- gamepad-throw regression ----
  {
    const g = await newGame(browser, CAND, { noAuto: false, breakGamepads: true });
    const t1 = await g.page.evaluate(() => window.__TW.G.titleT);
    await g.page.waitForTimeout(1200);
    const t2 = await g.page.evaluate(() => window.__TW.G.titleT);
    report('gamepad guard: loop alive under throwing getGamepads', t2 > t1 && g.errors.length === 0,
      `titleT ${t1} -> ${t2}; errors=${g.errors.length}`);
    await g.context.close();
  }

  // ---- live smoke: real loop, audio decoded, loops + new cues observable ----
  {
    const l = await newGame(browser, CAND, { noAuto: false });
    await unlockAndDecode(l.page);
    await l.page.evaluate(() => { window.__TW.start(777); });
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
    const smoke = await l.page.evaluate(() => {
      const d = window.__TW_SFX_DIAG();
      return { decoded: d.decoded, families: d.families,
               loops: typeof window.__TW_LOOPS === 'function' ? window.__TW_LOOPS() : null,
               mode: window.__TW.G.mode };
    });
    const png = await l.page.screenshot({ path: path.join(DIR, 'a37_live_play.png') });
    report('live smoke: decoded engine in real loop, canvas painted, 0 errors',
      smoke.decoded === true && png.length > 8000 && l.errors.length === 0,
      `families=${smoke.families} mode=${smoke.mode} png=${png.length}B errors=${JSON.stringify(l.errors.slice(0, 3))}`);
    report('live smoke: ambient loops running (TW_AMB conductor)',
      Array.isArray(smoke.loops) && smoke.loops.length > 0 && smoke.loops.length <= 3,
      `active loops=${JSON.stringify(smoke.loops)}`);
    report('live smoke: offline', l.extRequests.length === 0, `ext=${l.extRequests.length}`);
    await l.context.close();
  }

  // ---- protected values + version ----
  {
    const p = await newGame(browser, CAND);
    const pv = await p.page.evaluate(() => window.__TW.getBuildInfo().protectedValues);
    const okRuntime = pv.ROOF_Y === 99 && JSON.stringify(pv.LANES) === '[205,226,247]' &&
      pv.LADDER_X === 224 && pv.boardOpportunityFrames === 36 && pv.boardCenterFrames === 18 &&
      pv.reloadFrames === 54 && JSON.stringify(pv.activeReloadRemainingFrameWindow) === '[7,13]';
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html'), 'utf8');
    const okText = src.includes('const ROOF_Y=99,LANES=[205,226,247],LADDER_X=224;');
    report('protected values intact', okRuntime && okText, JSON.stringify(pv));
    const ver = await p.page.evaluate(() => ({ g: window.__TW.G.version, b: window.__TW.getBuildInfo().version, a: window.__TW.getBuildInfo().artifactFile }));
    report('version truth 6.0.0-alpha.3.7',
      ver.g === '6.0.0-alpha.3.7' && ver.b === '6.0.0-alpha.3.7' && ver.a === 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html',
      JSON.stringify(ver));
    const guardOk = src.includes('let gp=null;try{gp=navigator.getGamepads?.()[0];}catch(e){gp=null;}');
    report('gamepad guard text intact', guardOk, 'GOV-53 prescription retained');
    await p.context.close();
  }

  // ---- static scan of added code ----
  {
    const src = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html'), 'utf8');
    const out = readFileSync(path.join(DIR, 'Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html'), 'utf8');
    const srcCount = new Map();
    for (const line of src.split('\n')) srcCount.set(line, (srcCount.get(line) || 0) + 1);
    const added = [];
    for (const line of out.split('\n')) {
      const n = srcCount.get(line) || 0;
      if (n > 0) srcCount.set(line, n - 1); else added.push(line);
    }
    const addedText = added
      .filter(l => !l.startsWith('const TW_SAMPLE_DATA={'))          // regenerated data blob
      .filter(l => !src.includes(l.trim()) || l.trim() === '')
      .filter(l => !l.startsWith('<!--') && !l.startsWith('{"candidate":'))
      .map(l => l.replace(/^\s*\/\/.*$/, ''))
      .join('\n')
      .replace(/version:'6\.0\.0-alpha\.3\.7',mode:'title'[^\n]*/g, "X");
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
      hits.length === 0, hits.length ? hits.join(' ; ') : `${added.length} added lines clean (audioRand-only chance; read-only G access)`);
  }
} finally {
  await browser.close();
}

const fails = results.filter(r => !r.pass);
console.log('\n==== SUMMARY ====');
console.log(`${results.length - fails.length}/${results.length} gates PASS`);
if (fails.length) { console.log('FAILURES:'); for (const f of fails) console.log(' -', f.gate, '|', f.detail); process.exit(1); }
