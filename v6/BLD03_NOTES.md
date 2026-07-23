# BLD-03 WORKING NOTES (context-restore file — alpha.3.7-audio build in progress)
# Authorization: GOV-85 DEC-085-2 (owner, 2026-07-22). Gate=86157cd0 (alpha.3.6). HOLD after delivery.
# Manifest PINNED 5911c4468df6041b9f62b79dbcfa3bcc37ae21796f1552aefc97f8b0840b9f9a (206 clips/77 fams).
# Wiring spec round1_wiring_spec.json PINNED 68dd7a038680f0434c19a2a7c31b10bfbcf4b4f2662870b875564857daf00568.
# Wire ALL 46 incl 006/073/100 defaults; carry 85. OGGs → repo commit (121 new at
# v6/audio/assets/audio/_embed/round1_remaining/, agents verifying SHAs); carried 85 extracted
# from alpha.3.6 blob by builder into ogg-root alpha3_2/ (not committed).
# Builder: v6-bound BLD03_BUILD_ALPHA3_7_AUDIO.py (supersedes BLD02 scaffold).
# CUE→KEY: 003 shotFan(resolve shot rare) 004 reloadSpin(data) 005 hammerCock(deadeye windup)
# 006 reloadFull(resolve reload REVOLVER — replaces 022 start audibly, 022 stays embedded)
# 008 shotRifle 009 rifleLever(post-shot RIFLE) 010 reloadRifle 011 shotShotgun(SAWED)
# 012 reloadShotgun 013 emptyShotgun(resolve jam SAWED) 014 ricochet(resolve metal chance)
# 015 flyby(near-miss site) 016 dirt/019 stone(player bullet expiry, zone2=stone, GATE chance)
# 031 ironImpact/032 trunkImpact(resolve metal/wood chance variants — interpretive default)
# 060-064 ui*(confirm swap, back swap, cycleTitleChoice=uiTab, rebind-refuse=uiDisabled,
#   resolve coin→uiFocus in menus; fallback ui*→coin procedural) 066 hoofGrass(resolve hoof zone0)
# 069 horseTack(loop mounted) 072 horseWhinny(SADDLE return) 073 horseLand(return-complete site)
# 075 trainRods(loop on-train) 076 steamRelease(steamT<=0 site) 077 coupler(carIndex++ site)
# 078 brakeSqueal(finishRun) 079 trainInterior(loop G.interior) 080 engineProximity(loop carIndex>=2)
# 081 roofWind(loop roof) 082 fuse(loop lit dynamite) 083-085 debris(explosion site: zone2 rock,
#   roof metal, else wood) 086/087 explosionTail Ext/Int(explosion site by G.interior)
# 088 fireLoop(loop 240f after explosion via G.audioEvents tail) 089 canyonWind(loop zone1)
# 091 dustStorm(loop weather DUST) 092 stampede(stampedeT=180 site) 095 safeLock(crate break
#   when carType.lock — interpretive) 096 ladderGrab(beginBoard) 098 strongbox(pickup GOLD/
#   STRONGBOX/LEDGER) 100 crateBreak(c.hp<=0 broken site).
# Engine edits: AUDIO_CUES head insert; GATE whole-statement replace; ready/emit resolve hook;
# TW_SAMPLES return += loopSet; fallback += ui*/new-key procedural mapping; TW_AMB module +
# render-head hook chain (after TW_JUICE.observe()).
# Acceptance: parity off/on/no-context/suspended vs 86157cd0; decode 206/77; perf HUD decode/heap;
# guard regression; offline; protected values; non-vacuous new-cue evidence via __TW_SFX_DIAG perKey.
# Deliver per GOV-80: builder+harness+BLD-03 receipt to Brain (small text, bg agent); candidate+OGGs
# in git for history/reproduce. Then HOLD (CATCH/SYNC next, one at a time).
