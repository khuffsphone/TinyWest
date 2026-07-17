// build dist/tiny-west.html — one offline file, zero external requests
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rd = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const esc = s => s.replace(/<\/script/gi, '<\\/script');

const css = `
:root{color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{background:#151421;display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:ui-monospace,monospace;overflow:hidden;touch-action:manipulation}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;background:#151421;touch-action:none}
#frame{line-height:0;border:2px solid #24243A;box-shadow:0 0 0 2px #414A66,0 10px 34px rgba(0,0,0,.6)}
#pads{display:none;justify-content:space-between;align-items:center;width:100%;max-width:560px;
  padding:10px 14px;user-select:none;-webkit-user-select:none;gap:10px}
#stick{width:96px;height:96px;border-radius:50%;border:2px solid #414A66;background:#24243A;touch-action:none}
.btn{width:64px;height:64px;border-radius:14px;border:2px solid #414A66;background:#24243A;color:#FFF1BD;
  font:bold 13px ui-monospace,monospace;touch-action:none}
.btn:active{background:#543142}
#btnPause{width:48px;height:44px;font-size:11px;border-radius:8px}
.bgroup{display:flex;gap:10px;align-items:center}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Tiny West: Rampage Express — 42s Slice</title>
<style>${css}</style>
</head>
<body>
<div id="frame"><canvas id="game" width="480" height="270" aria-label="Tiny West Rampage Express"></canvas></div>
<div id="pads">
  <div id="stick" aria-label="move"></div>
  <div class="bgroup">
    <button id="btnPause" class="btn" aria-label="pause">II</button>
    <button id="btnJump" class="btn" aria-label="jump">JUMP</button>
    <button id="btnFire" class="btn" aria-label="fire">FIRE</button>
  </div>
</div>
<noscript>Tiny West needs JavaScript.</noscript>
<script>
${esc(rd('src/atlas.gen.js'))}
</script>
<script>
${esc(rd('src/game.js'))}
</script>
</body>
</html>
`;
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, '..', 'dist', 'tiny-west.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
const bytes = fs.statSync(out).size;
console.log(out, bytes, 'bytes', bytes < 1200000 ? '(under 1.2MB target)' : '(OVER TARGET)');
if (/https?:\/\//.test(html.replace(/https?:\/\/[^"']*claude/g, ''))) {
  const m = html.match(/https?:\/\/[^\s"'<>]+/g);
  console.log('external URL check:', m ? m.filter(u => !u.includes('w3.org')) : 'none');
}
