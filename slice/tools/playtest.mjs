// slice playtest: smoke + determinism + natural keyboard run with screenshots
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + path.join(__dirname, '..', 'dist', 'tiny-west.html'));
await page.waitForTimeout(700);
const shots = path.join(__dirname, 'shots');
fs.mkdirSync(shots, { recursive: true });
const cv = page.locator('canvas');
const state = () => page.evaluate(() => window.TinyWestTest.getState());
const snap = () => page.evaluate(() => window.TinyWestTest.getSnapshot());

// 1. smoke + determinism
const smoke = await page.evaluate(() => window.TinyWestTest.runSmokeTests());
console.log('smoke:', JSON.stringify(smoke));
const det = await page.evaluate(() => window.TinyWestTest.runDeterminismCheck(31337, 1200));
console.log('determinism:', JSON.stringify(det));

// 2. title shot then natural play, fixed seed
await page.evaluate(() => window.TinyWestTest.setSeed(20260717));
await page.waitForTimeout(300);
await cv.screenshot({ path: shots + '/s0_title.png' });
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
console.log('after start:', await state());

// CHASE: ride right toward ladder, jump fences when close, build sync, board on window
let boarded = false;
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 120 && !boarded; i++) {
  await page.waitForTimeout(120);
  const s = await snap();
  if (i === 18) await cv.screenshot({ path: shots + '/s1_chase.png' });
  // read window state via event log
  const st = s.state;
  if (st === 'board' || st === 'settle') { boarded = true; break; }
  const open = await page.evaluate(() => {
    const log = window.TinyWestTest.exportEventLog();
    for (let j = log.length - 1; j >= 0; j--) {
      if (log[j].type === 'board_window_open') return true;
      if (log[j].type === 'board_window_missed' || log[j].type === 'board_leap') return false;
    }
    return false;
  });
  // hop fences occasionally while closing in; jump when window open
  if (open) { await page.keyboard.up('ArrowRight'); await page.keyboard.press('Space'); await page.keyboard.down('ArrowRight'); }
  else if (i % 9 === 4) await page.keyboard.press('Space');
}
await page.keyboard.up('ArrowRight');
console.log('boarded:', boarded, 'state:', await state());
await page.waitForTimeout(600);
await cv.screenshot({ path: shots + '/s2_settle.png' });

// RELAY: fight — fire repeatedly, dodge by moving
for (let i = 0; i < 200; i++) {
  await page.waitForTimeout(110);
  if (i % 2 === 0) await page.keyboard.press('KeyX');
  if (i % 11 === 3) { await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(140); await page.keyboard.up('ArrowLeft'); }
  if (i % 13 === 6) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(140); await page.keyboard.up('ArrowRight'); }
  const st = await state();
  if (i === 12) await cv.screenshot({ path: shots + '/s3_relay.png' });
  if (st === 'lock') break;
  if (st === 'results') { console.log('DIED in relay'); break; }
}
console.log('after relay:', await state(), JSON.stringify(await snap()));

// LOCK: run right to car B, shoot pins (aim right/at pins), jump the gap
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(900);
await page.keyboard.press('Space'); // gap jump
await page.waitForTimeout(700);
await page.keyboard.press('Space');
await page.waitForTimeout(900);
await page.keyboard.up('ArrowRight');
for (let i = 0; i < 80; i++) {
  await page.waitForTimeout(120);
  await page.keyboard.press('KeyX');
  const st = await state();
  if (i === 6) await cv.screenshot({ path: shots + '/s4_lock.png' });
  if (st === 'cash') break;
}
console.log('after lock:', await state());
await page.waitForTimeout(300);
await cv.screenshot({ path: shots + '/s5_cash.png' });

// CASH: walk around to collect
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(160);
  await page.keyboard.down(i % 2 ? 'ArrowLeft' : 'ArrowRight');
  await page.waitForTimeout(160);
  await page.keyboard.up(i % 2 ? 'ArrowLeft' : 'ArrowRight');
  if ((await state()) === 'ret') break;
}
console.log('after cash:', await state(), 'snap:', JSON.stringify(await snap()));
await cv.screenshot({ path: shots + '/s6_return.png' });

// RETURN: wait for good alignment then jump (poll horse vs player x via snapshot? use event: just try when close)
for (let i = 0; i < 60; i++) {
  await page.waitForTimeout(120);
  const aligned = await page.evaluate(() => {
    const s = window.TinyWestTest.getSnapshot();
    return s.state === 'ret';
  });
  if (!aligned) break;
  if (i % 6 === 5) await page.keyboard.press('Space'); // attempt periodically; grade varies
}
await page.waitForTimeout(1200);
console.log('after return:', await state(), JSON.stringify(await snap()));
await cv.screenshot({ path: shots + '/s7_fork.png' });

// FORK + ESCAPE: ride to exit and keep riding (escape requires input now)
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 140; i++) {
  await page.waitForTimeout(150);
  const st = await state();
  if (i === 20) await cv.screenshot({ path: shots + '/s8_forkride.png' });
  if (st === 'results') break;
}
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(600);
const end = await snap();
console.log('END:', JSON.stringify(end));
await cv.screenshot({ path: shots + '/s9_results.png' });

// natural duration check from event log
const dur = await page.evaluate(() => {
  const log = window.TinyWestTest.exportEventLog();
  const start = log.find(e => e.type === 'state' && e.d.to === 'chase');
  const endE = log.find(e => e.type === 'run_end');
  return start && endE ? Math.round((endE.t - start.t) / 60) : null;
});
console.log('run duration (s):', dur);
console.log('pageerrors:', errors.length ? errors : 'none');
await browser.close();
