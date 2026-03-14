# Phase 2 — Map Rendering

> Prerequisites: Phase 1 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [09-ui-and-visuals](../design/09-ui-and-visuals.md)

---

Use Phaser 3 or PixiJS. All rendering reads from `WorldState` and `GameState`. Mobile-first, smooth performance.

---

## Reading List

Read these before writing any code:

- **Types:** `src/types/game.ts` — `WorldState`, `Region`, `Army`, `TradeRoute`, `DivinePower`
- **Design:** `docs/design/09-ui-and-visuals.md` — art style, phone UI, living map, divine overlay, zoom depth
- **Design:** `docs/design/art-spec.md` — visual identity, palettes, VFX specs, city/religion icons
- **Test spec:** `docs/design/test-spec.md` — §4 Performance Budget, §12 Device Testing Matrix

---

## 2.1 Base Map Renderer

Render Voronoi regions as smooth vector polygons.

- Gradient fills per terrain type
- Borders between regions
- Terrain coloring (plains, forest, mountain, desert, tundra, coast, ocean)
- Cities as markers at region centers

---

## 2.2 Religion Overlay

Color regions by dominant religion.

- Watercolor-blending for influence (multiple religions visible)
- Toggle on/off
- Legend for religion colors

---

## 2.3 Army Renderer

- Banner tokens on map at army positions
- Marching paths (animated line from current to target)
- Battle animations when armies engage

---

## 2.4 Trade Route Renderer

- Golden lines between cities
- Thickness by volume
- Disruption effects (dashed, dimmed when disrupted)

---

## 2.5 Disease Overlay

- Green tinting on affected regions
- Spreading tendrils animation
- Pandemic pulse effect for severe outbreaks

---

## 2.6 Divine Power VFX

Visual effects for all 12 powers on the map.

- Blessings: harvest glow, inspiration sparkles, miracle light, prophet aura, shield barrier, golden age radiance
- Disasters: earthquake shake, flood waves, plague mist, storm clouds, famine wilt, wildfire flames

---

## 2.7 Era Visual Transitions

- Palette swaps per era (1600s → 2200s)
- Icon evolution (e.g., city icons change with tech level)
- Map style progression

---

## 2.8 Camera System

- Pan (drag)
- Zoom (pinch-zoom for mobile, scroll wheel for desktop)
- Smooth scrolling
- Zoom levels with min/max bounds
