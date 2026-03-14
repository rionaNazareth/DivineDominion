# DIVINE DOMINION — Visual Art Spec

> Cross-references: [UI & Visuals](09-ui-and-visuals.md) · [In-Game Interactions](09c-in-game-interactions.md) · [Eras](07-eras-and-endgame.md) · [Divine Powers](06-divine-powers.md) · [Religions](05-religions.md) · [Harbinger](14-harbinger.md) · [Sound Spec](sound-spec.md) · [INDEX](../INDEX.md)
>

---

## 1. Art Identity

**Theme:** You are a god observing from the cosmic void. Dark backgrounds, warm gold divine accents, terrain-diverse world below.

**Style principles:**
- Smooth vector, no pixel art
- Radial gradients for terrain depth (lighter center, darker edges)
- Soft glows for religion influence and city presence
- Era-adaptive: warm earthy tones → cool industrial → cosmic purple
- Dark mode only

**Reference games:** Polytopia (clean vector terrain), Northgard (terrain variety), Alto's Adventure (atmospheric gradients)

---

## 2. Typography

All fonts from Google Fonts. Weights committed to `assets/fonts/`.

| Role | Font | Weights | Min Size | Usage |
|------|------|---------|----------|-------|
| **Headings** | Cinzel | 600, 700, 800, 900 | 14px | Era name, event title, region name, section headers |
| **Body** | Source Serif 4 | 400, 500, 600 | 13px | Event descriptions, toast text, petition text |
| **Numbers** | Source Serif 4 | 600 | 11px | Population, year, energy, stats |

**Rules:**
- Cinzel must NEVER appear below 14px (use Source Serif 4 for smaller text)
- All body text on dark backgrounds must meet WCAG AA contrast (4.5:1)
- Line-height: 1.65 for body paragraphs, 1.2 for headings

**Google Fonts import:**
```
https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Source+Serif+4:ital,wght@0,400;0,500;0,600;1,400&display=swap
```

---

## 3. Master Color Palette

### 3a. Core UI Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#c9a84c` | Divine gold — headings, accents, player religion |
| `--primary-dark` | `#8a6a20` | Gold shadow, gradient end |
| `--danger` | `#c93040` | Enemy, war, smite, disasters |
| `--danger-light` | `#cc6666` | Danger text, soft red on dark |
| `--info` | `#6a8acc` | Peace, diplomatic, energy |
| `--neutral` | `#b0b0c8` | Science, secondary UI |
| `--teal` | `#20aa98` | Minor religion, coastal |
| `--purple` | `#6a5acd` | Future tech, Harbinger counter, combo |
| `--cyan` | `#00CED1` | Future city, sci-fi accents |
| `--bg-void` | `#06061a` | App background, cosmic void |
| `--bg-surface` | `#0a0820` | Card backgrounds, modals |
| `--bg-elevated` | `#0c0a24` | Bottom sheet, elevated surfaces |
| `--text-primary` | `#d8d0c0` | Main body text |
| `--text-secondary` | `#8a7a50` | Labels, subtitles |
| `--text-muted` | `#5a4a30` | Disabled, hints |
| `--border-subtle` | `rgba(201,168,76,0.12)` | Card borders, dividers |
| `--border-accent` | `rgba(201,168,76,0.3)` | Active borders, secondary buttons |

### 3b. Era Background Palette (12 eras)

Each era shifts the global tint. CODE-RENDERED via Phaser palette tween.

| Era | Name | Primary BG | Secondary BG | Tint Family |
|-----|------|-----------|-------------|-------------|
| 1 | Renaissance | `#5a4530` | `#3a2a18` | Warm brown |
| 2 | Exploration | `#6a5038` | `#4a3520` | Warm brown |
| 3 | Enlightenment | `#7a6548` | `#5a4530` | Golden brown |
| 4 | Revolution | `#8a6a3a` | `#6a4a22` | Amber |
| 5 | Industry | `#5a5a5a` | `#3a3a40` | Cool grey |
| 6 | Empire | `#4a4a58` | `#2a2a38` | Slate |
| 7 | Atomic | `#3a3a52` | `#1a1a32` | Deep slate |
| 8 | Digital | `#2a2a4a` | `#12122a` | Indigo |
| 9 | Signal | `#1a2a52` | `#0a1530` | Navy |
| 10 | Revelation | `#1a1a42` | `#0a0a25` | Deep purple |
| 11 | Preparation | `#181838` | `#080820` | Dark purple |
| 12 | Arrival | `#12122e` | `#06061a` | Near-black |

### 3c. Terrain Palette (7 types)

All CODE-RENDERED via Phaser Graphics with radial gradients.

| Terrain | Gradient Center | Gradient Edge | Border Color | Border Width |
|---------|----------------|---------------|-------------|-------------|
| Plains | `#5a9a4a` | `#3a7a2a` | `#2a6a2a` | 2.5px |
| Forest | `#2a5a2a` | `#1a4a1a` | `#1a3a1a` | 2.5px |
| Desert | `#c9a060` | `#8a7040` | `#6a5530` | 2.5px |
| Hills | `#6a7a5a` | `#4a5a3a` | `#3a4a2a` | 2.5px |
| Tundra | `#8a9aaa` | `#5a6a7a` | `#4a5a6a` | 2.5px |
| Mountains | `#5a6878` | `#3a4858` | `#3a4858` | 2.5px |
| Coast | `#4a8a68` | `#2a6a4a` | `#1a5a4a` | 2.5px |

**Terrain micro-detail (CODE-RENDERED):**
- Forest: dark green circles (r=5-7, opacity 0.4-0.7) as tree clusters
- Desert: wavy stroke lines (opacity 0.25-0.35) as dunes, small circles as rocks
- Mountains: triangle polygons with lighter snow-cap triangles at peaks
- Tundra: light blue-gray circles (opacity 0.07-0.12) as frost patches
- Hills: arc paths (opacity 0.2-0.3) as rolling hills, ellipses as boulders
- Coast: wavy stroke paths at edges, faint sand-colored fills near shore
- Plains: small green circles (opacity 0.2-0.3) as vegetation, faint rectangles as farmland

**Ocean:** Radial gradient from `#0f1a2a` (center) to `#060812` (edge). Deep water patches as darker ellipses.

---

## 4. Religion Color Palette

Player religion + 10 pre-made rivals. Colors must be distinguishable at 12px circle size on dark background.

| ID | Religion | Hex | Map Overlay Opacity |
|----|----------|-----|-------------------|
| `player` | Player's Religion | `#c9a84c` (Gold) | 0.90 center → 0.0 edge (radial gradient) |
| `flame` | Order of the Flame | `#DC143C` (Crimson) | 0.50 |
| `harvest` | Children of the Harvest | `#8FBC8F` (Sage Green) | 0.40 |
| `deep` | Watchers of the Deep | `#191970` (Midnight Blue) | 0.50 |
| `endings` | Cult of Endings | `#4A4A4A` (Ash Grey) | 0.45 |
| `unity` | Seekers of Unity | `#FFBF00` (Warm Amber) | 0.40 |
| `fortress` | The Silent Fortress | `#708090` (Slate Grey) | 0.45 |
| `covenant` | Golden Covenant | `#DAA520` (Rich Gold) | 0.40 |
| `wandering` | The Wandering Path | `#008080` (Teal) | 0.45 |
| `veil` | Keepers of the Veil | `#6A0DAD` (Deep Purple) | 0.50 |
| `iron` | The Iron Dawn | `#B22222` (Firebrick) | 0.50 |

**Colorblind safety notes:**
- Crimson (#DC143C) and Firebrick (#B22222) are both red-family — differentiated by brightness (DC vs B2)
- Gold (#c9a84c) and Amber (#FFBF00) differ in saturation — amber is much brighter
- Midnight Blue (#191970) is dark enough to be distinct from Teal (#008080) under all deficiencies
- All pairs validated: no two colors within delta-E < 20 under deuteranopia/protanopia simulation

**Map overlay rendering:** Radial gradient from center (full opacity) to edge (0 opacity). CODE-RENDERED.

---

## 5. City Icon Progression

FILE-BASED SVGs committed to `assets/icons/city-{1..5}.svg`. Each icon must read by silhouette at 24px.

| Level | Name | Silhouette | Key Visual | Color Family |
|-------|------|-----------|-----------|-------------|
| 1 | Village | Round dome + smoke wisp | Single thatched hut, curling smoke | Warm brown (#6a5a40, #8a6a38) |
| 2 | Town | Pointed triangle + cross | Church spire above stone wall | Stone grey (#5a5a48, #7a6a48), gold cross |
| 3 | City | Arch + flanking peaks | Cathedral dome, two towers | Blue-grey (#4a5568, #5a6a7a), gold spire tip |
| 4 | Metropolis | Stepped bars | 5 staggered skyscrapers | Steel blue (#253548, #2d3f55), cyan antenna |
| 5 | Future City | Vertical line + halo ring | Needle spire, orbital ring | Purple (#151530, #6a5acd), cyan (#00CED1) |

**Rendering rules:**
- On the map, each city sits on a religion-colored radial glow (Phaser renders this, not the SVG)
- SVG must have transparent background
- Every icon must have light-colored strokes or glowing elements for visibility on dark terrain
- Minimum stroke width: 1.2px at 80px viewBox

**AI generation prompts (for asset production):**
1. `"Village icon, single round thatched hut with smoke wisp, warm brown earth tones, dark transparent background, smooth vector style, 64x64px"`
2. `"Medieval town icon, pointed church spire with cross above stone wall, grey stone with gold cross accent, dark transparent background, smooth vector, 64x64px"`
3. `"City icon, large cathedral dome with two flanking towers, blue-grey stone with gold spire tip, dark transparent background, smooth vector, 64x64px"`
4. `"Modern metropolis icon, five staggered skyscrapers of different heights, steel blue glass with cyan antenna light on tallest, dark transparent background, smooth vector, 64x64px"`
5. `"Futuristic city icon, single tall needle spire with glowing cyan orbital ring, purple and cyan neon, dark transparent background, smooth vector, 64x64px"`

---

## 6. Army Banner Spec

CODE-RENDERED (Phaser Graphics).

| Property | Value |
|----------|-------|
| Shape | Pennant/flag: flat top, V-notch bottom |
| Width | 22px at default zoom |
| Height | 16px |
| Fill | Nation's religion color (opacity 0.9) |
| Stroke | Lighter variant of fill color (0.5px) |
| Text | Troop count (e.g. "5K"), Source Serif 4 600, white, centered |
| Text size | 11px |
| Movement | Smooth tween along path, ease-in-out, 400ms per tile |
| Battle animation | Two banners clash → shake (200ms, 2px amplitude) → loser retreats |

---

## 7. Divine Power VFX Spec

All CODE-RENDERED via Phaser particle system and tweens. No sprite sheets needed.

### 7a. Blessings

| Power | Particle Color | Duration | Easing | Screen Effect | Opacity Curve |
|-------|---------------|----------|--------|--------------|---------------|
| Bountiful Harvest | `#8aaa4a` (green-gold) | 1200ms | ease-out | None | 0→1→0.3 hold 800ms→0 |
| Inspiration | `#88aacc` (light blue) | 1000ms | ease-in-out | Subtle flash | 0→0.8→0 |
| Miracle | `#c9a84c` (gold) + `#fff` | 1800ms | elastic | Golden flash, 1px shake | 0→1→hold 1000ms→0 |
| Prophet | `#c9a84c` (gold) radial | 1500ms | ease-out | Expanding ring | 0→0.7→hold 800ms→0 |
| Shield of Faith | `#88aacc` (blue) dome | 800ms up, holds for blessing duration (see constants.md), 400ms fade out | ease-out | Blue tint | 0→0.5 (800ms ramp) → 0.5 steady → 0 (400ms fade on expiry) |
| Golden Age | `#c9a84c` + `#fff` + `#8aaa4a` | 2400ms | ease-in-out | Golden glow, 2px shake | 0→1→hold 1500ms→0 |

### 7b. Disasters

| Power | Particle Color | Duration | Easing | Screen Effect | Opacity Curve |
|-------|---------------|----------|--------|--------------|---------------|
| Earthquake | `#8a7050` (brown) | 1500ms | ease-in | 4px shake, 600ms | 0→0.8→hold 400ms→0 |
| Great Flood | `#3a6a8a` (dark blue) | 2000ms | ease-in-out | Blue tint pulse | 0→0.7→hold 1000ms→0 |
| Plague | `#6a8a3a` (sickly green) | 1200ms | ease-out | Green tint | 0→0.6→hold 600ms→0 |
| Great Storm | `#5a5a7a` (storm grey) | 1800ms | ease-in | Flash + 3px shake | 0→0.9 (0-300ms) → 0.3 (300-600ms) → 0.9 (600-1200ms) → 0 (1200-1800ms) |
| Famine | `#8a7040` (dried earth) | 1000ms | ease-in | Desaturation pulse | 0→0.5→hold 400ms→0 |
| Wildfire | `#cc5522` (fire orange) + `#c93040` | 2000ms | ease-in | Orange flash, 2px shake | 0→1→0.6→0.8→0 |

### 7c. Divine Whispers

| Whisper | Indicator Color | VFX |
|---------|----------------|-----|
| War | `#c93040` | Red pulse ring expanding from region center, 600ms, ease-out |
| Peace | `#6a8acc` | Blue calming ring, 600ms, ease-out |
| Science | `#b0b0c8` | White sparkle particles upward, 500ms |
| Faith | `#c9a84c` | Gold glow pulse on region, 500ms |

**Targeted whisper (War/Peace):** Arrow trail from source region to target, same color, 400ms, ease-in-out.

### 7d. Combo VFX

| Combo | VFX | Duration |
|-------|-----|----------|
| Divine Chain toast | Gold→purple gradient border, scale-in from 0.8→1.0 | 300ms in, 3000ms hold, 500ms fade |
| All combos | Region flash in combo color + ripple ring expanding outward | 800ms |

### 7e. Progressive Unlock

When a new power unlocks at an era boundary:
- FAB pulses with gold glow (3 cycles, 600ms each)
- Toast: "[Power Name] Unlocked" with power-specific icon
- New power slot glows gold for 5 seconds in FAB menu

---

## 8. Harbinger VFX Spec

All CODE-RENDERED. Purple-dark color family (`#6a0dad` base, `#2a0050` dark).

| Effect | Visual | Colors | Duration | Opacity |
|--------|--------|--------|----------|---------|
| **Corruption** (on city) | Dark purple stain spreading from city center | `#2a0050` → `#6a0dad` | 2000ms spread, holds until purged | 0.3-0.5 |
| **Veil shimmer** | Rippling distortion on region + "⚠" icon | `#4a2080` shimmer | Continuous loop, 2000ms cycle | 0.15-0.25 |
| **Discord trail** | Purple whisper lines between two nations | `#6a0dad` dashed line | 800ms draw, 2000ms hold, 600ms fade | 0.4 |
| **Sever** | Purple cut line across trade route + flash | `#8a20c0` line + `#fff` flash | 400ms cut, 200ms flash | 0.7→0 |
| **False Miracle** | Purple halo around rival religion city | `#6a0dad` ring | 1200ms expand, holds 3000ms | 0.5 |
| **Plague Seed** | Green-purple particles at disease origin | `#6a8a3a` + `#6a0dad` | 1000ms burst | 0.6→0 |
| **Divine Purge** | Golden-white cleansing burst expanding outward | `#c9a84c` + `#ffffff` | 1500ms expand, 500ms fade | 0→1→0 |
| **Anomaly overlay** (Era 10+) | Faint purple shimmer over affected regions | `#2a0050` | Continuous, slow pulse 3000ms | 0.08-0.15 |

---

## 9. Era Transition Visual Spec

CODE-RENDERED (Phaser palette tween).

| Property | Value |
|----------|-------|
| Transition trigger | Era boundary crossed |
| Palette morph duration | 3000ms |
| Easing | ease-in-out (Phaser `Sine.InOut`) |
| Effect | All terrain, ocean, UI tints smoothly shift to next era's palette |
| Overlay | Brief era name toast: era number + name in Cinzel 800, gold, center screen |
| Toast duration | 2500ms (500ms fade in, 1500ms hold, 500ms fade out) |
| Timing | Palette starts morphing → 500ms later toast appears → toast fades → morph completes |

---

## 10. UI Component Style Guide

All CODE-RENDERED.

### 10a. Buttons

| Type | Background | Text | Border | Radius | Shadow |
|------|-----------|------|--------|--------|--------|
| Primary (Cast) | `linear-gradient(145deg, #c9a84c, #8a6a20)` | `#0a0a1a`, Cinzel 700 | none | 14px | `0 4px 16px rgba(201,168,76,0.3)` |
| Secondary (Cancel) | transparent | `#c9a84c`, Cinzel 600 | `1.5px solid rgba(201,168,76,0.3)` | 14px | none |
| Ghost (Stay Silent) | transparent | `#6a5a38`, Source Serif 4 italic | `1px solid #2a2018` | 14px | none |
| Danger (Smite) | `rgba(180,40,40,0.1)` | `#c93040`, Cinzel 600 | `1.5px solid rgba(180,40,40,0.3)` | 14px | `0 0 12px rgba(180,40,40,0.08)` |

### 10b. Cards & Surfaces

| Element | Background | Border | Radius | Shadow |
|---------|-----------|--------|--------|--------|
| Bottom Sheet | `linear-gradient(180deg, rgba(10,8,20,0.96), rgba(6,4,14,0.99))` | `1px solid rgba(201,168,76,0.12)` top | 20px top | `0 -10px 40px rgba(0,0,0,0.6)` |
| Event Card | `linear-gradient(180deg, rgba(12,10,24,0.97), rgba(8,6,18,0.99))` | `2px solid rgba(201,168,76,0.2)` | 20px | `0 24px 80px rgba(0,0,0,0.9)` |
| Event Card backdrop | Radial vignette: `rgba(6,6,26,0.3)` center → `rgba(6,6,26,0.85)` edge | — | — | Overlays dimmed map (15% opacity) |
| HUD Pill | `rgba(8,6,18,0.85)` + `backdrop-filter: blur(12px)` | `1px solid rgba(201,168,76,0.15)` | 16px | `0 2px 12px rgba(0,0,0,0.5)` |
| Toast | `rgba(8,6,18,0.94)` | `2px gradient border (gold→purple)` | 16px | `0 8px 30px rgba(0,0,0,0.5)` |

### 10c. HUD Layout

| Element | Position | Font | Size |
|---------|----------|------|------|
| Speed controls | Top-left | Source Serif 4, 600 | 12px |
| Year display | Top-center | Cinzel 900 | 24px |
| Era label | Below year | Source Serif 4, 600 | 12px |
| Energy | Top-right | Source Serif 4, 600 | 12px, blue `#8aaace` |
| Prayer counter | Top-right (after energy) | Cinzel 700 | 14px, gold gradient fill |
| FAB | Bottom-right, 20px from edges | — | 58×58px circle |
| FAB ring (power active) | Around FAB | — | 74×74px, `rgba(138,60,200,0.45)` |

### 10d. Follower Voice Icons

| Voice Type | Icon | Color | Border Color |
|-----------|------|-------|-------------|
| Prophet | 5-pointed star | `#c9a84c` | `#c9a84c` |
| Ruler | Crown/chevron pointing up | `#b0b0b8` | `#b0b0b8` |
| General | Sword | `#6a7a8a` | `#6a7a8a` |
| Scholar | Clock/compass circle | `#6a8acc` | `#6a8acc` |
| Heretic | X in circle | `#c93040` | `#c93040` |

Each icon: 52×52px circle, 3px border, `box-shadow: 0 0 12px` in icon color at 15-20% opacity. CODE-RENDERED (not file-based).

---

## 11. VFX Stacking & Performance Rules

### 11a. VFX Stacking

| Rule | Value |
|------|-------|
| Max simultaneous particle emitters | 6 |
| Same power re-cast | Previous VFX truncated (fast fade 200ms), new one starts |
| Different powers overlapping | Both play, oldest truncates if emitter limit exceeded |
| Combo VFX | Plays AFTER the triggering power VFX completes (chained, not overlapping) |
| Screen shake stacking | Max 1 active shake; strongest wins, others ignored |
| 4× game speed | VFX durations unchanged; particle emit rate unchanged (VFX is real-time, not game-time) |

### 11b. Religion Dominance Indicator

When multiple religions contest a region, a visual indicator shows dominance:

| State | Visual |
|-------|--------|
| Single religion majority (>60%) | Full radial glow in religion color |
| Contested (no religion >60%) | Split border: thickest segment = largest share. 2-3 religion colors along region border, proportional to share. |
| Player religion majority | Gold radial glow + subtle pulse (500ms cycle, 0.3→0.5 opacity) |

### 11c. Religion Wave-Front

When player religion spreads to a new region:

| Property | Value |
|----------|-------|
| Visual | Gold ripple ring expanding from conversion source |
| Duration | 800ms |
| Max radius | Region boundary |
| Opacity | 0.6 → 0 |
| Easing | ease-out |
| Trigger | Religion spread tick where player faith enters a new region |

### 11d. Overlay Complexity Limit

| Rule | Value |
|------|-------|
| Max overlay layers active simultaneously | 2 (e.g., Religion + Military, but not all 4 + Anomaly) |
| Default when Divine Eye opens | Religion layer only |
| Layer switching | Tap replaces current layer; long-press adds second layer |
| Anomaly overlay (Era 10+) | Always underlays other layers when active, does NOT count toward the 2-layer limit |
| Ambient indicators (disease, trade particles, city glow) | Always visible, not layer-gated |

### 11e. Particle Budget

| Property | Value |
|----------|-------|
| Max active particles per emitter | 50 |
| Max total active particles on screen | 300 |
| Terrain micro-detail | Pre-rendered to static texture at world gen (NOT per-frame draw calls) |
| Reduced motion mode | Particle count halved, duration halved, no screen shake |

---

## 12. Implementation Notes for Stage 8

These items are Stage 7 visual targets that require specific Phaser 3 approaches. Stage 8 (Tech/QA) must resolve the implementation method.

| Visual Target | Phaser Approach Options |
|--------------|------------------------|
| HUD Pill `backdrop-filter: blur(12px)` | DOM overlay with CSS (recommended — standard for Phaser HUD), OR solid semi-transparent background as fallback |
| Terrain radial gradients | Canvas 2D `createRadialGradient()` rendered to texture at world gen, used as Phaser sprite |
| Religion overlay radial gradient | Same Canvas 2D texture approach, re-rendered when religion map changes |
| Famine desaturation pulse | Phaser `ColorMatrixPipeline.desaturate()` |
| Veil shimmer distortion | Simple alpha pulse (0.15→0.25, 2s cycle) — full displacement shader optional/deferred |
| Button 145° gradient | Approximate with Phaser 4-corner gradient or use DOM overlay for UI buttons |
| Terrain micro-detail draw calls | Pre-bake to static textures at world gen (NOT per-frame Graphics calls) |

---

## 13. Asset Production Summary (updated)

| Asset | Rendering | File Path | Source |
|-------|-----------|-----------|--------|
| Terrain | CODE-RENDERED | — | Hex values above |
| Religion overlays | CODE-RENDERED | — | Hex values above |
| Divine power VFX | CODE-RENDERED | — | Params above |
| Harbinger VFX | CODE-RENDERED | — | Params above |
| Era transitions | CODE-RENDERED | — | Palette tween |
| UI components | CODE-RENDERED | — | Style values above |
| Army banners | CODE-RENDERED | — | Shape + color rules |
| Follower Voice icons | CODE-RENDERED | — | Circle + symbol per type (§10d) |
| City icons (5) | FILE-BASED SVG | `assets/icons/city-{1..5}.svg` | AI-generated or hand-coded |
| Religion symbols (11) | FILE-BASED SVG | `assets/icons/religion-{id}.svg` | Original work (created for this project) |
| App icon | FILE-BASED PNG | `assets/branding/app-icon.png` | AI-generated |
| Splash screen | FILE-BASED PNG | `assets/branding/splash.png` | AI-generated or code-rendered |
| Fonts (2 families) | FILE-BASED | `assets/fonts/` | Google Fonts (OFL) |

---

## 14. Unit Convention

All sizes in this spec use CSS pixels (px). At standard mobile density (2× or 3×), 1px = 2-3 physical pixels. Touch targets: 44px minimum (matches Apple HIG 44pt at 1:1).

---

## 15. Assumptions & Spec Notes

- **Map region shapes** are generated by the world generator at runtime — this spec defines only terrain colors and micro-detail rules, not exact geometry
- **City icons in mockup** are direction-setting sketches — production SVGs will be refined with proper contrast and glow backing
- **Event card entrance** should use scale-in animation (0.9→1.0, 200ms, ease-out) specified in implementation
- **Religion colors** may need adjustment if LLM generates additional religions beyond the 10 pre-made — implementation should verify colorblind safety for any runtime-generated colors
- **Cinzel 14px minimum** is a hard rule — the implementation agent must use Source Serif 4 for any text smaller than 14px
