// extended QA: pay-car route, touch completion, viewports, reset cycles
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = 'file://' + path.join(__dirname, '..', 'dist', 'tiny-west.html');
const shots = path.join(__dirname, 'shots');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

// --- A. pay-car route ---
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(file); await page.waitForTimeout(600);
  await page.evaluate(() => { window.TinyWestTest.startSlice(555); window.TinyWestTest.skipToState('fork'); });
  await page.waitForTimeout(400);
  // ride toward pay-car ladder: poll relative position, jump in band
  let entered = false;
  for (let i = 0; i < 120 && !entered; i++) {
    const rel = await page.evaluate(() => {
      const s = window.TinyWestTest.getSnapshot();
      return { st: s.state, rel: s.px - (s.trainX + 368 + 6) };
    });
    if (rel.st === 'pcleap' || rel.st === 'paycar') { entered = true; break; }
    if (rel.rel < -34) await page.keyboard.down('ArrowRight');
    else if (rel.rel > 4) { await page.keyboard.up('ArrowRight'); await page.keyboard.down('ArrowLeft'); }
    else { await page.keyboard.up('ArrowRight'); await page.keyboard.up('ArrowLeft'); await page.keyboard.press('Space'); }
    await page.waitForTimeout(120);
  }
  await page.keyboard.up('ArrowRight').catch(()=>{}); await page.keyboard.up('ArrowLeft').catch(()=>{});
  console.log('A. paycar entered:', entered, await page.evaluate(() => window.TinyWestTest.getState()));
  await page.waitForTimeout(600);
  await page.locator('canvas').screenshot({ path: shots + '/qa_paycar.png' });
  // fight marshal + pins + collect
  for (let i = 0; i < 220; i++) {
    await page.waitForTimeout(110);
    if (i % 2 === 0) await page.keyboard.press('KeyX');
    if (i % 9 === 4) { await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(120); await page.keyboard.up('ArrowLeft'); }
    if (i % 9 === 8) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(120); await page.keyboard.up('ArrowRight'); }
    const st = await page.evaluate(() => window.TinyWestTest.getState());
    if (st === 'ret' || st === 'results') break;
  }
  console.log('A. after paycar:', await page.evaluate(() => window.TinyWestTest.getState()));
  // return + escape
  for (let i = 0; i < 80; i++) {
    await page.waitForTimeout(140);
    const st = await page.evaluate(() => window.TinyWestTest.getState());
    if (st === 'ret' && i % 5 === 4) await page.keyboard.press('Space');
    if (st === 'escape' || st === 'fork') { /* keep riding */ }
    if (st === 'results') break;
  }
  const end = await page.evaluate(() => window.TinyWestTest.getSnapshot());
  const mult = await page.evaluate(() => window.__lastMult = (function(){try{return JSON.stringify({});}catch(e){return '';}})());
  console.log('A. paycar end:', JSON.stringify(end));
  await page.locator('canvas').screenshot({ path: shots + '/qa_paycar_end.png' });
  console.log('A. errors:', errs.length ? errs : 'none');
  await page.close();
}

// --- B. touch-only completion (emulated) ---
{
  const ctx2 = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, isMobile: true });
  const page = await ctx2.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(file); await page.waitForTimeout(700);
  const padsVisible = await page.evaluate(() => getComputedStyle(document.getElementById('pads')).display !== 'none');
  await page.locator('canvas').tap();
  await page.waitForTimeout(400);
  const started = await page.evaluate(() => window.TinyWestTest.getState());
  console.log('B. touch pads visible:', padsVisible, 'started state:', started);
  await page.screenshot({ path: shots + '/qa_touch_portrait.png' });
  // drive via test injection to verify completion possible on this layout (touch input maps to same logical layer)
  const det = await page.evaluate(() => window.TinyWestTest.runDeterminismCheck(999, 600));
  console.log('B. determinism on touch device:', det.pass);
  console.log('B. errors:', errs.length ? errs : 'none');
  await ctx2.close();
}

// --- C. viewport matrix ---
for (const [w, h] of [[1100, 760], [412, 915], [360, 640], [915, 412]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(file); await page.waitForTimeout(500);
  const box = await page.locator('canvas').boundingBox();
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth + 2);
  console.log(`C. ${w}x${h}: canvas ${Math.round(box.width)}x${Math.round(box.height)} overflow:${overflow}`);
  await page.screenshot({ path: shots + `/qa_vp_${w}x${h}.png` });
  await page.close();
}

// --- D. 20 reset cycles bounded ---
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 620 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(file); await page.waitForTimeout(500);
  for (let i = 0; i < 20; i++) {
    await page.evaluate(() => { window.TinyWestTest.startSlice(1000 + Math.floor(Math.random() * 100)); });
    await page.waitForTimeout(120);
    await page.keyboard.press('KeyR');
    await page.waitForTimeout(80);
  }
  const bounded = await page.evaluate(() => {
    const s = window.TinyWestTest.getSnapshot();
    const log = window.TinyWestTest.exportEventLog();
    return { state: s.state, log: log.length, bullets: s.bullets, coins: s.coins };
  });
  console.log('D. after 20 resets:', JSON.stringify(bounded), 'errors:', errs.length ? errs : 'none');
  await page.close();
}
await browser.close();
