#!/usr/bin/env python3
"""82_BUILD_ALPHA3_6.py — deterministic builder for Tiny West: Iron Trail alpha.3.6
(doc 59 §3.4 perf/telemetry instrumentation; GOV-80 transport protocol; GOV-81 gate advance).

Source (immutable, SHA-verified):  Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html
  sha256 930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8  (gate target)
Output:                            Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html
  expected sha256 is printed on build and pinned below after first verified build.

Every edit is an anchored replacement; each anchor must occur EXACTLY once or the
build aborts. Pure text transform — no timestamps, no randomness — byte-identical
rebuild. Presentation-layer only: TW_PERF is a diagnostic overlay with closure
state only, zero G.* reads/writes, nothing inside getSimulationState()/stateHash;
its wall-clock values (rAF timestamps, performance.memory/paint entries, the
audio engine's own decodeMs) are display-only and never feed the simulation.
"""
import hashlib, pathlib, sys

SRC = pathlib.Path(__file__).resolve().parent / "Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html"
OUT = pathlib.Path(__file__).resolve().parent / "Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html"
SRC_SHA = "930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8"
SRC_BYTES = 2468050
# Target identity (pinned; GOV-80 requires source+target SHA in the build script):
OUT_SHA = "86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa"
OUT_BYTES = 2472284

PERF_MODULE = """  // TW_PERF (alpha.3.6, doc 59 §3.4): toggleable perf/telemetry HUD. Render-only
  // diagnostic overlay: closure state only, zero G.* reads/writes, nothing here
  // is read by tick()/authoritativeSimulationState()/stateHash. Wall-clock values
  // (rAF timestamps, performance.memory / paint entries, the audio engine's own
  // decodeMs) are DISPLAY-ONLY and never feed the simulation. Toggle: F3 key
  // (capture-phase, ignored while key-rebind capture is active) or __TW.perf.
  // Default OFF each load — diagnostic instrument, not a player setting.
  const TW_PERF=(()=>{
    const st={on:false,prev:0,dts:new Array(120).fill(0),di:0,dn:0,lastDt:0,ticksLast:0,draws:0,frames:0,heapMB:-1,heapOK:false,decodeMs:-1,decoded:false,families:0,fpMs:-1,fcpMs:-1,sampleT:0};
    function frame(now,ticks){
      if(st.prev>0){const dt=now-st.prev;if(dt>=0&&dt<1000){st.lastDt=dt;st.dts[st.di]=dt;st.di=(st.di+1)%st.dts.length;if(st.dn<st.dts.length)st.dn++;}}
      st.prev=now;st.ticksLast=ticks|0;st.frames++;
    }
    function stats(){let sum=0,mx=0;for(let i=0;i<st.dn;i++){const v=st.dts[i];sum+=v;if(v>mx)mx=v;}return {avg:st.dn?sum/st.dn:0,max:mx};}
    function sample(){
      try{const m=performance.memory;if(m&&m.usedJSHeapSize>0){st.heapMB=m.usedJSHeapSize/1048576;st.heapOK=true;}}catch(_){}
      try{const d=typeof window.__TW_SFX_DIAG==='function'?window.__TW_SFX_DIAG():null;if(d){st.decoded=!!d.decoded;st.decodeMs=typeof d.decodeMs==='number'?d.decodeMs:-1;st.families=d.families|0;}}catch(_){}
      try{if(st.fpMs<0||st.fcpMs<0){const es=performance.getEntriesByType('paint')||[];for(const e of es){if(e.name==='first-paint'&&st.fpMs<0)st.fpMs=e.startTime;else if(e.name==='first-contentful-paint'&&st.fcpMs<0)st.fcpMs=e.startTime;}}}catch(_){}
      return snapshot();
    }
    function snapshot(){const s=stats();return {enabled:st.on,frames:st.frames,draws:st.draws,lastDt:+st.lastDt.toFixed(2),avgDt:+s.avg.toFixed(2),maxDt:+s.max.toFixed(2),ticksLast:st.ticksLast,heapMB:st.heapOK?+st.heapMB.toFixed(1):null,decoded:st.decoded,decodeMs:st.decodeMs>=0?st.decodeMs:null,families:st.families,firstPaintMs:st.fpMs>=0?+st.fpMs.toFixed(0):null,firstContentfulPaintMs:st.fcpMs>=0?+st.fcpMs.toFixed(0):null};}
    function draw(c){
      if(!st.on)return;st.draws++;
      if((st.sampleT--)<=0){st.sampleT=30;sample();}
      const s=stats(),fmt=v=>v>=100?Math.round(v):+v.toFixed(1);
      panel(c,4,H-32,168,28,.82);
      label(c,`FRAME ${fmt(st.lastDt)} AVG ${fmt(s.avg)} MAX ${fmt(s.max)} MS`,8,H-29,5,PAL.gold);
      label(c,`TICKS ${st.ticksLast} · HEAP ${st.heapOK?st.heapMB.toFixed(1)+' MB':'N/A'}`,8,H-21,5,PAL.cream);
      label(c,`DECODE ${st.decodeMs>=0?st.decodeMs+' MS · '+st.families+' FAM':'—'} · FP ${st.fpMs>=0?Math.round(st.fpMs)+' MS':'N/A'}`,8,H-13,5,PAL.teal);
    }
    function setEnabled(v){st.on=v!==false;if(st.on)st.sampleT=0;return st.on;}
    try{window.addEventListener('keydown',e=>{if(e.code==='F3'&&!e.repeat){if(typeof TW_OPTS!=='undefined'&&TW_OPTS.state&&TW_OPTS.state.rebind&&TW_OPTS.state.rebind.active)return;setEnabled(!st.on);e.preventDefault();}},true);}catch(_){}
    return {frame,draw,sample,snapshot,setEnabled,enabled:()=>st.on};
  })();

"""

PROVENANCE = """<!-- TW alpha.3.6 build provenance (doc 59 s3.4 perf/telemetry; GOV-80 transport; GOV-81 gate advance)
{"candidate":"Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html","source":{"file":"Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html","sha256":"930f3a15a8405f9eb13c6883cd28190ffac9cb1c42bb6905c1f889874b3cc5b8"},"changes":["TW_PERF render-only perf/telemetry HUD (frame-time last/avg/max, sim ticks per rAF, JS heap, audio decode ms + families, first-paint/FCP)","toggle: F3 (capture-phase, rebind-aware) + __TW.perf hook; default OFF each load","version bump"],"simSafety":"zero G.* reads/writes in TW_PERF; closure state only; wall-clock values are display-only and never feed the sim; nothing enters getSimulationState/stateHash; tick-parity vs 930f3a15 required HUD OFF and ON","builder":"tools/82_BUILD_ALPHA3_6.py"}
-->
"""

EDITS = [
    ("title",
     "<title>Tiny West: Iron Trail — v6 Alpha.3.5</title>",
     "<title>Tiny West: Iron Trail — v6 Alpha.3.6</title>"),
    ("G.version",
     "version:'6.0.0-alpha.3.5',mode:'title'",
     "version:'6.0.0-alpha.3.6',mode:'title'"),
    ("TW_BUILD_INFO.version",
     "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.5',stage:'A3-0.1'",
     "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.6',stage:'A3-0.1'"),
    ("TW_BUILD_INFO.artifactFile",
     "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.5.html',simulationHz:60",
     "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html',simulationHz:60"),
    ("TW_PERF module insert (above TW_JUICE)",
     "  // TW_JUICE (alpha.3.5, GOV-69 juice candidate): render-only game-feel layer.",
     PERF_MODULE + "  // TW_JUICE (alpha.3.5, GOV-69 juice candidate): render-only game-feel layer."),
    ("frame() perf sampling hook",
     "if(n===4)acc=0;if(TW_JUICE.allowRender())render();",
     "if(n===4)acc=0;TW_PERF.frame(now,n);if(TW_JUICE.allowRender())render();"),
    ("render() perf draw hook (topmost)",
     "    TW_JUICE.drawScreenFX(ctx);drawDangerStripes(ctx);drawWantedPoster(ctx);",
     "    TW_JUICE.drawScreenFX(ctx);drawDangerStripes(ctx);drawWantedPoster(ctx);TW_PERF.draw(ctx);"),
    ("__TW.perf test hook",
     "    juice:{enabled:()=>TW_JUICE.enabled(),setEnabled:(v)=>TW_JUICE.setEnabled(v),diagnostics:()=>TW_JUICE.diagnostics()},",
     "    juice:{enabled:()=>TW_JUICE.enabled(),setEnabled:(v)=>TW_JUICE.setEnabled(v),diagnostics:()=>TW_JUICE.diagnostics()},\n    perf:{enabled:()=>TW_PERF.enabled(),setEnabled:(v)=>TW_PERF.setEnabled(v),sample:()=>cloneJson(TW_PERF.sample()),snapshot:()=>cloneJson(TW_PERF.snapshot())},"),
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
    out_sha = hashlib.sha256(out).hexdigest()
    print(f"OK wrote {OUT.name}")
    print(f"bytes: {len(out)}")
    print(f"sha256: {out_sha}")
    if len(out) != OUT_BYTES or out_sha != OUT_SHA:
        sys.exit(f"ABORT: output does not match pinned target {OUT_BYTES} B / {OUT_SHA}")
    print("target pin verified")

if __name__ == "__main__":
    main()
