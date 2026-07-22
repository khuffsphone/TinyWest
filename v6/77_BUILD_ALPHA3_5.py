#!/usr/bin/env python3
"""77_BUILD_ALPHA3_5.py — deterministic builder for Tiny West: Iron Trail alpha.3.5
(GOV-69 game-feel juice candidate, GOV-72 corrected queue, GOV-75 cloud game-build lease).

Source (immutable, SHA-verified):  Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html
Output:                            Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html

Every edit is an anchored replacement; each anchor must occur EXACTLY once or the
build aborts. Pure text transform — no timestamps, no randomness — so the rebuild
is byte-identical. Presentation-layer only: the TW_JUICE module is a read-only
observer of G with its own xorshift32 decorative RNG (never G.rng/G.fxRng), zero
G.* writes, and nothing inside getSimulationState()/stateHash. Its hit-stop skips
render() calls only; the deterministic tick sequence is never altered.
"""
import hashlib, pathlib, sys

SRC = pathlib.Path(__file__).resolve().parent / "Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html"
OUT = pathlib.Path(__file__).resolve().parent / "Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html"
SRC_SHA = "1dcb5a74f787c5b800f049bf35815a2adc54173015f9a33761ddc80ce0360873"
SRC_BYTES = 2460430

JUICE_MODULE = """  // TW_JUICE (alpha.3.5, GOV-69 juice candidate): render-only game-feel layer.
  // Constraints: read-only observer of G (zero G.* writes); own decorative RNG
  // (xorshift32, fixed seed) — never G.rng/G.fxRng; no wall-clock reads; nothing
  // here is read by tick()/authoritativeSimulationState()/stateHash. Hit-stop
  // skips render() calls only (frame() gate) — the deterministic tick sequence
  // is never altered. Toggle: PROFILE.settings.juice (OPTIONS menu, default ON).
  const TW_JUICE=(()=>{
    let s=0x1CEB00DA;const jr=()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296};
    const st={parts:[],pops:[],shake:0,shakeX:0,shakeY:0,freeze:0,flashK:0,vign:0,muzzle:0,muzzleX:0,muzzleY:0,muzzleDir:1,dustT:0,prev:null};
    const D={events:0,shots:0,kills:0,hits:0,hurt:0,coins:0,lands:0,pops:0,spawned:0,frozenFrames:0,resets:0,lastEvent:''};
    const on=()=>PROFILE.settings.juice!==false;
    function reset(){st.parts.length=0;st.pops.length=0;st.shake=0;st.shakeX=0;st.shakeY=0;st.freeze=0;st.flashK=0;st.vign=0;st.muzzle=0;st.dustT=0;D.resets++;}
    function part(p){if(st.parts.length>160)st.parts.shift();st.parts.push({vx:0,vy:0,ay:0,drag:.97,life:24,max:24,size:2,color:'#fff',glint:false,...p});D.spawned++;}
    function coinBurst(x,y,n){for(let i=0;i<n;i++){const a=jr()*Math.PI*2,v=.6+jr()*2.1;part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.1,ay:.1,drag:.95,life:(16+jr()*14)|0,max:30,size:jr()<.5?1:2,color:jr()<.55?'#f4c34e':'#fff3a0',glint:true});}}
    function dustPuff(x,y,n,back){for(let i=0;i<n;i++)part({x:x+(jr()-.5)*10,y:y-jr()*2,vx:(jr()-.5)*1.6-(back||0),vy:-.3-jr()*.9,drag:.93,life:(14+jr()*12)|0,max:26,size:(2+jr()*2)|0,color:'#c9a06a'});}
    function pop(text,color){if(st.pops.length>6)st.pops.shift();st.pops.push({text,color,t:0,life:38});D.pops++;}
    function kick(name,sh,fz,fl,vg){
      D.events++;D.lastEvent=name;
      if(PROFILE.settings.shake){st.shake=Math.min(6,st.shake+sh);if(fz>st.freeze&&G.mode==='play'&&!G.paused)st.freeze=Math.min(4,fz);}
      if(!PROFILE.settings.reducedFlash){if(fl)st.flashK=Math.max(st.flashK,fl);if(vg)st.vign=Math.max(st.vign,vg);}
    }
    function observe(){
      if(!on()){if(st.prev||st.parts.length||st.pops.length)reset();st.prev=null;return;}
      const pl=G.player;
      const cur={mode:G.mode,seed:G.seed,runFrame:G.runFrame,shots:G.shots,hits:G.hits,kills:G.kills,score:G.score,hp:pl?pl.hp:0,carried:G.carried,banked:G.banked,coins:G.trailCoins,state:pl?pl.state:'',paused:G.paused};
      const pv=st.prev;st.prev=cur;
      if(!pv||cur.mode!==pv.mode||cur.seed!==pv.seed||cur.runFrame<pv.runFrame){reset();return;}
      if(cur.mode==='play'&&!cur.paused&&pl){
        const pc=playerCenter();
        if(cur.shots>pv.shots){D.shots+=cur.shots-pv.shots;st.muzzle=3;st.muzzleX=pc.x+(pl.facing||1)*13;st.muzzleY=pc.y-2;st.muzzleDir=pl.facing||1;kick('shot',.9,0,.5,0);}
        if(cur.kills>pv.kills){D.kills+=cur.kills-pv.kills;kick('kill',2.2,3,.35,0);}
        else if(cur.hits>pv.hits){D.hits+=cur.hits-pv.hits;kick('hit',.6,0,0,0);}
        if(pv.hp>0&&cur.hp<pv.hp){D.hurt++;kick('hurt',3.2,2,0,1);}
        const gain=Math.max(0,cur.carried-pv.carried)+Math.max(0,cur.banked-pv.banked)+Math.max(0,cur.coins-pv.coins);
        if(gain>0){D.coins++;D.events++;D.lastEvent='coin';coinBurst(pc.x,pc.y-4,Math.min(14,6+gain*3));}
        if(cur.state!==pv.state&&(cur.state==='roof'||cur.state==='horse')){D.lands++;kick('land',1.1,0,0,0);dustPuff(pc.x,cur.state==='roof'?ROOF_Y-2:(pl.y||H-40)+1,7,0);}
        if(cur.state==='horse'&&(pl.z||0)===0){if(++st.dustT>=7){st.dustT=0;dustPuff(pl.x-8,pl.y+1,1,.8);}}else st.dustT=0;
        const ds=cur.score-pv.score;
        if(ds>=50)pop('+'+ds,ds>=400?'#f4c34e':'#e8dfcc');
      }else{st.freeze=0;st.dustT=0;}
      st.shake*=.85;if(st.shake<.05)st.shake=0;
      const t=st.shake*st.shake/6;st.shakeX=((jr()*2-1)*t)|0;st.shakeY=((jr()*2-1)*t*.7)|0;
      if(st.flashK>0)st.flashK=Math.max(0,st.flashK-.12);
      if(st.vign>0)st.vign=Math.max(0,st.vign-.05);
      if(st.muzzle>0)st.muzzle--;
      for(let i=st.parts.length-1;i>=0;i--){const p=st.parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.ay;p.vx*=p.drag;p.vy*=p.drag;if(--p.life<=0)st.parts.splice(i,1);}
      for(let i=st.pops.length-1;i>=0;i--){const f=st.pops[i];if(++f.t>=f.life)st.pops.splice(i,1);}
    }
    function drawWorldFX(c){
      if(!on()||G.mode!=='play')return;
      for(const p of st.parts){
        c.globalAlpha=clamp(p.life/p.max,0,1);c.fillStyle=p.color;c.fillRect(p.x|0,p.y|0,p.size,p.size);
        if(p.glint){c.globalAlpha*=.45;c.fillRect((p.x-1)|0,p.y|0,p.size+2,1);}
      }
      c.globalAlpha=1;
      if(st.muzzle>0){
        const mx=st.muzzleX|0,my=st.muzzleY|0,d=st.muzzleDir,r=2+st.muzzle*2;
        c.globalAlpha=.8;c.fillStyle='#fff3a0';c.fillRect((mx+d*3-r/2)|0,my-1,r,2);c.fillRect((mx+d*4-1)|0,(my-r/2)|0,2,r);
        c.globalAlpha=.4;c.fillStyle='#f5a83f';c.fillRect(mx-2,my-2,4,4);c.globalAlpha=1;
      }
    }
    function drawScreenFX(c){
      if(!on()||G.mode!=='play')return;
      if(st.vign>0){c.globalAlpha=clamp(st.vign,0,1)*.4;for(let i=0;i<3;i++){const th=3+i*3;box(c,0,i*2,W,th,'rgba(168,32,38,.3)');box(c,0,H-th-i*2,W,th,'rgba(168,32,38,.3)');box(c,i*2,0,th,H,'rgba(168,32,38,.3)');box(c,W-th-i*2,0,th,H,'rgba(168,32,38,.3)');}c.globalAlpha=1;}
      if(st.flashK>0){c.globalAlpha=st.flashK*.16;box(c,0,0,W,H,'#fff3a0');c.globalAlpha=1;}
      for(const f of st.pops){const k=f.t/f.life,rise=(1-Math.pow(1-Math.min(1,k*1.6),3))*12;c.globalAlpha=clamp(1.2-k,0,1);label(c,f.text,W-13,(30-rise)|0,7,f.color,'right');}
      c.globalAlpha=1;
    }
    function allowRender(){
      if(st.freeze>0&&on()&&G.mode==='play'&&!G.paused){st.freeze--;D.frozenFrames++;return false;}
      return true;
    }
    return {observe,drawWorldFX,drawScreenFX,allowRender,
      shakeX:()=>st.shakeX,shakeY:()=>st.shakeY,
      enabled:on,setEnabled(v){PROFILE.settings.juice=v!==false;saveProfile();return on();},
      diagnostics(){return cloneJson({enabled:on(),particles:st.parts.length,pops:st.pops.length,shake:+st.shake.toFixed(3),freezePending:st.freeze,counters:{...D}});}};
  })();

"""

PROVENANCE = """<!-- TW alpha.3.5 build provenance (GOV-69 juice candidate; GOV-72 corrected queue; GOV-75 cloud game-build lease)
{"candidate":"Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html","source":{"file":"Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html","sha256":"1dcb5a74f787c5b800f049bf35815a2adc54173015f9a33761ddc80ce0360873"},"changes":["TW_JUICE render-only game-feel module (muzzle flash, dust/coin particles, damage-vignette pulse, score-pop, additive screen shake, render-frame hit-stop)","JUICE FX options-menu row + PROFILE.settings.juice (default ON, persisted with profile)","__TW.juice test hook (enabled/setEnabled/diagnostics)","options menu row pitch 13px to 12px to seat 17 rows","version bump"],"simSafety":"zero G.* writes; own xorshift32 decorative RNG (never G.rng/G.fxRng); no wall-clock; nothing enters getSimulationState/stateHash; hit-stop skips render() calls only, deterministic tick sequence unchanged; tick-parity vs 1dcb5a74 required juice OFF and ON","builder":"tools/77_BUILD_ALPHA3_5.py"}
-->
"""

# (name, anchor, replacement) — anchor must occur exactly once.
EDITS = [
    ("title",
     "<title>Tiny West: Iron Trail — v6 Alpha.3.4</title>",
     "<title>Tiny West: Iron Trail — v6 Alpha.3.5</title>"),
    ("G.version",
     "version:'6.0.0-alpha.3.4',mode:'title'",
     "version:'6.0.0-alpha.3.5',mode:'title'"),
    ("TW_BUILD_INFO.version",
     "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.4',stage:'A3-0.1'",
     "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.5',stage:'A3-0.1'"),
    ("TW_BUILD_INFO.artifactFile",
     "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.4.html',simulationHz:60",
     "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html',simulationHz:60"),
    ("settings default juice:true",
     "settings:{preset:0,controlPreset:0,damageNumbers:true,reducedFlash:false,shake:true,grain:true,diegetic:false,colorblind:false,haptics:true}",
     "settings:{preset:0,controlPreset:0,damageNumbers:true,reducedFlash:false,shake:true,grain:true,juice:true,diegetic:false,colorblind:false,haptics:true}"),
    ("module insert + render head hooks",
     "  function render(){\n    drawWorld();ctx.fillStyle=PAL.ink;ctx.fillRect(0,0,W,H);",
     JUICE_MODULE + "  function render(){\n    TW_JUICE.observe();drawWorld();TW_JUICE.drawWorldFX(wctx);ctx.fillStyle=PAL.ink;ctx.fillRect(0,0,W,H);"),
    ("juice shake offsets vars",
     "sy=G.mode==='play'?(Math.cos(G.runFrame*8.177+G.seed)*trauma*.65)|0:0;",
     "sy=G.mode==='play'?(Math.cos(G.runFrame*8.177+G.seed)*trauma*.65)|0:0,jsx=TW_JUICE.shakeX()|0,jsy=TW_JUICE.shakeY()|0;"),
    ("juice shake offsets applied",
     "ox=sx-(dw-W)*(focus.x/W),oy=sy-(dh-H)*(focus.y/H);",
     "ox=sx+jsx-(dw-W)*(focus.x/W),oy=sy+jsy-(dh-H)*(focus.y/H);"),
    ("screen FX hook",
     "    drawDangerStripes(ctx);drawWantedPoster(ctx);",
     "    TW_JUICE.drawScreenFX(ctx);drawDangerStripes(ctx);drawWantedPoster(ctx);"),
    ("frame render gate (render hit-stop)",
     "if(n===4)acc=0;render();",
     "if(n===4)acc=0;if(TW_JUICE.allowRender())render();"),
    ("OPTION_ROWS juice row",
     "'PALETTE','REBIND KEYS'",
     "'PALETTE','JUICE FX','REBIND KEYS'"),
    ("options values juice entry",
     "['STANDARD','HIGH CONTRAST','COLORBLIND'][TW_OPTS.state.palette||0],'','','']",
     "['STANDARD','HIGH CONTRAST','COLORBLIND'][TW_OPTS.state.palette||0],PROFILE.settings.juice!==false?'ON':'OFF','','','']"),
    ("options adjust juice case",
     "else if(FRONT.row===12){TW_OPTS.state.palette=(TW_OPTS.state.palette+dir+3)%3;TW_OPTS.applyPalette();TW_OPTS.save();SFX.play('coin');}",
     "else if(FRONT.row===12){TW_OPTS.state.palette=(TW_OPTS.state.palette+dir+3)%3;TW_OPTS.applyPalette();TW_OPTS.save();SFX.play('coin');}\n      else if(FRONT.row===13){PROFILE.settings.juice=PROFILE.settings.juice===false;saveProfile();SFX.play('coin');}"),
    ("options confirm renumber",
     "if(FRONT.row<=12)frontEndAdjust(1);else if(FRONT.row===13){TW_OPTS.beginRebind();SFX.play('coin');}else if(FRONT.row===14)fullButton.click?.();else frontEndBack();return;",
     "if(FRONT.row<=13)frontEndAdjust(1);else if(FRONT.row===14){TW_OPTS.beginRebind();SFX.play('coin');}else if(FRONT.row===15)fullButton.click?.();else frontEndBack();return;"),
    ("options row pitch 17 rows",
     ",34+i*13,FRONT.row===i,18,312);",
     ",33+i*12,FRONT.row===i,18,312);"),
    ("__TW.juice test hook",
     "events(){return G.events.slice();},",
     "events(){return G.events.slice();},\n    juice:{enabled:()=>TW_JUICE.enabled(),setEnabled:(v)=>TW_JUICE.setEnabled(v),diagnostics:()=>TW_JUICE.diagnostics()},"),
    ("provenance comment",
     "\n</body>\n</html>",
     "\n" + PROVENANCE + "</body>\n</html>"),
]

def main():
    data = SRC.read_bytes()
    if len(data) != SRC_BYTES:
        sys.exit(f"ABORT: source byte count {len(data)} != {SRC_BYTES}")
    sha = hashlib.sha256(data).hexdigest()
    if sha != SRC_SHA:
        sys.exit(f"ABORT: source SHA {sha} != {SRC_SHA}")
    text = data.decode("utf-8")
    for name, anchor, repl in EDITS:
        n = text.count(anchor)
        if n != 1:
            sys.exit(f"ABORT: anchor for edit '{name}' occurs {n} times (need exactly 1)")
        text = text.replace(anchor, repl)
    out = text.encode("utf-8")
    OUT.write_bytes(out)
    print(f"OK wrote {OUT.name}")
    print(f"bytes: {len(out)}")
    print(f"sha256: {hashlib.sha256(out).hexdigest()}")

if __name__ == "__main__":
    main()
