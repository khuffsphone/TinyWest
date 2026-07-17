// Tiny West slice — sprite pipeline
// ASCII grids -> per-sprite frames -> atlas.json (base64 packed pixels, 32-color master palette)
// chars: '.' or ' ' = transparent, '0'-'9','a'-'v' = palette index 0-31
// World sprites are authored at half resolution and doubled at build (2px world grid).
// HUD/font sprites are native 1px (scale:1).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- 07_ART_AUDIO_SPEC master palette (exact) ----
export const PALETTE = [
  '#151421', // 0 outline ink
  '#24243A', // 1 deep shadow
  '#282231', // 2 coal
  '#3C2834', // 3 plum shadow
  '#543142', // 4 plum mid
  '#713B3B', // 5 dark leather
  '#9F463A', // 6 rust
  '#DF4A42', // 7 danger red
  '#DD7938', // 8 coat orange
  '#F0A442', // 9 amber
  '#F4C34E', // 10 reward gold
  '#F2C981', // 11 sand
  '#B76C4F', // 12 skin shadow
  '#D79664', // 13 skin
  '#F5F0CF', // 14 bone
  '#FFF1BD', // 15 UI cream
  '#30483E', // 16 teal shadow
  '#437074', // 17 teal mid
  '#67C0B7', // 18 teal signal
  '#9FD4BB', // 19 teal sky
  '#753C48', // 20 dusk shadow
  '#87515C', // 21 dusk mid
  '#171824', // 22 night black-blue
  '#252944', // 23 night blue
  '#353B5D', // 24 night mid
  '#414A66', // 25 steel shadow
  '#596582', // 26 steel mid
  '#68728E', // 27 steel light
  '#8E9BB7', // 28 moon highlight
  '#AEB5BD', // 29 smoke
  '#EEE8D4', // 30 smoke light
  '#FFF0A4', // 31 flash highlight
];
const CH = {};
'0123456789abcdefghijklmnopqrstuv'.split('').forEach((c, i) => CH[c] = i);
CH['.'] = -1; CH[' '] = -1;

const SPRITES = {}; // name -> {frames:[grid], scale}
const S = (name, scale, frames) => { SPRITES[name] = { scale, frames: frames.map(f => f.slice()) }; };
const grid = (w, h, fill = '.') => Array.from({ length: h }, () => Array(w).fill(fill));
const put = (g, x, y, c) => { if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = c; };
const rect = (g, x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(g, x, y, c); };
const rows = g => g.map(r => r.join(''));
function prng(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }

/* ================= HORSE (40x28 half-res, gallop 4) =================
   slots: 14 bone body, 30 mane light, 29 shadow, 0 outline, 12 tack  */
function horseFrame(pose) {
  const g = grid(40, 28);
  // body barrel
  rect(g, 8, 8, 30, 16, 'e'); // 14 bone
  rect(g, 8, 8, 30, 9, 'u');  // 30 highlight top
  rect(g, 9, 15, 29, 16, 't'); // 29 belly shade
  // neck + head (front right)
  rect(g, 28, 4, 32, 10, 'e'); rect(g, 31, 2, 37, 6, 'e');
  rect(g, 36, 4, 38, 6, 'e'); // muzzle
  put(g, 35, 3, '0'); // eye
  rect(g, 31, 1, 33, 2, '2'); // ears/mane dark
  rect(g, 28, 4, 29, 10, '2'); // mane back dark
  // tail dark
  rect(g, 6, 8, 8, 14, '2'); rect(g, 5, 10, 6, 16, '2');
  // saddle (brown) over orange blanket
  rect(g, 15, 6, 24, 12, '8'); rect(g, 16, 6, 23, 10, '5'); rect(g, 16, 6, 23, 6, 'c');
  // legs by pose (0..3): reach, gather, push, stride
  const L = [
    [[10, 17, 6, 26], [14, 17, 12, 26], [26, 17, 30, 26], [30, 17, 34, 25]],
    [[11, 17, 10, 26], [15, 17, 15, 26], [27, 17, 26, 26], [30, 17, 31, 26]],
    [[10, 17, 13, 25], [14, 17, 17, 26], [26, 17, 24, 26], [29, 17, 28, 26]],
    [[9, 17, 5, 25], [15, 17, 13, 26], [27, 17, 31, 26], [31, 17, 35, 24]],
  ][pose];
  for (const [x0, y0, x1, y1] of L) {
    // simple 2px leg from (x0,y0) to (x1,y1)
    const steps = Math.max(Math.abs(x1 - x0), y1 - y0);
    for (let i = 0; i <= steps; i++) {
      const x = Math.round(x0 + (x1 - x0) * i / steps), y = Math.round(y0 + (y1 - y0) * i / steps);
      const c = i > steps * 0.55 ? '2' : 'e'; // dark lower legs
      put(g, x, y, c); put(g, x + 1, y, c);
    }
    put(g, x1, y1, '0'); put(g, x1 + 1, y1, '0'); // hoof
  }
  // outline pass: any bone/mane pixel adjacent to transparent above/below gets ink? keep silhouette clean w/o full outline (cost) — bottom shade
  return rows(g);
}
S('horse', 2, [horseFrame(0), horseFrame(1), horseFrame(2), horseFrame(3)]);

/* ============ RIDER OVERLAY (coat-orange player, 18x18 half-res) ============ */
function riderFrame(fire) {
  const g = grid(18, 18);
  // hat
  rect(g, 5, 0, 10, 1, '5'); rect(g, 3, 2, 12, 2, '5');
  // head
  rect(g, 5, 3, 10, 5, 'd'); put(g, 9, 4, '0');
  // torso coat orange
  rect(g, 4, 6, 11, 12, '8'); rect(g, 4, 6, 5, 12, '6');
  // arm
  if (fire) { rect(g, 10, 7, 16, 8, '8'); rect(g, 15, 7, 17, 8, '2'); } // extended + gun
  else rect(g, 9, 8, 12, 11, '6');
  // leg over saddle
  rect(g, 8, 13, 12, 15, '2'); rect(g, 11, 15, 13, 17, '5');
  return rows(g);
}
S('rider', 2, [riderFrame(0), riderFrame(1)]);

/* ============ LAW RIDER OVERLAY (steel/dusk enemy) ============ */
function lawFrame(fire) {
  const g = grid(18, 18);
  rect(g, 5, 0, 10, 1, '0'); rect(g, 3, 2, 12, 2, '0');
  rect(g, 5, 3, 10, 5, 'd'); put(g, 9, 4, '0');
  rect(g, 4, 6, 11, 12, 'q'); rect(g, 4, 6, 5, 12, 'p'); // steel mid/shadow
  if (fire) { rect(g, 10, 7, 16, 8, 'q'); rect(g, 15, 7, 17, 8, '2'); }
  else rect(g, 9, 8, 12, 11, 'p');
  rect(g, 8, 13, 12, 15, '2'); rect(g, 11, 15, 13, 17, '0');
  return rows(g);
}
S('law', 2, [lawFrame(0), lawFrame(1)]);

/* ============ ROOF PLAYER (20x32 half-res) ============
   idle 2, run 4, jump, fire, reload, grab */
function roofPlayer(pose, t) {
  const g = grid(20, 32);
  const bob = pose === 'idle' ? (t % 2) : 0;
  // hat + head
  rect(g, 6, 1 + bob, 13, 2 + bob, '5'); rect(g, 4, 3 + bob, 15, 3 + bob, '5');
  rect(g, 7, 4 + bob, 12, 7 + bob, 'd'); put(g, 11, 5 + bob, '0');
  // coat torso
  rect(g, 5, 8 + bob, 14, 18 + bob, '8');
  rect(g, 5, 8 + bob, 6, 18 + bob, '6');
  // arms
  if (pose === 'fire') { rect(g, 13, 9, 19, 10, '8'); rect(g, 18, 9, 19, 10, '2'); }
  else if (pose === 'reload') { rect(g, 10, 12, 15, 14, '6'); rect(g, 13, 12, 15, 13, '2'); }
  else if (pose === 'grab') { rect(g, 12, 14, 17, 16, '8'); }
  else rect(g, 12, 10 + bob, 14, 15 + bob, '6');
  // legs
  if (pose === 'run') {
    const p = t % 4;
    const legs = [
      [[6, 19, 3, 29], [12, 19, 15, 29]],
      [[7, 19, 6, 30], [12, 19, 13, 30]],
      [[6, 19, 9, 30], [12, 19, 11, 29]],
      [[7, 19, 10, 29], [11, 19, 8, 30]],
    ][p];
    for (const [x0, y0, x1, y1] of legs) {
      const steps = Math.max(Math.abs(x1 - x0), y1 - y0);
      for (let i = 0; i <= steps; i++) {
        const x = Math.round(x0 + (x1 - x0) * i / steps), y = Math.round(y0 + (y1 - y0) * i / steps);
        put(g, x, y, '2'); put(g, x + 1, y, '2');
      }
      put(g, x1, y1, '5'); put(g, x1 + 1, y1, '5');
    }
  } else if (pose === 'jump') {
    rect(g, 5, 19, 8, 25, '2'); rect(g, 11, 19, 14, 27, '2');
    rect(g, 5, 25, 8, 26, '5'); rect(g, 11, 27, 14, 28, '5');
  } else {
    rect(g, 6, 19 + bob, 8, 30, '2'); rect(g, 11, 19 + bob, 13, 30, '2');
    rect(g, 5, 29, 8, 30, '5'); rect(g, 11, 29, 14, 30, '5');
  }
  return rows(g);
}
S('p_idle', 2, [roofPlayer('idle', 0), roofPlayer('idle', 1)]);
S('p_run', 2, [0, 1, 2, 3].map(t => roofPlayer('run', t)));
S('p_jump', 2, [roofPlayer('jump', 0)]);
S('p_fire', 2, [roofPlayer('fire', 0)]);
S('p_reload', 2, [roofPlayer('reload', 0)]);
S('p_grab', 2, [roofPlayer('grab', 0)]);

/* ============ GUARD (20x32 half-res; dusk/plum colors, never gold) ============ */
function guard(pose, t) {
  const g = grid(20, 32);
  const bob = pose === 'idle' ? (t % 2) : 0;
  rect(g, 6, 1 + bob, 13, 2 + bob, '2'); rect(g, 4, 3 + bob, 15, 3 + bob, '2'); // dark hat
  rect(g, 7, 4 + bob, 12, 7 + bob, 'd'); put(g, 8, 5 + bob, '0');
  rect(g, 5, 8 + bob, 14, 18 + bob, 'l'); // 21 dusk mid shirt
  rect(g, 13, 8 + bob, 14, 18 + bob, 'k'); // 20 dusk shadow
  if (pose === 'fire') { rect(g, 0, 9, 6, 10, 'l'); rect(g, 0, 9, 1, 10, '2'); } // fires LEFT toward player
  else if (pose === 'tel') { rect(g, 2, 7, 7, 8, 'l'); rect(g, 2, 7, 3, 8, '2'); } // raising gun telegraph
  else rect(g, 5, 10 + bob, 7, 15 + bob, 'k');
  if (pose === 'fall') {
    // crumple
    const g2 = grid(20, 32);
    rect(g2, 2, 24, 17, 27, 'l'); rect(g2, 3, 22, 8, 24, 'd'); rect(g2, 1, 25, 4, 26, '2');
    return rows(g2);
  }
  rect(g, 6, 19 + bob, 8, 30, '4'); rect(g, 11, 19 + bob, 13, 30, '4');
  rect(g, 5, 29, 8, 30, '2'); rect(g, 11, 29, 14, 30, '2');
  return rows(g);
}
S('g_idle', 2, [guard('idle', 0), guard('idle', 1)]);
S('g_tel', 2, [guard('tel', 0)]);
S('g_fire', 2, [guard('fire', 0)]);
S('g_fall', 2, [guard('fall', 0)]);

/* ============ TRAIN CAR (80x44 half-res) ============ */
function trainCar(pay) {
  const g = grid(80, 44);
  const body = pay ? '4' : '4', trim = pay ? 'a' : '6', dark = '3', roofC = '2';
  // roof walkway
  rect(g, 1, 0, 78, 2, roofC); rect(g, 1, 0, 78, 0, '1');
  // body
  rect(g, 2, 3, 77, 30, body);
  rect(g, 2, 3, 77, 4, trim);
  rect(g, 2, 29, 77, 30, dark);
  // windows
  for (let wx = 8; wx <= 66; wx += 12) { rect(g, wx, 9, wx + 6, 18, '1'); rect(g, wx, 9, wx + 6, 10, '2'); }
  // trim band
  rect(g, 2, 22, 77, 23, trim);
  if (pay) { rect(g, 2, 3, 77, 3, 'a'); rect(g, 36, 12, 43, 19, 'a'); rect(g, 38, 13, 41, 17, '1'); } // gold marks pay car
  // frame
  rect(g, 2, 31, 77, 33, '1');
  // outline sides
  rect(g, 1, 3, 1, 33, '0'); rect(g, 78, 3, 78, 33, '0');
  return rows(g);
}
S('car', 2, [trainCar(false)]);
S('paycar', 2, [trainCar(true)]);

/* ============ ENGINE (88x48 half-res, faces right) ============ */
function engine() {
  const g = grid(88, 48);
  // cab
  rect(g, 4, 4, 26, 36, '3'); rect(g, 2, 2, 28, 5, '2'); rect(g, 8, 10, 20, 20, '1'); rect(g, 9, 11, 19, 15, 'q');
  // boiler
  rect(g, 26, 14, 74, 36, 'p'); rect(g, 26, 14, 74, 16, 'q'); rect(g, 26, 33, 74, 36, '1');
  for (const bx of [38, 52, 66]) rect(g, bx, 14, bx + 1, 36, 'o');
  // chimney + dome
  rect(g, 60, 2, 66, 14, '1'); rect(g, 58, 0, 68, 3, '2');
  rect(g, 44, 8, 50, 14, 'o');
  // headlamp + cowcatcher
  rect(g, 75, 16, 80, 24, '9'); rect(g, 75, 16, 76, 24, '1');
  for (let i = 0; i < 10; i++) { put(g, 76 + i, 30 + i, '1'); put(g, 77 + i, 30 + i, '1'); put(g, 76 + i, 31 + i, 'o'); }
  return rows(g);
}
S('engine', 2, [engine()]);

/* ============ WHEEL (12x12 half-res, 2 frames) ============ */
function wheel(f) {
  const g = grid(12, 12);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
    const d = Math.hypot(x - 5.5, y - 5.5);
    if (d < 5.6 && d > 4.2) put(g, x, y, '1');
    else if (d <= 4.2 && d > 1.2) put(g, x, y, '2');
  }
  if (f === 0) { rect(g, 5, 1, 6, 10, 'p'); rect(g, 1, 5, 10, 6, 'p'); }
  else { for (let i = 2; i < 10; i++) { put(g, i, i, 'p'); put(g, i, 11 - i, 'p'); put(g, i + 1, i, 'p'); } }
  rect(g, 5, 5, 6, 6, '0');
  return rows(g);
}
S('wheel', 2, [wheel(0), wheel(1)]);

/* ============ LADDER (12x32 half-res, normal + lit) ============ */
function ladder(lit) {
  const g = grid(12, 32);
  const rail = lit ? 'i' : '5', rung = lit ? 'h' : '3';
  rect(g, 2, 0, 3, 31, rail); rect(g, 8, 0, 9, 31, rail);
  for (let y = 3; y < 32; y += 6) rect(g, 3, y, 8, y + 1, rung);
  return rows(g);
}
S('ladder', 2, [ladder(false), ladder(true)]);

/* ============ POWDER LOCKBOX (20x20 half-res: closed/1pin/open/burst) ============ */
function lockbox(state) {
  const g = grid(20, 20);
  rect(g, 1, 6, 18, 18, '5'); rect(g, 1, 6, 18, 7, 'c');
  rect(g, 1, 17, 18, 18, '3'); rect(g, 1, 6, 2, 18, '3');
  rect(g, 3, 2, 16, 6, '5'); rect(g, 3, 2, 16, 2, 'c'); // lid
  // straps
  rect(g, 5, 2, 6, 18, '2'); rect(g, 13, 2, 14, 18, '2');
  if (state === 0) { rect(g, 4, 9, 7, 12, '7'); rect(g, 12, 9, 15, 12, '7'); }       // both pins (danger red)
  if (state === 1) { rect(g, 12, 9, 15, 12, '7'); rect(g, 4, 9, 7, 12, '1'); }        // one pin left
  if (state === 2) { rect(g, 3, 0, 16, 3, '1'); rect(g, 4, 8, 15, 14, 'a'); rect(g, 6, 10, 13, 12, '9'); } // open, gold inside
  if (state === 3) { rect(g, 2, 6, 17, 12, 'v'); rect(g, 4, 2, 15, 8, 'a'); }        // burst flash
  return rows(g);
}
S('lockbox', 2, [lockbox(0), lockbox(1), lockbox(2), lockbox(3)]);

/* ============ SMALL FX / PICKUPS ============ */
S('coin', 2, [
  ['.aaaa.', 'aavvaa', 'aavvaa', 'aaaaaa', '.aaaa.', '......'],
  ['..aa..', '.avva.', '.avva.', '.aaaa.', '..aa..', '......'],
].map(r => r.map(s => s)));
S('cashcore', 2, [[
  '..aaaaaa..',
  '.aaaaaaaa.',
  'aavaaaavaa',
  'aaaaaaaaaa',
  'aaavvvvaaa',
  '.aaaaaaaa.',
  '..aaaaaa..',
  '..........',
]]);
S('dyn', 2, [
  ['.77.', '7777', '7777', '.77.'],
  ['7..7', '.77.', '.77.', '7..7'],
]);
function boom(f) {
  const g = grid(24, 24), rnd = prng(f + 5);
  const R = [5, 9, 12][f];
  for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
    const d = Math.hypot(x - 12, y - 12);
    if (d < R * 0.5) put(g, x, y, 'v');
    else if (d < R * 0.8) put(g, x, y, '9');
    else if (d < R && rnd() > 0.25) put(g, x, y, f === 2 ? 't' : '7');
  }
  return rows(g);
}
S('boom', 2, [boom(0), boom(1), boom(2)]);
S('muzzle', 2, [['.v.', 'vvv', '.v.'], ['v.v', '.v.', 'v.v']]);
function dust(f) {
  const g = grid(8, 8), rnd = prng(f + 11);
  for (let i = 0; i < 6 - f * 2; i++) put(g, (rnd() * 8) | 0, (rnd() * 8) | 0, f ? 't' : 'u');
  return rows(g);
}
S('dust', 2, [dust(0), dust(1), dust(2)]);

/* ============ WORLD PROPS ============ */
S('fence', 2, [[
  '2..............2',
  '2222222222222222',
  '2..2........2..2',
  '2..2........2..2',
  '2222222222222222',
  '2..2........2..2',
]]);
S('cactus', 2, [[
  '..gg....',
  '..gg..g.',
  'g.gg..g.',
  'g.gggggg',
  'gggg....',
  '..gg....',
  '..gg....',
  '..gg....',
  '..gg....',
  '..gg....',
  '..gg....',
  '..gg....',
].map(r => r.replace(/g/g, 'g'))]);
function mesaFar() {
  const g = grid(64, 24);
  for (let y = 0; y < 24; y++) {
    const l = Math.max(0, 14 - y * 1.6 | 0), r = Math.min(63, 46 + y * 1.4 | 0);
    for (let x = l; x <= r; x++) put(g, x, y, y < 2 ? '4' : '3');
  }
  return rows(g);
}
S('mesafar', 2, [mesaFar()]);
S('exitsign', 2, [[
  '.iiiiiiiiii.',
  'ii........ii',
  'i..i.i.ii..i',
  'i..ii..i...i',
  'i..i.i.ii..i',
  'ii........ii',
  '.iiiiiiiiii.',
  '.....ii.....',
  '.....ii.....',
  '.....ii.....',
]]);
S('marker', 2, [ // teal alignment chevron
  ['iiiiii', '.iiii.', '..ii..'],
  ['hhhhhh', '.hhhh.', '..hh..'],
]);
S('goldmark', 2, [['aaaaaa', '.aaaa.', '..aa..'], ['999999', '.9999.', '..99..']]);

/* ============ HUD (native 1px) ============ */
S('heart', 1, [
  ['.77..77.', '77777777', '77777777', '.777777.', '..7777..', '...77...'].map(r => r + '....').map((r, i) => r.slice(0, 12)),
  ['.77..77.', '77707777', '77777077', '.770777.', '..7077..', '...77...'].map(r => (r + '....').slice(0, 12)),
  ['.11..11.', '11111111', '11111111', '.111111.', '..1111..', '...11...'].map(r => (r + '....').slice(0, 12)),
]);
S('bullet', 1, [
  ['.99.', '9999', '9999', '9999', '.99.', '.55.'],
  ['.11.', '1..1', '1..1', '1..1', '.11.', '.11.'],
]);

/* ============ FONT 5x7 in 6x8 cell (native) ============ */
const FONT57 = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '####.', '#...#', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '####.', '#....', '#....', '#....', '#####'],
  F: ['#####', '#....', '####.', '#....', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#####', '#...#', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['....#', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '###..', '#.#..', '#..#.', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '#####'],
  2: ['.###.', '#...#', '....#', '..##.', '.#...', '#....', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['#..#.', '#..#.', '#..#.', '#####', '...#.', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '..##.', '..#..', '.....', '..#..'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  "'": ['..#..', '..#..', '.....', '.....', '.....', '.....', '.....'],
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '$': ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  '+': ['.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'],
  '%': ['##..#', '##..#', '...#.', '..#..', '.#...', '#..##', '#..##'],
  '>': ['#....', '.#...', '..#..', '...#.', '..#..', '.#...', '#....'],
  '<': ['....#', '...#.', '..#..', '.#...', '..#..', '...#.', '....#'],
  '(': ['..#..', '.#...', '#....', '#....', '#....', '.#...', '..#..'],
  ')': ['..#..', '...#.', '....#', '....#', '....#', '...#.', '..#..'],
  '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
  '*': ['.....', '#.#.#', '.###.', '#####', '.###.', '#.#.#', '.....'],
};
for (const [ch, rws] of Object.entries(FONT57)) {
  const g = grid(6, 8);
  rws.forEach((r, y) => r.split('').forEach((c, x) => { if (c === '#') put(g, x, y, 'f'); })); // 15 UI cream
  S('f_' + ch, 1, [rows(g)]);
}

/* ================= build atlas ================= */
function frameToPixels(f, name) {
  const h = f.length, w = f[0].length;
  for (const r of f) if (r.length !== w) throw new Error(`${name}: ragged (${r.length} vs ${w})`);
  const px = new Int8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = f[y][x];
    if (!(c in CH)) throw new Error(`${name}: bad char '${c}'`);
    px[y * w + x] = CH[c];
  }
  return { w, h, px };
}

export function buildAtlas() {
  // pack all frames (scaled) into one atlas via simple shelf packing
  const entries = [];
  for (const [name, sp] of Object.entries(SPRITES)) {
    sp.frames.forEach((f, i) => {
      const { w, h, px } = frameToPixels(f, name);
      entries.push({ name, i, w: w * sp.scale, h: h * sp.scale, sw: w, sh: h, scale: sp.scale, px });
    });
  }
  entries.sort((a, b) => b.h - a.h);
  const AW = 1024;
  let x = 0, y = 0, shelf = 0;
  for (const e of entries) {
    if (x + e.w > AW) { x = 0; y += shelf + 1; shelf = 0; }
    e.ax = x; e.ay = y;
    x += e.w + 1; shelf = Math.max(shelf, e.h);
  }
  const AH = y + shelf + 1;
  const data = new Int8Array(AW * AH).fill(-1);
  for (const e of entries) {
    for (let yy = 0; yy < e.h; yy++) for (let xx = 0; xx < e.w; xx++) {
      const p = e.px[((yy / e.scale) | 0) * e.sw + ((xx / e.scale) | 0)];
      if (p >= 0) data[(e.ay + yy) * AW + e.ax + xx] = p;
    }
  }
  // encode: 1 byte per pixel (255 = transparent) -> RLE pairs (value, runLen<=255) -> base64
  // RLE keeps decode synchronous and dependency-free in the browser.
  const bytes = Buffer.alloc(AW * AH);
  for (let i = 0; i < data.length; i++) bytes[i] = data[i] < 0 ? 255 : data[i];
  const rle = [];
  for (let i = 0; i < bytes.length;) {
    const v = bytes[i]; let n = 1;
    while (i + n < bytes.length && bytes[i + n] === v && n < 255) n++;
    rle.push(v, n); i += n;
  }
  const b64 = Buffer.from(rle).toString('base64');
  const meta = {};
  for (const e of entries) {
    (meta[e.name] ||= []).push({ x: e.ax, y: e.ay, w: e.w, h: e.h });
  }
  return { AW, AH, b64, meta };
}

// ---- PNG preview writer (for visual iteration) ----
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c; }
  }
  c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function writePNG(file, w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]));
}
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  if (mode === 'preview') {
    const outDir = path.join(__dirname, 'previews');
    fs.mkdirSync(outDir, { recursive: true });
    const { AW, AH, b64, meta } = buildAtlas();
    const rleBuf = Buffer.from(b64, 'base64');
    const bytes = Buffer.alloc(AW * AH);
    for (let i = 0, o = 0; i < rleBuf.length; i += 2) { bytes.fill(rleBuf[i], o, o + rleBuf[i + 1]); o += rleBuf[i + 1]; }
    const scale = 2;
    const rgba = Buffer.alloc(AW * scale * AH * scale * 4);
    for (let y = 0; y < AH * scale; y++) for (let x = 0; x < AW * scale; x++) {
      const p = bytes[((y / scale) | 0) * AW + ((x / scale) | 0)];
      const o = (y * AW * scale + x) * 4;
      if (p === 255) { const ck = (((x / 8) | 0) + ((y / 8) | 0)) % 2 ? 42 : 52; rgba[o] = ck; rgba[o + 1] = ck; rgba[o + 2] = ck + 8; rgba[o + 3] = 255; }
      else { const [r, g, b] = hex(PALETTE[p]); rgba[o] = r; rgba[o + 1] = g; rgba[o + 2] = b; rgba[o + 3] = 255; }
    }
    writePNG(path.join(outDir, 'atlas.png'), AW * scale, AH * scale, rgba);
    console.log('atlas', AW + 'x' + AH, 'b64 bytes:', b64.length, 'sprites:', Object.keys(meta).length);
  } else {
    const { AW, AH, b64, meta } = buildAtlas();
    const out = `// generated by tools/sprites.mjs — do not edit
const ATLAS = ${JSON.stringify({ w: AW, h: AH, b64, meta })};
const PALETTE = ${JSON.stringify(PALETTE)};
`;
    fs.mkdirSync(path.join(__dirname, '..', 'src'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '..', 'src', 'atlas.gen.js'), out);
    console.log('wrote src/atlas.gen.js; atlas', AW + 'x' + AH, 'b64:', b64.length, 'sprites:', Object.keys(meta).length);
  }
}
