#!/usr/bin/env python3
"""BLD02_BUILD_ALPHA3_7_AUDIO.py — SCAFFOLD (PREP ONLY) for the Tiny West: Iron Trail
audio-embed candidate (GOV-72 corrected scope; GOV-54 rev 2 architecture; GOV-80 transport).

STATUS: *** NOT RUNNABLE BY DESIGN. *** Three guard pins below are sentinels and the
script aborts until they are filled, which may happen ONLY after:
  1. Cowork checks the Audio lane's encode manifest (pin MANIFEST_SHA256 to the
     checked bytes — the 2026-07-22 draft observed at 211,629 B, sha256
     5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a, is a DRAFT
     and is deliberately NOT pinned);
  2. the owner approves the build and confirms the source/gate target (presumed
     alpha.3.6 `86157cd0…` per GOV-83 §A — update SRC_* if the gate differs);
  3. the SFX-52 wiring spec exists and is Cowork-checked (all 121 newly encoded
     clips are engineKey:null / awaiting_callsite — without wiring, an embed adds
     zero audible content; assembler rule 1 forbids auto-grouping them).

Architecture per GOV-54 rev 2 + the shipped alpha.3.2 embed (GOV-58 audited):
  - ENCODE-ONCE upstream: the Audio lane produced the OGGs (ffmpeg 6.0 libvorbis
    -q:a 4 -ac 1, pinned binary). This script NEVER encodes — it verifies every
    clip's oggSha256/oggBytes against the manifest and embeds pre-encoded bytes.
  - DETERMINISTIC ASSEMBLER: TW_SAMPLE_DATA is regenerated as one JS statement
    from the manifest (keys sorted, takes sorted by (cueId, take), raw base64
    values exactly like the shipped blob) and spliced by whole-line replacement
    of the unique `const TW_SAMPLE_DATA={…};` line. Byte-identical rebuild.
  - AUDIO STATE OUTSIDE THE SIM: gates/wiring are read-only emits through the
    existing TW_SAMPLES/SFX graph; variant selection stays on the audio-local
    PRNG. This script REFUSES any wiring replacement that writes `G.*` or uses
    `G.rng`/`G.fxRng`/`Math.random`/`Date.now`/timers (see FORBIDDEN_IN_WIRING).
  - Tick-parity vs the gate target is required audio OFF and ON (harness at
    build time mirrors 82_ACCEPT + GOV-54's on/off/no-context/suspended states).

Inputs:
  --manifest PATH   encode manifest JSON (default: round1_full_encode_manifest.json)
  --ogg-root PATH   directory containing each clip's `oggFile` relative path
                    (on the box: the Drive-synced tree; on cloud: a git-staged copy)
  --wiring PATH     OPTIONAL wiring JSON derived from the SFX-52 spec (schema below).
                    Without it, only clips with a non-null engineKey (the 85
                    already-wired takes) are embedded; every excluded clip is listed.

Wiring JSON schema (SFX-52-derived; Cowork-checked before use):
{
  "wiringSpec": "SFX-52 <title>", "wiringSpecSha256": "<sha of the spec doc>",
  "extendKeys":   [ {"engineKey":"shot", "manifestKeys":["player.fire.revolver_alt"]} ],
  "newEngineKeys":[ {"engineKey":"fanFire",
                     "manifestKeys":["player.fire.revolver_fan"],
                     "gate": "function(){return G.mode==='play';}"  | null,
                     "callSites":[ {"name":"fan-fire emit",
                                    "anchor":"<exact unique source text>",
                                    "replacement":"<anchor text + SFX.play('fanFire',…) insertion>"} ] } ]
}
Rules enforced: every manifestKey must exist in the manifest; extendKeys.engineKey
must already be wired (non-null in manifest); newEngineKeys.engineKey must NOT
collide with an existing key; every callSites anchor must occur exactly once;
replacements must contain their anchor (insert-only) and pass FORBIDDEN_IN_WIRING.
"""
import argparse, base64, hashlib, json, pathlib, re, sys

# ----- GUARD PINS (sentinels: script aborts until legitimately filled) -----
AUTHORIZATION   = "UNAUTHORIZED"  # e.g. "OWNER-APPROVED 2026-07-xx per <Brain doc>"
MANIFEST_SHA256 = "UNPINNED"      # sha256 of the Cowork-CHECKED manifest bytes
WIRING_SHA256   = "UNPINNED-OR-NONE"  # sha256 of the Cowork-checked wiring JSON, or "NONE" for embed-only
# Source = current gate target (PRESUMED alpha.3.6 per GOV-83 §A; confirm at authorization):
SRC_FILE  = "Tiny-West-Iron-Trail-v6.0.0-alpha.3.6.html"
SRC_SHA   = "86157cd0309318db746dc11e17aa50fd001f04459dc23fe10a4614762cfe0daa"
SRC_BYTES = 2472284
TARGET_VERSION = "6.0.0-alpha.3.7"          # PRESUMED slot; confirm at authorization
OUT_FILE  = "Tiny-West-Iron-Trail-v6.0.0-alpha.3.7-audio.html"
OUT_SHA   = "TBD-PIN-AFTER-FIRST-VERIFIED-BUILD"   # GOV-80: pin target after first build
OUT_BYTES = -1

FORBIDDEN_IN_WIRING = [
    (re.compile(r"\bG\.[A-Za-z_$][\w.$]*\s*=[^=]"), "G.* write"),
    (re.compile(r"\bG\.rng\b"), "G.rng"),
    (re.compile(r"\bG\.fxRng\b"), "G.fxRng"),
    (re.compile(r"\bMath\.random\b"), "Math.random"),
    (re.compile(r"\bDate\.now\b"), "Date.now"),
    (re.compile(r"\bsetTimeout\b|\bsetInterval\b"), "timer"),
    (re.compile(r"\bfetch\b|XMLHttpRequest|WebSocket"), "network"),
]
REQUIRED_TOP  = ["manifest", "encoder", "authority", "scope", "assemblerRules", "summary", "clips"]
REQUIRED_CLIP = ["cueId", "take", "manifestKey", "oggFile", "oggBytes", "oggSha256"]

def sha256_path(p): return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

def abort(msg): sys.exit(f"ABORT: {msg}")

def check_guards(args):
    if AUTHORIZATION == "UNAUTHORIZED":
        abort("AUTHORIZATION sentinel unset — owner approval + Cowork manifest check required "
              "before this scaffold may run (prep-only per the 2026-07-22 hold).")
    man_bytes = pathlib.Path(args.manifest).read_bytes()
    man_sha = hashlib.sha256(man_bytes).hexdigest()
    if MANIFEST_SHA256 in ("UNPINNED",) or man_sha != MANIFEST_SHA256:
        abort(f"manifest sha {man_sha} does not match pinned Cowork-checked value ({MANIFEST_SHA256})")
    return json.loads(man_bytes.decode("utf-8"))

def validate_manifest(m):
    for k in REQUIRED_TOP:
        if k not in m: abort(f"manifest missing top-level key '{k}'")
    seen = set()
    for i, c in enumerate(m["clips"]):
        for k in REQUIRED_CLIP:
            if k not in c: abort(f"clip[{i}] missing '{k}'")
        ident = (c["manifestKey"], c["cueId"], c["take"])
        if ident in seen: abort(f"duplicate clip identity {ident}")
        seen.add(ident)

def load_wiring(args):
    if not args.wiring:
        if WIRING_SHA256 != "NONE":
            abort("no --wiring given but WIRING_SHA256 is not 'NONE' — decide embed-only explicitly")
        return None
    wb = pathlib.Path(args.wiring).read_bytes()
    ws = hashlib.sha256(wb).hexdigest()
    if WIRING_SHA256 in ("UNPINNED-OR-NONE", "NONE") or ws != WIRING_SHA256:
        abort(f"wiring sha {ws} does not match pinned Cowork-checked value ({WIRING_SHA256})")
    w = json.loads(wb.decode("utf-8"))
    for ek in w.get("newEngineKeys", []):
        for cs in ek.get("callSites", []):
            if cs["anchor"] not in cs["replacement"]:
                abort(f"wiring '{ek['engineKey']}' call site '{cs['name']}': replacement must contain its anchor (insert-only)")
            added = cs["replacement"].replace(cs["anchor"], "")
            for rx, name in FORBIDDEN_IN_WIRING:
                if rx.search(added): abort(f"wiring '{ek['engineKey']}' adds forbidden pattern: {name}")
        if ek.get("gate"):
            for rx, name in FORBIDDEN_IN_WIRING:
                if name == "G.* write":  # gates may READ G (existing GATE fns do); writes stay forbidden
                    if rx.search(ek["gate"]): abort(f"gate for '{ek['engineKey']}' contains forbidden pattern: {name}")
                elif name in ("G.rng", "G.fxRng", "Math.random", "Date.now", "timer", "network"):
                    if rx.search(ek["gate"]): abort(f"gate for '{ek['engineKey']}' contains forbidden pattern: {name}")
    return w

def plan_clips(m, w):
    by_manifest_key = {}
    for c in m["clips"]:
        by_manifest_key.setdefault(c["manifestKey"], []).append(c)
    wired_keys = {c["engineKey"] for c in m["clips"] if c.get("engineKey")}
    assign = {}   # engineKey -> [clips]
    for c in m["clips"]:
        if c.get("engineKey"):
            assign.setdefault(c["engineKey"], []).append(c)
    excluded = [c for c in m["clips"] if not c.get("engineKey")]
    gates, edits = [], []
    if w:
        for ext in w.get("extendKeys", []):
            ek = ext["engineKey"]
            if ek not in wired_keys: abort(f"extendKeys '{ek}' is not an already-wired engineKey")
            for mk in ext["manifestKeys"]:
                if mk not in by_manifest_key: abort(f"extendKeys manifestKey '{mk}' not in manifest")
                for c in by_manifest_key[mk]:
                    assign.setdefault(ek, []).append(c)
                    if c in excluded: excluded.remove(c)
        for new in w.get("newEngineKeys", []):
            ek = new["engineKey"]
            if ek in wired_keys or ek in assign: abort(f"newEngineKeys '{ek}' collides with an existing key")
            if not new.get("callSites"): abort(f"newEngineKeys '{ek}' has no call sites — would be dead bytes (assembler rule 1)")
            for mk in new["manifestKeys"]:
                if mk not in by_manifest_key: abort(f"newEngineKeys manifestKey '{mk}' not in manifest")
                for c in by_manifest_key[mk]:
                    assign.setdefault(ek, []).append(c)
                    if c in excluded: excluded.remove(c)
            if new.get("gate"): gates.append((ek, new["gate"]))
            for cs in new["callSites"]:
                edits.append((f"wiring:{ek}:{cs['name']}", cs["anchor"], cs["replacement"]))
    return assign, excluded, gates, edits

def verify_and_encode(assign, ogg_root):
    data, total = {}, 0
    for ek in sorted(assign):
        clips = sorted(assign[ek], key=lambda c: (str(c["cueId"]), int(c["take"])))
        arr = []
        for c in clips:
            p = pathlib.Path(ogg_root) / c["oggFile"]
            if not p.is_file(): abort(f"missing OGG {p}")
            raw = p.read_bytes()
            if len(raw) != c["oggBytes"]: abort(f"{p}: {len(raw)} B != manifest oggBytes {c['oggBytes']}")
            sha = hashlib.sha256(raw).hexdigest()
            if sha != c["oggSha256"]: abort(f"{p}: sha {sha} != manifest oggSha256 {c['oggSha256']}")
            arr.append(base64.b64encode(raw).decode("ascii"))
            total += len(raw)
        data[ek] = arr
    return data, total

def build(args):
    m = check_guards(args)
    validate_manifest(m)
    w = load_wiring(args)
    src_path = pathlib.Path(__file__).resolve().parent / SRC_FILE
    src = src_path.read_bytes()
    if len(src) != SRC_BYTES or hashlib.sha256(src).hexdigest() != SRC_SHA:
        abort(f"source is not the pinned gate target {SRC_BYTES} B / {SRC_SHA}")
    text = src.decode("utf-8")

    assign, excluded, gates, edits = plan_clips(m, w)
    data, ogg_total = verify_and_encode(assign, args.ogg_root)

    # 1) whole-line replacement of the unique TW_SAMPLE_DATA statement
    lines = text.split("\n")
    hits = [i for i, l in enumerate(lines) if l.startswith("const TW_SAMPLE_DATA={")]
    if len(hits) != 1: abort(f"TW_SAMPLE_DATA line anchor occurs {len(hits)} times")
    blob = json.dumps(data, separators=(",", ":"), sort_keys=True, ensure_ascii=True)
    lines[hits[0]] = "const TW_SAMPLE_DATA=" + blob + ";"
    text = "\n".join(lines)

    # 2) GATE additions (splice before the closing of the unique GATE statement)
    if gates:
        gate_rx = re.compile(r"(const GATE=\{.*?)(\};)", re.S)
        if len(gate_rx.findall(text)) != 1: abort("GATE statement anchor not unique")
        addition = "".join(f",{ek}:{src_fn}" for ek, src_fn in sorted(gates))
        text = gate_rx.sub(lambda mo: mo.group(1) + addition + mo.group(2), text, count=1)

    # 3) wiring call-site edits (anchored exactly-once, insert-only, pre-screened)
    for name, anchor, repl in edits:
        n = text.count(anchor)
        if n != 1: abort(f"anchor for edit '{name}' occurs {n} times (need exactly 1)")
        text = text.replace(anchor, repl)

    # 4) version truth + provenance (anchors verified exactly-once like every prior NN_BUILD)
    old_v, new_v = "6.0.0-alpha.3.6", TARGET_VERSION
    for name, anchor, repl in [
        ("title", f"<title>Tiny West: Iron Trail — v6 Alpha.3.6</title>",
                  f"<title>Tiny West: Iron Trail — v6 Alpha.{new_v.split('alpha.')[1]}</title>"),
        ("G.version", f"version:'{old_v}',mode:'title'", f"version:'{new_v}',mode:'title'"),
        ("build version", f"product:'Tiny West: Iron Trail',version:'{old_v}',stage:'A3-0.1'",
                          f"product:'Tiny West: Iron Trail',version:'{new_v}',stage:'A3-0.1'"),
        ("artifactFile", f"artifactFile:'{SRC_FILE}',simulationHz:60",
                         f"artifactFile:'{OUT_FILE}',simulationHz:60"),
    ]:
        n = text.count(anchor)
        if n != 1: abort(f"anchor for edit '{name}' occurs {n} times (need exactly 1)")
        text = text.replace(anchor, repl)

    prov = {
        "candidate": OUT_FILE,
        "source": {"file": SRC_FILE, "sha256": SRC_SHA},
        "encodeManifest": {"sha256": MANIFEST_SHA256, "clipsIncluded": sum(len(v) for v in data.values()),
                            "clipsExcludedAwaitingCallsite": len(excluded), "families": len(data),
                            "oggBytesEmbedded": ogg_total},
        "wiringSpec": (w or {}).get("wiringSpec", "NONE (embed-only)"),
        "simSafety": "encode-once upstream; deterministic assembler; audio state outside simulationState; "
                     "wiring is insert-only read-only emits (forbidden-pattern screened); "
                     f"tick-parity vs {SRC_SHA[:8]} required audio OFF and ON",
        "builder": "tools/BLD02_BUILD_ALPHA3_7_AUDIO.py",
    }
    tail = "\n</body>\n</html>"
    if text.count(tail) != 1: abort("tail anchor not unique")
    text = text.replace(tail, "\n<!-- TW alpha.3.7-audio build provenance\n" + json.dumps(prov) + "\n-->\n</body>\n</html>")

    out = text.encode("utf-8")
    out_path = pathlib.Path(__file__).resolve().parent / OUT_FILE
    out_path.write_bytes(out)
    out_sha = hashlib.sha256(out).hexdigest()
    print(f"OK wrote {OUT_FILE}\nbytes: {len(out)}\nsha256: {out_sha}")
    print(f"families: {len(data)} | clips embedded: {sum(len(v) for v in data.values())} | "
          f"excluded awaiting call site: {len(excluded)} | ogg bytes: {ogg_total}")
    for c in excluded:
        print(f"  EXCLUDED {c['manifestKey']} cue {c['cueId']} take {c['take']} ({c.get('tierName','?')})")
    if OUT_SHA != "TBD-PIN-AFTER-FIRST-VERIFIED-BUILD":
        if len(out) != OUT_BYTES or out_sha != OUT_SHA:
            abort(f"output does not match pinned target {OUT_BYTES} B / {OUT_SHA}")
        print("target pin verified")
    else:
        print("NOTE: pin OUT_SHA/OUT_BYTES to these values before delivery (GOV-80).")

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", default="round1_full_encode_manifest.json")
    ap.add_argument("--ogg-root", required=True)
    ap.add_argument("--wiring", default=None)
    build(ap.parse_args())
