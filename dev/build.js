// Assemble single-file index.html: React UMD + base64 assets + game, zero external requests
const fs = require('fs');
const path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const rdReact = f => {
  const nm = path.join(__dirname, 'node_modules', f.startsWith('react-dom') ? 'react-dom' : 'react', 'umd',
    f.replace('.min.js', '.production.min.js'));
  if (fs.existsSync(nm)) return fs.readFileSync(nm, 'utf8');
  return rd(f);
};
const esc = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const css = `
:root{color-scheme:dark}
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%}
body{background:#14121f;color:#c8c2d8;font-family:'Courier New',ui-monospace,monospace;
  display:flex;align-items:center;justify-content:center;overflow:hidden}
.shell{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px}
.frame{line-height:0;border:3px solid #2e2434;box-shadow:0 0 0 3px #5b5568,0 8px 30px rgba(0,0,0,.6)}
canvas{image-rendering:pixelated;image-rendering:crisp-edges;background:#000;outline:none;touch-action:none}
.bar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;justify-content:center;font-size:12px}
.brand{color:#f5cf4e;letter-spacing:2px;font-weight:bold}
.hint{color:#8f8aa5}
.mute{background:#2e2434;color:#f9ecd2;border:1px solid #5b5568;padding:3px 10px;cursor:pointer;font:inherit;font-size:11px}
.mute:hover{background:#3d2b4a}
.pads{display:flex;justify-content:space-between;width:100%;max-width:480px;user-select:none;-webkit-user-select:none}
.pgroup{display:flex;gap:6px}
.tbtn{width:52px;height:52px;border-radius:10px;border:2px solid #5b5568;background:#2e2434;color:#f9ecd2;
  font-size:14px;font-family:inherit;touch-action:none;user-select:none;-webkit-user-select:none}
.tbtn:active{background:#9c4f40}
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>Tiny West — a Sunset Riders tribute</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<noscript>Tiny West needs JavaScript to run.</noscript>
<script>${esc(rdReact('react.min.js'))}</script>
<script>${esc(rdReact('react-dom.min.js'))}</script>
<script>
/* ==== ASSETS: every graphic in the game lives here, 8x8 tiles base64-encoded ==== */
${esc(rd('assets.js'))}
</script>
<script>
${esc(rd('game.js'))}
</script>
</body>
</html>
`;
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'index.html');
fs.writeFileSync(out, html);
console.log(out, 'bytes:', html.length);
