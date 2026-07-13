// TinyWest sprite pipeline: ASCII pixel grids -> 8x8 tiles -> base64
// chars: '.' = transparent(0), hex 1-f = palette slot
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---------------- palette themes (slot -> rgb) ----------------
// slots: 1 ink, 2 shadow, 3 wood_dk, 4 wood_md, 5 wood_lt, 6 sand, 7 sand_lt,
//        8 red, 9 skin, a cream, b yellow, c green_dk, d green_lt, e gray_dk, f gray_lt
const THEMES = {
  day: {
    sky: '#4ec3ab', skyhi: '#7fd8bd', horizon: '#f2d8a0',
    pal: [null, '#2e2434', '#6e3a3f', '#9c4f40', '#c96f3d', '#e89a52', '#e3b077', '#f3d5a4',
          '#d43d3d', '#eda577', '#f9ecd2', '#f5cf4e', '#3e7d4f', '#7fbf58', '#5b5568', '#9d99a8'],
  },
  night: {
    sky: '#23253d', skyhi: '#313552', horizon: '#3c4a5c',
    pal: [null, '#171526', '#2c3245', '#3c4a5c', '#4f6a72', '#6d8f8f', '#6f6a86', '#8f8aa5',
          '#b04552', '#b58a7a', '#d9d3e0', '#edcb64', '#2e4a4a', '#4f7264', '#3f3d52', '#6f6d85'],
  },
  forest: {
    sky: '#1c1830', skyhi: '#2a2342', horizon: '#2a1e38',
    pal: [null, '#120e1c', '#2a1e38', '#3d2b4a', '#543a5c', '#6e4f6e', '#3a2f4a', '#4d4161',
          '#a63c4e', '#a3766d', '#cfc3d6', '#e8c95c', '#35284a', '#4d3b61', '#35304a', '#57506e'],
  },
};

// ---------------- sprite art ----------------
const ART = {};
const A = (name, rows) => { ART[name] = rows.slice(); }; // space or '.' = transparent

// ======== PLAYER (16x16, faces right) ========
A('p_idle', [
  '................',
  '......aaaa......',
  '.....aaaaaa.....',
  '.....a8888a.....',
  '...aaaaaaaaaa...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....28888882....',
  '...9288888829...',
  '...1288888821...',
  '....2e8888e2....',
  '.....eeeeee.....',
  '.....ee..ee.....',
  '.....33..33.....',
  '....133..331....',
]);
A('p_run1', [
  '................',
  '......aaaa......',
  '.....aaaaaa.....',
  '.....a8888a.....',
  '...aaaaaaaaaa...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....28888882....',
  '...9288888829...',
  '...1288888821...',
  '....2e8888e2....',
  '.....eeeeee.....',
  '....ee...ee.....',
  '...33.....33....',
  '..133......331..',
]);
A('p_run2', [
  '................',
  '......aaaa......',
  '.....aaaaaa.....',
  '.....a8888a.....',
  '...aaaaaaaaaa...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....28888882....',
  '...9288888829...',
  '...1288888821...',
  '....2e8888e2....',
  '.....eeeeee.....',
  '......eeee......',
  '.....33.33......',
  '.....331331.....',
]);
A('p_shoot', [
  '................',
  '......aaaa......',
  '.....aaaaaa.....',
  '.....a8888a.....',
  '...aaaaaaaaaa...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....28888882....',
  '....2888888899..',
  '....128888eeef..',
  '....2e8888e2....',
  '.....eeeeee.....',
  '.....ee..ee.....',
  '.....33..33.....',
  '....133..331....',
]);
A('p_jump', [
  '................',
  '......aaaa......',
  '.....aaaaaa.....',
  '.....a8888a.....',
  '...aaaaaaaaaa...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....28888882....',
  '...9288888829...',
  '...1288888821...',
  '....2e8888e2....',
  '.....eeeeee.....',
  '....ee....ee....',
  '...33......33...',
  '................',
]);

// ======== HORSE + RIDER (24x16, faces right) ========
A('h_run1', [
  '........aaaa............',
  '.......aaaaaa...........',
  '.......a8888a...........',
  '.....aaaaaaaaaa.........',
  '.......999999...........',
  '.......919919...........',
  '......28888882......aa..',
  '......2888888892...aaa1.',
  '......1288888821..aaaa..',
  '...aaaaaaaaaaaaaaaaaa...',
  '..aaaaaaaaaaaaaaaaaa....',
  '.faaaaaaaaaaaaaaaaa.....',
  '..f.aaa.......aaa.......',
  '...aa...........aa......',
  '..aa..............aa....',
  '.aa................aa...',
]);
A('h_run2', [
  '........aaaa............',
  '.......aaaaaa...........',
  '.......a8888a...........',
  '.....aaaaaaaaaa.........',
  '.......999999...........',
  '.......919919...........',
  '......28888882......aa..',
  '......2888888892...aaa1.',
  '......1288888821..aaaa..',
  '...aaaaaaaaaaaaaaaaaa...',
  '..aaaaaaaaaaaaaaaaaa....',
  '.faaaaaaaaaaaaaaaaa.....',
  '..f..aaa.....aaa........',
  '.....aa.......aa........',
  '....aa.........aa.......',
  '....aa.........aa.......',
]);

// ======== ENEMY BANDIT (16x16, green shirt) ========
A('e_walk1', [
  '................',
  '......eeee......',
  '.....eeeeee.....',
  '.....e1111e.....',
  '...eeeeeeeeee...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....cddddddc....',
  '...9cddddddc9...',
  '...1cddddddc1...',
  '....ceddddec....',
  '.....333333.....',
  '....33....33....',
  '...11......11...',
  '................',
]);
A('e_walk2', [
  '................',
  '......eeee......',
  '.....eeeeee.....',
  '.....e1111e.....',
  '...eeeeeeeeee...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....cddddddc....',
  '...9cddddddc9...',
  '...1cddddddc1...',
  '....ceddddec....',
  '.....333333.....',
  '.....33..33.....',
  '.....11..11.....',
  '................',
]);
A('e_shoot', [
  '................',
  '......eeee......',
  '.....eeeeee.....',
  '.....e1111e.....',
  '...eeeeeeeeee...',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....cddddddc....',
  '....cdddddd99...',
  '....1cddddeee...',
  '....ceddddec....',
  '.....333333.....',
  '.....33..33.....',
  '.....11..11.....',
  '................',
]);

// ======== BOSS (24x24, long dark coat, two guns) ========
A('boss1', [
  '........eeeeee..........',
  '.......eeeeeeee.........',
  '.......e222222e.........',
  '.....eeeeeeeeeeee.......',
  '.......99999999.........',
  '.......91199119.........',
  '.......99999999.........',
  '.......22222222.........',
  '......2233333322........',
  '.....922333333229.......',
  '.....122333333221.......',
  '.....922333333229.......',
  '......2233333322........',
  '......2233333322........',
  '......2233333322........',
  '......2233333322........',
  '.......23333332.........',
  '.......23333332.........',
  '.......ee....ee.........',
  '.......ee....ee.........',
  '......111....111........',
  '........................',
  '........................',
  '........................',
]);

// ======== FX ========
A('bullet', [
  '........',
  '........',
  '........',
  '..bbbb..',
  '..bbbb..',
  '........',
  '........',
  '........',
]);
A('ebullet', [
  '........',
  '........',
  '...88...',
  '..8888..',
  '..8888..',
  '...88...',
  '........',
  '........',
]);
A('muzzle', [
  '...b....',
  '.b.b.b..',
  '..bbb...',
  'bbbbbb..',
  '..bbb...',
  '.b.b.b..',
  '...b....',
  '........',
]);
A('poof1', [
  '................',
  '................',
  '......ffff......',
  '.....ffffff.....',
  '.....ffffff.....',
  '......ffff......',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
]);
A('poof2', [
  '................',
  '....f......f....',
  '...ff.ffff.ff...',
  '.....ffffff.....',
  '....ff.ff.ff....',
  '....f.ffff.f....',
  '.....ffffff.....',
  '...ff.ffff.ff...',
  '....f......f....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
]);

// ======== PICKUPS / HUD ========
A('heart', [
  '........',
  '.88.88..',
  '8888888.',
  '8888888.',
  '.88888..',
  '..888...',
  '...8....',
  '........',
]);
A('pip', [
  '...b....',
  '..bbb...',
  '.bbbbb..',
  'bbbbbbb.',
  '.bbbbb..',
  '..bbb...',
  '...b....',
  '........',
]);
A('pip_e', [
  '...e....',
  '..e.e...',
  '.e...e..',
  'e.....e.',
  '.e...e..',
  '..e.e...',
  '...e....',
  '........',
]);

// ======== TERRAIN ========
A('sand', [
  '66666666',
  '66666666',
  '66676666',
  '66666666',
  '66666676',
  '67666666',
  '66666666',
  '66666667',
]);
A('sandtop', [
  '77777777',
  '66666666',
  '66666666',
  '66676666',
  '66666666',
  '66666676',
  '67666666',
  '66666666',
]);
A('track', [
  '........',
  '........',
  'ffffffff',
  'eeeeeeee',
  '.3..3...',
  '33333333',
  '.3..3...',
  '........',
]);

// ======== TRAIN CAR (48x24) ========
A('t_car', [
  '444444444444444444444444444444444444444444444444',
  '455555555555555555555555555555555555555555555554',
  '444444444444444444444444444444444444444444444444',
  '344444444444444444444444444444444444444444444443',
  '334433114433114433114433114433114433114433113333',
  '334433114433114433114433114433114433114433113333',
  '334433114433114433114433114433114433114433113333',
  '334433444433444433444433444433444433444433443333',
  '333333333333333333333333333333333333333333333333',
  '344444444444444444444444444444444444444444444443',
  '333333333333333333333333333333333333333333333333',
  '133333333333333333333333333333333333333333333331',
  '111111111111111111111111111111111111111111111111',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
  '................................................',
]);
A('wheel1', [
  '..eeee..',
  '.efeefe.',
  'efe..efe',
  'ee.ee.ee',
  'ee.ee.ee',
  'efe..efe',
  '.efeefe.',
  '..eeee..',
]);
A('wheel2', [
  '..eeee..',
  '.eefeee.',
  'ee.f..fe',
  'eff.ff.e',
  'e.ff.ffe',
  'ef..f.ee',
  '.eeefee.',
  '..eeee..',
]);

// ======== BACKGROUND ========
A('sun', [
  '....bbbbbbbb....',
  '..bbbbbbbbbbbb..',
  '.bbbbbbbbbbbbbb.',
  '.bbbbbbbbbbbbbb.',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  '.bbbbbbbbbbbbbb.',
  '.bbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbb..',
  '....bbbbbbbb....',
]);
A('cloud', [
  '......aaaa..............',
  '....aaaaaaaaa...........',
  '..aaaaaaaaaaaaaaa.......',
  '.aaaaaaaaaaaaaaaaaa.....',
  'aaaaaaaaaaaaaaaaaaaaaa..',
  '........................',
  '........................',
  '........................',
]);
A('cactus', [
  '...cc...',
  '..cdcc..',
  '..cdcc..',
  'c.cdcc.c',
  'ccddcccc',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
  '..cdcc..',
]);
A('rock', [
  '........',
  '...ee...',
  '..eefe..',
  '.eeeffe.',
  'eeeeefee',
  'eeeeeeee',
  '........',
  '........',
]);

// ======== LOCOMOTIVE (48x32, faces right, procedural) ========
(function engine() {
  const W = 48, H = 32, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const put = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
  const rect = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(x, y, c); };
  // cab (rear, left): cols 2-13
  rect(2, 5, 13, 19, '3');
  rect(1, 4, 14, 5, '4'); rect(1, 4, 14, 4, '5');       // roof
  rect(4, 8, 11, 13, '1'); rect(5, 9, 10, 12, '5');     // window
  rect(2, 19, 13, 19, '2');
  // boiler: cols 14-41
  rect(14, 12, 41, 19, '4');
  rect(14, 11, 41, 11, '5');
  rect(14, 17, 41, 18, '3');
  rect(14, 19, 41, 19, '2');
  for (const bx of [20, 28, 36]) rect(bx, 11, bx, 19, '3'); // rivet bands
  // chimney: cols 32-35, flared top
  rect(33, 3, 34, 10, '3'); rect(32, 2, 35, 3, '4'); rect(32, 2, 35, 2, '1');
  // steam dome
  rect(24, 8, 27, 10, '4'); rect(24, 8, 27, 8, '5');
  // smokebox front (dark) + headlight
  rect(42, 11, 44, 19, 'e'); rect(42, 11, 44, 11, 'f');
  rect(45, 13, 45, 16, 'b');
  // cowcatcher: slats angling down-forward
  for (let y = 20; y <= 26; y++) { const x = 40 + (y - 19); put(x, y, 'e'); put(x + 1, y, 'e'); put(x - 1, y, 'f'); }
  rect(40, 20, 41, 26, 'e');
  ART['t_engine'] = g.map(r => r.join(''));
})();

// ======== FLATCAR + TARPED CRATES (48x16) ========
A('t_flat', [
  '................................................',
  '....1111111111111111....1111111111111111........',
  '...1cccccccccccccccc1..1cccccccccccccccc1.......',
  '...1c1cc1cc1cc1cc1cc1..1cc1cc1cc1cc1cc1c1.......',
  '...1cc1cc1cc1cc1cc1c1..1c1cc1cc1cc1cc1cc1.......',
  '...1c1cc1cc1cc1cc1cc1..1cc1cc1cc1cc1cc1c1.......',
  '...1cc1cc1cc1cc1cc1c1..1c1cc1cc1cc1cc1cc1.......',
  '...1cccccccccccccccc1..1cccccccccccccccc1.......',
  '...111111111111111111..111111111111111111.......',
  '444444444444444444444444444444444444444444444444',
  '455555555555555555555555555555555555555555555554',
  '333333333333333333333333333333333333333333333333',
  '133333333333333333333333333333333333333333333331',
  '111111111111111111111111111111111111111111111111',
  '................................................',
  '................................................',
]);

// ======== FOREST TREE (24x32) ========
A('tree', [
  '......2222..............',
  '....22222222.2222.......',
  '...2222222222222222.....',
  '..222232222222222222....',
  '.22222222222322222222...',
  '.22322222222222222222...',
  '2222222223222222232222..',
  '2222222222222222222222..',
  '.22222322222232222222...',
  '..222222222222222222....',
  '...2222223222222222.....',
  '....22222222222222......',
  '......222444222.........',
  '.........444............',
  '.........344............',
  '.........344............',
  '........3444............',
  '........3444............',
  '........34444...........',
  '.......33444.4..........',
  '.......334444.44........',
  '......334444............',
  '......3344444...........',
  '.....33444444...........',
  '.....334444444..........',
  '....33444444444.........',
  '....33444444444.........',
  '...3344444444444........',
  '...3344444444444........',
  '..33444444444444........',
  '..334444444444444.......',
  '.33444444444444444......',
]);

// ======== WOLF (16x16, faces right) ========
A('wolf1', [
  '................',
  '................',
  '................',
  '................',
  '............e.e.',
  '...........eeee.',
  'e..........ebee.',
  'ee.eeeeeeeeeee1.',
  '.eeeeeeeeeeee...',
  '.eeffffffffee...',
  '..eeffffffee....',
  '...ee.....ee....',
  '..ee.......ee...',
  '.ee.........ee..',
  'ee...........ee.',
  '................',
]);
A('wolf2', [
  '................',
  '................',
  '................',
  '................',
  '............e.e.',
  '...........eeee.',
  '.e.........ebee.',
  '.ee.eeeeeeeeee1.',
  '..eeeeeeeeeee...',
  '..eeffffffffe...',
  '...eeffffffee...',
  '....ee...ee.....',
  '....ee...ee.....',
  '....ee...ee.....',
  '....ee...ee.....',
  '................',
]);

// ======== PONCHO BANDIT (16x16) ========
A('e2_walk1', [
  '................',
  '......bbbb......',
  '.....bbbbbb.....',
  '.....b2222b.....',
  '..bbbbbbbbbbbb..',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....66666666....',
  '...6668866866...',
  '...6688668866...',
  '....66666666....',
  '.....666666.....',
  '....33....33....',
  '...11......11...',
  '................',
]);
A('e2_walk2', [
  '................',
  '......bbbb......',
  '.....bbbbbb.....',
  '.....b2222b.....',
  '..bbbbbbbbbbbb..',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....66666666....',
  '...6668866866...',
  '...6688668866...',
  '....66666666....',
  '.....666666.....',
  '.....33..33.....',
  '.....11..11.....',
  '................',
]);
A('e2_shoot', [
  '................',
  '......bbbb......',
  '.....bbbbbb.....',
  '.....b2222b.....',
  '..bbbbbbbbbbbb..',
  '.....999999.....',
  '.....919919.....',
  '.....999999.....',
  '....66666666....',
  '....6668866999..',
  '....668866eeee..',
  '....66666666....',
  '.....666666.....',
  '.....33..33.....',
  '.....11..11.....',
  '................',
]);

// ======== MOON (16x16, night palette turns slot b pale gold) ========
A('moon', [
  '....bbbbbbbb....',
  '..bbbbbbbbbbbb..',
  '.bbbb99bbbbbbbb.',
  '.bbb9999bbbbbbb.',
  'bbbb9999bbbbbbbb',
  'bbbbb99bbbb99bbb',
  'bbbbbbbbbb9999bb',
  'bbbbbbbbbb9999bb',
  'bbbbbbbbbbb99bbb',
  'bbb99bbbbbbbbbbb',
  'bb9999bbbbbbbbbb',
  'bb9999bbbbb99bbb',
  '.bb99bbbbbb99bb.',
  '.bbbbbbbbbbbbbb.',
  '..bbbbbbbbbbbb..',
  '....bbbbbbbb....',
]);

// ======== EYES IN THE DARK (8x8) ========
A('eyes', [
  '........',
  '........',
  '.b...b..',
  'bb..bb..',
  '........',
  '........',
  '........',
  '........',
]);

// ======== SMALL PROPS ========
A('fence', [
  '........',
  '.4....4.',
  '44444444',
  '.4....4.',
  '.4....4.',
  '44444444',
  '.4....4.',
  '.4....4.',
]);
A('skull', [
  '........',
  '.aaaaa..',
  'aaaaaaa.',
  'a1aa1aa.',
  'aaaaaaa.',
  '.a1a1a..',
  '.aaaaa..',
  '........',
]);
A('dust', [
  '........',
  '........',
  '........',
  '.f..7...',
  '7.f.....',
  '..7..f..',
  '.f.7....',
  '........',
]);
A('pgun', [
  '........',
  '.b....b.',
  'eeeeee..',
  'eeeeeee.',
  '..ee....',
  '..ee....',
  '.b...b..',
  '........',
]);
A('poof3', [
  '................',
  'f......f........',
  '...............f',
  '....f...........',
  '............f...',
  'f...............',
  '.......f........',
  '................',
  '..f.........f...',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
]);

// ======== PROCEDURAL SPRITES ========
// seeded PRNG for deterministic speckle
function prng(seed) { let s = seed; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }

// big mesa 64x40: horizontal strata + sparse cracks
(function mesa() {
  const W = 64, H = 40, g = Array.from({ length: H }, () => Array(W).fill('.'));
  const rnd = prng(42);
  for (let y = 0; y < H; y++) {
    const l = Math.max(0, Math.round(20 - y * 1.4)), r = Math.min(W - 1, Math.round(43 + y * 1.4));
    for (let x = l; x <= r; x++) {
      let c = '4';
      if (y < 2) c = '5';                                   // sunlit plateau top
      else if (y === 2) c = '3';                            // rim shadow
      else if (y >= 10 && y <= 11) c = '3';                 // stratum band
      else if (y >= 12 && y <= 12) c = '5';                 // lit ledge
      else if (y >= 22 && y <= 23) c = '3';
      else if (y === 24) c = '5';
      else if (y >= H - 5) c = '3';                         // talus shadow base
      if (y >= H - 2) c = '2';
      if (x <= l + 1 && y >= 2 && y < 16) c = '5';          // lit left slope
      if (x >= r - 1 && y >= 2) c = '3';                    // shaded right edge
      g[y][x] = c;
    }
  }
  // sparse vertical cracks, staggered lengths
  for (const [cx, y0, y1] of [[11, 14, 26], [22, 4, 18], [31, 13, 33], [43, 5, 20], [52, 16, 30], [37, 26, 37]]) {
    for (let y = y0; y <= y1; y++) if (rnd() > 0.25) { if (g[y][cx] !== '.') g[y][cx] = '2'; }
  }
  ART['mesa'] = g.map(r => r.join(''));
})();

// far mesa 40x24 (flat silhouette)
(function mesafar() {
  const W = 40, H = 24, g = Array.from({ length: H }, () => Array(W).fill('.'));
  for (let y = 0; y < H; y++) {
    const l = Math.max(0, 9 - y), r = Math.min(W - 1, 30 + y);
    for (let x = l; x <= r; x++) g[y][x] = y < 2 ? '4' : '3';
  }
  ART['mesafar'] = g.map(r => r.join(''));
})();

// star field tiles (2 variants, 8x8)
(function stars() {
  const rnd = prng(7);
  for (let v = 1; v <= 2; v++) {
    const g = Array.from({ length: 8 }, () => Array(8).fill('.'));
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(rnd() * 8), y = Math.floor(rnd() * 8);
      g[y][x] = i === 0 && v === 2 ? 'b' : 'f';
    }
    ART['stars' + v] = g.map(r => r.join(''));
  }
})();

// forest ground tiles
(function fground() {
  const rnd = prng(13);
  for (const [name, top] of [['fground', false], ['fgroundtop', true]]) {
    const g = Array.from({ length: 8 }, () => Array(8).fill('6'));
    for (let i = 0; i < 5; i++) g[Math.floor(rnd() * 8)][Math.floor(rnd() * 8)] = '7';
    if (top) for (let x = 0; x < 8; x++) g[0][x] = '7';
    ART[name] = g.map(r => r.join(''));
  }
})();

// ======== 3x5 FONT -> 8x8 tiles ========
const FONT_GLYPHS = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#...#', '##..#', '#.#.#', '#..##', '#...#'],
  O: ['###', '#.#', '#.#', '#.#', '###'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.##.', '#..#', '#..#', '#.#.', '.#.#'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'],
  '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '##.'],
  '.': ['.', '.', '.', '.', '#'], '!': ['#', '#', '#', '.', '#'],
  '?': ['###', '..#', '.##', '...', '.#.'], '-': ['...', '...', '###', '...', '...'],
  ':': ['.', '#', '.', '#', '.'], "'": ['#', '#', '.', '.', '.'],
  '/': ['..#', '..#', '.#.', '#..', '#..'], ',': ['..', '..', '..', '.#', '#.'],
  '+': ['...', '.#.', '###', '.#.', '...'],
};
const FONT_W = {}; // char -> advance width
(function buildFont() {
  for (const [ch, rows] of Object.entries(FONT_GLYPHS)) {
    const w = rows[0].length;
    FONT_W[ch] = w + 1;
    const g = Array.from({ length: 8 }, () => Array(8).fill('.'));
    rows.forEach((r, y) => r.split('').forEach((c, x) => { if (c === '#') g[y + 1][x] = 'a'; }));
    ART['f_' + ch] = g.map(r => r.join(''));
  }
  FONT_W[' '] = 4;
})();

module.exports = { THEMES, ART, FONT_W };

// ---------------- tile slicing + base64 ----------------
const CHARMAP = {};
'.123456789abcdef'.split('').forEach((c, i) => CHARMAP[c] = i === 0 ? 0 : i);
CHARMAP['0'] = 0; CHARMAP[' '] = 0;

function gridToPixels(rows, name) {
  const h = rows.length, w = rows[0].length;
  if (w % 8 || h % 8) throw new Error(`${name}: ${w}x${h} not multiple of 8`);
  for (const r of rows) if (r.length !== w) throw new Error(`${name}: ragged rows (${r.length} vs ${w})`);
  const px = [];
  for (const r of rows) for (const c of r) {
    if (!(c in CHARMAP)) throw new Error(`${name}: bad char '${c}'`);
    px.push(CHARMAP[c]);
  }
  return { w, h, px };
}

function encode() {
  const tileMap = new Map();
  const tiles = [];
  const sprites = {};
  for (const [name, rows] of Object.entries(ART)) {
    const { w, h, px } = gridToPixels(rows, name);
    const tw = w / 8, th = h / 8, t = [];
    for (let ty = 0; ty < th; ty++) for (let tx = 0; tx < tw; tx++) {
      const bytes = Buffer.alloc(32);
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x += 2) {
        const p0 = px[(ty * 8 + y) * w + tx * 8 + x];
        const p1 = px[(ty * 8 + y) * w + tx * 8 + x + 1];
        bytes[y * 4 + x / 2] = (p0 << 4) | p1;
      }
      const b64 = bytes.toString('base64');
      if (!tileMap.has(b64)) { tileMap.set(b64, tiles.length); tiles.push(b64); }
      t.push(tileMap.get(b64));
    }
    sprites[name] = { tw, th, t };
  }
  return { tiles, sprites };
}

// ---------------- minimal PNG writer ----------------
function crc32(buf) {
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
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
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }

// render one sprite preview at scale, checkered bg
function preview(name, theme, scale, outDir) {
  const rows = ART[name];
  const { w, h, px } = gridToPixels(rows, name);
  const pal = THEMES[theme].pal;
  const W = w * scale, H = h * scale;
  const rgba = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = px[Math.floor(y / scale) * w + Math.floor(x / scale)];
    const i = (y * W + x) * 4;
    if (p === 0) {
      const ck = (Math.floor(x / scale / 4) + Math.floor(y / scale / 4)) % 2 ? 40 : 55;
      rgba[i] = ck; rgba[i + 1] = ck; rgba[i + 2] = ck + 8; rgba[i + 3] = 255;
    } else {
      const [r, g, b] = hex(pal[p]);
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
    }
  }
  writePNG(path.join(outDir, `${name}_${theme}.png`), W, H, rgba);
}

// combined sheet of all sprites, one theme
function sheet(theme, scale, outDir) {
  const names = Object.keys(ART);
  const pal = THEMES[theme].pal;
  const pad = 4;
  // layout: rows of sprites, wrap at 480px wide (pre-scale)
  let x = pad, y = pad, rowH = 0;
  const places = [];
  const MAXW = 300;
  for (const n of names) {
    const { w, h } = gridToPixels(ART[n], n);
    if (x + w > MAXW) { x = pad; y += rowH + pad; rowH = 0; }
    places.push({ n, x, y, w, h });
    x += w + pad; rowH = Math.max(rowH, h);
  }
  const W = MAXW * scale, H = (y + rowH + pad) * scale;
  const rgba = Buffer.alloc(W * H * 4);
  const [sr, sg, sb] = hex(THEMES[theme].sky);
  for (let i = 0; i < W * H; i++) { rgba[i * 4] = sr; rgba[i * 4 + 1] = sg; rgba[i * 4 + 2] = sb; rgba[i * 4 + 3] = 255; }
  for (const pl of places) {
    const { px } = gridToPixels(ART[pl.n], pl.n);
    for (let yy = 0; yy < pl.h * scale; yy++) for (let xx = 0; xx < pl.w * scale; xx++) {
      const p = px[Math.floor(yy / scale) * pl.w + Math.floor(xx / scale)];
      if (p === 0) continue;
      const X = pl.x * scale + xx, Y = pl.y * scale + yy;
      const i = (Y * W + X) * 4;
      const [r, g, b] = hex(pal[p]);
      rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = 255;
    }
  }
  writePNG(path.join(outDir, `sheet_${theme}.png`), W, H, rgba);
  return places;
}

if (require.main === module) {
  const outDir = path.join(__dirname, 'previews');
  fs.mkdirSync(outDir, { recursive: true });
  const arg = process.argv[2];
  if (arg === 'emit') {
    const { tiles, sprites } = encode();
    const js = `const TILE_B64=${JSON.stringify(tiles)};\nconst SPR=${JSON.stringify(sprites)};\nconst THEMES=${JSON.stringify(THEMES)};`;
    fs.writeFileSync(path.join(__dirname, 'assets.js'), js);
    console.log(`tiles: ${tiles.length}, sprites: ${Object.keys(sprites).length}, assets.js bytes: ${js.length}`);
  } else if (arg) {
    // preview single sprite(s): node sprites.js p_idle,p_run1 [theme] [scale]
    const theme = process.argv[3] || 'day';
    const scale = +(process.argv[4] || 10);
    for (const n of arg.split(',')) preview(n, theme, scale, outDir);
    console.log('wrote previews:', arg);
  } else {
    for (const th of Object.keys(THEMES)) sheet(th, 4, outDir);
    console.log('wrote sheets. sprites:', Object.keys(ART).length);
    const { tiles } = encode();
    console.log('unique tiles:', tiles.length);
  }
}
