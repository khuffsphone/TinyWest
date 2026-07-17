/* ============================================================
   TINY WEST : RAMPAGE EXPRESS — 42-second vertical slice
   480x270 Canvas 2D · fixed 60 Hz deterministic sim · seeded PRNG
   Loop: CHASE → BOARD → BLAST → CASH → RETURN → ESCAPE
   Canon: Tiny West Brain TW-CANON-2026-07-17-R1 (reconciled, rampage-first)
   ============================================================ */
(function () {
'use strict';
var W = 480, H = 270, STEP = 1000 / 60;

/* ---------------- protected tuning constants (v4.0.0 ground truth) ---------------- */
var K = {
  hearts: 3, ammo: 6,
  reloadTicks: 54, perfectLo: 4, perfectHi: 10, fireCd: 9,
  boardSafe: 36, boardPerfect: 18, boardRecycle: 72, boardLeap: 24,
  settleTicks: 180,
  returnClean: 12, returnRough: 24,          // grade by alignment timing frames
  chainWindow: 150, chainCap: 5,
  spillPct: 0.2, magnet: 82,
  iframes: 90,
  cashOutMult: 1.25, payCarMult: 1.5,
  medals: [[8000, 'BLACK'], [6000, 'GOLD'], [4000, 'SILVER'], [2200, 'BRONZE'], [0, 'TIN']],
  trainV: 1.3,
  zoneMidnight: 1800,                         // Sundown 0-30s, Midnight after (60hz ticks)
  payCarCap: 720,                             // 12 s scoped extension
  telegraphMin: 30,
};

/* ---------------- deterministic RNG (mulberry32) ---------------- */
function mulberry(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- save (versioned localStorage) ---------------- */
var SAVE_KEY = 'tinywest_rampage_slice_v1';
function loadSave() {
  var d = { schema: 1, settings: { assist: true, shake: true, flash: true, muted: false, touchAlpha: 0.55 }, records: { best: 0, bestCash: 0 }, seedRecords: {} };
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      var p = JSON.parse(raw);
      if (p && p.schema === 1) {
        if (p.settings && typeof p.settings === 'object') for (var k in d.settings) if (typeof p.settings[k] === typeof d.settings[k]) d.settings[k] = p.settings[k];
        if (p.records && typeof p.records === 'object') { d.records.best = +p.records.best || 0; d.records.bestCash = +p.records.bestCash || 0; }
        if (p.seedRecords && typeof p.seedRecords === 'object') d.seedRecords = p.seedRecords;
      }
    }
  } catch (e) { }
  return d;
}
var SAVE = loadSave();
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (e) { } }

/* ---------------- atlas decode ---------------- */
var atlasCanvas = null;
function decodeAtlas() {
  var bin = atob(ATLAS.b64);
  var px = new Uint8Array(ATLAS.w * ATLAS.h);
  for (var i = 0, o = 0; i < bin.length; i += 2) {
    var v = bin.charCodeAt(i), n = bin.charCodeAt(i + 1);
    px.fill(v, o, o + n); o += n;
  }
  var cv = document.createElement('canvas'); cv.width = ATLAS.w; cv.height = ATLAS.h;
  var cx = cv.getContext('2d');
  var img = cx.createImageData(ATLAS.w, ATLAS.h);
  var rgb = PALETTE.map(function (c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; });
  for (var j = 0; j < px.length; j++) {
    if (px[j] === 255) continue;
    var c = rgb[px[j]], o4 = j * 4;
    img.data[o4] = c[0]; img.data[o4 + 1] = c[1]; img.data[o4 + 2] = c[2]; img.data[o4 + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  atlasCanvas = cv;
}
function frames(name) { return ATLAS.meta[name]; }

/* ---------------- palette helper ---------------- */
function pal(i) { return PALETTE[i]; }

/* ---------------- logical input layer ---------------- */
var IN = { moveX: 0, moveY: 0, jumpPressed: false, jumpHeld: false, firePressed: false, pausePressed: false, device: 'keyboard' };
var kb = {}, kbLatch = {};
var KEYS = {
  left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyZ', 'KeyK'], fire: ['KeyX', 'KeyJ'], pause: ['KeyP', 'Escape'],
  start: ['Enter'], retry: ['KeyR'], mute: ['KeyM'], seed: ['KeyS'], t1: ['Digit1'], t2: ['Digit2'], t3: ['Digit3'],
};
function kdown(a) { var l = KEYS[a]; for (var i = 0; i < l.length; i++) if (kb[l[i]]) return true; return false; }
function kedge(a) { var l = KEYS[a]; for (var i = 0; i < l.length; i++) if (kbLatch[l[i]]) return true; return false; }
var padPrev = [], padNow = [];
var touch = { on: false, moveX: 0, moveY: 0, jump: false, fire: false, jumpEdge: false, fireEdge: false, pauseEdge: false };
var inject = null; // array of logical frames for tests

function sampleInput() {
  if (inject && inject.length) {
    var f = inject.shift();
    IN.moveX = f.moveX || 0; IN.moveY = f.moveY || 0;
    IN.jumpPressed = !!f.jumpPressed; IN.jumpHeld = !!f.jumpHeld;
    IN.firePressed = !!f.firePressed; IN.pausePressed = false; IN.device = 'inject';
    return;
  }
  // gamepad poll
  var gp = null;
  try { var gps = navigator.getGamepads ? navigator.getGamepads() : []; for (var i = 0; i < gps.length; i++) if (gps[i] && gps[i].connected) { gp = gps[i]; break; } } catch (e) { }
  var gmx = 0, gmy = 0, gJump = false, gFire = false, gPause = false, gJumpE = false, gFireE = false, gPauseE = false;
  if (gp) {
    padNow = gp.buttons.map(function (b) { return b.pressed; });
    var ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    gmx = Math.abs(ax) > 0.3 ? ax : 0; gmy = Math.abs(ay) > 0.3 ? ay : 0;
    if (padNow[14]) gmx = -1; if (padNow[15]) gmx = 1; if (padNow[12]) gmy = -1; if (padNow[13]) gmy = 1;
    gJump = !!(padNow[0] || padNow[1]); gFire = !!(padNow[2] || padNow[5]); gPause = !!padNow[9];
    gJumpE = gJump && !(padPrev[0] || padPrev[1]);
    gFireE = gFire && !(padPrev[2] || padPrev[5]);
    gPauseE = gPause && !padPrev[9];
    if (gJumpE || gFireE || gPauseE) { Audio2.unlock(); IN.device = 'gamepad'; }
    padPrev = padNow;
  }
  var kmx = (kdown('right') ? 1 : 0) - (kdown('left') ? 1 : 0);
  var kmy = (kdown('down') ? 1 : 0) - (kdown('up') ? 1 : 0);
  IN.moveX = kmx || gmx || touch.moveX;
  IN.moveY = kmy || gmy || touch.moveY;
  IN.jumpHeld = kdown('jump') || gJump || touch.jump;
  IN.jumpPressed = kedge('jump') || gJumpE || touch.jumpEdge;
  IN.firePressed = kedge('fire') || gFireE || touch.fireEdge;
  IN.pausePressed = kedge('pause') || gPauseE || touch.pauseEdge;
  if (kmx || kmy || kedge('jump') || kedge('fire')) IN.device = 'keyboard';
  if (touch.moveX || touch.jumpEdge || touch.fireEdge) IN.device = 'touch';
  touch.jumpEdge = touch.fireEdge = touch.pauseEdge = false;
}
function clearLatches() { kbLatch = {}; }
function clearAllInput() { kb = {}; kbLatch = {}; touch.moveX = touch.moveY = 0; touch.jump = touch.fire = false; }

/* ---------------- audio (music/transport/effects buses + limiter) ---------------- */
var Audio2 = {
  ctx: null, master: null, music: null, transport: null, fx: null,
  active: 0, cap: 10, musicState: 0, layerGain: [], nextBeat: 0, stepIdx: 0,
  unlock: function () {
    if (!this.ctx) {
      try {
        var C = window.AudioContext || window.webkitAudioContext;
        this.ctx = new C();
        var comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -8; comp.ratio.value = 8;
        this.master = this.ctx.createGain(); this.master.gain.value = 0.9;
        this.master.connect(comp); comp.connect(this.ctx.destination);
        var mk = (function (v) { var g = this.ctx.createGain(); g.gain.value = v; g.connect(this.master); return g; }).bind(this);
        this.music = mk(0.5); this.transport = mk(0.28); this.fx = mk(0.8);
        this.layerGain = [1, 0, 0, 0].map((function (v) { var g = this.ctx.createGain(); g.gain.value = v; g.connect(this.music); return g; }).bind(this));
      } catch (e) { return; }
    }
    if (this.ctx.state === 'suspended') { var p = this.ctx.resume(); if (p && p.catch) p.catch(function () { }); }
  },
  setMusicState: function (s) { // 1 chase, 2 roof, 3 cash carried, 4 final/pay car
    if (!this.ctx || s === this.musicState) return;
    this.musicState = s;
    for (var i = 0; i < 4; i++) {
      var on = s >= i + 1 ? (i === 0 ? 1 : i === 1 ? 0.8 : i === 2 ? 0.7 : 0.9) : 0;
      this.layerGain[i].gain.linearRampToValueAtTime(on, this.ctx.currentTime + 0.5);
    }
  },
  osc: function (bus, type, f0, f1, dur, vol, at) {
    if (!this.ctx || this.ctx.state !== 'running' || SAVE.settings.muted || this.active >= this.cap) return;
    var c = this.ctx, t = c.currentTime + (at || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.02);
    this.active++;
    var self = this; o.onended = function () { self.active--; };
  },
  noise: function (bus, dur, vol, at, lp) {
    if (!this.ctx || this.ctx.state !== 'running' || SAVE.settings.muted || this.active >= this.cap) return;
    var c = this.ctx, t = c.currentTime + (at || 0);
    var n = Math.max(16, (c.sampleRate * dur) | 0), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; g.gain.value = vol;
    if (lp) { var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; s.connect(f); f.connect(g); }
    else s.connect(g);
    g.connect(bus); s.start(t);
    this.active++;
    var self = this; s.onended = function () { self.active--; };
  },
  duck: function (db, ms) {
    if (!this.ctx) return;
    var g = this.music.gain, t = this.ctx.currentTime, base = 0.5;
    g.cancelScheduledValues(t); g.setValueAtTime(base * Math.pow(10, -db / 20), t);
    g.linearRampToValueAtTime(base, t + ms / 1000);
  },
  sfx: function (name) {
    var A = this, fx = this.fx, tr = this.transport;
    if (!this.ctx) return;
    switch (name) {
      case 'shot': this.noise(fx, 0.09, 0.5, 0, 3200); this.osc(fx, 'square', 700 + Math.random() * 180, 140, 0.09, 0.2); break;
      case 'eshot': this.osc(fx, 'square', 320, 110, 0.08, 0.12); this.noise(fx, 0.06, 0.2, 0, 1800); break;
      case 'volley': this.osc(fx, 'square', 260, 90, 0.13, 0.16); this.noise(fx, 0.1, 0.3, 0, 1500); break;
      case 'dry': this.osc(fx, 'square', 900, 900, 0.045, 0.12); break;
      case 'reloadOpen': this.osc(fx, 'square', 500, 350, 0.045, 0.1); break;
      case 'reloadRound': this.osc(fx, 'triangle', 800, 800, 0.03, 0.12); break;
      case 'reloadClose': this.osc(fx, 'square', 350, 550, 0.055, 0.12); break;
      case 'perfectReload': this.osc(fx, 'square', 880, 1320, 0.11, 0.16); break;
      case 'cancel': this.osc(fx, 'square', 1100 + Math.random() * 500, 500, 0.07, 0.16); break;
      case 'nearmiss': this.noise(fx, 0.16, 0.14, 0, 5000); break;
      case 'hoof': this.noise(tr, 0.035, 0.5, 0, 500); break;
      case 'clack': this.noise(tr, 0.035, 0.35, 0, 1200); this.noise(tr, 0.035, 0.3, 0.07, 1200); break;
      case 'boardSafe': this.osc(fx, 'square', 400, 620, 0.17, 0.16); break;
      case 'boardPerfect': this.osc(fx, 'square', 523, 784, 0.12, 0.18); this.osc(fx, 'square', 784, 1046, 0.12, 0.16, 0.12); this.duck(2, 80); break;
      case 'land': this.noise(fx, 0.1, 0.3, 0, 800); break;
      case 'hatch': this.osc(fx, 'sawtooth', 200, 140, 0.09, 0.14); break;
      case 'boom': this.noise(fx, 0.32, 0.7, 0, 900); this.osc(fx, 'sine', 120, 40, 0.3, 0.5); this.duck(4, 120); break;
      case 'lockOpen': this.osc(fx, 'square', 392, 392, 0.08, 0.14); this.osc(fx, 'square', 523, 523, 0.08, 0.14, 0.08); this.osc(fx, 'square', 659, 659, 0.1, 0.16, 0.16); break;
      case 'pin': this.osc(fx, 'square', 1046, 1568, 0.09, 0.16); break;
      case 'cash': this.osc(fx, 'square', 988, 1318, 0.3, 0.14); this.osc(fx, 'square', 1318, 1976, 0.18, 0.1, 0.1); break;
      case 'coin': this.osc(fx, 'square', 1568, 2093, 0.07, 0.12); break;
      case 'saddleClean': this.osc(fx, 'triangle', 330, 494, 0.22, 0.2); break;
      case 'saddleRough': this.noise(fx, 0.18, 0.3, 0, 700); break;
      case 'rope': this.osc(fx, 'sawtooth', 240, 120, 0.26, 0.16); break;
      case 'bank': this.osc(fx, 'triangle', 523, 523, 0.1, 0.18); this.osc(fx, 'triangle', 659, 659, 0.1, 0.18, 0.1); this.osc(fx, 'triangle', 784, 1046, 0.15, 0.2, 0.2); break;
      case 'hurt': this.osc(fx, 'sawtooth', 200, 60, 0.25, 0.25); this.noise(fx, 0.12, 0.3, 0, 1200); break;
      case 'tunnel': this.osc(fx, 'sine', 330, 310, 0.7, 0.2); break;
      case 'escape': [523, 659, 784, 1046].forEach(function (f, i) { A.osc(fx, 'square', f, f, 0.16, 0.16, i * 0.14); }); break;
      case 'fail': [392, 311, 262, 196].forEach(function (f, i) { A.osc(fx, 'triangle', f, f, 0.22, 0.18, i * 0.18); }); break;
      case 'ui': this.osc(fx, 'square', 660, 660, 0.03, 0.1); break;
      case 'confirm': this.osc(fx, 'square', 660, 990, 0.055, 0.12); break;
    }
  },
  // 16-step adaptive score, layers share bar timing (rearrange, never restart)
  tickMusic: function () {
    if (!this.ctx || SAVE.settings.muted || this.musicState === 0) return;
    var c = this.ctx, spb = 60 / 132 / 2; // 132bpm 8ths
    if (this.nextBeat < c.currentTime) this.nextBeat = c.currentTime + 0.05;
    while (this.nextBeat < c.currentTime + 0.12) {
      var s = this.stepIdx % 16, at = this.nextBeat - c.currentTime;
      var mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
      // L1: hoof-kick pulse + two-note bass + rail clave
      if (s % 4 === 0) this.noise(this.layerGain[0], 0.05, 0.5, at, 300);
      var bass = [38, 0, 0, 38, 41, 0, 38, 0, 36, 0, 0, 36, 41, 0, 43, 0][s];
      if (bass) this.osc(this.layerGain[0], 'triangle', mtof(bass), 0, spb * 0.9, 0.22, at);
      if (s === 6 || s === 14) this.noise(this.layerGain[0], 0.03, 0.25, at, 2500);
      // L2: snare + plucked lead
      if (s % 8 === 4) this.noise(this.layerGain[1], 0.07, 0.4, at, 1800);
      var lead = [62, 0, 65, 0, 0, 62, 0, 60, 65, 0, 67, 0, 0, 70, 69, 65][s];
      if (lead) this.osc(this.layerGain[1], 'square', mtof(lead), 0, spb * 0.7, 0.09, at);
      // L3: high gold ostinato
      var ost = [74, 77, 81, 77][s % 4];
      if (s % 2 === 0) this.osc(this.layerGain[2], 'square', mtof(ost), 0, spb * 0.5, 0.06, at);
      // L4: doubled percussion + brake dissonance
      if (s % 2 === 1) this.noise(this.layerGain[3], 0.04, 0.3, at, 4000);
      if (s === 0) this.osc(this.layerGain[3], 'sawtooth', mtof(46), mtof(45), spb * 3, 0.06, at);
      this.stepIdx++; this.nextBeat += spb;
    }
  },
};

/* ---------------- game state ---------------- */
var G = null;
var audioQ = []; // sim -> audio events (drained render-side; sim stays pure)
var STATE_NAMES = ['title', 'chase', 'board', 'settle', 'relay', 'lock', 'cash', 'ret', 'leap', 'fork', 'pcleap', 'paycar', 'escape', 'results'];

function initRun(seed) {
  var rng = mulberry(seed);
  G = {
    seed: seed, rng: rng, tick: 0, state: 'title', stateT: 0,
    log: [], paused: false, shake: 0, flashT: 0,
    // train: rear car A at world x=0 when run starts; train advances
    trainX: 520, trainV: K.trainV,
    cars: [ // offsets from trainX (rear -> front)
      { kind: 'car', off: 0 },        // A: boarding + Dynamite Relay
      { kind: 'car', off: 184 },      // B: lockbox payday
      { kind: 'paycar', off: 368 },   // optional pay car
      { kind: 'engine', off: 552 },
    ],
    player: {
      x: 300, y: 252, vx: 0, vy: 0, on: 'horse', // horse|roof|air|leap
      feetY: 252, hearts: K.hearts, ammo: K.ammo, iframes: 0,
      fireCd: 0, reload: 0, fireAnim: 0, anim: 0, face: 1,
      coyote: 0, jumpBuf: 0, carIdx: 0, grabT: 0, hurtT: 0,
    },
    horse: { x: 300, y: 252, vy: 0, jumping: 0, stumble: 0, anim: 0 },
    // chase
    sync: 0, windowT: 0, recycleT: 0, missCount: 0, boardGrade: null, boardT: 0,
    fences: [], lawRider: null,
    // roof
    ents: [], bullets: [], ebullets: [], fxs: [], coins: [],
    lockbox: null, dynamites: [],
    // economy
    cashLoose: 0, cashBanked: 0, score: 0, heistScore: 0, killScore: 0,
    chain: 0, chainT: 0, bestChain: 0,
    events: [],
    returnHorseWave: rng() * 6.28,
    forkChoice: null, escapeT: 0, payT: 0, payDone: false,
    tunnelWarned: false, resultMult: 1, resultTitle: '', endTick: 0,
    payRaided: false, escProg: 0, escStart: 0, lastMoveT: 0,
    stats: { shots: 0, hits: 0, boards: 0, perfectBoard: false, perfectReloads: 0, cancels: 0, dynamiteKills: 0 },
  };
  // seeded chase fences (world x ahead of start)
  var fx = 420;
  for (var i = 0; i < 4; i++) { fx += 130 + G.rng() * 120; G.fences.push({ x: fx, hit: false }); }
  // law rider spawns shortly into chase
  G.lawRider = { x: 140, y: 252, hp: 2, telT: 0, cycleT: 200 + G.rng() * 60, anim: 0, dead: false };
  // seeded payday values
  G.bagValue = 260 + ((G.rng() * 80) | 0);
  G.payBagValue = 480 + ((G.rng() * 80) | 0);
  G.ladderPhase = G.rng() * 6.28;
  logEvent('run_init', { seed: seed });
}

function logEvent(type, data) {
  if (!G) return;
  G.log.push({ t: G.tick, type: type, d: data || {} });
  if (G.log.length > 6000) G.log.shift();
}
function setState(next, cause) {
  var prev = G.state;
  logEvent('state', { from: prev, to: next, cause: cause || '', score: G.score, cash: G.cashLoose, banked: G.cashBanked, hearts: G.player.hearts });
  G.state = next; G.stateT = 0;
}
function sfx(n) { audioQ.push(n); }

/* ---------------- scoring ---------------- */
function addScore(n, tag, heist) {
  var mult = 1 + Math.min(G.chain, K.chainCap) * 0.05;
  var v = Math.round(n * mult);
  G.score += v;
  if (heist) G.heistScore += v; else G.killScore += v;
  G.chain++; G.chainT = K.chainWindow;
  if (G.chain > G.bestChain) G.bestChain = G.chain;
  var stack = 0;
  for (var fi5 = 0; fi5 < G.fxs.length; fi5++) if (G.fxs[fi5].kind === 'text' && G.fxs[fi5].t < 20) stack++;
  G.fxs.push({ kind: 'text', txt: (tag ? tag + ' ' : '') + '+' + v, x: G.player.x, y: (G.player.on === 'roof' ? 120 : 232) - stack * 9, t: 0, life: 55, gold: heist });
  logEvent('score', { n: v, tag: tag, heist: !!heist });
}
function addCash(n, x, y) {
  G.cashLoose += n;
  G.fxs.push({ kind: 'text', txt: '$' + n, x: x, y: y - 8, t: 0, life: 45, gold: true });
  sfx('coin');
  logEvent('cash', { n: n });
}

/* ---------------- combat ---------------- */
function fireRevolver() {
  var P = G.player;
  if (P.reload > 0) {
    // active reload notch: fire during 4-10 ticks remaining completes instantly
    if (P.reload >= K.perfectLo && P.reload <= K.perfectHi) {
      P.reload = 0; P.ammo = K.ammo; P.fireCd = K.fireCd;
      G.stats.perfectReloads++;
      addScore(100, 'PERFECT RELOAD', true);
      sfx('perfectReload'); G.flashT = 4;
    }
    return;
  }
  if (P.fireCd > 0) return;
  if (P.ammo <= 0) { sfx('dry'); P.reload = K.reloadTicks; sfx('reloadOpen'); logEvent('reload_start'); return; }
  P.ammo--; P.fireCd = K.fireCd; P.fireAnim = 10; G.stats.shots++;
  var t = pickTarget();
  var px = P.x, py = (P.on === 'roof' || P.on === 'air') ? P.feetY - 22 : P.y - 30;
  if (t) P.face = (t.x - px) < 0 ? -1 : 1;
  var sx = px + P.face * 10;
  var vx = P.face * 7, vy = 0;
  if (t) {
    // aim from the muzzle, not the body center — point-blank shots must connect
    var dx = t.x - sx, dy = t.y - py, d = Math.max(1, Math.hypot(dx, dy));
    if (d < 4) { vx = P.face * 7; vy = 0; }
    else { vx = dx / d * 7; vy = dy / d * 7; }
  }
  G.bullets.push({ x: sx, y: py, vx: vx, vy: vy, life: 90 });
  G.fxs.push({ kind: 'muzzle', x: px + P.face * 14, y: py, t: 0, life: 5 });
  sfx('shot');
  logEvent('fire', { ammo: P.ammo, target: t ? t.tag : 'none' });
}
// threat-priority target selection: committed threats > threats > (directional or no-threat) objective props
function pickTarget() {
  var P = G.player, cands = [];
  var px = P.x;
  function add(x, y, tag, pri, ref) { cands.push({ x: x, y: y, tag: tag, pri: pri, ref: ref, d: Math.abs(x - px) }); }
  // enemies
  G.ents.forEach(function (e) {
    if (e.dead || e.hidden) return;
    var committed = e.telT > 0;
    add(e.x, e.y - 20, e.tag, committed ? 3 : 2, e);
  });
  if (G.lawRider && !G.lawRider.dead && (G.state === 'chase' || G.state === 'fork' || G.state === 'escape'))
    add(G.lawRider.x, G.lawRider.y - 30, 'law', G.lawRider.telT > 0 ? 3 : 2, G.lawRider);
  // airborne or about-to-blow dynamite is a threat; resting dynamite is a prop
  G.dynamites.forEach(function (d) {
    if (d.boomed) return;
    if (d.air) add(d.x, d.y, 'dyn', 2.5, d);
    else add(d.x, d.y, 'dynprop', 1, d);
  });
  // lockbox pins are props (never outrank a committed threat)
  if (G.lockbox && !G.lockbox.open) {
    if (!G.lockbox.pinL) add(G.lockbox.x - 10, G.lockbox.y - 12, 'pinL', 1, G.lockbox);
    if (!G.lockbox.pinR) add(G.lockbox.x + 10, G.lockbox.y - 12, 'pinR', 1, G.lockbox);
  }
  if (!cands.length) return null;
  var dir = IN.moveX;
  var hasCommitted = cands.some(function (c) { return c.pri >= 3; });
  var pool = cands;
  if (dir) {
    var cone = cands.filter(function (c) { return Math.sign(c.x - px) === Math.sign(dir); });
    if (cone.length) pool = cone;
    // directional intent may select props — but a committed threat in the cone still wins
  } else {
    // neutral: with assist off there is no auto-target at all — the shot flies straight
    if (!SAVE.settings.assist) return null;
    // assist on: threats first; objective props only when no threats remain
    var threats = cands.filter(function (c) { return c.pri >= 2; });
    if (threats.length) pool = threats;
    else pool = cands.filter(function (c) { return c.pri <= 1; });
  }
  // committed first, then nearest
  pool = pool.slice().sort(function (a, b) { return (b.pri - a.pri) || (a.d - b.d); });
  if (hasCommitted && pool[0].pri < 3) {
    // hard rule: never prefer a prop while a committed threat exists — force committed target
    var committedOnly = cands.filter(function (c) { return c.pri >= 3; }).sort(function (a, b) { return a.d - b.d; });
    if (pool[0].pri <= 1) return committedOnly[0];
  }
  return pool[0];
}

function hurtPlayer(cause) {
  var P = G.player;
  if (P.iframes > 0) return;
  P.hearts--; P.iframes = K.iframes; P.hurtT = 20;
  G.shake = SAVE.settings.shake ? 8 : 2;
  sfx('hurt');
  logEvent('hurt', { cause: cause, hearts: P.hearts });
  // spill 20% of loose cash once, recoverable
  if (G.cashLoose > 0) {
    var spill = Math.round(G.cashLoose * K.spillPct);
    if (spill > 0) {
      G.cashLoose -= spill;
      var parts = Math.min(3, spill), each = Math.floor(spill / parts), rem = spill - each * parts;
      for (var i = 0; i < parts; i++) {
        G.coins.push({ x: P.x + (G.rng() * 40 - 20), y: (P.on === 'horse' ? P.y - 10 : P.feetY - 8), vx: G.rng() * 2 - 1, vy: -1.5 - G.rng(), v: each + (i === 0 ? rem : 0), life: 300, spill: true });
      }
      logEvent('spill', { n: spill });
    }
  }
  if (P.hearts <= 0) {
    endRun(false, 'hp');
  }
}
function endRun(success, cause) {
  if (G.state === 'results') return;
  G.endTick = G.tick;
  G.resultTitle = success ? 'CLEAN GETAWAY!' : 'CAUGHT!';
  G.resultMult = success ? (G.payRaided ? K.payCarMult : K.cashOutMult) : 1;
  setState('results', cause);
  sfx(success ? 'escape' : 'fail');
  var final = finalScore();
  if (final > SAVE.records.best) SAVE.records.best = final;
  if (G.cashBanked > SAVE.records.bestCash) SAVE.records.bestCash = G.cashBanked;
  var sr = SAVE.seedRecords['s' + G.seed];
  if (!sr || final > sr) SAVE.seedRecords['s' + G.seed] = final;
  persist();
  logEvent('run_end', { success: success, cause: cause, final: final });
}
function finalScore() { return Math.round((G.score + G.cashBanked) * G.resultMult); }
function medalFor(v) { for (var i = 0; i < K.medals.length; i++) if (v >= K.medals[i][0]) return K.medals[i][1]; return 'TIN'; }

/* ---------------- geometry helpers ---------------- */
function carX(i) { return G.trainX + G.cars[i].off; }
var CAR_W = 160, GAP = 24, ROOF_Y = 142, RAIL_Y = 228, TRAIL_Y = 252;
function roofBoundsAt(x) { // which car roof is under world x; returns car index or -1
  for (var i = 0; i < G.cars.length; i++) {
    var cx = carX(i), w = G.cars[i].kind === 'engine' ? 176 : CAR_W;
    if (x >= cx - 2 && x <= cx + w + 2) return i;
  }
  return -1;
}

/* ---------------- sim tick ---------------- */
function tick() {
  G.tick++;
  G.stateT++;
  if (IN.moveX || IN.moveY || IN.jumpPressed) G.lastMoveT = G.tick;
  var P = G.player, S = G.state;
  if (P.iframes > 0) P.iframes--;
  if (P.fireCd > 0) P.fireCd--;
  if (P.fireAnim > 0) P.fireAnim--;
  if (P.hurtT > 0) P.hurtT--;
  if (G.flashT > 0) G.flashT--;
  if (G.shake > 0) G.shake--;
  if (G.chainT > 0) { G.chainT--; if (G.chainT === 0) G.chain = 0; }
  if (P.reload > 0 && S !== 'title' && S !== 'results') {
    P.reload--;
    if (P.reload === 40 || P.reload === 30 || P.reload === 20) sfx('reloadRound');
    if (P.reload === 0) { P.ammo = K.ammo; sfx('reloadClose'); logEvent('reload_done'); }
  }

  // train always advances (except title/results freeze look is fine to keep moving)
  if (S !== 'title' && S !== 'results') G.trainX += G.trainV;

  switch (S) {
    case 'title': break;
    case 'chase': tickChase(); break;
    case 'board': tickBoard(); break;
    case 'settle':
      tickRoofMove(true);
      if (G.stateT >= K.settleTicks) { setState('relay', 'settled'); spawnRelay(); }
      break;
    case 'relay': tickRoofMove(true); tickRelay(); break;
    case 'lock': tickRoofMove(true); tickLock(); break;
    case 'cash': tickRoofMove(true); tickCash(); break;
    case 'ret': tickRoofMove(false); tickReturn(); break;
    case 'leap': tickLeap(); break;
    case 'fork': tickFork(); break;
    case 'pcleap': tickPcLeap(); break;
    case 'paycar': tickRoofMove(true); tickPayCar(); break;
    case 'escape':
      tickHorseRide();
      tickPursuit();
      if (G.stateT === 1) { sfx('tunnel'); G.escStart = G.escProg; }
      if (G.escProg - G.escStart >= 150) endRun(true, 'escape');
      break;
    case 'results': break;
  }
  if (G.state === 'results') { tickFx(); return; }
  tickProjectiles();
  tickFx();
  tickCoins();
  tickDynamite();
}

/* ----- chase ----- */
function tickChase() {
  var P = G.player, Hs = G.horse;
  Hs.anim += 0.21;
  if (G.tick % 9 === 0) sfx('hoof');
  // horse speed relative control
  var spd = G.trainV + IN.moveX * 0.95;
  if (Hs.stumble > 0) { Hs.stumble--; spd = G.trainV - 0.8; }
  Hs.x += spd;
  Hs.x = Math.max(G.trainX - 320, Math.min(G.trainX + 40, Hs.x));
  // lane nudge (visual dodge space)
  Hs.y = Math.max(244, Math.min(260, Hs.y + IN.moveY * 1.2));
  // horse jump over fences
  if (Hs.jumping > 0) { Hs.jumping--; }
  // fences
  G.fences.forEach(function (f) {
    if (f.hit) return;
    if (Math.abs(f.x - Hs.x) < 10 && Hs.jumping <= 0) {
      f.hit = true; Hs.stumble = 55; G.sync = 0;
      G.fxs.push({ kind: 'dust', x: Hs.x, y: TRAIL_Y - 6, t: 0, life: 20 });
      sfx('land');
      logEvent('fence_hit', { x: f.x | 0 });
    }
  });
  // law rider pursues + telegraphed shots
  var L = G.lawRider;
  if (L && !L.dead) {
    L.anim += 0.2;
    L.x += (Hs.x - 90 - L.x) * 0.02 + G.trainV * 0.85;
    L.cycleT--;
    if (L.cycleT <= 0 && L.telT === 0) { L.telT = 36; }
    if (L.telT > 0) {
      L.telT--;
      if (L.telT === 0) {
        var dx = Hs.x - L.x, dy = (Hs.y - 26) - (L.y - 30), d = Math.max(1, Math.hypot(dx, dy));
        G.ebullets.push({ x: L.x + 12, y: L.y - 30, vx: dx / d * 2.4, vy: dy / d * 2.4, life: 240 });
        sfx('eshot');
        L.cycleT = 190 + G.rng() * 80;
      }
    }
  }
  // ladder sync: ladder hangs at rear of car A
  var ladderX = carX(0) + 4;
  var rel = Hs.x - ladderX;
  var inBand = rel > -30 && rel < 6;
  if (G.recycleT > 0) { G.recycleT--; G.sync = 0; }
  else if (G.windowT > 0) {
    G.windowT--;
    if (G.windowT === 0) { G.recycleT = K.boardRecycle; G.missCount++; logEvent('board_window_missed'); }
  } else if (inBand && Hs.stumble <= 0) {
    G.sync = Math.min(30, G.sync + 1);
    if (G.sync === 30) { G.windowT = K.boardSafe; sfx('clack'); logEvent('board_window_open'); }
  } else if (G.sync > 0) G.sync = Math.max(0, G.sync - 2);

  // jump: board attempt or fence hop
  if (IN.jumpPressed) {
    if (G.windowT > 0 && inBand) {
      // grade: perfect = central 18 ticks of the 36-tick window
      var into = K.boardSafe - G.windowT;
      var lo = (K.boardSafe - K.boardPerfect) / 2, hi = lo + K.boardPerfect;
      G.boardGrade = (into >= lo && into < hi) ? 'perfect' : 'safe';
      G.boardT = 0;
      setState('board', 'jump');
      logEvent('board_leap', { grade: G.boardGrade });
    } else if (Hs.jumping <= 0) {
      Hs.jumping = 26; // hop (fences)
      sfx('hoof');
      if (G.windowT === 0 && inBand && G.sync < 30) { /* early hop near ladder is just a hop */ }
    }
  }
  if (IN.firePressed) fireRevolver();
  P.x = Hs.x; P.y = Hs.y - (Hs.jumping > 0 ? Math.sin(Hs.jumping / 26 * Math.PI) * 16 : 0);
  // keep player entity mirrored on horse
  P.feetY = P.y;
}

/* ----- board leap (24f scripted arc, then settle) ----- */
function tickBoard() {
  var P = G.player;
  G.boardT++;
  var t = G.boardT / K.boardLeap;
  var fromX = G.horse.x, toX = carX(0) + 22;
  P.x = fromX + (toX - fromX) * t + G.trainV * G.boardT;
  P.feetY = TRAIL_Y - Math.sin(t * Math.PI) * 60 - t * (TRAIL_Y - ROOF_Y);
  P.on = 'air';
  if (G.boardT >= K.boardLeap) {
    P.on = 'roof'; P.feetY = ROOF_Y; P.carIdx = 0;
    G.stats.boards++;
    if (G.boardGrade === 'perfect') { G.stats.perfectBoard = true; addScore(400, 'PERFECT BOARD', true); sfx('boardPerfect'); G.flashT = SAVE.settings.flash ? 5 : 2; }
    else { addScore(150, 'BOARD', true); sfx('boardSafe'); }
    sfx('land');
    setState('settle', 'landed');
  }
}

/* ----- roof movement shared (settle/relay/lock/cash/paycar) ----- */
function tickRoofMove(consumeActions) {
  var P = G.player;
  P.x += IN.moveX * 1.6 + G.trainV;
  if (IN.moveX) { P.anim += 0.2; P.face = IN.moveX < 0 ? -1 : 1; } else P.anim = 0;
  if (G.tick % 26 === 0) sfx('clack');
  var onCar = roofBoundsAt(P.x);
  // jump physics (gaps between cars)
  if (P.on === 'roof') {
    P.coyote = 6;
    if (consumeActions && (IN.jumpPressed || P.jumpBuf > 0)) {
      P.jumpBuf = 0; P.vy = -3.6; P.on = 'air'; sfx('hoof');
    }
  } else if (P.on === 'air') {
    if (IN.jumpPressed) P.jumpBuf = 6;
    P.vy = Math.min(4, P.vy + 0.22);
    P.feetY += P.vy;
    if (P.coyote > 0) P.coyote--;
    if (P.vy > 0 && P.feetY >= ROOF_Y && onCar >= 0) {
      P.feetY = ROOF_Y; P.on = 'roof'; P.vy = 0; P.carIdx = onCar; sfx('land');
      G.fxs.push({ kind: 'dust', x: P.x, y: ROOF_Y, t: 0, life: 14 });
    }
    if (P.feetY > RAIL_Y - 6) {
      // fell between cars: recoverable — clamber back with a cost
      hurtPlayer('fall');
      if (G.player.hearts > 0) {
        var back = roofBoundsAt(P.x - 30) >= 0 ? P.x - 30 : carX(0) + 30;
        P.x = back; P.feetY = ROOF_Y; P.on = 'roof'; P.vy = 0; P.iframes = K.iframes;
        logEvent('gap_fall');
      }
    }
  }
  if (P.on === 'roof' && onCar < 0) { P.on = 'air'; P.vy = Math.max(P.vy, 0.5); }
  if (P.jumpBuf > 0) P.jumpBuf--;
  // clamp to train extent
  P.x = Math.max(carX(0) - 8, Math.min(carX(3) + 150, P.x));
  if (consumeActions && IN.firePressed) fireRevolver();
}

/* ----- Dynamite Relay card (car A) ----- */
function spawnRelay() {
  var a = carX(0);
  G.ents.push({ tag: 'guard', x: a + 132, y: ROOF_Y, hp: 1, telT: 0, cycleT: 120, anim: 0, dead: false, rise: 20 });
  G.ents.push({ tag: 'hatch', x: a + 70, y: ROOF_Y, hp: 1, telT: 0, cycleT: 90, anim: 0, dead: false, hidden: true, warnT: 40, throwT: 0 });
  logEvent('card', { id: 'dynamite-relay' });
}
function tickRelay() {
  var P = G.player, a = carX(0);
  G.ents.forEach(function (e) {
    if (e.dead) return;
    e.x += G.trainV; // ride the train
    if (e.tag === 'guard') {
      if (e.rise > 0) { e.rise--; return; }
      e.cycleT--;
      if (e.cycleT <= 0 && e.telT === 0) e.telT = 36;
      if (e.telT > 0) {
        e.telT--;
        if (e.telT === 0) {
          var dx = P.x - e.x, dy = (P.feetY - 20) - (e.y - 20), d = Math.max(1, Math.hypot(dx, dy));
          G.ebullets.push({ x: e.x - 8, y: e.y - 20, vx: dx / d * 2.4, vy: dy / d * 2.4, life: 240 });
          sfx('eshot'); e.cycleT = 130 + G.rng() * 60;
        }
      }
    } else if (e.tag === 'hatch') {
      if (e.warnT > 0) { e.warnT--; if (e.warnT === 20) sfx('hatch'); if (e.warnT === 0) e.hidden = false; return; }
      e.cycleT--;
      if (e.cycleT <= 0) {
        // throw dynamite toward player's side
        var tx = P.x + (G.rng() * 60 - 30);
        var dxx = Math.max(-90, Math.min(90, tx - e.x));
        G.dynamites.push({ x: e.x, y: e.y - 26, vx: dxx / 46, vy: -2.6, air: true, fuse: 0, boomed: false });
        e.telT = 12; // brief arm-up read
        e.cycleT = 150 + G.rng() * 60;
        logEvent('dyn_throw');
      }
      if (e.telT > 0) e.telT--;
    }
  });
  // card cleared?
  var alive = G.ents.filter(function (e) { return !e.dead; });
  if (!alive.length && G.stateT > 60) {
    setState('lock', 'card_clear');
    var b = carX(1);
    G.lockbox = { x: b + 80, y: ROOF_Y, pinL: false, pinR: false, open: false, burstT: 0 };
    logEvent('lockbox_ready');
  }
}

/* ----- lockbox payday (car B) ----- */
function tickLock() {
  var L = G.lockbox;
  L.x = carX(1) + 80;
  if (L.pinL && L.pinR && !L.open) {
    L.open = true; L.burstT = 20;
    sfx('lockOpen'); sfx('boom');
    G.shake = SAVE.settings.shake ? 6 : 2;
    // cash fountain: coins + core
    var total = G.bagValue, coins = 6, each = Math.floor(total * 0.55 / coins), core = total - each * coins;
    for (var i = 0; i < coins; i++) {
      G.coins.push({ x: L.x, y: L.y - 16, vx: (G.rng() * 2 - 1) * 1.6, vy: -2 - G.rng() * 1.4, v: each, life: 9999 });
    }
    G.coins.push({ x: L.x, y: L.y - 14, vx: 0, vy: -1.2, v: core, life: 9999, core: true });
    setState('cash', 'payday_open');
    logEvent('payday_open', { value: total });
  }
}
function tickCash() {
  G.lockbox.x = carX(1) + 80;
  if (!G.coins.length) {
    setState('ret', 'cash_collected');
    G.horse.x = G.player.x - 10; // horse gallops below, tracking
    logEvent('return_ready');
  }
}

/* ----- return alignment + leap ----- */
function tickReturn() {
  var P = G.player, Hs = G.horse;
  Hs.anim += 0.21;
  if (G.tick % 9 === 0) sfx('hoof');
  // horse tracks below player with a seeded weave — the alignment challenge
  G.returnHorseWave += 0.045;
  var weave = Math.sin(G.returnHorseWave) * 16;
  Hs.x += (P.x + weave - Hs.x) * 0.06 + 0;
  Hs.y = TRAIL_Y;
  if (IN.jumpPressed) {
    var err = Math.abs(P.x - Hs.x);
    // grade by alignment error mapped to timing frames (weave speed ~1.4px/f)
    var frames2 = err / 1.4;
    G.retGrade = frames2 < K.returnClean ? 'clean' : frames2 < K.returnRough ? 'rough' : 'rope';
    G.leapT = 0;
    setState('leap', 'return_jump');
    logEvent('return_leap', { grade: G.retGrade, err: err | 0 });
  }
  if (IN.firePressed) fireRevolver();
}
function tickLeap() {
  var P = G.player, Hs = G.horse;
  G.leapT++;
  Hs.anim += 0.21; Hs.x += G.trainV;
  var t = G.leapT / K.boardLeap;
  P.x += (Hs.x - P.x) * 0.16 + G.trainV * 0.4;
  P.feetY = ROOF_Y + (TRAIL_Y - ROOF_Y) * t - Math.sin(t * Math.PI) * 14;
  P.on = 'air';
  if (G.leapT >= K.boardLeap) {
    P.on = 'horse'; P.feetY = TRAIL_Y; P.x = Hs.x;
    var g = G.retGrade;
    if (g === 'clean') { addScore(400, 'CLEAN SADDLE', true); sfx('saddleClean'); }
    else if (g === 'rough') { addScore(150, 'ROUGH CATCH', true); sfx('saddleRough'); Hs.stumble = 30; }
    else {
      // rope catch fail-safe: cash penalty, slow recovery
      var pen = Math.round(G.cashLoose * 0.15);
      G.cashLoose -= pen;
      G.fxs.push({ kind: 'text', txt: 'ROPE CATCH -$' + pen, x: P.x, y: 220, t: 0, life: 60, gold: false });
      sfx('rope'); Hs.stumble = 55;
      logEvent('rope_catch', { pen: pen });
    }
    // bank the cash
    if (G.cashLoose > 0) {
      G.cashBanked += G.cashLoose;
      G.fxs.push({ kind: 'text', txt: 'BANKED $' + G.cashLoose, x: P.x, y: 210, t: 0, life: 70, gold: true });
      G.cashLoose = 0;
      sfx('bank');
      logEvent('bank', { banked: G.cashBanked });
    }
    if (G.state !== 'results') {
      if (G.payDone) { setState('escape', 'pay_done'); }
      else setState('fork', 'banked');
    }
  }
}

/* ----- escape fork: ride out (teal) vs pay car ladder (gold) ----- */
function tickFork() {
  var P = G.player, Hs = G.horse;
  tickHorseRide();
  if (G.stateT === 1) {
    G.exitX = Hs.x + 560; // teal exit marker ahead on the trail
    logEvent('fork_open', { exitX: G.exitX | 0 });
  }
  // tunnel warning as exit approaches
  if (!G.tunnelWarned && G.exitX - Hs.x < 260) { G.tunnelWarned = true; sfx('tunnel'); logEvent('tunnel_warning'); }
  // pay car ladder: rear of pay car
  var ladderX = carX(2) + 6;
  var rel = Hs.x - ladderX;
  var inBand = rel > -30 && rel < 8;
  if (IN.jumpPressed) {
    if (inBand) {
      G.forkChoice = 'paycar'; G.pcT = 0;
      setState('pcleap', 'paycar_choice');
      logEvent('paycar_commit');
    } else if (Hs.jumping <= 0) Hs.jumping = 26;
  }
  if (IN.firePressed) fireRevolver();
  tickPursuit();
  if (Hs.x >= G.exitX) {
    G.forkChoice = 'out';
    setState('escape', 'rode_out');
  }
}
// law pursuit keeps escape honest: a fresh rider closes in if the getaway stalls
function tickPursuit() {
  if (G.stateT === 360 && (!G.lawRider || G.lawRider.dead)) {
    G.lawRider = { x: G.horse.x - 170, y: 252, hp: 2, telT: 0, cycleT: 120, anim: 0, dead: false };
    logEvent('pursuit_spawn');
  }
  var L = G.lawRider;
  if (!L || L.dead || G.state === 'chase') return;
  L.anim += 0.2;
  L.x += (G.horse.x - 80 - L.x) * 0.03 + 0.8;
  L.cycleT--;
  if (L.cycleT <= 0 && L.telT === 0) L.telT = 36;
  if (L.telT > 0) {
    L.telT--;
    if (L.telT === 0) {
      var dx = G.horse.x - L.x, dy = (G.horse.y - 26) - (L.y - 30), d = Math.max(1, Math.hypot(dx, dy));
      G.ebullets.push({ x: L.x + 12, y: L.y - 30, vx: dx / d * 2.4, vy: dy / d * 2.4, life: 240 });
      sfx('eshot'); L.cycleT = 170 + G.rng() * 60;
    }
  }
}
function tickHorseRide() {
  var P = G.player, Hs = G.horse;
  Hs.anim += 0.21;
  if (G.tick % 9 === 0) sfx('hoof');
  // escape is play, not a timer: standing still makes no progress toward the exit
  var spd = Math.max(0, IN.moveX) * 2.25 + Math.min(0, IN.moveX) * 0.6;
  if (Hs.stumble > 0) { Hs.stumble--; spd = Math.min(spd, 0.4); }
  Hs.x += spd;
  if (spd > 0.1) G.escProg += spd;
  Hs.x = Math.max(G.trainX - 200, Math.min(carX(3) + 60, Hs.x));
  Hs.y = Math.max(244, Math.min(260, Hs.y + IN.moveY * 1.2));
  if (Hs.jumping > 0) Hs.jumping--;
  P.x = Hs.x; P.feetY = TRAIL_Y; P.on = 'horse';
  P.y = Hs.y - (Hs.jumping > 0 ? Math.sin(Hs.jumping / 26 * Math.PI) * 16 : 0);
}
function tickPcLeap() {
  var P = G.player;
  G.pcT++;
  var t = G.pcT / K.boardLeap;
  var toX = carX(2) + 30;
  P.x += (toX - P.x) * 0.16 + G.trainV;
  P.feetY = TRAIL_Y - Math.sin(t * Math.PI) * 60 - t * (TRAIL_Y - ROOF_Y);
  P.on = 'air';
  if (G.pcT >= K.boardLeap) {
    P.on = 'roof'; P.feetY = ROOF_Y; P.carIdx = 2;
    addScore(200, 'PAY CAR', true); sfx('boardSafe'); sfx('land');
    // Marshal + richer lockbox
    var c = carX(2);
    G.ents.push({ tag: 'marshal', x: c + 120, y: ROOF_Y, hp: 4, telT: 0, cycleT: 110, anim: 0, dead: false, rise: 16 });
    G.lockbox = { x: c + 64, y: ROOF_Y, pinL: false, pinR: false, open: false, burstT: 0, pay: true };
    G.payT = K.payCarCap;
    setState('paycar', 'boarded_pay');
    logEvent('card', { id: 'pay-car-marshal' });
  }
}
function tickPayCar() {
  var P = G.player;
  G.payT--;
  G.lockbox.x = carX(2) + 64;
  // Marshal: 3-bullet spread volleys, telegraphed
  G.ents.forEach(function (e) {
    if (e.dead || e.tag !== 'marshal') return;
    e.x += G.trainV;
    if (e.rise > 0) { e.rise--; return; }
    e.cycleT--;
    if (e.cycleT <= 0 && e.telT === 0) e.telT = 40;
    if (e.telT > 0) {
      e.telT--;
      if (e.telT === 0) {
        for (var a = -1; a <= 1; a++) {
          var dx = P.x - e.x, dy = (P.feetY - 20 + a * 14) - (e.y - 20), d = Math.max(1, Math.hypot(dx, dy));
          G.ebullets.push({ x: e.x - 8, y: e.y - 20, vx: dx / d * 2.5, vy: dy / d * 2.5, life: 240 });
        }
        sfx('volley'); e.cycleT = 120 + G.rng() * 40;
      }
    }
  });
  // lockbox open only when marshal down
  var marshal = G.ents.find(function (e) { return e.tag === 'marshal' && !e.dead; });
  if (!marshal && G.lockbox.pinL && G.lockbox.pinR && !G.lockbox.open) {
    G.lockbox.open = true;
    sfx('lockOpen'); sfx('boom');
    var total = G.payBagValue, coins = 7, each = Math.floor(total * 0.6 / coins), core = total - each * coins;
    for (var i = 0; i < coins; i++) G.coins.push({ x: G.lockbox.x, y: ROOF_Y - 16, vx: (G.rng() * 2 - 1) * 1.8, vy: -2.2 - G.rng() * 1.4, v: each, life: 9999 });
    G.coins.push({ x: G.lockbox.x, y: ROOF_Y - 14, vx: 0, vy: -1.4, v: core, life: 9999, core: true });
    logEvent('paycar_open', { value: total });
  }
  if (G.lockbox.open && !G.coins.length && !G.payDone) {
    G.payDone = true; G.payRaided = true;
    G.horse.x = P.x - 10;
    clearPaycarCombat();
    setState('ret', 'paycar_collected');
  }
  if (G.payT <= 0 && !G.payDone) {
    // out of time: forced return; raid failed, no pay-car reward
    G.payDone = true;
    G.horse.x = P.x - 10;
    clearPaycarCombat();
    setState('ret', 'paycar_timeout');
  }
  if (G.payT === 240) sfx('tunnel');
}

function clearPaycarCombat() {
  G.ents.forEach(function (e) { if (e.tag === 'marshal') e.dead = true; });
  G.lockbox = null;
  G.ebullets.length = 0;
}

/* ----- projectiles / props ----- */
function tickProjectiles() {
  var P = G.player;
  // player bullets
  for (var i = G.bullets.length - 1; i >= 0; i--) {
    var b = G.bullets[i];
    b.x += b.vx; b.y += b.vy; b.life--;
    var hit = false;
    // enemies
    for (var j = 0; j < G.ents.length; j++) {
      var e = G.ents[j];
      if (e.dead || (e.hidden)) continue;
      if (Math.abs(b.x - e.x) < 10 && Math.abs(b.y - (e.y - 20)) < 18) {
        e.hp--; hit = true; G.stats.hits++;
        if (e.hp <= 0) {
          e.dead = true;
          addScore(e.tag === 'marshal' ? 150 : 50, null, false);
          G.fxs.push({ kind: 'boom', x: e.x, y: e.y - 16, t: 0, life: 18, small: true });
          logEvent('kill', { tag: e.tag });
        } else { G.fxs.push({ kind: 'dust', x: e.x, y: e.y - 20, t: 0, life: 10 }); }
        break;
      }
    }
    // law rider
    if (!hit && G.lawRider && !G.lawRider.dead && Math.abs(b.x - G.lawRider.x) < 12 && Math.abs(b.y - (G.lawRider.y - 28)) < 20) {
      G.lawRider.hp--; hit = true; G.stats.hits++;
      if (G.lawRider.hp <= 0) { G.lawRider.dead = true; addScore(100, 'RIDER DOWN', false); G.fxs.push({ kind: 'boom', x: G.lawRider.x, y: G.lawRider.y - 20, t: 0, life: 18, small: true }); logEvent('kill', { tag: 'law' }); }
      else G.fxs.push({ kind: 'dust', x: G.lawRider.x, y: G.lawRider.y - 24, t: 0, life: 10 });
    }
    // dynamite (air = bullet cancel, resting = detonate solution)
    if (!hit) for (var d2 = 0; d2 < G.dynamites.length; d2++) {
      var dy = G.dynamites[d2];
      if (dy.boomed) continue;
      if (Math.abs(b.x - dy.x) < 8 && Math.abs(b.y - dy.y) < 8) {
        hit = true; G.stats.hits++;
        if (dy.air) { dy.boomed = true; G.stats.cancels++; addScore(150, 'BULLET CANCEL', true); sfx('cancel'); G.fxs.push({ kind: 'dust', x: dy.x, y: dy.y, t: 0, life: 12 }); }
        else explodeDynamite(dy, true);
        break;
      }
    }
    // lockbox pins (swept: fast bullets check the midpoint too)
    if (!hit && G.lockbox && !G.lockbox.open) {
      var L = G.lockbox, mx = b.x - b.vx / 2, my = b.y - b.vy / 2;
      var hitP = function (px2) {
        return (Math.abs(b.x - px2) < 7 && Math.abs(b.y - (L.y - 12)) < 8) ||
               (Math.abs(mx - px2) < 7 && Math.abs(my - (L.y - 12)) < 8);
      };
      if (!L.pinL && hitP(L.x - 10)) { L.pinL = true; hit = true; G.stats.hits++; addScore(200, 'LOCK PIN', true); sfx('pin'); }
      else if (!L.pinR && hitP(L.x + 10)) { L.pinR = true; hit = true; G.stats.hits++; addScore(200, 'LOCK PIN', true); sfx('pin'); }
    }
    if (hit || b.life <= 0) G.bullets.splice(i, 1);
  }
  // enemy bullets
  var py = P.on === 'horse' ? P.y - 26 : P.feetY - 20;
  for (var k2 = G.ebullets.length - 1; k2 >= 0; k2--) {
    var eb = G.ebullets[k2];
    eb.x += eb.vx; eb.y += eb.vy; eb.life--;
    var dx2 = Math.abs(eb.x - P.x), dy2 = Math.abs(eb.y - py);
    if (dx2 < 6 && dy2 < 12) { hurtPlayer('shot'); G.ebullets.splice(k2, 1); continue; }
    else if (dx2 < 14 && dy2 < 18 && !eb.near) { eb.near = true; if (G.tick - G.lastMoveT < 30) { sfx('nearmiss'); addScore(25, 'NEAR MISS', true); } }
    if (eb.life <= 0) G.ebullets.splice(k2, 1);
  }
  if (G.bullets.length > 24) G.bullets.length = 24;
  if (G.ebullets.length > 24) G.ebullets.length = 24;
}
function tickDynamite() {
  for (var i = G.dynamites.length - 1; i >= 0; i--) {
    var d = G.dynamites[i];
    if (d.boomed) { G.dynamites.splice(i, 1); continue; }
    if (d.air) {
      d.x += d.vx + G.trainV; d.y += d.vy; d.vy += 0.12;
      if (d.y >= ROOF_Y - 4) { d.y = ROOF_Y - 4; d.air = false; d.fuse = 60; }
    } else {
      d.x += G.trainV;
      d.fuse--;
      if (d.fuse <= 0) explodeDynamite(d, false);
    }
  }
}
function explodeDynamite(d, byShot) {
  d.boomed = true;
  G.fxs.push({ kind: 'boom', x: d.x, y: d.y - 6, t: 0, life: 24 });
  G.shake = SAVE.settings.shake ? 7 : 2;
  sfx('boom');
  var P = G.player;
  var px = P.x, py2 = P.on === 'horse' ? P.y - 10 : P.feetY - 10;
  if (Math.abs(px - d.x) < 34 && Math.abs(py2 - d.y) < 30) hurtPlayer('dynamite');
  // dynamite solution: blast takes out nearby enemies (player-credited only when player triggered it)
  G.ents.forEach(function (e) {
    if (e.dead || e.hidden) return;
    if (Math.abs(e.x - d.x) < 40 && Math.abs((e.y - 16) - d.y) < 32) {
      e.dead = true;
      G.fxs.push({ kind: 'boom', x: e.x, y: e.y - 16, t: 0, life: 16, small: true });
      if (byShot) { G.stats.dynamiteKills++; addScore(300, 'DYNAMITE!', true); }
      logEvent('kill', { tag: e.tag, dyn: true, credited: !!byShot });
    }
  });
  logEvent('dyn_boom', { byShot: !!byShot });
}
function tickCoins() {
  var P = G.player;
  var px = P.x, py = P.on === 'horse' ? P.y - 10 : P.feetY - 10;
  for (var i = G.coins.length - 1; i >= 0; i--) {
    var c = G.coins[i];
    c.x += c.vx + (G.state !== 'chase' && G.state !== 'fork' && G.state !== 'escape' ? G.trainV : 0);
    c.y += c.vy; c.vy += 0.14;
    var overCar = roofBoundsAt(c.x) >= 0 && c.y < RAIL_Y - 10;
    var floor = overCar ? ROOF_Y - 2 : TRAIL_Y - 4;
    if (c.y > floor && c.vy > 0) { c.y = floor; c.vy *= -0.4; c.vx *= 0.8; }
    if (c.spill) { c.life--; if (c.life <= 0) { G.coins.splice(i, 1); continue; } }
    // magnet + collect (82px protected default)
    var d = Math.hypot(c.x - px, c.y - py);
    if (d < K.magnet) { c.x += (px - c.x) * 0.18; c.y += (py - c.y) * 0.18; }
    if (d < 14) {
      addCash(c.v, c.x, c.y);
      G.coins.splice(i, 1);
    }
  }
}
function tickFx() {
  for (var i = G.fxs.length - 1; i >= 0; i--) {
    var f = G.fxs[i];
    f.t++;
    if (f.kind === 'text') f.y -= 0.4;
    if (f.t >= f.life) G.fxs.splice(i, 1);
  }
  if (G.fxs.length > 80) G.fxs.splice(0, G.fxs.length - 80);
}

/* ---------------- meta input (title/results/pause) ---------------- */
function metaInput() {
  if (kedge('mute')) { SAVE.settings.muted = !SAVE.settings.muted; persist(); }
  if (kedge('t1')) { SAVE.settings.assist = !SAVE.settings.assist; persist(); sfx('ui'); }
  if (kedge('t2')) { SAVE.settings.shake = !SAVE.settings.shake; persist(); sfx('ui'); }
  if (kedge('t3')) { SAVE.settings.flash = !SAVE.settings.flash; persist(); sfx('ui'); }
  if (G.state === 'title') {
    if (kedge('seed')) { newSeed(); sfx('ui'); }
    if (kedge('start') || IN.jumpPressed || IN.firePressed || touchStartTap) {
      touchStartTap = false;
      startSlice();
    }
  } else if (G.state === 'results') {
    if (kedge('retry')) { var s = G.seed; initRun(s); setState('chase', 'retry_same_seed'); sfx('confirm'); }
    else if (kedge('start') || touchStartTap) { touchStartTap = false; newSeed(); startSlice(); sfx('confirm'); }
  } else {
    if (IN.pausePressed) { G.paused = !G.paused; sfx('ui'); }
    if (kedge('retry')) { var s2 = G.seed; initRun(s2); setState('chase', 'retry_same_seed'); }
  }
}
var pendingSeed = null;
function newSeed() {
  pendingSeed = ((Math.random() * 90000) | 0) + 10000; // meta-level only; sim uses stored seed
}
function startSlice() {
  var s = pendingSeed || G.seed || 12345;
  pendingSeed = null;
  initRun(s);
  setState('chase', 'start');
  sfx('confirm');
}
var touchStartTap = false;

/* ---------------- render ---------------- */
var canvas, ctx;
function draw(name, fi, x, y, flip) {
  var fr = frames(name); if (!fr) return;
  var f = fr[Math.max(0, fi | 0) % fr.length];
  x |= 0; y |= 0;
  if (flip) {
    ctx.save(); ctx.translate(x + f.w, y); ctx.scale(-1, 1);
    ctx.drawImage(atlasCanvas, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
    ctx.restore();
  } else ctx.drawImage(atlasCanvas, f.x, f.y, f.w, f.h, x, y, f.w, f.h);
}
function drawScaled(name, fi, x, y, s) {
  var fr = frames(name); if (!fr) return;
  var f = fr[(fi | 0) % fr.length];
  ctx.drawImage(atlasCanvas, f.x, f.y, f.w, f.h, x | 0, y | 0, f.w * s, f.h * s);
}
function textW2(str, s) { return str.length * 6 * (s || 1); }
function text2(str, x, y, s) {
  s = s || 1; x |= 0; y |= 0;
  str = ('' + str).toUpperCase();
  for (var i = 0; i < str.length; i++) {
    var ch = str[i];
    if (ch !== ' ') drawScaled('f_' + ch, 0, x, y, s);
    x += 6 * s;
  }
}
function textTint(str, x, y, s, palIdx) {
  // tinted via temp fill: draw cream glyphs then overlay? Simplest: rely on cream + gold variants pre-not-available.
  // draw with shadow for legibility
  ctx.save();
  text2(str, x, y, s);
  ctx.restore();
}
function textC2(str, cx, y, s) { text2(str, cx - textW2(str, s) / 2, y, s); }
function textColor(str, x, y, s, color) {
  // colored text: draw glyphs to offscreen then composite — cache per color+size is overkill; use fill trick
  var w = textW2(str, s), h = 8 * (s || 1);
  var oc = textColor._c || (textColor._c = document.createElement('canvas'));
  if (oc.width < w || oc.height < h) { oc.width = Math.max(oc.width, w); oc.height = Math.max(oc.height, h); }
  var o = oc.getContext('2d');
  o.clearRect(0, 0, w, h);
  o.imageSmoothingEnabled = false;
  var save = ctx; ctx = o;
  text2(str, 0, 0, s);
  ctx = save;
  o.globalCompositeOperation = 'source-in';
  o.fillStyle = color; o.fillRect(0, 0, w, h);
  o.globalCompositeOperation = 'source-over';
  ctx.drawImage(oc, 0, 0, w, h, x | 0, y | 0, w, h);
}
function textColorC(str, cx, y, s, color) { textColor(str, cx - textW2(str, s) / 2, y, s, color); }

var camX = 0;
function render() {
  ctx.imageSmoothingEnabled = false;
  var P = G.player;
  // camera target
  var focus = (G.state === 'chase' || G.state === 'fork' || G.state === 'escape' || P.on === 'horse') ? G.horse.x : P.x;
  var target = focus - 190;
  var d = target - camX;
  camX += Math.abs(d) > 4 ? Math.sign(d) * 4 : d; // ≤4px/tick ease: no >0.45s uncontrolled snap
  var shx = G.shake > 0 ? ((G.tick % 2) * 2 - 1) * Math.min(3, G.shake) : 0;
  var night = G.tick > K.zoneMidnight && G.state !== 'title';
  var blend = night ? Math.min(1, (G.tick - K.zoneMidnight) / 60) : 0;

  // ---- sky (Sundown -> Midnight zone shift at 30 s) ----
  var skyTop = night ? pal(22) : pal(17);
  var skyMid = night ? pal(23) : pal(18);
  var skyLow = night ? pal(24) : pal(19);
  var horizon = night ? pal(24) : pal(11);
  ctx.fillStyle = skyTop; ctx.fillRect(0, 0, W, 70);
  ctx.fillStyle = skyMid; ctx.fillRect(0, 70, W, 60);
  ctx.fillStyle = skyLow; ctx.fillRect(0, 130, W, 40);
  ctx.fillStyle = horizon; ctx.fillRect(0, 170, W, 30);
  if (night) { // stars + moon
    for (var st = 0; st < 40; st++) {
      var sx2 = (st * 97 + 13) % W, sy2 = (st * 53) % 120;
      if ((st + ((G.tick / 30) | 0)) % 7) { ctx.fillStyle = pal(28); ctx.fillRect(sx2, sy2, 1, 1); }
    }
    ctx.fillStyle = pal(30); ctx.beginPath ? (function () { ctx.fillRect(392, 26, 24, 24); ctx.fillStyle = pal(28); ctx.fillRect(396, 30, 6, 6); ctx.fillRect(404, 38, 5, 5); })() : 0;
  } else {
    ctx.fillStyle = pal(9); ctx.fillRect(392, 30, 20, 28); ctx.fillRect(388, 34, 28, 20); // stepped sun
    ctx.fillStyle = pal(10); ctx.fillRect(394, 34, 16, 20); ctx.fillRect(392, 36, 20, 16);
  }
  ctx.save();
  ctx.translate(shx, 0);
  // far mesas parallax
  for (var m = -((camX * 0.22) % 300) - 300; m < W + 130; m += 150) draw('mesafar', 0, m, 118);
  // mid dune band
  ctx.fillStyle = night ? pal(24) : pal(21); ctx.fillRect(0, 196, W, 14);
  ctx.fillStyle = night ? pal(23) : pal(20); ctx.fillRect(0, 206, W, 22);
  // track bed + rails
  ctx.fillStyle = pal(2); ctx.fillRect(0, RAIL_Y, W, 8);
  ctx.fillStyle = pal(26); ctx.fillRect(0, RAIL_Y, W, 2);
  var so = -((camX | 0) % 16);
  ctx.fillStyle = pal(1);
  for (var sx3 = so; sx3 < W; sx3 += 16) ctx.fillRect(sx3, RAIL_Y + 3, 8, 3);
  // trail
  ctx.fillStyle = night ? pal(3) : pal(4); ctx.fillRect(0, 236, W, H - 236);
  ctx.fillStyle = night ? pal(2) : pal(3); ctx.fillRect(0, 262, W, 8);

  // world props (fences, cacti seeded from ~x)
  for (var cx2 = (((camX / 90) | 0) - 1) * 90; cx2 < camX + W + 90; cx2 += 90) {
    if (((cx2 / 90) | 0) % 3 === 0) draw('cactus', 0, cx2 - camX, 186);
  }
  if (G.state === 'chase') G.fences.forEach(function (f) { if (!f.hit) draw('fence', 0, f.x - camX - 16, TRAIL_Y - 22); });

  // ---- train ----
  for (var ci = 0; ci < G.cars.length; ci++) {
    var c = G.cars[ci], x = carX(ci) - camX;
    if (x < -220 || x > W + 40) continue;
    var kind = c.kind;
    var bodyY = kind === 'engine' ? 132 : 136;
    draw(kind, 0, x, bodyY);
    var wn = kind === 'engine' ? 3 : 2, ww = kind === 'engine' ? 176 : CAR_W;
    for (var wi = 0; wi < wn; wi++) draw('wheel', ((G.tick / 5) | 0) % 2, x + 14 + wi * ((ww - 48) / (wn - 1)), RAIL_Y - 26);
  }
  // boarding ladder at rear of car A (chase) / pay car (fork)
  if (G.state === 'chase') {
    var lx = carX(0) + 4 - camX;
    var lit = G.windowT > 0;
    draw('ladder', lit ? 1 : 0, lx - 6, 160);
    if (lit) { draw('marker', ((G.tick / 8) | 0) % 2, lx - 6, 146 - 8); textColorC('JUMP!', lx, 132, 1, pal(18)); }
    else if (G.recycleT > 0) textColorC('' + Math.ceil(G.recycleT / 60), lx, 140, 1, pal(29));
    else if (G.missCount >= 3) textColorC('RIDE THE SLIPSTREAM', lx, 132, 1, pal(18));
    // sync meter (world-space, small)
    ctx.fillStyle = pal(1); ctx.fillRect(lx - 16, 150, 32, 3);
    ctx.fillStyle = pal(18); ctx.fillRect(lx - 16, 150, (32 * Math.min(30, G.sync) / 30) | 0, 3);
  }
  if (G.state === 'fork') {
    var plx = carX(2) + 6 - camX;
    draw('ladder', 0, plx - 6, 160);
    draw('goldmark', ((G.tick / 8) | 0) % 2, plx - 6, 138);
    textColorC('PAY CAR', plx, 128, 1, pal(10));
    var ex = G.exitX - camX;
    if (ex < W + 30) { draw('exitsign', 0, ex, 216); draw('marker', ((G.tick / 8) | 0) % 2, ex + 6, 206); textColorC('RIDE OUT', ex + 12, 196, 1, pal(18)); }
  }

  // lockbox
  if (G.lockbox && (G.state === 'lock' || G.state === 'cash' || G.state === 'paycar' || G.state === 'ret')) {
    var L = G.lockbox, lbf = L.open ? (L.burstT-- > 0 ? 3 : 2) : (L.pinL || L.pinR ? 1 : 0);
    draw('lockbox', lbf, L.x - 20 - camX, L.y - 40);
    if (!L.open && (G.state === 'lock' || (G.state === 'paycar' && !G.ents.some(function (e) { return e.tag === 'marshal' && !e.dead; })))) {
      textColorC('BLAST THE LOCKS', L.x - camX, L.y - 56, 1, pal(10));
    }
    if (G.state === 'paycar') textColorC('' + Math.ceil(G.payT / 60), L.x - camX, L.y - 68, 1, G.payT < 240 ? pal(7) : pal(15));
  }

  // dynamites
  G.dynamites.forEach(function (dn) {
    if (dn.boomed) return;
    var fr2 = dn.air ? ((G.tick / 6) | 0) % 2 : (dn.fuse < 20 ? ((G.tick / 3) | 0) % 2 : ((G.tick / 8) | 0) % 2);
    draw('dyn', fr2, dn.x - 4 - camX, dn.y - 4);
    if (!dn.air && dn.fuse < 30) { ctx.fillStyle = pal(7); ctx.fillRect(dn.x - camX - 1, dn.y - 10, 2, 2); }
  });

  // enemies
  G.ents.forEach(function (e) {
    if (e.dead || e.hidden) return;
    var ex2 = e.x - camX;
    if (e.tag === 'hatch' && e.rise === undefined) { }
    var pose = e.telT > 12 ? 'g_tel' : e.telT > 0 ? 'g_fire' : 'g_idle';
    var fi2 = ((G.tick / 10) | 0) % 2;
    if (e.rise > 0) { ctx.save(); ctx.beginPath(); ctx.rect(ex2 - 24, e.y - 64, 48, 64); ctx.clip(); draw(pose, fi2, ex2 - 20, e.y - 64 + e.rise * 2, true); ctx.restore(); }
    else draw(pose, fi2, ex2 - 20, e.y - 64, e.x > G.player.x);
    if (e.tag === 'marshal') { ctx.fillStyle = pal(10); ctx.fillRect(ex2 - 8, e.y - 70, 16 * (e.hp / 4), 2); }
    if (e.telT > 0 && e.telT <= 12 && SAVE.settings.flash) { ctx.fillStyle = pal(7); ctx.fillRect(ex2 - 2, e.y - 70, 4, 4); }
    else if (e.telT > 12) { ctx.fillStyle = pal(7); if ((G.tick / 4 | 0) % 2) ctx.fillRect(ex2 - 2, e.y - 70, 4, 4); }
  });
  // hatch base
  if (G.state === 'relay') {
    var hatch = G.ents.find(function (e) { return e.tag === 'hatch'; });
    if (hatch) { ctx.fillStyle = pal(1); ctx.fillRect(hatch.x - 12 - camX, ROOF_Y - 4, 24, 4); if (hatch.warnT > 0 && (G.tick / 4 | 0) % 2) { ctx.fillStyle = pal(7); ctx.fillRect(hatch.x - 12 - camX, ROOF_Y - 4, 24, 2); } }
  }

  // law rider (chase + pursuit)
  if ((G.state === 'chase' || G.state === 'fork' || G.state === 'escape') && G.lawRider && !G.lawRider.dead) {
    var L2 = G.lawRider;
    draw('horse', (L2.anim | 0) % 4, L2.x - 40 - camX, L2.y - 56);
    draw('law', L2.telT > 0 ? 1 : 0, L2.x - 22 - camX, L2.y - 74);
    if (L2.telT > 0 && (G.tick / 4 | 0) % 2) { ctx.fillStyle = pal(7); ctx.fillRect(L2.x - camX - 2, L2.y - 82, 4, 4); }
  }

  // horse + mounted player OR roof player
  var Ph = G.player;
  var horseVisible = (G.state !== 'title');
  if (horseVisible && (Ph.on === 'horse' || G.state === 'ret' || G.state === 'leap' || (Ph.on !== 'horse' && (G.state === 'chase' || G.state === 'board')))) {
    var Hs = G.horse;
    var hy = (Ph.on === 'horse' ? Ph.y : Hs.y) - 56;
    draw('horse', (Hs.anim | 0) % 4, Hs.x - 40 - camX, hy);
    if (Ph.on === 'horse' && !(Ph.iframes > 0 && (G.tick % 4) < 2)) {
      draw('rider', Ph.fireAnim > 0 ? 1 : 0, Hs.x - 22 - camX, hy - 18, Ph.face < 0);
    }
    if (G.state === 'ret') { draw('marker', ((G.tick / 8) | 0) % 2, Hs.x - 6 - camX, hy - 14); }
  }
  if (Ph.on === 'roof' || Ph.on === 'air') {
    if (!(Ph.iframes > 0 && (G.tick % 4) < 2)) {
      var name2 = 'p_idle', fi3 = ((G.tick / 12) | 0) % 2;
      if (Ph.on === 'air') { name2 = 'p_jump'; fi3 = 0; }
      else if (Ph.reload > 0) name2 = 'p_reload';
      else if (Ph.fireAnim > 0) name2 = 'p_fire';
      else if (Math.abs(IN.moveX) > 0) { name2 = 'p_run'; fi3 = (Ph.anim | 0) % 4; }
      else if (G.state === 'cash') name2 = 'p_grab';
      draw(name2, fi3, Ph.x - 20 - camX, Ph.feetY - 64, Ph.face < 0);
    }
  }

  // bullets
  ctx.fillStyle = pal(31);
  G.bullets.forEach(function (b) { ctx.fillRect((b.x - camX) | 0, b.y | 0, 3, 2); });
  ctx.fillStyle = pal(7);
  G.ebullets.forEach(function (b) { ctx.fillRect((b.x - camX) | 0, b.y | 0, 3, 3); });

  // coins/cash
  G.coins.forEach(function (c2) {
    if (c2.core) draw('cashcore', 0, c2.x - 10 - camX, c2.y - 8);
    else draw('coin', ((G.tick / 7) | 0) % 2, c2.x - 6 - camX, c2.y - 6);
  });

  // fx
  G.fxs.forEach(function (f) {
    var fx2 = f.x - camX;
    if (f.kind === 'boom') draw('boom', Math.min(2, (f.t / 8) | 0), fx2 - 24 + (f.small ? 6 : 0), f.y - 24 + (f.small ? 6 : 0));
    else if (f.kind === 'dust') draw('dust', Math.min(2, (f.t / 6) | 0), fx2 - 8, f.y - 8);
    else if (f.kind === 'muzzle') draw('muzzle', (f.t / 3 | 0) % 2, fx2 - 3, f.y - 3);
    else if (f.kind === 'text') textColorC(f.txt, fx2, f.y, 1, f.gold ? pal(10) : pal(15));
  });
  ctx.restore();

  // ---- flash cue (accessibility-limited) ----
  if (G.flashT > 0 && SAVE.settings.flash) { ctx.fillStyle = 'rgba(255,240,164,0.25)'; ctx.fillRect(0, 0, W, H); }

  // ---- HUD (≤24 px tall, <12% of screen) ----
  if (G.state !== 'title' && G.state !== 'results') {
    for (var h2 = 0; h2 < K.hearts; h2++) draw('heart', h2 < P.hearts ? 0 : (h2 === P.hearts && P.hurtT > 0 ? 1 : 2), 4 + h2 * 14, 4);
    for (var a2 = 0; a2 < K.ammo; a2++) draw('bullet', a2 < P.ammo ? 0 : 1, 48 + a2 * 6, 4);
    if (P.reload > 0) {
      var rw = 34, prog = 1 - P.reload / K.reloadTicks;
      ctx.fillStyle = pal(1); ctx.fillRect(48, 18, rw, 3);
      // perfect notch (4-10 ticks remaining)
      var nx = 48 + rw * (1 - K.perfectHi / K.reloadTicks), nw = rw * (K.perfectHi - K.perfectLo) / K.reloadTicks;
      ctx.fillStyle = pal(10); ctx.fillRect(nx | 0, 18, Math.max(2, nw | 0), 3);
      ctx.fillStyle = pal(15); ctx.fillRect(48, 18, (rw * prog) | 0, 2);
    }
    textColor('$' + G.cashLoose, W - 4 - textW2('$' + G.cashLoose, 1), 4, 1, pal(10));
    textColor('BANK $' + G.cashBanked, W - 4 - textW2('BANK $' + G.cashBanked, 1), 14, 1, pal(15));
    if (G.chain > 1) {
      var cw = 30;
      ctx.fillStyle = pal(1); ctx.fillRect(W / 2 - cw / 2, 4, cw, 3);
      ctx.fillStyle = pal(10); ctx.fillRect(W / 2 - cw / 2, 4, (cw * G.chainT / K.chainWindow) | 0, 3);
      textColorC('X' + Math.min(G.chain, 5), W / 2, 9, 1, pal(10));
    }

  }

  // ---- screens ----
  if (G.state === 'title') renderTitle();
  if (G.state === 'results') renderResults();
  if (G.paused) {
    ctx.fillStyle = 'rgba(21,20,33,0.6)'; ctx.fillRect(0, 0, W, H);
    textColorC('PAUSED', W / 2, 120, 2, pal(15));
    textColorC('P: RESUME  R: RETRY SEED', W / 2, 145, 1, pal(29));
  }
}

function renderTitle() {
  ctx.fillStyle = 'rgba(21,20,33,0.35)'; ctx.fillRect(0, 0, W, 116);
  textColorC('TINY WEST', W / 2, 34, 3, pal(10));
  textColorC('RAMPAGE EXPRESS', W / 2, 62, 1, pal(15));
  textColorC('CHASE - BOARD - BLAST - CASH - RETURN - ESCAPE', W / 2, 76, 1, pal(29));
  if (((G.tick / 30) | 0) % 2) textColorC('PRESS ENTER OR TAP TO RIDE', W / 2, 96, 1, pal(18));
  textColorC('MOVE: ARROWS/WASD   JUMP: Z/SPACE   FIRE: X/J', W / 2, 232, 1, pal(29));
  textColorC('SEED ' + (pendingSeed || G.seed) + '  (S: NEW SEED)', W / 2, 244, 1, pal(29));
  var s = SAVE.settings;
  textColorC('1 ASSIST:' + (s.assist ? 'ON' : 'OFF') + '  2 SHAKE:' + (s.shake ? 'ON' : 'LOW') + '  3 FLASH:' + (s.flash ? 'ON' : 'LOW') + '  M SOUND:' + (s.muted ? 'OFF' : 'ON'), W / 2, 256, 1, pal(26));
  if (SAVE.records.best > 0) textColorC('BEST ' + SAVE.records.best, W / 2, 110, 1, pal(10));
}
function renderResults() {
  ctx.fillStyle = 'rgba(21,20,33,0.72)'; ctx.fillRect(0, 0, W, H);
  var ok = G.resultTitle.indexOf('CLEAN') >= 0;
  textColorC(G.resultTitle, W / 2, 34, 2, ok ? pal(10) : pal(7));
  var final = finalScore();
  var lines = [
    ['BANKED CASH', '$' + G.cashBanked],
    ['ACTION SCORE', '' + G.score],
    ['RAMPAGE SHARE', (G.score > 0 ? Math.round(100 * G.heistScore / Math.max(1, G.heistScore + G.killScore)) : 0) + '%'],
    ['BEST CHAIN', 'X' + Math.min(G.bestChain, 99)],
    ['ESCAPE BONUS', 'X' + G.resultMult.toFixed(2)],
    ['FINAL', '' + final],
    ['MEDAL', medalFor(final)],
  ];
  var y = 66;
  lines.forEach(function (l) {
    textColor(l[0], W / 2 - 100, y, 1, pal(29));
    textColor(l[1], W / 2 + 100 - textW2(l[1], 1), y, 1, l[0] === 'MEDAL' || l[0] === 'FINAL' ? pal(10) : pal(15));
    y += 14;
  });
  textColorC('BEST ' + SAVE.records.best + '   SEED ' + G.seed, W / 2, y + 8, 1, pal(26));
  if (((G.tick / 30) | 0) % 2) textColorC('R: SAME SEED   ENTER: NEW SEED', W / 2, y + 26, 1, pal(18));
  textColorC(G.payRaided ? 'PAY CAR RAIDED' : G.payDone ? 'PAY CAR TIMED OUT' : (G.forkChoice === 'out' ? 'CLEAN RIDE OUT' : ''), W / 2, y + 40, 1, pal(29));
}

/* ---------------- main loop ---------------- */
var raf = 0, last = 0, acc = 0;
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!last) last = now;
  var dt = Math.min(120, now - last); last = now;
  acc += dt;
  var steps = 0;
  while (acc >= STEP && steps < 5) {
    sampleInput();
    metaInput();
    if (!G.paused && G.state !== 'title') tick();
    else if (G.state === 'title') { G.tick++; G.horse.anim += 0.21; }
    clearLatches();
    acc -= STEP; steps++;
  }
  if (steps === 5) acc = 0; // drop backlog: no runaway catch-up
  // music state from game state
  var ms = 0, S = G.state;
  if (S === 'chase' || S === 'board') ms = 1;
  else if (S === 'settle' || S === 'relay' || S === 'lock') ms = 2;
  else if (S === 'cash' || S === 'ret' || S === 'leap') ms = 3;
  else if (S === 'fork' || S === 'paycar' || S === 'pcleap' || S === 'escape') ms = 4;
  if (ms) Audio2.setMusicState(ms);
  Audio2.tickMusic();
  while (audioQ.length) Audio2.sfx(audioQ.shift());
  render();
}

/* ---------------- boot + shell ---------------- */
function boot() {
  decodeAtlas();
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;
  ctx.imageSmoothingEnabled = false;

  window.addEventListener('keydown', function (e) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter'].indexOf(e.code) >= 0) e.preventDefault();
    // latch on every genuine press (e.repeat filters OS auto-repeat, so holding
    // never auto-fires, and a lost keyup can never brick the key)
    if (!e.repeat) kbLatch[e.code] = true;
    kb[e.code] = true;
    Audio2.unlock();
  });
  window.addEventListener('keyup', function (e) { kb[e.code] = false; });
  window.addEventListener('blur', function () { clearAllInput(); if (G && G.state !== 'title' && G.state !== 'results') G.paused = true; });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearAllInput(); if (G && G.state !== 'title' && G.state !== 'results') G.paused = true; } });

  // touch: left zone joystick + right buttons (44px+ targets)
  var isCoarse = window.matchMedia && window.matchMedia('(pointer:coarse)').matches;
  setupTouch(isCoarse);
  window.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch' && !touch.on) setupTouch(true); });

  canvas.addEventListener('pointerdown', function () { Audio2.unlock(); touchStartTap = true; setTimeout(function () { touchStartTap = false; }, 120); });

  // scale canvas to viewport (integer preferred)
  function resize() {
    var pad = touch.on ? 110 : 24;
    var vw = (window.visualViewport && window.visualViewport.width) || window.innerWidth;
    var vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    var s = Math.min(vw / W, (vh - pad) / H);
    s = s >= 1 ? Math.floor(s) : Math.max(0.5, s);
    canvas.style.width = (W * s) + 'px';
    canvas.style.height = (H * s) + 'px';
  }
  window.addEventListener('resize', resize);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resize);
  resize();

  initRun(12345);
  raf = requestAnimationFrame(frame);
}
function setupTouch(on) {
  if (!on || touch.on) return;
  touch.on = true;
  var pads = document.getElementById('pads');
  pads.style.display = 'flex';
  pads.style.opacity = SAVE.settings.touchAlpha;
  var stick = document.getElementById('stick');
  var sOrigin = null;
  stick.addEventListener('pointerdown', function (e) { e.preventDefault(); Audio2.unlock(); sOrigin = { x: e.clientX, y: e.clientY }; stick.setPointerCapture(e.pointerId); });
  stick.addEventListener('pointermove', function (e) {
    if (!sOrigin) return;
    var dx = e.clientX - sOrigin.x, dy = e.clientY - sOrigin.y;
    touch.moveX = Math.abs(dx) > 12 ? Math.max(-1, Math.min(1, dx / 34)) : 0;
    touch.moveY = Math.abs(dy) > 12 ? Math.max(-1, Math.min(1, dy / 34)) : 0;
  });
  var endStick = function () { sOrigin = null; touch.moveX = touch.moveY = 0; };
  stick.addEventListener('pointerup', endStick);
  stick.addEventListener('pointercancel', endStick);
  var bind = function (id, downFn, upFn) {
    var el = document.getElementById(id);
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); Audio2.unlock(); downFn(); });
    el.addEventListener('pointerup', function (e) { e.preventDefault(); upFn(); });
    el.addEventListener('pointercancel', upFn);
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  };
  bind('btnJump', function () { touch.jump = true; touch.jumpEdge = true; }, function () { touch.jump = false; });
  bind('btnFire', function () { touch.fire = true; touch.fireEdge = true; }, function () { touch.fire = false; });
  bind('btnPause', function () { touch.pauseEdge = true; }, function () { });
  window.dispatchEvent(new Event('resize'));
}

/* ---------------- TinyWestTest API (development diagnostics) ---------------- */
function snapshot() {
  var P = G.player;
  return {
    tick: G.tick, state: G.state, seed: G.seed,
    px: Math.round(P.x * 10) / 10, py: Math.round(P.feetY * 10) / 10,
    hearts: P.hearts, ammo: P.ammo, reload: P.reload,
    cash: G.cashLoose, banked: G.cashBanked, score: G.score, chain: G.chain,
    trainX: Math.round(G.trainX * 10) / 10,
    ents: G.ents.map(function (e) { return [e.tag, Math.round(e.x), e.hp, e.dead ? 1 : 0]; }),
    bullets: G.bullets.length, ebullets: G.ebullets.length, coins: G.coins.length,
  };
}
function hashStr(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; }
window.TinyWestTest = {
  setSeed: function (s) { initRun(s >>> 0); return G.seed; },
  startSlice: function (s) { if (s !== undefined) initRun(s >>> 0); setState('chase', 'test_start'); return G.seed; },
  startRun: function (s) { return this.startSlice(s); },
  getState: function () { return G.state; },
  getSnapshot: snapshot,
  injectLogicalInput: function (framesArr) { inject = framesArr.slice(); return inject.length; },
  exportEventLog: function () { return G.log.slice(); },
  resetSave: function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } SAVE = loadSave(); return true; },
  skipToState: function (name) {
    var P = G.player;
    switch (name) {
      case 'relay': G.trainX = 520 + 0; P.on = 'roof'; P.x = carX(0) + 30; P.feetY = ROOF_Y; setState('relay', 'skip'); spawnRelay(); break;
      case 'lock': P.on = 'roof'; P.x = carX(1) + 40; P.feetY = ROOF_Y;
        G.lockbox = { x: carX(1) + 80, y: ROOF_Y, pinL: false, pinR: false, open: false, burstT: 0 };
        setState('lock', 'skip'); break;
      case 'ret': P.on = 'roof'; P.x = carX(1) + 80; P.feetY = ROOF_Y; G.horse.x = P.x - 10; G.cashLoose = G.cashLoose || 300; setState('ret', 'skip'); break;
      case 'fork': P.on = 'horse'; G.horse.x = P.x = carX(1) + 60; P.feetY = TRAIL_Y; G.cashBanked = G.cashBanked || 300; setState('fork', 'skip'); break;
      case 'paycar': P.on = 'roof'; P.x = carX(2) + 30; P.feetY = ROOF_Y; P.carIdx = 2; G.cashBanked = G.cashBanked || 300;
        G.ents.push({ tag: 'marshal', x: carX(2) + 120, y: ROOF_Y, hp: 4, telT: 0, cycleT: 110, anim: 0, dead: false, rise: 16 });
        G.lockbox = { x: carX(2) + 64, y: ROOF_Y, pinL: false, pinR: false, open: false, burstT: 0, pay: true };
        G.payT = K.payCarCap;
        setState('paycar', 'skip'); break;
      default: return 'unknown skip target: ' + name + ' (valid: relay, lock, ret, fork, paycar)';
    }
    return G.state;
  },
  runDeterminismCheck: function (seed, ticks) {
    seed = (seed || 777) >>> 0; ticks = ticks || 900;
    var trace = [];
    for (var i = 0; i < ticks; i++) trace.push({ moveX: i % 120 < 60 ? 1 : 0, jumpPressed: i % 97 === 0, firePressed: i % 41 === 0 });
    var saveG = G, saveInject = inject, saveQ = audioQ;
    audioQ = [];
    var runOnce = function () {
      initRun(seed); setState('chase', 'det_test');
      inject = trace.map(function (f) { return { moveX: f.moveX, jumpPressed: f.jumpPressed, firePressed: f.firePressed }; });
      var acc2 = '';
      for (var t = 0; t < ticks; t++) {
        sampleInput(); tick(); clearLatches();
        if (t % 30 === 0) acc2 += JSON.stringify(snapshot());
        if (G.state === 'results') break;
      }
      return hashStr(acc2 + JSON.stringify(snapshot()));
    };
    var h1 = runOnce(), h2 = runOnce();
    G = saveG; inject = saveInject; audioQ = saveQ;
    return { pass: h1 === h2, hashA: h1, hashB: h2 };
  },
  runSmokeTests: function () {
    var out = [];
    var det = this.runDeterminismCheck(4242, 600);
    out.push(['determinism', det.pass]);
    var saveG = G;
    initRun(999); setState('chase', 'smoke');
    out.push(['state_chase', G.state === 'chase']);
    out.push(['hearts3', G.player.hearts === 3]);
    out.push(['ammo6', G.player.ammo === 6]);
    this.skipToState('relay');
    out.push(['relay_ents', G.ents.length === 2]);
    G = saveG;
    return out;
  },
  constants: K,
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
