// deterministic fork->paycar reachability + full paycar route via skip
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = 'file://' + path.join(__dirname, '..', 'dist', 'tiny-west.html');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(file); await page.waitForTimeout(600);

// 1. exact-input fork -> ladder jump
const forkTest = await page.evaluate(() => {
  const T = window.TinyWestTest;
  T.startSlice(555); T.skipToState('fork');
  const trace = [];
  for (let i = 0; i < 112; i++) trace.push({ moveX: 1 });
  trace.push({ jumpPressed: true });
  for (let i = 0; i < 40; i++) trace.push({});
  T.injectLogicalInput(trace);
  return new Promise(res => setTimeout(() => res(T.getState()), 3200));
});
console.log('1. fork->paycar via exact input:', forkTest, forkTest === 'paycar' || forkTest === 'pcleap' ? 'PASS' : 'FAIL');

// 2. full pay-car route from skip: marshal, pins, cash, return, escape, x1.5
await page.evaluate(() => { window.TinyWestTest.startSlice(777); window.TinyWestTest.skipToState('paycar'); });
await page.waitForTimeout(300);
await page.locator('canvas').screenshot({ path: path.join(__dirname, 'shots', 'qa_paycar.png') });
for (let i = 0; i < 260; i++) {
  await page.waitForTimeout(100);
  if (i % 2 === 0) await page.keyboard.press('KeyX');
  if (i % 8 === 3) { await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(110); await page.keyboard.up('ArrowLeft'); }
  if (i % 8 === 7) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(110); await page.keyboard.up('ArrowRight'); }
  const st = await page.evaluate(() => window.TinyWestTest.getState());
  if (st === 'ret' || st === 'results') break;
}
console.log('2. after paycar fight:', await page.evaluate(() => window.TinyWestTest.getState()));
for (let i = 0; i < 100; i++) {
  await page.waitForTimeout(130);
  const st = await page.evaluate(() => window.TinyWestTest.getState());
  if (st === 'ret' && i % 4 === 3) await page.keyboard.press('Space');
  if (st === 'results') break;
}
const end = await page.evaluate(() => {
  const s = window.TinyWestTest.getSnapshot();
  const log = window.TinyWestTest.exportEventLog();
  const endE = log.find(e => e.type === 'run_end');
  return { state: s.state, banked: s.banked, final: endE && endE.d.final, success: endE && endE.d.success };
});
console.log('2. paycar route end:', JSON.stringify(end));
await page.locator('canvas').screenshot({ path: path.join(__dirname, 'shots', 'qa_paycar_end.png') });
console.log('errors:', errs.length ? errs : 'none');
await browser.close();
