# DIVINE DOMINION — UI & Visuals

> Cross-references: [Overview](01-overview.md) · [Art Spec](art-spec.md) · [Sound Spec](sound-spec.md) · [UX Flows](09b-ux-flows.md) · [In-Game Interactions](09c-in-game-interactions.md) · [Divine Powers](06-divine-powers.md) · [Follower Voices](13-follower-voices.md) · [Harbinger](14-harbinger.md) · [World](04-world.md) · [Eras](07-eras-and-endgame.md) · [INDEX](../INDEX.md)

---

## Art Style: Vibrant Cosmic Vector *(Finalized — Stage 7)*

> **Fully defined in [art-spec.md](art-spec.md).** That document is the authoritative source for all hex values, VFX timing, typography rules, and asset paths. This section provides the summary.

**Direction:** Dark cosmic void, warm divine gold accents, terrain-diverse map. Cartoony, mobile-friendly, AI-generation-compatible.

- **Dark mode only** — cosmic god perspective from above
- **Smooth vector** with radial gradients (lighter center, darker edges)
- **Soft glows** for religion influence and city presence
- **Era-adaptive** palette from warm earthy → cool industrial → cosmic purple
- **Typography:** Cinzel (headings, 14px min) + Source Serif 4 (body, 13px min)
- **Divine gold** `#c9a84c` as player accent color throughout

**Full spec:** [art-spec.md](art-spec.md)

---

## Core Visual Principles

| Principle | Implementation |
|-----------|----------------|
| **Smooth vector regions** | Soft curves, no jagged edges. Radial gradients per terrain type. |
| **Soft gradient fills** | Lighter center, darker edges; religion overlay as radial glow |
| **Depth** | Subtle shadows, layered elements, `backdrop-filter: blur` on HUD |
| **Palette** | Divine gold (#c9a84c) + era-adaptive backgrounds. See [art-spec.md §3](art-spec.md). |
| **7 terrain types** | Plains, Forest, Desert, Hills, Tundra, Mountains, Coast — each with unique gradient + micro-detail. See [art-spec.md §3c](art-spec.md). |
| **Living map** | Drifting clouds, day/night, seasonal shifts, glowing trade routes (all Phaser-rendered) |

---

## Era-Adaptive Visual Evolution

The map and UI evolve across 600 years. Exact hex values per era in [art-spec.md §3b](art-spec.md).

| Era Range | Visual Mood | Tint Family |
|-----------|-------------|-------------|
| 1–2 (1600s) | Warm brown, earthy, organic | `#5a4530` → `#6a5038` |
| 3–4 (1700s) | Golden brown → amber | `#7a6548` → `#8a6a3a` |
| 5–6 (1800s) | Cool grey → slate | `#5a5a5a` → `#4a4a58` |
| 7–8 (1900s) | Deep slate → indigo | `#3a3a52` → `#2a2a4a` |
| 9–10 (2000s) | Navy → deep purple | `#1a2a52` → `#1a1a42` |
| 11–12 (2100s+) | Dark purple → near-black | `#181838` → `#12122e` |

---

## Phone Layout (Portrait, Map-First)

| Element | Behavior |
|---------|----------|
| **Map** | 100% of screen. Primary content. |
| **Top bar** | Minimal, semi-transparent. Pause, speed, year, energy, prayer counter. |
| **FAB** | Floating Action Button, bottom-right. Tap → contextual dual-arc power menu (3–6 buttons). |
| **Power menu** | Dual-arc: blessings fan left (gold), disasters fan right (red). Both visible — no toggle. Divine Eye at apex toggles overlay. Smart context shows 3–4 relevant powers; "..." for full set. |
| **Event notifications** | Toast from top. Choice events auto-pause. |
| **Region tap** | Bottom sheet slides up (Google Maps style). Includes Divine Whisper buttons. |
| **No permanent bottom bar** | Clean map. |
| **Touch targets** | 44pt minimum. |
| **Left-hand mode** | FAB + arc mirrors to bottom-left. |
| **Swipe right** | Commandments panel. |
| **Swipe left** | World stats. |
| **Two-finger tap** | Pause/unpause (shortcut — visible pause button in HUD). |

> **Full interaction specs** (HUD, FAB, events, bottom sheet, overlay, map, accessibility, errors, whispers, combos, follower voices) are in [09c-in-game-interactions.md](09c-in-game-interactions.md).

---

## Ambient Map Life

The map must feel alive every second, even when no events or wars are happening. Dead time between events (30-90 seconds) must still feel engaging.

### Constant Ambient Motion

| Element | Animation | Purpose |
|---------|-----------|---------|
| **Clouds** | Slow drift across regions, semi-transparent, wind-direction-aware | Adds life to static terrain |
| **Rivers** | Gentle flow shimmer (subtle texture scroll) | Terrain feels organic |
| **Trees/vegetation** | Micro-sway on wind (late eras: less vegetation in industrial regions) | Nature is alive |
| **Ocean/lakes** | Wave ripple animation, color shifts with time-of-day | Water never looks static |
| **City glow** | Soft pulsing proportional to population — brighter = bigger city | Cities "breathe" |
| **Industrial smoke** | Wispy particles from developed cities (Era 5+) | Era progression is visible |

### Activity Indicators

| Element | Visual | When |
|---------|--------|------|
| **Trade particles** | Small golden dots flowing along trade route lines (like data packets) | While trade routes are active |
| **Religion wave-front** | Soft golden ripple expanding outward when influence enters a new region | During religion spread ticks |
| **Construction** | Tiny sparkle on cities that are developing (Dev increasing) | During development growth |
| **Recruitment** | Faint banner-raising animation in cities building armies | During military recruitment |

---

## Visual Complexity Growth

The world at year 2100 must look obviously more complex and developed than year 1600. The map evolves in density, not just color.

| Era Range | Visual Density |
|-----------|---------------|
| 1600s | Sparse — small villages, few roads, empty terrain, vast wilderness |
| 1700s | Emerging — towns appear, first trade routes draw golden lines |
| 1800s | Connected — cities grow, road networks visible, factory smoke |
| 1900s | Dense — metropolises, thick trade networks, armies with modern banners |
| 2000s | Saturated — sprawling cities, satellite dishes, digital pulse effects |
| 2100s+ | Futuristic — orbital rings, space stations as map elements, defense grid visible in sky |

### City Icon Progression

Cities visually evolve as their Dev level increases. SVG files: `assets/icons/city-{1..5}.svg`. Full spec in [art-spec.md §5](art-spec.md).

| Dev Level | Icon | Silhouette | Scale |
|-----------|------|-----------|-------|
| 1-2 | Village | Round hut + smoke wisp | Small |
| 3-4 | Town | Pointed spire + cross | Medium |
| 5-7 | City | Cathedral dome + flanking towers | Large |
| 8-10 | Metropolis | 5 staggered skyscrapers | Extra large |
| 11-12 | Future City | Needle spire + orbital ring | Extra large + aura |

---

## Zoom-Level Depth

Three zoom levels provide different engagement depending on what the player wants:

| Zoom Level | What's Visible | Player Intent |
|------------|---------------|---------------|
| **Strategic (default)** | Full map, region borders, army tokens, trade routes, religion overlay colors | "What's happening in the world?" |
| **Regional** | Region detail, city icons at full size, army composition, active battles with VFX, disease indicators | "What's happening in this area?" |
| **Close-up** | City detail (buildings evolving with Dev), tiny inhabitants/vehicles (late eras), historical event markers, region flavor text | "Let me explore this place" |

### Close-up Discovery Elements

At max zoom, regions reveal discoverable details:

- **Historical markers:** "Battle of the Northern Plains, 1743" — events that happened in this region
- **Population activity:** Tiny animated figures (farmers → factory workers → office workers across eras)
- **Religion symbols:** Temple/church icons matching the region's current faith
- **Development indicators:** Visible infrastructure (roads, bridges, power lines, satellites)

---

## Living Map Elements

### Armies

| State | Visual |
|-------|--------|
| **Garrisoned** | Banner token (flag/pennant), nation color, strength number. Shield in city. |
| **Marching** | Dotted path, fading trail. |
| **Battle** | Crossed swords, sparks. |
| **Retreating** | Fast, transparent, red trail. |
| **Sieging** | Circling city. |
| **Destroyed** | Shatter particles. |

Zoom-responsive: simplify at low zoom, detail at high zoom.

### Disease

| State | Visual |
|-------|--------|
| **Outbreak** | Green-yellow tint on region |
| **Spread** | Green tendrils along trade routes |
| **Pandemic** | Pulsing tint, dim cities |
| **Quarantine** | Dashed border |
| **Recovery** | Fading green, floating + icons |

### Trade Routes

| State | Visual |
|-------|--------|
| **Active** | Golden lines. Thicker = more volume. |
| **Disrupted** | Red fade. |
| **New** | Golden draw animation. |

### God's Omniscient View (Divine Overlay)

Toggle via **Divine Eye** at apex of FAB dual-arc. Purple ring on FAB when active. Shows hidden information across 4 selectable layers (see [09c §5](09c-in-game-interactions.md) for layer picker interaction):

| Layer | Data Elements | Visual |
|-------|---------------|--------|
| **Religion** | Religion Pressure, Schism Risk | Gold/gray arrows (spread), hairline cracks (schism) |
| **Military** | Attack Plans, Tension Zones | Dashed arrows (plans), pulsing red borders (tension) |
| **Trade** | *(no named elements in art spec — trade volume + disruption shown as line thickness)* | Golden lines |
| **Science** | Scientific Hotspots | White glow |

Additional late-game elements (not layer-selectable — always visible when overlay is active):

| Element | Visual | When |
|---------|--------|------|
| **Disease Vectors** | Green arrows | When active disease exists |
| **Alien Signal** | Faint line from sky | Era 9+ after reveal |

---

## Power VFX Table

> Full VFX spec with particle colors, duration, easing, and opacity curves in [art-spec.md §7](art-spec.md).

| Power | Visual on Map | Particle Color |
|-------|---------------|---------------|
| **Bountiful Harvest** | Golden wheat waves, rippling fields | `#8aaa4a` |
| **Inspiration** | Soft blue glow, sparkles | `#88aacc` |
| **Miracle** | Gold + white radial burst, conversion halo | `#c9a84c` + `#fff` |
| **Prophet** | Gold radial expanding ring | `#c9a84c` |
| **Shield of Faith** | Translucent blue dome over region | `#88aacc` |
| **Golden Age** | Warm golden aura, sparkles, shake | `#c9a84c` + `#fff` + `#8aaa4a` |
| **Earthquake** | Brown particles, 4px screen shake | `#8a7050` |
| **Great Flood** | Dark blue waves, blue tint pulse | `#3a6a8a` |
| **Plague** | Sickly green mist, green tint | `#6a8a3a` |
| **Great Storm** | Grey particles, flash + shake | `#5a5a7a` |
| **Famine** | Dried earth particles, desaturation | `#8a7040` |
| **Wildfire** | Orange + red flames, shake | `#cc5522` + `#c93040` |

---

## Critical SFX (MVP)

> Full audio spec with SFX list, music per era, audio state machine, haptics, and budget in [sound-spec.md](sound-spec.md).

Sound effects essential for engagement. Without these, key moments feel flat.

### Divine Power SFX

| Power | Sound Description |
|-------|------------------|
| Bountiful Harvest | Warm chime + rustling wheat |
| Inspiration | Ascending bell tone + page flutter |
| Miracle | Deep resonant gong + choir swell |
| Prophet | Ethereal voice whisper + wind |
| Shield of Faith | Glass dome forming + hum |
| Golden Age | Triumphant brass sting + sparkle |
| Earthquake | Deep rumble + crack |
| Great Flood | Rushing water crescendo |
| Plague | Eerie dissonant drone + cough |
| Great Storm | Thunder crack + wind howl |
| Famine | Dry creaking + wind |
| Wildfire | Roaring flame + crackling |

### Event & Game State SFX

| Trigger | Sound Description |
|---------|------------------|
| Event notification | Soft bell chime (distinct from power SFX) |
| Event choice confirm | Click + subtle whoosh |
| Era transition | Rising whoosh + chime sequence (2-3s) |
| Battle start | Distant clash of metal |
| Battle victory | Short brass fanfare |
| Battle defeat | Low drum + fade |
| War declared | War horn blast |
| Divine Whisper cast | Soft breath + golden shimmer |
| Power Combo trigger | Cascading chime + rumble chain |
| Follower Voice emergence | Ethereal voice rising + wind chime |
| Follower Voice death | Somber single bell + fade |
| Petition received | Gentle prayer hum + golden chime |
| Heretic emergence | Dissonant chord + crack |
| Alien reveal (early) | Faint radio static + eerie tone |
| Alien reveal (late) | Deep bass rumble + alarm |
| Game won | Full triumphant fanfare (5s) |
| Game lost | Somber descent + silence |

### UI SFX

| Trigger | Sound Description |
|---------|------------------|
| FAB open | Soft pop |
| FAB close | Reverse pop |
| Button tap | Light click |
| Region tap | Subtle map thud |
| Overlay toggle | Soft filter sweep |
| Pause | Time-stop whoosh |
| Unpause | Reverse time-stop |

---

## Accessibility

- **Colorblind modes:** Alternative palettes for religion, tension, disease, voice type rings
- **High contrast:** Optional toggle for readability. HUD pill borders thicken. Text contrast ≥ 4.5:1.
- **Reduce motion:** Disable particles, simplify animations, instant arc/pulse transitions
- **Font scaling:** 80%–140% on game text. Button labels stay fixed.
- **Touch targets:** 44pt minimum on all interactive elements.
- **Screen reader:** VoiceOver/TalkBack labels on all HUD, FAB, and event elements.

> **Full accessibility spec** in [09c-in-game-interactions.md](09c-in-game-interactions.md) § 7.
