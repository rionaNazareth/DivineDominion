# DIVINE DOMINION — In-Game Interactions (Stage 2B)

> Cross-references: [UI & Visuals](09-ui-and-visuals.md) · [UX Flows](09b-ux-flows.md) · [Divine Powers](06-divine-powers.md) · [Follower Voices](13-follower-voices.md) · [Harbinger](14-harbinger.md) · [Events](08-events.md) · [Eras](07-eras-and-endgame.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Decision Log

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | Orientation | **Portrait-only** | Matches 2A menus, one-handed play, "phone on the bus" persona. Map squeezed is mitigated by zoom levels. |
| 2 | FAB + Overlay | **Combo 3: Dual-Arc with Eye at Apex + Progressive Unlock + Smart Context** | Unified divine interface. Both power types visible. Eye crowns the arc. FAB shows 3–4 contextual powers, not all 12. |
| 3 | Map interaction | **Hybrid pinch-zoom with 3 snap levels** | Free pinch feels modern. Snap levels give structure for gameplay and targeting. |
| 4 | Overlay activation | **Integrated into FAB apex** | No separate HUD button. Eye is discoverable every time FAB opens. Purple ring on FAB when overlay active. |
| 5 | Accessibility | **WCAG AA minimum** | 4.5:1 text contrast, 3:1 UI contrast, 44pt targets, screen reader labels, reduced motion, colorblind, font scaling. |
| 6 | FAB simplification | **Progressive Unlock + Smart Context** | Powers unlock era-by-era (2 → 12). FAB always curates to 3–6 contextual buttons. Never 13. |

---

## 1. In-Game HUD

### Layout (Portrait)

| Element | Position | Size | Details |
|---------|----------|------|---------|
| **Speed control** | Top-left, below safe area | 36pt segmented | 1× / 2× / 4×. Honors settings default. |
| **Pause button** | Left of speed control | 30pt icon | Visible pause icon. Tap to pause/unpause. Two-finger tap remains as shortcut. |
| **Year + Era** | Top-center | Year: 13pt bold, Era: 9pt | "1743" / "Enlightenment" |
| **Energy display** | Top-right | Pill, 30pt height | "⚡ 14" with blue border. Shows current/max on tap. |
| **Prayer counter** | Right of energy | Badge, 20pt | Hidden when 0. Shows count when petitions pending. Gold pulse. Red if heretic petition. Tap → pans to nearest petitioning voice. |
| **FAB** | Bottom-right (bottom-left in left-hand mode) | 52pt diameter | Golden gradient. Purple ring when overlay active. Tap to open dual-arc. |

### Always Visible vs. On-Demand

| Always visible | On-demand |
|----------------|-----------|
| Speed, pause, year/era, energy, prayer counter, FAB | Bottom sheet (tap region), event cards (auto-pause), overlay layers (tap eye), era summary cards |

### Safe Areas

- **Top:** 44pt inset (notch/Dynamic Island). All HUD elements sit below.
- **Bottom:** 34pt inset (home indicator). FAB sits above.

### HUD During Special States

| State | HUD Change |
|-------|-----------|
| Event card visible | HUD dims to 60% opacity. Speed auto-drops to 1×. |
| Overlay active | Layer picker appears above FAB. HUD remains at full opacity. |
| Targeting mode | HUD dims. Targeting banner appears at bottom. |
| Bottom sheet open | HUD remains. Sheet overlaps lower map only. |

### Settings → HUD Behavior (2A Handoff Compliance)

| Setting | HUD Effect |
|---------|-----------|
| Left-hand mode | FAB mirrors to bottom-left. Prayer counter mirrors to left of energy. |
| Speed default | Speed control initializes to this value on game start. |
| Font scaling | Year, era, energy text scale (80%–140%). Button labels do NOT scale. |
| High contrast | HUD pill borders thicken. Text contrast ≥ 4.5:1. |
| Reduced motion | Prayer counter pulse replaced with static badge. |

---

## 2. FAB + Dual-Arc Power Menu

### Progressive Power Unlock

| Era | Blessings Unlocked | Disasters Unlocked | Total | Arc Buttons |
|-----|-------------------|-------------------|-------|-------------|
| 1 (Renaissance) | Bountiful Harvest | Great Storm | 2 | 2 + Eye = 3 |
| 2 (Exploration) | Inspiration | Great Flood | 4 | 3–4 + Eye = 5 |
| 3 (Enlightenment) | Shield of Faith | Plague | 6 | 3–4 + Eye + "..." = 6 |
| 4 (Revolution) | Miracle | Famine | 8 | 3–4 + Eye + "..." = 6 |
| 5 (Industry) | Prophet | Wildfire | 10 | 3–4 + Eye + "..." = 6 |
| 6+ (Empire onward) | Golden Age | Earthquake | 12 | 3–4 + Eye + "..." = 6 |

Each unlock triggers a one-time toast: "New divine power: Shield of Faith." The power glows on first FAB appearance.

### Smart Context Selection

Once 4+ powers are available, the FAB curates what to show:

| Slot | Rule | Always? |
|------|------|---------|
| **Base blessing** | Cheapest available blessing | Yes |
| **Base disaster** | Cheapest available disaster | Yes |
| **Context slot 1** | Most relevant power for current world state near camera (war → Shield/Storm, science opportunity → Inspiration, low faith → Miracle) | When applicable |
| **Context slot 2** | Combo-eligible power with chain icon, if any | When combo available |
| **Divine Eye** | Overlay toggle at arc apex | Always |
| **"..." expander** | Opens full unlocked set in scrollable grid | When 5+ powers unlocked |

### Arc Layout

- Tap FAB → subtle scrim dims the map. Dual-arc expands.
- **Arc radius:** 130pt from FAB center. Buttons spaced evenly along the arc.
- **Angular spread:** Blessings arc spans 60°–150° (upper-left quadrant). Disasters arc spans 30°–120° (upper-right quadrant). Eye at 90° (12 o'clock).
- **Blessings** fan out above-left (golden border, gold name labels)
- **Disasters** fan out above-right (red border, red name labels)
- **Divine Eye** sits at the 12 o'clock position (apex), between the arcs
- Zone labels ("Blessings" / "Disasters") appear in 8pt uppercase, 40% opacity

### Button Anatomy

Each arc button shows:
- **Icon:** 42pt circle with type-colored border
- **Name:** 8pt semibold below icon (e.g., "Harvest")
- **Cost:** 7pt below name (e.g., "⚡2")
- **Chain icon:** Small link icon on the button when combo conditions are met
- **Cooldown state:** Radial sweep overlay when on cooldown, remaining seconds in 7pt
- **Insufficient energy:** 40% opacity, cost text turns red

### Casting Flow

1. **Tap FAB** → dual-arc expands (250ms ease-out). Map scrim dims.
2. **Tap a power** → arc collapses (200ms). Map enters targeting mode.
3. **Targeting mode:** Valid regions pulse with gold border. Banner at bottom: "🌾 Bountiful Harvest — tap a region to cast". Cancel button (X) in banner.
4. **Tap region** → power casts. VFX plays. Energy deducts. Banner disappears. Cooldown starts.
5. **If combo triggers** → "Divine Chain" notification (distinct gold+purple toast): "Your earthquake scattered the Northern Army — 3,000 soldiers defected."

**Total taps to cast: 3** (FAB → power → region). Cancel at any step by tapping the scrim (step 2) or the X (step 3).

### Left-Hand Mode

Entire arc mirrors horizontally. Blessings fan above-right, disasters above-left. Eye remains at apex. All positions use a `handedness` parameter.

### Haptic Feedback

| Action | Haptic |
|--------|--------|
| Tap FAB (open arc) | Light impact |
| Tap power (enter targeting) | Medium impact |
| Cast power on region | Heavy impact |
| Combo triggers | Double heavy impact (two pulses, 100ms apart) |
| Insufficient energy tap | Error pattern (three light taps) |

### Reduced Motion

Arc buttons appear instantly (no fan animation). Scrim appears instantly. Cooldown sweep replaced with static opacity + text timer.

---

## 3. Event Notification UX

### Toast Appearance

| Property | Value |
|----------|-------|
| Position | Top, 16pt below safe area |
| Max height | 80pt (2-line max) |
| Background | Dark, 85% opacity, backdrop blur |
| Border | 1px gold (choice events) or 1px gray (informational) |
| Border radius | 20pt |
| Entry animation | Slide down + fade in (250ms). Reduced motion: instant appear. |
| Auto-dismiss | Informational only: 5 seconds. Choice events: never (must interact). |

### Choice Events → Event Card

Tapping a choice-event toast expands it into a full event card:

| Element | Details |
|---------|---------|
| **Scope badge** | Nation/region this affects. Top of card. |
| **Map highlight** | Affected region(s) pulse behind the semi-transparent card. Off-screen regions show directional arrow + "Show on map" link. Tapping "Show on map" smooth-pans the camera (500ms ease-in-out) to center the affected region, then re-shows the event card. Camera never moves automatically — the player initiates the pan. |
| **Headline** | Event name, 1 line, 16pt bold |
| **Description** | 2–3 lines, 13pt. Era-appropriate language. |
| **Follower stakes** | "Your followers: 12K in Valdorn (attackers) · 8K in Alaris (defenders)" |
| **Choices** | 2–3 option buttons. Each shows: label + 1-line consequence preview. Full width, stacked, 48pt height. |
| **Stay Silent** | Always available as last option (gray, understated). |

### Event Queue

| Rule | Value |
|------|-------|
| Max queue | 5 events |
| Priority order | Conflict > Alien > Religious > Political > all others |
| Presentation | One at a time, highest priority first |
| Overflow | Events beyond 5 auto-resolve with "Stay Silent" outcome |
| Badge | Event toast shows queue count: "2 events need attention" |

### Mid-Era Milestone Toasts (NOT events)

| Property | Value |
|----------|-------|
| Style | Same toast position, but lighter border (gray), no gold |
| Duration | 4 seconds, auto-dismiss |
| SFX | Subtle chime (distinct from event notification) |
| Max frequency | 1 per real-minute |
| Examples | "Your followers number 1 million." / "A new trade route connects east and west." |

### Session Milestone Toasts

Track player activity since the current app session started. Give every 15-minute session a sense of accomplishment.

| Property | Value |
|----------|-------|
| Style | Same toast position, purple-gray border (distinct from milestone and event toasts) |
| Duration | 3 seconds, auto-dismiss |
| SFX | Soft ascending chime |
| Max frequency | 1 per 2 real-minutes (don't compete with events) |
| Reset | Counters reset when app returns from background (new session) |

| Trigger | Toast Text |
|---------|-----------|
| 3 events resolved this session | "3 prayers answered this session." |
| 5 events resolved this session | "5 prayers answered. Your faithful feel your presence." |
| 3 divine acts (blessings + disasters) | "3 divine acts. The world bends to your will." |
| First whisper this session | "Your first whisper. Small nudges shape worlds." |
| Era transition during session | "A new era begins under your watch." |
| 10 minutes played this session | "10 minutes of divine guidance. Your mark is left." |

---

## 4. Bottom Sheet (Region Info + Whispers)

### Opening and Closing

| Action | Behavior |
|--------|----------|
| Tap region on map | Sheet slides up to peek position (250ms) |
| Swipe up | Expands to half-screen or full-screen |
| Swipe down | Collapses to peek → dismisses |
| Tap outside | Dismisses |
| Tap another region | Sheet updates content (no close/reopen) |

### Snap Points

| Position | Height | Content Visible |
|----------|--------|----------------|
| **Peek** | 120pt | Region name, population, faith %, Dev level |
| **Half** | 50% screen | All stats + whisper buttons + voice profile (if present) |
| **Full** | 85% screen | Full scrollable detail: stats, whisper history, trade routes, army info |

### Content Layout

| Section | Position | Details |
|---------|----------|---------|
| **Handle** | Top center | 36pt × 4pt rounded bar |
| **Region name** | Below handle | 14pt bold, gold |
| **Key stats** | Below name | Row: Pop · Faith% · Dev · Religion icon |
| **Whisper row** | Below stats | Four whisper buttons (see §9) |
| **Voice profile** | Below whispers | If a Follower Voice is in this region (see §11) |
| **Detail sections** | Scrollable | Trade routes, army presence, disease status, event history |

### Left-Hand Mode

Sheet anchor remains bottom-center (no mirror needed — sheets are full-width).

### Tutorial Callout Target

Callout #2 attaches above the top edge of the peek sheet. Sheet must leave 80pt+ of space above for the callout tooltip.

---

## 5. Divine Overlay

### Activation

- **Primary:** Tap Divine Eye at apex of FAB dual-arc (2 taps: FAB → Eye)
- **State indicator:** FAB gains a purple ring glow when overlay is active
- Overlay persists across FAB opens/closes — it's a toggle, not a momentary view

### Layers

| Layer | What It Shows | Unlock |
|-------|--------------|--------|
| **Religion** | Heat map (gold = yours, blue/red = rivals), spread direction arrows | Available from start |
| **Military** | Attack plans (dashed arrows), army positions, tension zones | After first war |
| **Trade** | Trade route volumes, disrupted routes, trade wealth flow | After first trade route forms |
| **Science** | Development hotspots (white glow), science milestone progress | After first science milestone |

### Layer Picker

| Property | Value |
|----------|-------|
| Position | Centered horizontally, 96pt above FAB |
| Style | Dark pill row, backdrop blur, 1px border |
| Buttons | One per unlocked layer. Active layer has purple background. |
| Button size | Pill, ~40pt height, text labels (8pt) |

### Visual Priority

When overlay is active:
- Map regions dim to 15% opacity
- Overlay data renders on top (heat maps, arrows, zones)
- City dots and trade routes remain visible
- HUD remains at full opacity
- Event toasts remain visible (overlay does not suppress them)

### Mid-Cast Overlay

Player can toggle overlay ON, then open FAB. The arcs render over the overlay data, allowing the player to see divine information while choosing which power to cast.

---

## 6. Map Interaction

### Zoom — Hybrid with Snap Levels

| Level | Scale | What's Visible | Snap Range |
|-------|-------|---------------|------------|
| **Strategic** (default) | 1.0× | Full map, region borders, army tokens, trade routes, religion colors | 0.8–1.2× |
| **Regional** | 2.0× | Region detail, city icons, army composition, battles, disease, voice icons | 1.5–2.5× |
| **Close-up** | 4.0× | City buildings, population activity, historical markers, religion symbols | 3.0–5.0× |

### Gestures

| Gesture | Behavior |
|---------|----------|
| **Pinch** | Smooth zoom. On release, snaps to nearest level (300ms ease-out). |
| **Double-tap** | Zoom in one level, centered on tap point. At Close-up: zoom out to Strategic. |
| **One-finger pan** | Move map. Bounded — can't pan past world edges. 20pt rubber-band overscroll. |
| **Tap region** | Selects region. Bottom sheet opens. Region highlights with gold border pulse. |
| **Tap empty ocean** | Deselects current region. Closes bottom sheet. |

### Region Selection Feedback

- **Selected region:** 2px gold border, soft pulse animation (1.5s cycle)
- **Targeting region (during cast):** 2px gold border, faster pulse (0.8s cycle)
- **Affected by event:** Region tint at 40% gold behind event card

### Aspect Ratio (16:9 to 21:9)

- Map renders at full device width
- Taller phones (21:9) see more map vertically — no letterboxing
- HUD and FAB use absolute positioning from edges — layout stable across ratios
- Bottom sheet peek height is percentage-based (adjusts to screen)

---

## 7. Accessibility

### Color Contrast

| Element | Ratio | Standard |
|---------|-------|----------|
| HUD text on dark background | ≥ 4.5:1 | WCAG AA |
| Button labels | ≥ 4.5:1 | WCAG AA |
| UI component borders | ≥ 3:1 | WCAG AA |
| Map region borders | ≥ 3:1 | WCAG AA |

### Touch Targets

All interactive elements: **44pt minimum** (icon + invisible hit area expansion where needed). FAB: 52pt. Arc buttons: 42pt icon + 2pt padding = 44pt target.

### Screen Reader (VoiceOver / TalkBack)

Labels for key HUD elements:
- FAB: "Divine powers. Tap to open."
- Energy: "Divine energy: 14 of 20."
- Prayer counter: "2 prayers pending. Tap to view."
- Speed: "Simulation speed: 2 times."
- Pause: "Pause game."
- Each arc button: "[Power name], [cost] energy, [available/on cooldown/insufficient energy]."

### Reduced Motion

| Normal | Reduced Motion Alternative |
|--------|---------------------------|
| Cloud drift | Static clouds |
| Trade particle flow | Static golden lines |
| Religion wave-front | Instant tint change |
| Battle sparks | Static icon overlay |
| Arc fan animation | Instant appear |
| Region pulse | Static gold border |
| Prayer counter pulse | Static badge |

### Font Scaling (80%–140%)

Scales: year/era text, event card body, region panel text, tooltip text, petition text.
Does NOT scale: button labels, tab labels, icons, arc button names (already at 8pt minimum).

### High Contrast Mode

When enabled in Settings: all in-game UI elements (HUD pills, bottom sheet, event cards, FAB arc buttons, overlay layer picker, toast notifications) use thickened borders, increased background opacity, and text contrast ratios of at least 4.5:1. Map region borders increase to 3px. Stage 7 defines the exact high-contrast theme variant.

### Colorblind Palettes

4 palette sets (normal + deuteranopia + protanopia + tritanopia) applied to: religion overlay colors, tension/schism warnings, disease tints, trade route colors, voice type ring colors. Stage 7 produces exact hex values.

---

## 8. Error & Edge States (2B-Owned)

| Error | Behavior |
|-------|----------|
| **Auto-save failed** | Non-blocking toast: "Save failed. Retrying..." Auto-retry 3×. If all fail: modal with "Save to file" option. |
| **LLM timeout/fallback** | Silent fallback to template narrative. No player-facing error. |
| **Corrupted save** | Modal: "Save data may be corrupted." Options: "Try Recovery" / "Start New Earth". |
| **Offline** | No error — game is 100% offline. LLM calls silently use templates. |
| **Low memory** | Reduce ambient animations (clouds, particles). If critical: toast "Low memory — consider closing other apps." |
| **App backgrounded mid-event** | Auto-pause. On resume: event card still visible, state preserved. Same for phone calls, notifications, app switches. |
| **App backgrounded mid-petition** | Auto-pause. Petition timer pauses. On resume: petition still visible. |
| **Multiple events pending** | Queue (max 5, priority order). Excess auto-resolves with "Stay Silent." Badge shows count. |

---

## 9. Divine Whispers — Interaction Spec

### Where They Live

Whisper buttons appear in the **bottom sheet** when a region is tapped — not in the FAB. This keeps the FAB focused on divine powers and the bottom sheet focused on region context.

### Layout in Bottom Sheet

Below the key stats row, a row of 4 small icon buttons:

| Button | Icon | Label | Color |
|--------|------|-------|-------|
| War | Sword | "War" | Red |
| Peace | Dove | "Peace" | Blue |
| Science | Flask | "Science" | White |
| Faith | Prayer hands | "Faith" | Gold |

Each button: 36pt diameter, 8pt label below, 44pt total touch target (with padding).

### Interaction Flow

**Standard whisper (all 4 types):**

1. Tap region → bottom sheet opens
2. Whisper row visible below stats
3. Tap a whisper button → golden ripple animation from region center (500ms). Subtle haptic (light).
4. Button enters cooldown: radial sweep overlay (30s per region). Other regions remain available.
5. Global cooldown: 10s before any whisper can be cast on any region.

**Targeted whisper (War and Peace only):**

War and Peace whispers support an optional second-nation target. This specifies *who* to fight or make peace with, instead of a general nudge.

1. Tap region → bottom sheet opens
2. **Long-press** War or Peace button (instead of tap) → bottom sheet collapses. Map enters targeting mode.
3. Neighboring nations of the region's owner highlight with pulsing borders (red for War, blue for Peace). Banner: "Whisper War — tap a rival nation" / "Whisper Peace — tap a nation to reconcile with."
4. Tap a highlighted nation → targeted whisper casts. Golden ripple on both nations. Micro-toast: "Whispered War: {nation_a} → {nation_b}".
5. Cancel: tap anywhere else or the X in the banner.

**Short tap** = untargeted (general nudge, same as before). **Long-press** = targeted (specific nation pair). Science and Faith whispers are always untargeted — they don't have meaningful nation-pair dynamics.

Targeted whispers use the same cooldowns, stacking, and AI nudge strength as untargeted. The only difference: the 0.15 weight modifier applies to the `declare_war` or `sue_peace` score for the specific target nation pair, not the general aggression/diplomacy weight. See `04b-nation-ai.md` §Whisper Integration.

### Feedback

| Event | Feedback |
|-------|----------|
| Whisper cast (untargeted) | Golden ripple VFX on map. "Whispered: Peace" micro-toast (1.5s, bottom of sheet). |
| Whisper cast (targeted) | Golden ripple on both nations. "Whispered War: Valdorn → Kavari" micro-toast (2s). |
| Cooldown active | Button dimmed, radial timer sweep, seconds remaining in 7pt. |
| Compound effect | After 3+ whispers to same nation: bottom sheet shows "Whispered Peace 3×" in detail section. |

### Progressive Disclosure

Whisper buttons appear in the bottom sheet AFTER the tutorial completes (~minute 5). First appearance triggers one-time tooltip: "You can whisper to your followers. Small nudges, constant influence."

---

## 10. Power Combos — Interaction Spec

### Discovery Model

Combos are never explicitly taught. They are discovered organically when the player casts a power in a combo-eligible situation.

### Chain Icon Hint

When the FAB is open and a power has a combo-eligible world state nearby:
- A small chain-link icon appears on the power button (top-left corner, 12pt)
- The icon is subtle — experienced players notice it, new players may not
- Tapping a power with a chain icon doesn't guarantee a combo — the combo fires when the cast hits the right region

### Combo Notification

When a combo triggers, a special "Divine Chain" toast appears:

| Property | Value |
|----------|-------|
| Position | Same as event toast (top, below safe area) |
| Style | Gold + purple gradient border (distinct from events and milestones) |
| Duration | 5 seconds, auto-dismiss |
| Content | "Your [power] [combo effect]. [Outcome with numbers]." |
| Example | "Your earthquake scattered the Northern Army — 3,000 soldiers defected to your faith." |
| SFX | Unique chain-reaction sound (cascading chime + rumble) |
| Pivotal moment | Logged to Earth History timeline |

### First Combo Tooltip

The first time a combo ever fires (per device, not per Earth), a one-time tooltip appears after the combo toast: "Your divine powers interact with the world in unexpected ways. Experiment."

### Combo Visibility in Targeting Mode

During targeting (after selecting a power from the arc), regions where a combo would trigger show a subtle chain-link overlay on the pulsing gold border. This is the only in-targeting hint.

---

## 11. Follower Voices — Interaction Spec

Full system design is in [13-follower-voices.md](13-follower-voices.md). This section covers only the interaction design.

### Map Presence

- Voice icons: 24pt circular portrait at Regional/Close-up zoom. Hidden at Strategic zoom.
- Type-colored ring (gold=Prophet, silver=Ruler, steel=General, blue=Scholar, red=Heretic)
- Golden prayer pulse when petition is active
- Tap target: 44pt minimum

### Bottom Sheet — Character Profile

When tapping a voice icon, the bottom sheet shows:

| Section | Content |
|---------|---------|
| **Name + type** | "Ava of the Eastern Plains (Prophet)" |
| **Loyalty bar** | Visual bar 0–1.0, green→yellow→red gradient |
| **Petition** (if active) | Request text + Fulfill / Deny buttons |
| **Fulfill button** | Gold, shows required action: "Cast Harvest on Eastern Plains (⚡2)" |
| **Deny button** | Gray, understated. Shows consequence: "-loyalty" |
| **History** | "Petitions answered: 3 / Denied: 1 / Active for: 47 years" |

### Petition from Prayer Counter

Tapping the HUD prayer counter:
1. Camera pans to the nearest petitioning voice (500ms ease-in-out)
2. Bottom sheet opens with that voice's profile + petition
3. If multiple petitions: after resolving one, camera pans to the next

### Voice Emergence Notification

When a new voice appears:
- Milestone-style toast (not event-style — no choice needed): "A voice rises from your followers. Ava, Prophet of the Eastern Plains, seeks your guidance."
- Voice icon fades in on the map with a golden bloom
- If this is the first-ever voice: one-time tooltip after the toast

### Voice Death Notification

- Memorial toast: "The prophet Ava has passed. Her teachings endure." or "General Marcus fell at the Battle of the Northern Plains."
- Icon fades out with a dissolve
- Logged as pivotal moment in Earth History
