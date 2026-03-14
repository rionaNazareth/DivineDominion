# Phase 3 — UI & Scenes

> Prerequisites: Phase 2 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [09-ui-and-visuals](../design/09-ui-and-visuals.md)

---

## Reading List

Read these before writing any code:

- **Types:** `src/types/game.ts` — UI-related types, `GameState`, `DivineState`
- **Design:** `docs/design/09-ui-and-visuals.md` — art style, phone layout, overlay
- **Design:** `docs/design/09b-ux-flows.md` — screens, menus, settings, tutorial, 2B handoff
- **Design:** `docs/design/09c-in-game-interactions.md` — HUD, FAB, events, bottom sheet, overlay, whispers, combos, voices
- **Design:** `docs/design/06-divine-powers.md` — power details for FAB
- **Design:** `docs/design/13-follower-voices.md` — voice display for map icons and profiles
- **Design:** `docs/design/14-harbinger.md` — Harbinger overlay indicators

**Session 7 (tasks 3.1–3.8):** Focus on 09-ui-and-visuals.md, 09b-ux-flows.md, 09c-in-game-interactions.md (base sections).
**Session 8 (tasks 3.9–3.15):** Focus on 09c-in-game-interactions.md (Stage 2B sections), 06-divine-powers.md, 13-follower-voices.md, 14-harbinger.md.

---

## 3.1 Menu Scene

- New game
- Continue (if save exists)
- Settings
- Earth counter display (total Earths visited)

---

## 3.2 Commandment Selection Scene

- Categorized menu (7 categories × 5 options)
- Pick 10 commandments
- Show effects on hover/tap
- Tension warnings when conflicting commandments selected

---

## 3.3 Game HUD

- Minimal top bar: speed, year, energy
- Semi-transparent overlay
- Non-intrusive

---

## 3.4 FAB + Radial Power Menu

- Floating action button (bottom-right on mobile)
- Radial menu for blessings/disasters
- Toggle open/close
- Show cooldowns and energy cost

**API Contract (for Session 8 extension):**

Session 7 builds the base FAB. Session 8 (tasks 3.9–3.15) extends it with dual-arc layout and smart context. The base FAB must export:

- Class: `FABMenu extends Phaser.GameObjects.Container` with config `{ powers: DivinePower[], onPowerSelect: (id: PowerId) => void, disabled?: boolean }`
- Methods: `open()`, `close()`, `isOpen(): boolean`
- Override hook: `createPowerSlot(power: DivinePower): Phaser.GameObjects.Container` — Session 8 overrides to customize per-slot rendering
- Session 8 extends the base class to add `.setDualArcLayout()` and smart context selection

---

## 3.5 Event Notification System

- Toast notifications for events
- Tap to expand full event
- Choice cards with binary/ternary options
- Auto-pause on important events (configurable)

---

## 3.6 Region Info Bottom Sheet

- Slide-up panel (Google Maps style)
- Region details: population, development, religion, nation
- Nation details: government, military, relations

**API Contract (for Session 8 extension):**

Session 7 builds the base bottom sheet as a DOM overlay (not Phaser — UI panels work better as HTML/CSS). Session 8 extends it with whisper buttons (3.10) and petition panel (3.14). The base bottom sheet must export:

- Class: `BottomSheet` with config `{ region: Region, nation: Nation, onClose: () => void }`
- Extension points: `actionButtonsContainer` (empty div — 3.10 populates with whisper buttons), `extraPanelContainer` (empty div — 3.14 populates with petition UI)
- Methods: `expand()`, `collapse()`, `isExpanded(): boolean`, `setRegion(region: Region, nation: Nation): void`
- Event callback: `onRegionChange: (regionId: RegionId) => void` — fired when user navigates to a different region within the sheet

---

## 3.7 Divine Overlay UI

Toggle overlay layers:

- Attack plans
- Religion pressure
- Schism risk
- Disease
- Science
- Tension
- Alien (when revealed)

---

## 3.8 Era Transition Screen

- Narrative summary
- Prophecy / historical quote
- Continue button

---

### Stage 2B System Tasks

## 3.9 FAB Dual-Arc UI

- Dual-arc layout with progressive unlock and smart context selection.
- Powers surface based on era and situational relevance.

---

## 3.10 Bottom Sheet Whisper Buttons

- Whisper action buttons in bottom sheet.
- Integrate with whisper simulation state.

---

## 3.11 Prayer Counter HUD

- HUD element showing prayer count / devotion metric.

---

## 3.12 Voice Map Icons + Character Profiles

- Voice icons on map; tap to open bottom sheet character profiles.
- Show loyalty, lineage, petition status.

---

## 3.13 Combo "Divine Chain" Toast

- Toast notification when a power combo (Divine Chain) triggers.

---

## 3.14 Petition UI in Bottom Sheet

- Petition display with fulfill/deny buttons.
- Integrate with voice simulation.

---

## 3.15 Harbinger Overlay and Indicators

- Anomaly overlay layer UI (Era 10+ unlock, purple-dark shimmer on affected regions)
- "⚠ Data unreliable" indicator for Veiled regions
- Harbinger VFX integration (corruption visuals, sabotage trails, purge effect)
