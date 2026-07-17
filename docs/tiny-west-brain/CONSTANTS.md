# Protected tuning constants — Tiny West slice

Sources: `02 — GROUND TRUTH v4.0.0` (protected defaults), `06_VERTICAL_SLICE_AND_ACCEPTANCE`,
`01_CANON` (both sets). Change only deliberately, with before/after evidence and a
decision note. Values marked ⚠ are slice-scoped approximations (`CANON_BUILD_DELTA`).

## Player
| Constant | Value | Source |
| --- | --- | --- |
| Hearts | 3 | canon |
| Revolver rounds | 6 | canon |
| Fire | discrete, one press = one shot; cooldown 9f ⚠ (v4 cooldown undocumented) | canon / slice |
| Reload | 54 frames | ground truth |
| Perfect (active) reload window | 4–10 frames remaining | ground truth |
| Invulnerability after hit | 90f ⚠ | slice |

## Boarding / chase
| Constant | Value | Source |
| --- | --- | --- |
| Board window | 36f safe (±18f), 18f perfect (±9f) | ground truth |
| Missed board recycle | 72f | ground truth |
| Board leap transition | 24f | ground truth |
| Roof settle | 180f (control available) | ground truth |

## Return
| Constant | Value | Source |
| --- | --- | --- |
| Clean saddle | < 12f alignment error | ground truth |
| Rough catch | < 24f | ground truth |
| Rope catch | otherwise; −15% carried cash ⚠ | ground truth / slice |

## Economy / scoring
| Constant | Value | Source |
| --- | --- | --- |
| Loose-cash spill on player damage | 20%, once per hit, recoverable | ground truth |
| Pickup magnetize radius | 82 px | ground truth |
| Chain window | 150f; combo multiplier 1 + min(chain,5)×0.05 | ground truth |
| Cash-out final multiplier | ×1.25 | ground truth |
| Pay-car final multiplier | ×1.5 | ground truth |
| Medals (final score) | Tin 0 / Bronze 2,200 / Silver 4,000 / Gold 6,000 / Black 8,000 | ground truth |
| Heist/risk score share | ≥ 60% of scoring opportunity | canon |

## Enemies (slice scope)
| Enemy | HP | Source |
| --- | --- | --- |
| Mounted law rider | 2 | ground truth |
| Pistol guard | 1 | ground truth |
| Hatch ambusher | 1 | ground truth |
| Pay Car Marshal | 4, spread volley | ground truth |
| Ordinary telegraph | ≥ 30f | canon |

## World / presentation
| Constant | Value | Source |
| --- | --- | --- |
| Resolution | 480×270 Canvas 2D, smoothing off, integer positions | canon |
| Simulation | fixed 60 Hz, seeded PRNG (mulberry32), no sim `Math.random()` | canon |
| Zones | Sundown 0–30 s → Midnight after 30 s (Ghost Trail deferred) | ground truth |
| Live HUD | ≤ 24 native px; overlays ≤ 12% of screen | canon |
| Uncontrollable camera beat | ≤ 0.45 s (27f) | canon |
| Pay Car extension cap | 12 s ⚠ (v4: 15 s on an 80 s clock; slice has no global clock) | slice |
| Audio voices | ≤ 10 simultaneous ⚠ (Iron Trail spec; v4 doc says 64 — took stricter) | 07 spec |
| Music | 4 layered states (chase / roof / cash-carried / final), rearrange not restart | canon |
| Restart friction | ≤ 2 s | canon |
| File budget | < 1.2 MB preferred, 2.5 MB hard | canon |

## Deferred to full run (not in slice)
Wanted tiers (Heat 14/30/50/74/100), Rampage 100 → Overdrive 360–480f, Fan Fire ×3
after perfect reload, High Noon crit (final 12f of tell), 80 s base clock, contracts,
six-card encounter grammar (slice ships Dynamite Relay + Pay Car Marshal only),
water-tank heat cooling, cosmetics, voice barks.
