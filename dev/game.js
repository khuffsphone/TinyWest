/* ============================================================
   TINY WEST — a Sunset Riders tribute
   320x240 canvas, all art = 8x8 tiles hardcoded as base64
   (decoded at runtime into per-theme palette atlases)
   ============================================================ */
(function () {
'use strict';
var W = 320, H = 240;

/* ---------------- tile decode + atlases ---------------- */
function hexRGB(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
var TILES = TILE_B64.map(function (b64) {
  var bin = atob(b64), px = new Uint8Array(64);
  for (var i = 0; i < 32; i++) { var b = bin.charCodeAt(i); px[i * 2] = b >> 4; px[i * 2 + 1] = b & 15; }
  return px;
});
var PALRGB = {}, THEME_NAMES = Object.keys(THEMES);
THEME_NAMES.forEach(function (t) { PALRGB[t] = THEMES[t].pal.map(function (c) { return c ? hexRGB(c) : null; }); });

var ATLAS = {}, ATLASF = {}, ACOLS = 16;
function buildAtlas(pal, flip) {
  var rows = Math.ceil(TILES.length / ACOLS);
  var cv = document.createElement('canvas'); cv.width = ACOLS * 8; cv.height = rows * 8;
  var cx = cv.getContext('2d');
  var img = cx.createImageData(cv.width, cv.height);
  TILES.forEach(function (px, i) {
    var ox = (i % ACOLS) * 8, oy = (i / ACOLS | 0) * 8;
    for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) {
      var p = px[y * 8 + (flip ? 7 - x : x)];
      if (!p) continue;
      var rgb = pal[p], o = ((oy + y) * cv.width + ox + x) * 4;
      img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = 255;
    }
  });
  cx.putImageData(img, 0, 0); return cv;
}
THEME_NAMES.forEach(function (t) { ATLAS[t] = buildAtlas(PALRGB[t], false); ATLASF[t] = buildAtlas(PALRGB[t], true); });

/* ---------------- game object ---------------- */
var G = {
  mode: 'title', theme: 'day', stageN: 1, t: 0,
  camX: 0, bgAuto: 0, shake: 0, score: 0, hi: 0, stageScore: 0,
  ents: [], fx: [], stage: null, player: null, boss: null,
  banner: 0, clearT: 0, deadT: 0, muted: false, paused: false,
};
try { G.hi = +(localStorage.getItem('tinywest_hi') || 0); } catch (e) { }

var canvas, ctx;

/* ---------------- draw helpers ---------------- */
function col(i) { var c = THEMES[G.theme].pal[i]; return c || '#000'; }
function spr(name, x, y, flip) {
  var s = SPR[name]; if (!s) return;
  var at = flip ? ATLASF[G.theme] : ATLAS[G.theme];
  x |= 0; y |= 0;
  for (var r = 0; r < s.th; r++) for (var c = 0; c < s.tw; c++) {
    var sc = flip ? s.tw - 1 - c : c, tI = s.t[r * s.tw + sc];
    ctx.drawImage(at, (tI % ACOLS) * 8, (tI / ACOLS | 0) * 8, 8, 8, x + c * 8, y + r * 8, 8, 8);
  }
}
function sprS(name, x, y, scale, flip) { // scaled metasprite
  var s = SPR[name]; if (!s) return;
  var at = flip ? ATLASF[G.theme] : ATLAS[G.theme];
  x |= 0; y |= 0;
  for (var r = 0; r < s.th; r++) for (var c = 0; c < s.tw; c++) {
    var sc = flip ? s.tw - 1 - c : c, tI = s.t[r * s.tw + sc];
    ctx.drawImage(at, (tI % ACOLS) * 8, (tI / ACOLS | 0) * 8, 8, 8, x + c * 8 * scale, y + r * 8 * scale, 8 * scale, 8 * scale);
  }
}
/* tinted font */
var tintCache = {};
function glyph(ch, color) {
  var key = ch + '|' + color + '|' + G.theme, g = tintCache[key];
  if (g) return g;
  var s = SPR['f_' + ch]; if (!s) return null;
  var cv = document.createElement('canvas'); cv.width = 8; cv.height = 8;
  var c2 = cv.getContext('2d'), tI = s.t[0];
  c2.drawImage(ATLAS[G.theme], (tI % ACOLS) * 8, (tI / ACOLS | 0) * 8, 8, 8, 0, 0, 8, 8);
  c2.globalCompositeOperation = 'source-in'; c2.fillStyle = color; c2.fillRect(0, 0, 8, 8);
  tintCache[key] = cv; return cv;
}
function textW(str, scale) {
  scale = scale || 1; var w = 0;
  for (var i = 0; i < str.length; i++) w += (FONT_W[str[i].toUpperCase()] || 4) * scale;
  return w;
}
function text(str, x, y, color, scale) {
  color = color || '#f9ecd2'; scale = scale || 1; x |= 0; y |= 0;
  for (var i = 0; i < str.length; i++) {
    var ch = str[i].toUpperCase();
    if (ch !== ' ') { var g = glyph(ch, color); if (g) ctx.drawImage(g, 0, 0, 8, 8, x, y, 8 * scale, 8 * scale); }
    x += (FONT_W[ch] || 4) * scale;
  }
}
function textC(str, cx, y, color, scale) { text(str, cx - textW(str, scale) / 2, y, color, scale); }
function textSh(str, x, y, color, scale) { text(str, x + 1, y + 1, col(1), scale); text(str, x, y, color, scale); }
function textCSh(str, cx, y, color, scale) { textCSh0(str, cx, y, color, scale || 1); }
function textCSh0(str, cx, y, color, scale) { var x = cx - textW(str, scale) / 2; text(str, x + scale, y + scale, col(1), scale); text(str, x, y, color, scale); }

/* ---------------- input ---------------- */
var keys = {}, prevKeys = {}, latch = {};
var KEYMAP = {
  left: ['ArrowLeft', 'KeyA', 'V_LEFT'], right: ['ArrowRight', 'KeyD', 'V_RIGHT'],
  up: ['ArrowUp', 'KeyW', 'V_UP'], down: ['ArrowDown', 'KeyS', 'V_DOWN'],
  jump: ['Space', 'KeyZ', 'KeyK', 'V_JUMP'], fire: ['KeyX', 'KeyJ', 'KeyF', 'V_FIRE'],
  start: ['Enter', 'V_START'], pause: ['KeyP', 'Escape'], mute: ['KeyM'],
};
function down(a) { var ks = KEYMAP[a]; for (var i = 0; i < ks.length; i++) if (keys[ks[i]]) return true; return false; }
function pressed(a) { var ks = KEYMAP[a]; for (var i = 0; i < ks.length; i++) if (latch[ks[i]] || (keys[ks[i]] && !prevKeys[ks[i]])) return true; return false; }
function onKey(e, isDown) {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter'].indexOf(e.code) >= 0) e.preventDefault();
  if (isDown && !keys[e.code]) latch[e.code] = true; // survives down+up inside one tick
  keys[e.code] = isDown;
  if (isDown) Sound.unlock();
}

/* ---------------- sound (WebAudio chip synth) ---------------- */
var Sound = {
  ctx: null, nextStep: 0, step: 0,
  unlock: function () {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    }
    if (this.ctx.state === 'suspended') { var p = this.ctx.resume(); if (p && p.catch) p.catch(function () { }); }
  },
  env: function (type, f0, f1, dur, vol, delay) {
    if (!this.ctx || G.muted) return;
    var c = this.ctx, t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  noise: function (dur, vol, delay) {
    if (!this.ctx || G.muted) return;
    var c = this.ctx, t = c.currentTime + (delay || 0);
    var n = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; g.gain.value = vol; s.connect(g); g.connect(c.destination); s.start(t);
  },
  sfx: function (name) {
    switch (name) {
      case 'shoot': this.noise(0.07, 0.18); this.env('square', 900, 200, 0.08, 0.12); break;
      case 'eshoot': this.env('square', 340, 130, 0.1, 0.08); break;
      case 'hit': this.noise(0.12, 0.22); this.env('square', 240, 50, 0.14, 0.14); break;
      case 'hurt': this.env('sawtooth', 180, 55, 0.25, 0.2); this.noise(0.1, 0.15); break;
      case 'jump': this.env('square', 220, 520, 0.12, 0.1); break;
      case 'pickup': this.env('square', 660, 660, 0.07, 0.12); this.env('square', 990, 990, 0.09, 0.12, 0.07); break;
      case 'bosshit': this.env('square', 130, 45, 0.12, 0.16); break;
      case 'fall': this.env('sawtooth', 400, 60, 0.4, 0.15); break;
      case 'clear': [523, 659, 784, 1047].forEach(function (f, i) { Sound.env('square', f, f, 0.13, 0.13, i * 0.11); }); break;
      case 'over': [392, 330, 262, 196].forEach(function (f, i) { Sound.env('triangle', f, f, 0.2, 0.16, i * 0.16); }); break;
    }
  },
  // tiny per-theme sequencer: [bass 16 steps, lead 16 steps] midi (0 = rest)
  patterns: {
    day: { bass: [45, 0, 45, 0, 48, 0, 45, 0, 50, 0, 48, 0, 45, 0, 43, 0], lead: [69, 0, 0, 72, 0, 74, 0, 0, 76, 0, 74, 0, 72, 0, 69, 0], bpm: 132 },
    night: { bass: [41, 0, 0, 41, 0, 0, 44, 0, 41, 0, 0, 41, 0, 0, 39, 0], lead: [65, 0, 0, 0, 68, 0, 0, 0, 72, 0, 0, 68, 0, 0, 63, 0], bpm: 104 },
    forest: { bass: [38, 0, 38, 0, 0, 38, 0, 0, 41, 0, 41, 0, 0, 36, 0, 0], lead: [62, 0, 0, 65, 0, 0, 62, 0, 0, 69, 0, 0, 68, 0, 65, 0], bpm: 116 },
  },
  music: function () {
    if (!this.ctx || G.muted || G.mode === 'title' || G.paused) return;
    var p = this.patterns[G.theme], spb = 60 / p.bpm / 2, c = this.ctx;
    if (this.nextStep < c.currentTime) this.nextStep = c.currentTime + 0.05;
    while (this.nextStep < c.currentTime + 0.12) {
      var s = this.step % 16, mtof = function (m) { return 440 * Math.pow(2, (m - 69) / 12); };
      if (p.bass[s]) this.env('triangle', mtof(p.bass[s]), 0, spb * 0.9, 0.1, this.nextStep - c.currentTime);
      if (p.lead[s]) this.env('square', mtof(p.lead[s]), 0, spb * 0.8, 0.045, this.nextStep - c.currentTime);
      if (s % 4 === 2) this.noise(0.03, 0.04, this.nextStep - c.currentTime);
      this.step++; this.nextStep += spb;
    }
  },
};

/* ---------------- stages ---------------- */
function rngFor(seed) { var s = seed; return function () { return (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }; }

var STAGE_INFO = [
  { name: 'SUNDOWN EXPRESS', theme: 'day' },
  { name: 'MIDNIGHT RUN', theme: 'night' },
  { name: 'GHOST FOREST', theme: 'forest' },
];

function buildStage(n) {
  var rnd = rngFor(n * 999 + 7);
  var S = { n: n, theme: STAGE_INFO[n - 1].theme, name: STAGE_INFO[n - 1].name, props: [], spawns: [], platforms: [], train: [], obstacles: [] };
  if (n === 1) {
    S.type = 'ground'; S.length = 2200; S.groundY = 200; S.railY = 172;
    // train parked on the berm: cars then engine at front (right)
    var tx = 1000;
    ['t_flat', 't_car', 't_car', 't_flat', 't_car'].forEach(function (kind) {
      S.train.push({ kind: kind, x: tx }); tx += 56;
    });
    S.train.push({ kind: 't_engine', x: tx });
    // ground props
    for (var x = 120; x < S.length - 60; x += 90 + rnd() * 160) {
      var r = rnd(), sprN = r < 0.35 ? 'cactus' : r < 0.55 ? 'rock' : r < 0.75 ? 'fence' : 'skull';
      S.props.push({ spr: sprN, x: x, y: S.groundY - (sprN === 'cactus' ? 16 : 8) });
    }
    // enemies: ground walkers + flatcar gunners + roof walkers
    for (var sx = 300; sx < S.length - 400; sx += 130 + rnd() * 170) {
      S.spawns.push({ x: sx, type: 'walker', v: rnd() < 0.35 ? 'e2' : 'e' });
      if (rnd() < 0.3) S.spawns.push({ x: sx + 60, type: 'walker', v: 'e', behind: true });
    }
    S.train.forEach(function (c) {
      if (c.kind === 't_flat') S.spawns.push({ x: c.x - 150, type: 'gunner', gx: c.x + 24, gy: S.railY - 11, v: 'e' });
      if (c.kind === 't_car') S.spawns.push({ x: c.x - 150, type: 'roofer', gx: c.x + 24, y0: S.railY - 20, x0: c.x + 4, x1: c.x + 44, v: 'e2' });
    });
    S.pickups = [{ x: 500, kind: 'heart' }, { x: 1100, kind: 'pgun' }, { x: 1600, kind: 'gem' }];
    S.bossX = S.length - 120;
  } else if (n === 2) {
    S.type = 'train'; S.railY = 222; S.roofY = 180; S.scale = 2;
    var cars = 13, pitch = 120, x0 = 120;
    for (var i = 0; i < cars; i++) {
      S.train.push({ kind: 't_car', x: x0 + i * pitch, i: i });
      S.platforms.push({ x: x0 + i * pitch, w: 96, y: S.roofY });
    }
    var ex = x0 + cars * pitch + 8;
    S.train.push({ kind: 't_engine', x: ex, i: cars });
    S.platforms.push({ x: ex, w: 88, y: S.roofY - 4 });
    S.length = ex + 200;
    for (var j = 1; j < cars; j++) {
      var cx2 = x0 + j * pitch;
      if (j % 3 === 1) S.spawns.push({ x: cx2 - 170, type: 'roofer', gx: cx2 + 30, y0: S.roofY, x0: cx2 + 4, x1: cx2 + 88, v: j % 2 ? 'e' : 'e2' });
      if (j % 4 === 2) S.spawns.push({ x: cx2 - 150, type: 'popper', gx: cx2 + 4, gy: S.roofY, v: 'e' });
    }
    S.pickups = [{ x: 560, kind: 'heart' }, { x: 1050, kind: 'pgun' }, { x: 1420, kind: 'heart' }, { x: 900, kind: 'gem' }];
    S.bossX = ex + 40;
  } else {
    S.type = 'ride'; S.length = 2300; S.groundY = 150; S.waterY = 150; S.pathY = 172;
    for (var tx3 = 20; tx3 < S.length + 500; tx3 += 26 + rnd() * 40) {
      S.props.push({ spr: 'tree', x: tx3, y: 150 - 32 + (rnd() * 10 | 0), back: true });
      if (rnd() < 0.22) S.props.push({ spr: 'eyes', x: tx3 + 10, y: 116 + rnd() * 20, eyes: true });
    }
    for (var fx3 = 200; fx3 < S.length + 400; fx3 += 260 + rnd() * 300) {
      S.props.push({ spr: 'tree', x: fx3, y: 176, fg: true });
    }
    for (var ox = 350; ox < S.length - 380; ox += 150 + rnd() * 200) {
      S.obstacles.push({ x: ox, y: 186 + rnd() * 40, spr: rnd() < 0.5 ? 'rock' : 'skull' });
    }
    for (var wx = 420; wx < S.length - 400; wx += 170 + rnd() * 220) {
      S.spawns.push({ x: wx, type: 'wolf', front: rnd() < 0.65 });
      if (rnd() < 0.4) S.spawns.push({ x: wx + 80, type: 'shooter3', gx: wx + 380, gy: 186 + rnd() * 36 });
    }
    S.pickups = [{ x: 700, kind: 'heart' }, { x: 1300, kind: 'pgun' }, { x: 1800, kind: 'heart' }];
    S.bossX = S.length - 60;
  }
  return S;
}

/* ---------------- entities ---------------- */
function newPlayer(S) {
  return {
    x: S.type === 'train' ? 150 : 40, y: S.type === 'train' ? S.roofY : S.type === 'ride' ? 200 : S.groundY,
    vx: 0, vy: 0, onGround: true, facing: 1, hp: 4, maxHp: 4,
    iframes: 0, fireCd: 0, rapid: 0, anim: 0, shootT: 0, dead: false,
  };
}
function spawnEnt(sp, S) {
  var e = { type: sp.type, v: sp.v || 'e', t: 0, hp: 2, w: 12, h: 14, vx: 0, vy: 0, flash: 0 };
  var P = G.player;
  if (sp.type === 'walker') {
    e.x = sp.behind ? G.camX - 30 : G.camX + W + 20; e.y = S.groundY; e.spd = 0.4 + Math.random() * 0.25; e.shootT = 100 + Math.random() * 80;
  } else if (sp.type === 'roofer') {
    e.x = sp.gx; e.y = sp.y0; e.x0 = sp.x0; e.x1 = sp.x1; e.spd = 0.35; e.dir = 1; e.shootT = 80 + Math.random() * 90; e.hp = 2;
  } else if (sp.type === 'gunner') {
    e.x = sp.gx; e.y = sp.gy; e.hp = 1; e.shootT = 70 + Math.random() * 60; e.stat = true;
  } else if (sp.type === 'popper') {
    e.x = sp.gx; e.y = sp.gy; e.hp = 1; e.shootT = 60; e.stat = true; e.pop = true; e.hidden = 40;
  } else if (sp.type === 'wolf') {
    e.x = sp.front ? G.camX + W + 24 : G.camX - 24; e.y = 170 + Math.random() * 55;
    e.w = 14; e.h = 8; e.hp = 1; e.spd = 1.5 + Math.random() * 0.5; e.wolf = true;
  } else if (sp.type === 'shooter3') {
    e.x = G.camX + W + 20; e.y = sp.gy; e.hp = 2; e.shootT = 60; e.stat = true; e.drift = true;
  }
  G.ents.push(e);
}
function spawnBoss(S) {
  var hp = [26, 32, 40][S.n - 1];
  var y = S.type === 'train' ? S.roofY - 4 : S.type === 'ride' ? 200 : S.groundY;
  G.boss = { type: 'boss', x: S.bossX, y: y, w: 14, h: 20, hp: hp, maxHp: hp, t: 0, st: 'idle', stT: 40, vx: 0, flash: 0, dir: -1 };
  G.ents.push(G.boss);
}
function pbullet(x, y, vx, vy) {
  G.ents.push({ type: 'pb', x: x, y: y, vx: vx, vy: vy, w: 6, h: 4, t: 0, life: 80 });
  addFx({ spr: 'muzzle', x: x - 4 + (vx > 0 ? 2 : vx < 0 ? -2 : 0), y: y - 4 - (vy < 0 ? 4 : 0), life: 5, flip: vx < 0 });
  Sound.sfx('shoot');
}
function ebullet(x, y, tx, ty, spd) {
  var dx = tx - x, dy = ty - y, d = Math.max(1, Math.hypot(dx, dy));
  G.ents.push({ type: 'eb', x: x, y: y, vx: dx / d * spd, vy: dy / d * spd, w: 4, h: 4, t: 0, life: 240 });
  Sound.sfx('eshoot');
}
function addFx(f) { if (G.paused || G.fx.length >= 300) return; G.fx.push(f); }
function poof(x, y, big) {
  addFx({ spr: 'poof1', x: x - 8, y: y - 8, life: 8 });
  addFx({ spr: 'poof2', x: x - 8, y: y - 8, life: 16, delay: 6 });
  if (big) for (var i = 0; i < 4; i++) addFx({ spr: 'poof2', x: x - 16 + Math.random() * 24, y: y - 16 + Math.random() * 24, life: 14, delay: 4 + i * 5 });
  addFx({ spr: 'poof3', x: x - 8, y: y - 8, life: 10, delay: 14 });
}
function dropPickup(x, y) {
  var r = Math.random(), fl = G.stage.type !== 'ground';
  if (r < 0.1) G.ents.push({ type: 'pickup', kind: 'heart', x: x, y: y, w: 8, h: 8, t: 0, float: fl });
  else if (r < 0.2) G.ents.push({ type: 'pickup', kind: 'pgun', x: x, y: y, w: 8, h: 8, t: 0, float: fl });
  else if (r < 0.45) G.ents.push({ type: 'pickup', kind: 'gem', x: x, y: y, w: 8, h: 8, t: 0, float: fl });
}
function overlap(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && (a.y - a.h / 2) - (b.y - b.h / 2) < (a.h + b.h) / 2 && (b.y - b.h / 2) - (a.y - a.h / 2) < (a.h + b.h) / 2;
}

/* ---------------- flow ---------------- */
function startStage(n) {
  G.stageN = n; G.stage = buildStage(n); G.theme = G.stage.theme;
  G.ents = []; G.fx = []; G.boss = null; G.camX = 0; G.bgAuto = 0;
  var keepHp = G.player && !G.player.dead ? G.player.hp : 4;
  G.player = newPlayer(G.stage); G.player.hp = keepHp;
  G.stage.spawns.sort(function (a, b) { return a.x - b.x; });
  G.stageScore = G.score;
  G.stage.spawnIdx = 0; G.stage.pickups.forEach(function (p) {
    var y = G.stage.type === 'train' ? G.stage.roofY - 14 : G.stage.type === 'ride' ? 185 + (p.x % 40) : G.stage.groundY - 10;
    G.ents.push({ type: 'pickup', kind: p.kind, x: p.x, y: y, w: 8, h: 8, t: 0, float: true });
  });
  G.mode = 'intro'; G.banner = 110; Sound.step = 0;
}
function gameOver() {
  G.mode = 'gameover'; Sound.sfx('over');
  try { if (G.score > G.hi) { G.hi = G.score; localStorage.setItem('tinywest_hi', G.hi); } } catch (e) { }
}
function stageClear() {
  G.mode = 'clear'; G.clearT = 160; G.score += 1000; Sound.sfx('clear');
  if (G.player) G.player.hp = Math.min(G.player.maxHp, G.player.hp + 1);
}

/* ---------------- update ---------------- */
function update() {
  G.t++;
  var S = G.stage, P = G.player;

  if (pressed('mute')) { if (window.__TW_TOGGLE_MUTE) window.__TW_TOGGLE_MUTE(); else G.muted = !G.muted; }

  if (G.mode === 'title') {
    titleT++;
    if (titleT % 6 === 0) addFx({ spr: 'dust', x: 48, y: 192, life: 10 });
    updateFx();
    if (pressed('start') || pressed('fire') || pressed('jump')) { G.score = 0; G.player = null; startStage(getStartStage()); }
    return;
  }
  if (pressed('pause') && (G.mode === 'play' || G.mode === 'boss')) G.paused = !G.paused;
  if (G.paused) return;

  if (G.mode === 'intro') { G.banner--; if (G.banner <= 0) G.mode = 'play'; return; }
  if (G.mode === 'gameover') {
    updateFx();
    if (pressed('start')) { G.score = G.stageScore; startStage(G.stageN); }
    return;
  }
  if (G.mode === 'win') {
    updateFx();
    if (pressed('start')) { G.mode = 'title'; G.player = null; }
    return;
  }
  if (G.mode === 'clear') {
    G.clearT--;
    updateFx();
    if (G.clearT <= 0) { if (G.stageN < 3) startStage(G.stageN + 1); else { G.mode = 'win'; try { if (G.score > G.hi) { G.hi = G.score; localStorage.setItem('tinywest_hi', G.hi); } } catch (e) { } } }
    return;
  }

  /* ---- playing ---- */
  if (P.dead) {
    G.deadT--;
    updateFx();
    if (G.deadT <= 0) gameOver();
    return;
  }

  // spawns triggered by camera
  var spawns = S.spawns;
  while (S.spawnIdx < spawns.length && spawns[S.spawnIdx].x < G.camX + W + 40) {
    var active = 0;
    for (var n2 = 0; n2 < G.ents.length; n2++) if (G.ents[n2].hp) active++;
    if (active >= 8) break; // defer until room frees up
    spawnEnt(spawns[S.spawnIdx++], S);
  }
  // boss trigger
  if (!G.boss && G.camX + W > S.bossX - 60) { spawnBoss(S); G.mode = 'boss'; }

  updatePlayer(S, P);
  updateEnts(S, P);
  updateFx();
  Sound.music();

  // camera
  if (S.type === 'ride') {
    G.camX = Math.min(G.camX + 1.15, S.length - W);
    G.bgAuto += 1.4;
  } else {
    var target = P.x - 120;
    G.camX = Math.max(G.camX, Math.min(target, S.length - W));
    if (S.type === 'train') G.bgAuto += 2.6;
  }
  if (G.mode === 'boss') {
    var arenaCam = Math.min(S.bossX - W + 60, S.length - W);
    if (G.camX < arenaCam) G.camX = Math.min(arenaCam, G.camX + 2);
  }
  if (G.shake > 0) G.shake--;
}

function getStartStage() {
  var m = /[?&]stage=(\d)/.exec(location.search || '');
  return m ? Math.max(1, Math.min(3, +m[1])) : 1;
}

function hurtPlayer(P, n) {
  if (P.iframes > 0 || P.dead) return;
  P.hp -= n; P.iframes = 80; G.shake = 8; P.rapid = 0; Sound.sfx('hurt');
  if (P.hp <= 0) { P.dead = true; G.deadT = 80; poof(P.x, P.y - 8, true); }
}

function updatePlayer(S, P) {
  var spd = S.type === 'ride' ? 1.7 : 1.3;
  P.iframes > 0 && P.iframes--;
  P.fireCd > 0 && P.fireCd--;
  P.shootT > 0 && P.shootT--;

  if (S.type === 'ride') {
    // horseback: free movement in box, no jump
    var vx = (down('right') ? spd : 0) - (down('left') ? spd : 0);
    var vy = (down('down') ? 1.4 : 0) - (down('up') ? 1.4 : 0);
    P.x += vx + 1.15; P.y += vy; P.facing = 1;
    P.x = Math.max(G.camX + 16, Math.min(G.camX + W - (G.mode === 'boss' ? 110 : 30), P.x));
    P.y = Math.max(182, Math.min(232, P.y));
    P.anim += 0.22;
    // obstacles
    for (var i = 0; i < S.obstacles.length; i++) {
      var o = S.obstacles[i];
      if (Math.abs(o.x - P.x) < 12 && Math.abs(o.y - P.y) < 7) { hurtPlayer(P, 1); }
    }
    if (down('fire') && P.fireCd <= 0) {
      pbullet(P.x + 12, P.y - 10, 5, 0); P.fireCd = P.rapid > 0 ? 6 : 13; P.shootT = 10;
    }
  } else {
    // on foot
    var mv = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
    P.vx = mv * spd;
    if (mv) { P.facing = mv; P.anim += 0.18; } else P.anim = 0;
    if (pressed('jump') && P.onGround) { P.vy = -5.4; P.onGround = false; Sound.sfx('jump'); }
    P.vy = Math.min(P.vy + 0.34, 6);
    P.x += P.vx; P.y += P.vy;
    P.x = Math.max(G.camX + 8, Math.min(S.length - 8, P.x));

    if (S.type === 'ground') {
      if (P.y >= S.groundY) { P.y = S.groundY; P.vy = 0; P.onGround = true; }
    } else { // train roofs
      P.onGround = false;
      if (P.vy >= 0) {
        for (var j = 0; j < S.platforms.length; j++) {
          var pl = S.platforms[j];
          if (P.x > pl.x - 4 && P.x < pl.x + pl.w + 4 && P.y >= pl.y && P.y - P.vy <= pl.y + 2) {
            P.y = pl.y; P.vy = 0; P.onGround = true; break;
          }
        }
      }
      if (P.y > S.railY + 10) { // fell between cars
        Sound.sfx('fall'); P.iframes = 0; hurtPlayer(P, 1);
        if (!P.dead) {
          var best = S.platforms[0];
          for (var b = 0; b < S.platforms.length; b++) if (S.platforms[b].x - 20 < P.x) best = S.platforms[b];
          P.x = Math.max(best.x + 12, Math.min(P.x, best.x + best.w - 12)); P.y = best.y - 30; P.vy = 0; P.iframes = 90;
        }
      }
    }
    // dust while running
    if (P.onGround && mv && G.t % 9 === 0) addFx({ spr: 'dust', x: P.x - 8 - mv * 4, y: P.y - 8, life: 12 });
    // shooting: hold up to fire upward
    if (down('fire') && P.fireCd <= 0) {
      if (down('up')) pbullet(P.x + 2 * P.facing, P.y - 18, 0, -5);
      else pbullet(P.x + 9 * P.facing, P.y - 9, 5 * P.facing, 0);
      P.fireCd = P.rapid > 0 ? 6 : 13; P.shootT = 10;
    }
  }
}

function updateEnts(S, P) {
  var i, e;
  for (i = G.ents.length - 1; i >= 0; i--) {
    e = G.ents[i]; e.t++;
    if (e.flash > 0) e.flash--;
    switch (e.type) {
      case 'pb':
        e.x += e.vx; e.y += e.vy;
        if (--e.life <= 0 || e.x < G.camX - 20 || e.x > G.camX + W + 20 || e.y < -10) { G.ents.splice(i, 1); continue; }
        var hit = false;
        for (var k = G.ents.length - 1; k >= 0; k--) {
          var t = G.ents[k];
          if (t.hp && t !== e && t.type !== 'pb' && t.type !== 'eb' && t.type !== 'pickup' && !(t.hidden > 0) && overlap(e, t)) {
            t.hp--; t.flash = 6; hit = true;
            if (t.type === 'boss') { Sound.sfx('bosshit'); G.shake = 3; }
            if (t.hp <= 0) {
              poof(t.x, t.y - t.h / 2, t.type === 'boss');
              G.score += t.type === 'boss' ? 0 : t.wolf ? 150 : 100;
              if (t.type !== 'boss') dropPickup(t.x, t.y);
              Sound.sfx('hit');
              if (t.type === 'boss') { G.boss = null; stageClear(); }
              var idx = G.ents.indexOf(t); if (idx >= 0) { G.ents.splice(idx, 1); if (idx < i) i--; }
            }
            break;
          }
        }
        if (hit) { var ii = G.ents.indexOf(e); if (ii >= 0) G.ents.splice(ii, 1); continue; }
        break;
      case 'eb':
        e.x += e.vx; e.y += e.vy;
        if (--e.life <= 0 || e.x < G.camX - 30 || e.x > G.camX + W + 30 || e.y > H + 10 || e.y < -10) { G.ents.splice(i, 1); continue; }
        if (P.iframes <= 0 && !P.dead && Math.abs(e.x - P.x) < 6 && Math.abs(e.y - (P.y - 8)) < 9) { hurtPlayer(P, 1); G.ents.splice(i, 1); continue; }
        break;
      case 'pickup':
        e.bob = Math.sin(e.t / 12) * 2;
        if (!e.float && S.type === 'ground') e.y = Math.min(e.y + 1.5, S.groundY - 4);
        if (Math.abs(e.x - P.x) < 10 && Math.abs(e.y - (P.y - 8)) < 14 && !P.dead) {
          if (e.kind === 'heart') P.hp = Math.min(P.maxHp, P.hp + 1);
          else if (e.kind === 'pgun') P.rapid = 1;
          else G.score += 250;
          Sound.sfx('pickup'); G.ents.splice(i, 1); continue;
        }
        if (e.x < G.camX - 40) { G.ents.splice(i, 1); continue; }
        break;
      case 'boss': updateBoss(S, P, e); break;
      default: updateEnemy(S, P, e, i); break;
    }
  }
}

function updateEnemy(S, P, e, i) {
  if (e.hidden > 0) { e.hidden--; return; }
  if (e.wolf) {
    if (e.lunge > 0) { e.lunge--; e.x += e.dir * 3; }
    else if (e.passed) { e.x += e.dir * 2.4; }
    else {
      var dx = P.x - e.x, dy = P.y - e.y;
      e.dir = dx < 0 ? -1 : 1;
      e.x += Math.sign(dx) * Math.min(e.spd, Math.abs(dx));
      e.y += Math.sign(dy) * Math.min(0.8, Math.abs(dy));
      if (Math.abs(dx) < 26) { e.lunge = 26; e.passed = true; } // dash past, then keep running off
    }
    if ((e.t > 40 && (e.x < G.camX - 90 || e.x > G.camX + W + 100)) || e.t > 1500) { G.ents.splice(i, 1); return; }
  } else if (e.stat) {
    if (e.drift) e.x -= 0.9; // stage-3 standing shooters slide past with the scroll
    e.shootT--;
    if (e.shootT <= 0 && e.x > G.camX - 8 && e.x < G.camX + W + 8 && Math.abs(e.x - P.x) < 300) {
      ebullet(e.x, e.y - 10, P.x, P.y - 8, 2.1);
      e.shootT = 90 + Math.random() * 70; e.fireAnim = 14;
      if (e.pop) e.hidden = 50 + Math.random() * 40;
    }
    if (e.fireAnim > 0) e.fireAnim--;
    if (e.x < G.camX - 60) { G.ents.splice(i, 1); return; }
  } else {
    // walker / roofer
    var tx = P.x, adx = tx - e.x;
    var range = e.x0 !== undefined ? 10 : 70;
    if (Math.abs(adx) > range) { e.x += Math.sign(adx) * e.spd; e.dir = Math.sign(adx) || 1; e.walkT = (e.walkT || 0) + 1; }
    if (e.x0 !== undefined) e.x = Math.max(e.x0, Math.min(e.x1, e.x));
    e.shootT--;
    if (e.shootT <= 0 && Math.abs(adx) < 260) {
      ebullet(e.x + (e.dir || 1) * 8, e.y - 9, P.x, P.y - 8, 2.0);
      e.shootT = 110 + Math.random() * 80; e.fireAnim = 14;
    }
    if (e.fireAnim > 0) e.fireAnim--;
    if (e.x < G.camX - 100) { G.ents.splice(i, 1); return; }
  }
  // contact damage
  if (!P.dead && P.iframes <= 0 && overlap({ x: P.x, y: P.y, w: 10, h: 14 }, e)) hurtPlayer(P, 1);
}

function updateBoss(S, P, e) {
  e.stT--;
  e.dir = P.x < e.x ? -1 : 1;
  if (e.st === 'idle' && e.stT <= 0) {
    var r = Math.random();
    if (r < 0.4) { e.st = 'volley'; e.stT = 60; e.shots = 3; }
    else if (r < 0.75) { e.st = 'move'; e.stT = 50; e.tx = (S.type === 'ride' ? S.bossX - 30 : S.bossX - 60) + Math.random() * 100; }
    else { e.st = 'rush'; e.stT = 42; e.vx = e.dir * 2.4; }
  } else if (e.st === 'volley') {
    if (e.stT % 16 === 0 && e.shots > 0) {
      e.shots--;
      for (var a = -1; a <= 1; a++) ebullet(e.x + e.dir * 10, e.y - 12, P.x + a * 40, P.y - 8 + a * 12, 2.3);
      e.fireAnim = 12;
    }
    if (e.stT <= 0) { e.st = 'idle'; e.stT = 50 + Math.random() * 40; }
  } else if (e.st === 'move') {
    e.x += Math.sign(e.tx - e.x) * 1.2;
    if (Math.abs(e.tx - e.x) < 3 || e.stT <= 0) { e.st = 'idle'; e.stT = 30; }
  } else if (e.st === 'rush') {
    e.x += e.vx;
    if (e.stT <= 0) { e.st = 'idle'; e.stT = 60; }
  }
  var lo = S.type === 'train' ? S.bossX - 130 : S.type === 'ride' ? S.bossX - 50 : S.bossX - 150, hi = S.length - 24;
  e.x = Math.max(lo, Math.min(hi, e.x));
  if (e.fireAnim > 0) e.fireAnim--;
  if (!P.dead && P.iframes <= 0 && overlap({ x: P.x, y: P.y, w: 10, h: 14 }, e)) hurtPlayer(P, 1);
}

function updateFx() {
  for (var i = G.fx.length - 1; i >= 0; i--) {
    var f = G.fx[i];
    if (f.delay > 0) { f.delay--; continue; }
    f.life--;
    if (f.rise) f.y -= 0.5;
    if (f.life <= 0) G.fx.splice(i, 1);
  }
}

/* ---------------- render ---------------- */
function render() {
  var S = G.stage, P = G.player, T = THEMES[G.theme];
  ctx.imageSmoothingEnabled = false;
  var shx = G.shake > 0 ? ((G.t % 2) * 2 - 1) * Math.min(3, G.shake) : 0;

  if (G.mode === 'title') { renderTitle(); return; }

  ctx.save();
  ctx.translate(shx, 0);

  // ----- sky -----
  ctx.fillStyle = T.sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = T.skyhi; ctx.fillRect(0, S.type === 'train' ? 150 : 120, W, S.type === 'train' ? 60 : 60);
  if (G.theme === 'day') {
    ctx.fillStyle = T.horizon; ctx.fillRect(0, 156, W, 16);
    spr('sun', 248 - (G.camX * 0.02 % 8), 22);
  } else if (G.theme === 'night') {
    drawStars();
    sprS('moon', 226, 26, 3);
  } else {
    drawStars();
  }

  // ----- parallax far -----
  if (S.type !== 'ride') {
    var fx0 = -((G.camX * 0.2 + G.bgAuto * 0.5) % 260);
    for (var m = fx0 - 260; m < W + 40; m += 130) spr('mesafar', m, S.type === 'train' ? 190 : 132);
    var cx0 = -((G.camX * 0.1 + G.bgAuto * 0.2 + G.t * 0.05) % 420);
    for (var c = cx0 - 420; c < W + 30; c += 140) spr('cloud', c, 30 + (c / 140 % 3 | 0) * 22);
    if (S.type === 'ground') {
      var mx0 = -((G.camX * 0.45) % 700);
      for (var mm = mx0 - 700; mm < W + 80; mm += 233) spr('mesa', mm, 116);
    }
  } else {
    // forest: background tree wall
    drawForestBg(S);
  }

  if (S.type === 'ground') renderStage1(S);
  else if (S.type === 'train') renderStage2(S);
  else renderStage3(S);

  // ----- entities -----
  drawEnts(S, P);
  if (S.type === 'ride') S.props.forEach(function (p) {
    if (!p.fg) return;
    var x = p.x - G.camX * 1.25;
    if (x < -60 || x > W + 60) return;
    sprS('tree', x, p.y - 24, 2);
  });
  // ----- fx (world coords) -----
  G.fx.forEach(function (f) { if (!(f.delay > 0)) spr(f.spr, f.x - G.camX, f.y, f.flip); });

  ctx.restore();

  renderHud(S, P);
  if (G.mode === 'intro') renderBanner(S);
  if (G.mode === 'clear') textCSh0('STAGE CLEAR!', W / 2, 96, '#f5cf4e', 2);
  if (G.mode === 'gameover') renderGameOver();
  if (G.mode === 'win') renderWin();
  if (G.paused) { dim(0.5); textCSh0('PAUSED', W / 2, 110, '#f9ecd2', 2); }
}

function dim(a) { ctx.fillStyle = 'rgba(10,8,16,' + a + ')'; ctx.fillRect(0, 0, W, H); }

function drawStars() {
  var n = SPR['stars1'] ? 2 : 0; if (!n) return;
  for (var y = 0; y < 96; y += 16) for (var x = 0; x < W; x += 16) {
    if ((x * 7 + y * 13) % 48 < 12) spr((x + y) % 32 ? 'stars1' : 'stars2', x, y);
  }
}

function drawForestBg(S) {
  // dark canopy overhead
  ctx.fillStyle = col(2); ctx.fillRect(0, 0, W, 44);
  ctx.fillStyle = col(1); ctx.fillRect(0, 0, W, 26);
  S.props.forEach(function (p) {
    if (!p.back) return;
    var x = p.x - G.camX * 0.85;
    if (x < -40 || x > W + 40) return;
    spr('tree', x, p.y);
  });
  // river band with tree reflections + sparkles
  ctx.fillStyle = col(15); ctx.fillRect(0, S.waterY, W, S.pathY - S.waterY);
  ctx.fillStyle = col(14); ctx.fillRect(0, S.waterY, W, 2);
  ctx.globalAlpha = 0.28; ctx.fillStyle = col(1);
  S.props.forEach(function (p) {
    if (!p.back) return;
    var x = p.x - G.camX * 0.85;
    if (x < -40 || x > W + 40) return;
    var jig = ((G.t >> 4) + (p.x >> 3)) % 2;
    ctx.fillRect((x + 6 + jig) | 0, S.waterY + 2, 10, S.pathY - S.waterY - 4);
    ctx.fillRect((x + 9 - jig) | 0, S.waterY + 2, 4, S.pathY - S.waterY - 2);
  });
  ctx.globalAlpha = 0.5; ctx.fillStyle = col(14);
  ctx.fillRect(0, S.waterY + 6, W, 1); ctx.fillRect(0, S.waterY + 13, W, 1);
  ctx.globalAlpha = 1;
  for (var sx2 = 0; sx2 < W; sx2 += 24) {
    if ((sx2 * 13 + (G.t >> 4) * 7) % 96 < 24) { ctx.fillStyle = col(10); ctx.fillRect(sx2 + ((G.t >> 3) % 24), S.waterY + 4 + (sx2 % 3) * 4, 2, 1); }
  }
  // glowing eyes between trunks
  S.props.forEach(function (p) {
    if (!p.eyes) return;
    var x = p.x - G.camX * 0.85;
    if (x < -40 || x > W + 40) return;
    if ((G.t / 40 | 0) % 3) spr('eyes', x, p.y);
  });
}

function tileRow(name, y, step, off) {
  var x0 = -((off !== undefined ? off : G.camX) % step) - step;
  for (var x = x0; x < W + step; x += step) spr(name, x, y);
}

function renderStage1(S) {
  // berm + track
  ctx.fillStyle = col(2); ctx.fillRect(0, S.railY + 4, W, S.groundY - S.railY - 4);
  tileRow('sandtop', S.railY + 4, 8);
  tileRow('track', S.railY - 4, 8);
  // train
  S.train.forEach(function (c) { drawTrainCar(c, S.railY, 1, false); });
  // foreground ground
  tileRow('sandtop', S.groundY, 8);
  for (var y = S.groundY + 8; y < H; y += 8) tileRow('sand', y, 8);
  // props
  S.props.forEach(function (p) {
    var x = p.x - G.camX; if (x < -20 || x > W + 20) return;
    spr(p.spr, x, p.y);
  });
}

function drawTrainCar(c, railY, scale, moving) {
  var x = (c.x - G.camX) * 1; if (scale === 2) x = c.x - G.camX;
  var wpx = (SPR[c.kind].tw * 8) * scale;
  if (x + wpx < -20 || x > W + 20) return;
  var bob = moving ? Math.round(Math.sin(G.t / 9 + (c.i || 0)) * 1) : 0;
  var bodyH = c.kind === 't_engine' ? 32 : 24;
  var by = railY - (c.kind === 't_engine' ? 27 : 20) * scale + bob;
  if (c.kind === 't_engine') by = railY - 27 * scale + bob;
  sprS(c.kind, x, by, scale);
  // wheels
  var wf = moving ? ((G.t / 5 | 0) % 2 ? 'wheel1' : 'wheel2') : 'wheel1';
  var n = c.kind === 't_engine' ? 3 : 2;
  for (var w = 0; w < n; w++) {
    var wx = x + (6 + w * ((wpx / scale - 20) / (n - 1))) * scale;
    sprS(wf, wx, railY - 8 * scale, scale);
  }
  // chimney smoke
  if (c.kind === 't_engine' && G.t % 14 === 0 && moving) {
    addFx({ spr: 'poof1', x: c.x + 33 * scale, y: railY - 30 * scale - 8, life: 30, rise: true });
  }
}

function renderStage2(S) {
  // rushing ground + track under wheels
  ctx.fillStyle = col(2); ctx.fillRect(0, S.railY + 8, W, H - S.railY - 8);
  var off = G.bgAuto * 2.4;
  tileRow('track', S.railY - 6, 8, off);
  tileRow('sand', S.railY + 10, 8, off * 1.1);
  // train cars (scaled 2x)
  S.train.forEach(function (c) { drawTrainCar(c, S.railY, 2, true); });
}

function renderStage3(S) {
  // path below the river
  ctx.fillStyle = col(6); ctx.fillRect(0, S.pathY, W, H - S.pathY);
  tileRow('fgroundtop', S.pathY, 8, G.camX);
  for (var y = S.pathY + 8; y < H; y += 8) tileRow('fground', y, 8, G.camX * (1 + (y - S.pathY) / 300));
  // obstacles
  S.obstacles.forEach(function (o) {
    var x = o.x - G.camX; if (x < -20 || x > W + 20) return;
    spr(o.spr, x - 4, o.y - 8);
  });
}

function drawEnts(S, P) {
  // pickups + enemies + bullets
  G.ents.forEach(function (e) {
    var x = e.x - G.camX;
    if (x < -40 || x > W + 60) return;
    if (e.flash > 0 && (G.t % 2)) return;
    switch (e.type) {
      case 'pb': spr('bullet', x - 4, e.y - 4, e.vx < 0); break;
      case 'eb': spr('ebullet', x - 4, e.y - 4); break;
      case 'pickup': spr(e.kind === 'heart' ? 'heart' : e.kind === 'pgun' ? 'pgun' : 'pip', x - 4, e.y - 8 + (e.bob || 0)); break;
      case 'boss': drawBoss(e, x); break;
      default: drawEnemy(e, x); break;
    }
  });
  if (!P.dead) drawPlayer(S, P);
}

function drawEnemy(e, x) {
  if (e.hidden > 0) return;
  var pre = e.v === 'e2' ? 'e2_' : 'e_';
  var flip = (e.dir || -1) < 0;
  var name;
  if (e.wolf) { name = (e.t / 8 | 0) % 2 ? 'wolf1' : 'wolf2'; spr(name, x - 8, e.y - 14, e.dir < 0); return; }
  if (e.fireAnim > 0) name = pre + 'shoot';
  else if (e.stat) name = pre + 'walk2';
  else name = (e.walkT / 9 | 0) % 2 ? pre + 'walk1' : pre + 'walk2';
  spr(name, x - 8, e.y - 16, flip);
  if (e.fireAnim > 10) spr('muzzle', x + (flip ? -14 : 6), e.y - 12, flip);
}

function drawBoss(e, x) {
  spr('boss1', x - 12, e.y - 21, e.dir < 0);
  if (e.fireAnim > 8) spr('muzzle', x + (e.dir < 0 ? -16 : 8), e.y - 14, e.dir < 0);
}

function drawPlayer(S, P) {
  if (P.iframes > 0 && (G.t % 4 < 2)) return; // blink
  var x = P.x - G.camX;
  if (S.type === 'ride') {
    var f = (P.anim | 0) % 2 ? 'h_run1' : 'h_run2';
    spr(f, x - 12, P.y - 16);
    if (P.shootT > 6) spr('muzzle', x + 10, P.y - 13);
    if (G.t % 5 === 0) addFx({ spr: 'dust', x: P.x - 14, y: P.y - 6, life: 10 });
  } else {
    var name = 'p_idle';
    if (!P.onGround) name = 'p_jump';
    else if (P.shootT > 0) name = 'p_shoot';
    else if (Math.abs(P.vx) > 0.1) name = (P.anim | 0) % 2 ? 'p_run1' : 'p_run2';
    spr(name, x - 8, P.y - 16, P.facing < 0);
  }
}

/* ---------------- HUD / overlays ---------------- */
function renderHud(S, P) {
  // hp pips
  var pips = Math.min(P.maxHp, 8);
  for (var i = 0; i < pips; i++) spr(i < P.hp ? 'pip' : 'pip_e', 8 + i * 9, 8);
  // rapid indicator
  if (P.rapid > 0) spr('pgun', 8, 18);
  // score
  textSh('SCORE ' + pad(G.score, 6), W - 8 - textW('SCORE 000000'), 9, '#f9ecd2');
  // boss bar
  if (G.boss) {
    var bw = 90, bx = W - bw - 8, byy = 22;
    ctx.fillStyle = col(1); ctx.fillRect(bx - 1, byy - 1, bw + 2, 7);
    ctx.fillStyle = col(2); ctx.fillRect(bx, byy, bw, 5);
    ctx.fillStyle = col(8); ctx.fillRect(bx, byy, Math.max(0, bw * G.boss.hp / G.boss.maxHp), 5);
    textSh('BOSS', bx - 30, byy - 1, '#f9ecd2');
  }
}
function pad(n, l) { var s = '' + n; while (s.length < l) s = '0' + s; return s; }

function renderBanner(S) {
  var a = Math.max(0, Math.min(1, G.banner / 20, (110 - G.banner) / 15));
  ctx.globalAlpha = a;
  ctx.fillStyle = col(1);
  ctx.fillRect(0, 92, W, 44);
  textCSh0('STAGE ' + S.n, W / 2, 100, '#f5cf4e', 2);
  textCSh0(S.name, W / 2, 120, '#f9ecd2', 1);
  ctx.globalAlpha = 1;
}

function renderGameOver() {
  dim(0.55);
  textCSh0('GAME OVER', W / 2, 92, '#d43d3d', 2);
  textCSh0('PRESS ENTER / TAP TO RETRY', W / 2, 122, '#f9ecd2', 1);
}
function renderWin() {
  dim(0.5);
  textCSh0('THE FRONTIER IS SAFE!', W / 2, 76, '#f5cf4e', 2);
  textCSh0('SCORE ' + pad(G.score, 6), W / 2, 108, '#f9ecd2', 1);
  textCSh0('BEST  ' + pad(G.hi, 6), W / 2, 122, '#f9ecd2', 1);
  textCSh0('PRESS ENTER FOR TITLE', W / 2, 148, '#9d99a8', 1);
}

/* ---------------- title screen ---------------- */
var titleT = 0;
function renderTitle() {
  G.theme = 'day';
  var T = THEMES.day;
  ctx.fillStyle = T.sky; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = T.skyhi; ctx.fillRect(0, 120, W, 50);
  ctx.fillStyle = T.horizon; ctx.fillRect(0, 152, W, 18);
  spr('sun', 250, 20);
  for (var m = -((titleT * 0.2) % 130) - 130; m < W + 40; m += 130) spr('mesafar', m, 130);
  for (var c = -((titleT * 0.4) % 140) - 140; c < W + 30; c += 140) spr('cloud', c, 34 + (c / 140 % 3 | 0) * 16);
  // track + moving train silhouette
  ctx.fillStyle = col(2); ctx.fillRect(0, 176, W, H - 176);
  var x0 = -((titleT * 0.9) % 8);
  for (var x = x0 - 8; x < W + 8; x += 8) spr('track', x, 168);
  var toff = W - ((titleT * 0.9) % (W + 500));
  [0, 56, 112, 168].forEach(function (dx, i) {
    drawTrainCar({ kind: i === 3 ? 't_engine' : i === 1 ? 't_flat' : 't_car', x: G.camX + toff + dx, i: i }, 172, 1, true);
  });
  // ground + galloping horse
  for (var y2 = 200; y2 < H; y2 += 8) tileRow('sand', y2, 8, titleT * 1.6);
  tileRow('sandtop', 200, 8, titleT * 1.6);
  spr((titleT / 7 | 0) % 2 ? 'h_run1' : 'h_run2', 60, 200 - 16);
  G.fx.forEach(function (f) { if (!(f.delay > 0)) spr(f.spr, f.x - G.camX, f.y, f.flip); });

  // logo
  textCSh0('TINY WEST', W / 2, 52, '#f5cf4e', 3);
  textCSh0('A SUNSET RIDERS TRIBUTE', W / 2, 82, '#f9ecd2', 1);
  if ((titleT / 30 | 0) % 2) textCSh0('PRESS ENTER OR TAP TO START', W / 2, 130, '#f9ecd2', 1);
  textCSh0('ARROWS/WASD MOVE  Z/SPACE JUMP  X/J FIRE', W / 2, 220, '#2e2434', 1);
  if (G.hi > 0) textCSh0('BEST ' + pad(G.hi, 6), W / 2, 108, '#2e2434', 1);
}

/* ---------------- main loop ---------------- */
var raf = 0, last = 0, acc = 0, STEP = 1000 / 60;
function frame(now) {
  raf = requestAnimationFrame(frame);
  if (!last) last = now;
  var dt = Math.min(100, now - last); last = now;
  acc += dt;
  var steps = 0;
  while (acc >= STEP && steps < 4) {
    update();
    for (var k in keys) prevKeys[k] = keys[k];
    for (var k2 in latch) delete latch[k2];
    acc -= STEP; steps++;
  }
  if (steps === 4) acc = 0;
  render();
}

/* ---------------- boot / React shell ---------------- */
function initGame(cv) {
  canvas = cv; ctx = canvas.getContext('2d');
  var kd = function (e) { onKey(e, true); }, ku = function (e) { onKey(e, false); };
  window.addEventListener('keydown', kd);
  window.addEventListener('keyup', ku);
  var pd = function () { Sound.unlock(); latch['V_START'] = true; keys['V_START'] = true; setTimeout(function () { keys['V_START'] = false; }, 80); };
  var onBlur = function () { for (var k in keys) keys[k] = false; };
  var onVis = function () { if (document.hidden) onBlur(); };
  window.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVis);
  canvas.addEventListener('pointerdown', pd);
  raf = requestAnimationFrame(frame);
  window.__TW = { G: G, startStage: startStage, Sound: Sound }; // debug/testing hook
  return {
    destroy: function () {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      canvas.removeEventListener('pointerdown', pd);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    },
  };
}

var e = React.createElement, useState = React.useState, useEffect = React.useEffect, useRef = React.useRef;

function TouchBtn(props) {
  var press = function (ev) { ev.preventDefault(); Sound.unlock(); keys[props.k] = true; };
  var release = function (ev) { ev.preventDefault(); keys[props.k] = false; };
  return e('button', {
    className: 'tbtn', onPointerDown: press, onPointerUp: release, onPointerLeave: release, onPointerCancel: release,
    onContextMenu: function (ev) { ev.preventDefault(); },
  }, props.label);
}

function App() {
  var cvRef = useRef(null);
  var wrapRef = useRef(null);
  var _m = useState(false), muted = _m[0], setMuted = _m[1];
  var _t = useState(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:coarse)').matches), touch = _t[0];

  useEffect(function () {
    var game = initGame(cvRef.current);
    var onResize = function () {
      var pad2 = touch ? 130 : 60;
      var s = Math.min((window.innerWidth - 12) / W, (window.innerHeight - pad2) / H);
      s = s >= 1 ? Math.floor(s) : Math.max(0.5, s);
      cvRef.current.style.width = W * s + 'px';
      cvRef.current.style.height = H * s + 'px';
    };
    onResize();
    window.addEventListener('resize', onResize);
    return function () { game.destroy(); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(function () { G.muted = muted; }, [muted]);

  useEffect(function () {
    window.__TW_TOGGLE_MUTE = function () { setMuted(function (m) { return !m; }); };
    return function () { delete window.__TW_TOGGLE_MUTE; };
  }, []);

  return e('div', { className: 'shell', ref: wrapRef },
    e('div', { className: 'frame' },
      e('canvas', { ref: cvRef, width: W, height: H, tabIndex: 0, 'aria-label': 'Tiny West game' })),
    e('div', { className: 'bar' },
      e('span', { className: 'brand' }, 'TINY WEST'),
      e('span', { className: 'hint' }, touch ? 'tap canvas to start' : 'enter: start · z/space: jump · x/j: fire · ↑+fire: shoot up · p: pause'),
      e('button', { className: 'mute', onClick: function (ev) { if (ev && ev.currentTarget) ev.currentTarget.blur(); Sound.unlock(); setMuted(function (m) { return !m; }); } }, muted ? 'SOUND: OFF' : 'SOUND: ON')),
    touch ? e('div', { className: 'pads' },
      e('div', { className: 'pgroup' }, e(TouchBtn, { k: 'V_LEFT', label: '◀' }), e(TouchBtn, { k: 'V_RIGHT', label: '▶' }), e(TouchBtn, { k: 'V_UP', label: '▲' }), e(TouchBtn, { k: 'V_DOWN', label: '▼' })),
      e('div', { className: 'pgroup' }, e(TouchBtn, { k: 'V_JUMP', label: 'JUMP' }), e(TouchBtn, { k: 'V_FIRE', label: 'FIRE' }))) : null
  );
}

var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
})();
