#!/usr/bin/env python3
"""BLD03_BUILD_ALPHA3_7_AUDIO.py — deterministic builder for Tiny West: Iron Trail
alpha.3.7-audio (Round-1 full embed + wiring). Supersedes the BLD-02 scaffold.

AUTHORIZATION: owner, 2026-07-22 — GOV-85 DEC-085-2. Wire ALL 46 new families
(006/073/100 with proposed default routing; owner tunes by ear) + carry the 85
embedded takes. Gate target confirmed alpha.3.6 `86157cd0…`. Delivery per GOV-80.

Architecture (GOV-54 rev 2 / GOV-58, unchanged):
  - ENCODE-ONCE upstream: this script never encodes; every clip's bytes are
    verified against the pinned manifest oggSha256/oggBytes before embedding.
    The 85 carried clips are EXTRACTED from the alpha.3.6 TW_SAMPLE_DATA blob
    itself (SHA-matched against the manifest) — they never travel separately.
  - DETERMINISTIC ASSEMBLER: TW_SAMPLE_DATA regenerated as one statement
    (sorted keys, takes ordered by (cueId,take)); whole-line splice; every other
    edit anchored-exactly-once; byte-identical rebuild.
  - PARITY CONTRACT: read-only emits; audio state outside getSimulationState;
    audio-local PRNG (audioRand) only; zero G.* writes in added code; gamepad
    guard preserved; tick parity vs `86157cd0…` audio OFF and ON.
"""
import base64, hashlib, json, pathlib, re, sys

D = pathlib.Path(__file__).resolve().parent
AUTHORIZATION   = "OWNER-APPROVED 2026-07-22 per GOV-85 DEC-085-2"
MANIFEST_SHA256 = "5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a"
WIRING_SHA256   = "68dd7a038680f0434c19a2a7c31b10bfbcf4b4f2662870b875564857daf00568"
DEFER_RULING    = "RULED 2026-07-22 per GOV-85 DEC-085-2: wire 006/073/100 with proposed default routing"

SRC_FILE  = "Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html"
SRC_SHA   = "86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa"
SRC_BYTES = 2472284
OUT_FILE  = "Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html"
OUT_SHA   = "TBD-PIN-AFTER-FIRST-VERIFIED-BUILD"
OUT_BYTES = -1

MANIFEST = "round1_full_encode_manifest.json"
WIRING   = "round1_wiring_spec.json"
OGG_ROOT = None  # set by --ogg-root

# cueId -> engine sample-group key for the 46 new families (BLD-03 defaults,
# derived from round1_wiring_spec proposals; DECISION cues per DEC-085-2).
CUE_KEY = {
  "003":"shotFan","004":"reloadSpin","005":"hammerCock","006":"reloadFull",
  "008":"shotRifle","009":"rifleLever","010":"reloadRifle","011":"shotShotgun",
  "012":"reloadShotgun","013":"emptyShotgun","014":"ricochet","015":"flyby",
  "016":"dirt","019":"stone","031":"ironImpact","032":"trunkImpact",
  "060":"uiFocus","061":"uiConfirm","062":"uiBack","063":"uiTab","064":"uiDisabled",
  "066":"hoofGrass","069":"horseTack","072":"horseWhinny","073":"horseLand",
  "075":"trainRods","076":"steamRelease","077":"coupler","078":"brakeSqueal",
  "079":"trainInterior","080":"engineProximity","081":"roofWind","082":"fuse",
  "083":"debrisWood","084":"debrisMetal","085":"debrisRock","086":"explosionTailExt",
  "087":"explosionTailInt","088":"fireLoop","089":"canyonWind","091":"dustStorm",
  "092":"stampede","095":"safeLock","096":"ladderGrab","098":"strongbox","100":"crateBreak",
}

NEW_CUES = ("shotFan:audioCue('weapon','world',100,'revolver.player.fan-shot'),hammerCock:audioCue('weapon','world',55,'revolver.hammer-cock'),reloadFull:audioCue('weapon','world',72,'revolver.reload-full'),"
  "shotRifle:audioCue('weapon','world',100,'rifle.player.shot'),rifleLever:audioCue('weapon','world',58,'rifle.lever'),reloadRifle:audioCue('weapon','world',72,'rifle.reload'),"
  "shotShotgun:audioCue('weapon','world',100,'shotgun.player.shot'),reloadShotgun:audioCue('weapon','world',72,'shotgun.reload'),emptyShotgun:audioCue('weapon','world',60,'shotgun.empty'),"
  "ricochet:audioCue('impact','world',42,'impact.ricochet'),flyby:audioCue('impact','world',44,'impact.flyby'),dirt:audioCue('impact','world',38,'impact.dirt'),stone:audioCue('impact','world',38,'impact.stone'),"
  "ironImpact:audioCue('impact','world',40,'impact.iron'),trunkImpact:audioCue('impact','world',40,'impact.trunk'),debrisWood:audioCue('impact','world',45,'debris.wood'),debrisMetal:audioCue('impact','world',45,'debris.metal'),debrisRock:audioCue('impact','world',45,'debris.rock'),"
  "explosionTailExt:audioCue('impact','world',70,'explosion.tail-ext'),explosionTailInt:audioCue('impact','world',70,'explosion.tail-int'),crateBreak:audioCue('impact','world',65,'destruction.crate'),"
  "uiFocus:audioCue('ui','ui',30,'ui.focus'),uiConfirm:audioCue('ui','ui',35,'ui.confirm'),uiBack:audioCue('ui','ui',32,'ui.back'),uiTab:audioCue('ui','ui',31,'ui.tab'),uiDisabled:audioCue('ui','ui',30,'ui.disabled'),"
  "hoofGrass:audioCue('movement','world',15,'horse.hoof-grass'),horseTack:audioCue('ambient','ambience',10,'horse.tack-loop'),horseWhinny:audioCue('movement','world',45,'horse.whinny'),horseLand:audioCue('movement','world',60,'horse.landing'),ladderGrab:audioCue('movement','world',50,'movement.ladder-grab'),"
  "trainRods:audioCue('ambient','ambience',10,'train.rods-loop'),steamRelease:audioCue('movement','world',48,'train.steam-release'),coupler:audioCue('movement','world',46,'train.coupler'),brakeSqueal:audioCue('movement','world',52,'train.brake'),trainInterior:audioCue('ambient','ambience',10,'train.interior-loop'),engineProximity:audioCue('ambient','ambience',10,'train.engine-loop'),roofWind:audioCue('ambient','ambience',10,'train.roof-wind-loop'),"
  "fuse:audioCue('ambient','ambience',60,'dynamite.fuse-loop'),fireLoop:audioCue('ambient','ambience',30,'fire.burn-loop'),canyonWind:audioCue('ambient','ambience',8,'ambience.canyon'),dustStorm:audioCue('ambient','ambience',8,'ambience.dust-storm'),"
  "stampede:audioCue('critical','ui',88,'world.stampede'),safeLock:audioCue('reward','ui',55,'interaction.safe-lock'),strongbox:audioCue('reward','ui',50,'loot.strongbox'),")

GATE_OLD = ("const GATE={shot:function(){return !!(G.weapon&&G.weapon.id==='REVOLVER');},"
  "lastShot:function(){return !!(G.weapon&&G.weapon.id==='REVOLVER');},"
  "coin:function(){return G.mode==='play';}};")
GATE_NEW = ("const GATE={shot:function(){return !!(G.weapon&&(G.weapon.id==='REVOLVER'||G.weapon.id==='RIFLE'||G.weapon.id==='SAWED'));},"
  "lastShot:function(){return !!(G.weapon&&(G.weapon.id==='REVOLVER'||G.weapon.id==='RIFLE'||G.weapon.id==='SAWED'));},"
  "coin:function(){return G.mode==='play';},"
  "dirt:function(){return G.mode==='play'&&audioRand()<.55;},"
  "stone:function(){return G.mode==='play'&&audioRand()<.55;},"
  "uiFocus:function(){return G.mode!=='play';},uiConfirm:function(){return G.mode!=='play';},uiBack:function(){return G.mode!=='play';},uiTab:function(){return G.mode!=='play';},uiDisabled:function(){return G.mode!=='play';},"
  "horseTack:GNP,trainRods:GNP,trainInterior:GNP,engineProximity:GNP,roofWind:GNP,fuse:GNP,fireLoop:GNP,canyonWind:GNP,dustStorm:GNP};"
  "function GNP(){return false;}")

# Injected inside the TW_SAMPLES closure, just above `function ready(name){` —
# has()/resolve() (read-only G reads + audioRand only), loop voices, SFX bridges.
SAMPLES_EXT = """function has(n){const b=buffers[n];if(!b)return false;for(let i=0;i<b.length;i++)if(b[i])return true;return false;}
      function resolve(name){
        try{
          const w=G.weapon&&G.weapon.id;
          if(name==='shot'){if(w==='RIFLE'&&has('shotRifle'))return 'shotRifle';if(w==='SAWED'&&has('shotShotgun'))return 'shotShotgun';if(w==='REVOLVER'&&has('shotFan')&&audioRand()<.1)return 'shotFan';return name;}
          if(name==='lastShot'){if(w==='RIFLE'&&has('shotRifle'))return 'shotRifle';if(w==='SAWED'&&has('shotShotgun'))return 'shotShotgun';return name;}
          if(name==='reload'){if(w==='RIFLE'&&has('reloadRifle'))return 'reloadRifle';if(w==='SAWED'&&has('reloadShotgun'))return 'reloadShotgun';if(w==='REVOLVER'&&has('reloadFull'))return 'reloadFull';return name;}
          if(name==='jam'&&w==='SAWED'&&has('emptyShotgun'))return 'emptyShotgun';
          if(name==='hoof'&&G.zone===0&&has('hoofGrass'))return 'hoofGrass';
          if(name==='coin'&&G.mode!=='play'&&has('uiFocus'))return 'uiFocus';
          if(name==='metal'){const r=audioRand();if(r<.3&&has('ricochet'))return 'ricochet';if(r<.55&&has('ironImpact'))return 'ironImpact';return name;}
          if(name==='wood'&&audioRand()<.3&&has('trunkImpact'))return 'trunkImpact';
        }catch(_){}
        return name;
      }
      const loopVoices={};
      function loopGain(n){return n==='fuse'?.5:n==='fireLoop'?.4:n==='horseTack'?.28:.22;}
      function loopSet(name,on){
        try{
          const cur=loopVoices[name];
          if(on){
            if(cur||!decoded||SFX.muted||!SFX.ac)return;
            const b=buffers[name];if(!b)return;let buf=null;for(let i=0;i<b.length;i++){if(b[i]){buf=b[i];break;}}
            if(!buf)return;
            const nodes=(typeof AUDIO_P0!=='undefined')&&AUDIO_P0.state&&AUDIO_P0.state.nodes;if(!nodes||!nodes.ambience)return;
            const src=SFX.ac.createBufferSource(),g=SFX.ac.createGain();
            src.buffer=buf;src.loop=true;g.gain.value=0;src.connect(g);g.connect(nodes.ambience);
            src.start();g.gain.linearRampToValueAtTime(loopGain(name),SFX.ac.currentTime+.2);
            loopVoices[name]={src:src,g:g};
          }else if(cur){
            delete loopVoices[name];
            try{cur.g.gain.linearRampToValueAtTime(0,SFX.ac.currentTime+.15);}catch(_){}
            try{cur.src.stop(SFX.ac.currentTime+.25);}catch(_){}
          }
        }catch(_){delete loopVoices[name];}
      }
      function loopStopAll(){for(const k in loopVoices)loopSet(k,false);}
      try{SFX.sampleReady=function(n){return ready(n);};SFX.loopSet=loopSet;SFX.loopStopAll=loopStopAll;if(typeof window!=='undefined')window.__TW_LOOPS=function(){return Object.keys(loopVoices);};}catch(_){}
      """

# TW_AMB — render-side ambient-loop conductor. Read-only observer of G; drives
# SFX.loopSet only; audio state stays outside the sim; max 3 loops, priority
# ordered, tier-7 beds last (drop-first per SFX-57).
AMB_MODULE = """  // TW_AMB (alpha.3.7-audio): ambient-loop conductor. Read-only observer of G;
  // drives SFX.loopSet (audio-local state only); never writes G.*; nothing here
  // is read by tick()/authoritativeSimulationState()/stateHash.
  const TW_AMB=(()=>{
    const PRI=['fuse','fireLoop','horseTack','roofWind','trainInterior','trainRods','engineProximity','dustStorm','canyonWind'];
    function conds(){
      const p=G.player;
      let fire=false;
      try{const ev=G.audioEvents;for(let i=ev.length-1;i>=0&&i>=ev.length-24;i--){if(ev[i][1]==='explosion'&&G.runFrame-ev[i][0]<240){fire=true;break;}}}catch(_){}
      return {
        fuse:G.hazards.some(h=>h.kind==='dynamite'&&!h.dead),
        fireLoop:fire,
        horseTack:!!(p&&p.state==='horse'),
        roofWind:!!(p&&p.state==='roof'),
        trainInterior:!!G.interior,
        trainRods:!!(p&&p.state!=='horse'),
        engineProximity:G.carIndex>=2,
        dustStorm:!!(G.weather&&G.weather.id==='DUST'),
        canyonWind:G.zone===1
      };
    }
    function observe(){
      try{
        if(!SFX.loopSet)return;
        const play=G.mode==='play'&&!G.paused,c=play?conds():{};
        let n=0;
        for(const k of PRI){const on=!!c[k]&&n<3;if(on)n++;SFX.loopSet(k,on);}
      }catch(_){}
    }
    return {observe,_conds:conds};
  })();

"""

def abort(m): sys.exit(f"ABORT: {m}")

def load_inputs():
    mb = (D / MANIFEST).read_bytes()
    if hashlib.sha256(mb).hexdigest() != MANIFEST_SHA256: abort("manifest SHA mismatch vs pin")
    wb = (D / WIRING).read_bytes()
    if hashlib.sha256(wb).hexdigest() != WIRING_SHA256: abort("wiring spec SHA mismatch vs pin")
    m, w = json.loads(mb), json.loads(wb)
    spec_cues = sorted(f["cueId"] for f in w["families"])
    if spec_cues != sorted(CUE_KEY): abort(f"wiring-spec cue set differs from CUE_KEY table")
    return m, w

def collect_clip_bytes(m, src_text):
    """Return {engineKey:[(cueId,take,b64),...]} verifying every clip's bytes.
    Carried clips come from the alpha.3.6 blob (SHA-matched); new clips from OGG_ROOT."""
    line = next(l for l in src_text.split("\n") if l.startswith("const TW_SAMPLE_DATA={"))
    old = json.loads(line[len("const TW_SAMPLE_DATA="):-1])
    by_sha = {}
    for key, arr in old.items():
        for b64 in arr:
            raw = base64.b64decode(b64)
            by_sha[hashlib.sha256(raw).hexdigest()] = b64
    groups, missing = {}, []
    stats = {"carried":0, "new":0, "bytes":0}
    for c in m["clips"]:
        key = c.get("engineKey") or CUE_KEY.get(c["cueId"])
        if not key: abort(f"clip {c['cueId']}#{c['take']} has no engine key assignment")
        if c.get("engineKey"):
            b64 = by_sha.get(c["oggSha256"])
            if not b64: missing.append(f"carried {c['cueId']}#{c['take']} not found in source blob"); continue
            raw = base64.b64decode(b64)
            stats["carried"] += 1
        else:
            p = pathlib.Path(OGG_ROOT) / c["oggFile"]
            if not p.is_file(): missing.append(f"missing OGG {p}"); continue
            raw = p.read_bytes()
            if hashlib.sha256(raw).hexdigest() != c["oggSha256"]: missing.append(f"SHA mismatch {p}"); continue
            b64 = base64.b64encode(raw).decode("ascii")
            stats["new"] += 1
        if len(raw) != c["oggBytes"]: missing.append(f"byte-count mismatch {c['cueId']}#{c['take']}"); continue
        stats["bytes"] += len(raw)
        groups.setdefault(key, []).append((str(c["cueId"]), int(c["take"]), b64))
    if missing: abort("clip verification failed:\n  " + "\n  ".join(missing[:20]))
    if stats["carried"] != 85 or stats["new"] != 121: abort(f"expected 85 carried + 121 new, got {stats}")
    return {k: [b for _,_,b in sorted(v)] for k, v in sorted(groups.items())}, stats

def build(ogg_root, pin_check=True):
    global OGG_ROOT
    OGG_ROOT = ogg_root
    if AUTHORIZATION == "UNAUTHORIZED": abort("not authorized")
    src = (D / SRC_FILE).read_bytes()
    if len(src) != SRC_BYTES or hashlib.sha256(src).hexdigest() != SRC_SHA: abort("source is not the pinned gate target")
    text = src.decode("utf-8")
    m, w = load_inputs()
    data, stats = collect_clip_bytes(m, text)
    if len(data) != 77: abort(f"expected 77 sample groups, got {len(data)}")

    # 1) whole-line TW_SAMPLE_DATA replacement
    lines = text.split("\n")
    hits = [i for i, l in enumerate(lines) if l.startswith("const TW_SAMPLE_DATA={")]
    if len(hits) != 1: abort("TW_SAMPLE_DATA line anchor not unique")
    lines[hits[0]] = "const TW_SAMPLE_DATA=" + json.dumps(data, separators=(",", ":"), sort_keys=True) + ";"
    text = "\n".join(lines)

    EDITS = [
      ("AUDIO_CUES registration",
       "const AUDIO_CUES=Object.freeze({\n    shot:audioCue('weapon','world',100,'revolver.player.shot')",
       "const AUDIO_CUES=Object.freeze({\n    " + NEW_CUES + "\n    shot:audioCue('weapon','world',100,'revolver.player.shot')"),
      ("GATE extension", GATE_OLD, GATE_NEW),
      ("TW_SAMPLES ext (resolve/loops/bridges)",
       "      function ready(name){if(!decoded||!SFX.ac||SFX.muted||!state.currentVoice)return false;",
       "      " + SAMPLES_EXT + "function ready(name){if(!decoded||!SFX.ac||SFX.muted||!state.currentVoice)return false;"),
      ("wrappedPlay resolve-once (ready)",
       "const willSample=TW_SAMPLES.ready(semantic);",
       "const sem2=TW_SAMPLES.resolve(semantic),willSample=TW_SAMPLES.ready(sem2);"),
      ("wrappedPlay resolve-once (emit)",
       "if(willSample)TW_SAMPLES.emit(semantic);",
       "if(willSample)TW_SAMPLES.emit(sem2);"),
      ("playCustom resolve-once",
       "if(TW_SAMPLES.ready(name))TW_SAMPLES.emit(name);else fallback(name);",
       "{const n2=TW_SAMPLES.resolve(name);if(TW_SAMPLES.ready(n2))TW_SAMPLES.emit(n2);else fallback(name);}"),
      ("fallback legacy mapping",
       "function fallback(name){\n      const jitter=.96+audioRand()*.08;",
       "function fallback(name){\n      name=({uiFocus:'coin',uiConfirm:'coin',uiBack:'coin',uiTab:'coin',uiDisabled:'coin',reloadFull:'reload',shotRifle:'shot',shotShotgun:'shot',shotFan:'shot',reloadRifle:'reload',reloadShotgun:'reload',emptyShotgun:'jam',hoofGrass:'hoof',ricochet:'metal',ironImpact:'metal',trunkImpact:'wood',dirt:'wood',stone:'metal',debrisWood:'wood',debrisMetal:'metal',debrisRock:'wood',strongbox:'bag',crateBreak:'wood'})[name]||name;\n      const jitter=.96+audioRand()*.08;"),
      ("dispatch: rifle lever",
       "SFX.play(lastRound?'lastShot':'shot',pc.x/W*2-1);",
       "SFX.play(lastRound?'lastShot':'shot',pc.x/W*2-1);if(G.weapon.id==='RIFLE')SFX.play('rifleLever',pc.x/W*2-1);"),
      ("dispatch: hammer cock (deadeye wind-up)",
       "triggerCinematic('deadeye',18);SFX.play('deadeye');logEvent('deadeye-shot');",
       "triggerCinematic('deadeye',18);SFX.play('hammerCock');SFX.play('deadeye');logEvent('deadeye-shot');"),
      ("dispatch: flyby (near miss)",
       "addDeadeye(10);SFX.play('perfect');logEvent('near-miss');",
       "addDeadeye(10);SFX.play('flyby',pc.x/W*2-1);SFX.play('perfect');logEvent('near-miss');"),
      ("dispatch: horse landing + whinny (return complete)",
       "G.returnGrade=delta<22?'SADDLE':delta<92?'ROUGH':'ROPE-SAVE';",
       "G.returnGrade=delta<22?'SADDLE':delta<92?'ROUGH':'ROPE-SAVE';SFX.play('horseLand');if(delta<22)SFX.play('horseWhinny');"),
      ("dispatch: steam release",
       "if(G.steamT<=0){const low=",
       "if(G.steamT<=0){SFX.play('steamRelease');const low="),
      ("dispatch: coupler (car boundary)",
       "G.carIndex++;G.carStyle=",
       "G.carIndex++;SFX.play('coupler');G.carStyle="),
      ("dispatch: brake squeal (run finish)",
       "function finishRun(success,reason){\n    if(G.mode!=='play')return;",
       "function finishRun(success,reason){\n    if(G.mode!=='play')return;\n    SFX.play('brakeSqueal');"),
      ("dispatch: ladder grab (board start)",
       "G.boardRoute=held.down?'HATCH':p.x<LADDER_X-20?'COUPLING':'LADDER';G.interior=G.boardRoute==='HATCH';",
       "G.boardRoute=held.down?'HATCH':p.x<LADDER_X-20?'COUPLING':'LADDER';G.interior=G.boardRoute==='HATCH';SFX.play('ladderGrab');"),
      ("dispatch: crate break + safe lock",
       "if(c.hp<=0){c.broken=true;",
       "if(c.hp<=0){c.broken=true;SFX.play('crateBreak',c.x/W*2-1);if(G.carType&&G.carType.lock)SFX.play('safeLock');"),
      ("dispatch: strongbox pickup",
       "SFX.play('bag');G.banner=85;G.bannerText=l.dropped?'LOOT RECOVERED':def.label;",
       "if(def&&(def.label==='GOLD BARS'||def.label==='STRONGBOX'||def.label==='PAYROLL LEDGER'))SFX.play('strongbox');SFX.play('bag');G.banner=85;G.bannerText=l.dropped?'LOOT RECOVERED':def.label;"),
      ("dispatch: explosion tails + debris",
       "h.fuse<=0)explode(h,!!h.player);continue;",
       "h.fuse<=0){SFX.play(G.interior?'explosionTailInt':'explosionTailExt');SFX.play(G.zone===2?'debrisRock':(h.space==='roof'?'debrisMetal':'debrisWood'),h.x/W*2-1);explode(h,!!h.player);}continue;"),
      ("dispatch: dirt/stone (player bullet miss expiry)",
       "if(b.life<=0||b.x<-30||b.x>W+30||b.y<-20||b.y>H+25){b.dead=true;continue;}",
       "if(b.life<=0||b.x<-30||b.x>W+30||b.y<-20||b.y>H+25){if(b.owner==='player'&&b.life<=0)SFX.play(G.zone===2?'stone':'dirt',b.x/W*2-1);b.dead=true;continue;}"),
      ("dispatch: stampede",
       "stampedeT=180;SFX.play('whistle');",
       "stampedeT=180;SFX.play(SFX.sampleReady&&SFX.sampleReady('stampede')?'stampede':'whistle');"),
      ("dispatch: ui confirm (main menu)",
       "else setFrontScreen('help');\n      SFX.play('coin');return;",
       "else setFrontScreen('help');\n      SFX.play(SFX.sampleReady&&SFX.sampleReady('uiConfirm')?'uiConfirm':'coin');return;"),
      ("dispatch: ui back",
       "if(FRONT.screen==='main')setFrontScreen('intro');else setFrontScreen('main');\n    SFX.play('coin');",
       "if(FRONT.screen==='main')setFrontScreen('intro');else setFrontScreen('main');\n    SFX.play(SFX.sampleReady&&SFX.sampleReady('uiBack')?'uiBack':'coin');"),
      ("dispatch: ui tab (title category cycle)",
       "function cycleTitleChoice(kind,dir=1){\n    ",
       "function cycleTitleChoice(kind,dir=1){\n    SFX.play(SFX.sampleReady&&SFX.sampleReady('uiTab')?'uiTab':'coin');\n    "),
      ("dispatch: ui disabled (reserved rebind key)",
       "rebind.msg='RESERVED KEY';return true;}",
       "rebind.msg='RESERVED KEY';SFX.play(SFX.sampleReady&&SFX.sampleReady('uiDisabled')?'uiDisabled':'coin');return true;}"),
      ("TW_AMB module insert",
       "  // TW_JUICE (alpha.3.5, GOV-69 juice candidate): render-only game-feel layer.",
       AMB_MODULE + "  // TW_JUICE (alpha.3.5, GOV-69 juice candidate): render-only game-feel layer."),
      ("render hook: ambient observe",
       "    TW_JUICE.observe();drawWorld();TW_JUICE.drawWorldFX(wctx);",
       "    TW_JUICE.observe();TW_AMB.observe();drawWorld();TW_JUICE.drawWorldFX(wctx);"),
      ("title",
       "<title>Tiny West: Iron Trail — v6 Alpha.3.6</title>",
       "<title>Tiny West: Iron Trail — v6 Alpha.3.7</title>"),
      ("G.version",
       "version:'6.0.0-alpha.3.6',mode:'title'",
       "version:'6.0.0-alpha.3.7',mode:'title'"),
      ("TW_BUILD_INFO.version",
       "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.6',stage:'A3-0.1'",
       "product:'Tiny West: Iron Trail',version:'6.0.0-alpha.3.7',stage:'A3-0.1'"),
      ("TW_BUILD_INFO.artifactFile",
       "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html',simulationHz:60",
       "artifactFile:'Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html',simulationHz:60"),
    ]
    for name, anchor, repl in EDITS:
        n = text.count(anchor)
        if n != 1: abort(f"anchor for edit '{name}' occurs {n} times (need exactly 1)")
        text = text.replace(anchor, repl)

    prov = {
      "candidate": OUT_FILE,
      "source": {"file": SRC_FILE, "sha256": SRC_SHA},
      "encodeManifest": {"sha256": MANIFEST_SHA256, "clips": 206, "families": 77,
                          "carried": stats["carried"], "new": stats["new"], "oggBytes": stats["bytes"]},
      "wiringSpec": {"file": WIRING, "sha256": WIRING_SHA256,
                      "ruling": DEFER_RULING, "authorization": AUTHORIZATION},
      "simSafety": "encode-once upstream (every clip SHA-verified); deterministic assembler; read-only emits; audio-local audioRand only; audio state outside getSimulationState; loops via render-side TW_AMB conductor; gamepad guard preserved; tick-parity vs 86157cd0 required audio OFF and ON",
      "builder": "tools/BLD03_BUILD_ALPHA3_7_AUDIO.py",
    }
    tail = "\n</body>\n</html>"
    if text.count(tail) != 1: abort("tail anchor not unique")
    text = text.replace(tail, "\n<!-- TW alpha.3.7-audio build provenance (GOV-85 DEC-085-2)\n" + json.dumps(prov) + "\n-->\n</body>\n</html>")

    out = text.encode("utf-8")
    (D / OUT_FILE).write_bytes(out)
    sha = hashlib.sha256(out).hexdigest()
    print(f"OK wrote {OUT_FILE}\nbytes: {len(out)}\nsha256: {sha}")
    print(f"groups: {len(data)} | carried: {stats['carried']} | new: {stats['new']} | ogg bytes: {stats['bytes']}")
    if pin_check and OUT_SHA != "TBD-PIN-AFTER-FIRST-VERIFIED-BUILD":
        if len(out) != OUT_BYTES or sha != OUT_SHA: abort("output does not match pinned target")
        print("target pin verified")
    elif OUT_SHA == "TBD-PIN-AFTER-FIRST-VERIFIED-BUILD":
        print("NOTE: pin OUT_SHA/OUT_BYTES to these values before delivery (GOV-80).")

if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("--ogg-root", required=True)
    a = ap.parse_args()
    build(a.ogg_root)
