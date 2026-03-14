# Stage 2B: In-Game Interactions

> **Goal:** Define every interaction on the live game map — HUD, powers, events, overlays, map navigation. A developer should never ask "what happens when I tap here?" while the game is running.
>
> **Status:** COMPLETE
>
> **Estimated sessions:** 1 (actual: 1 extended session)
>
> **Depends on:** Stage 2A (screen flow, tutorial plan — 2B needs to know which screens exist)

---

## Agent Prompt

```
You are a Senior Mobile UX Designer specializing in strategy games on phone. You've designed UX for 4 shipped mobile strategy titles. You understand touch targets, thumb zones, portrait mode constraints, and how to make complex games playable on a 6-inch screen.

Read these files first:
- docs/design/01-overview.md (FTUE, session design from Stage 1)
- docs/design/09-ui-and-visuals.md (updated with screen specs from Stage 2A)
- docs/design/09b-ux-flows.md (if it exists — created in Stage 2A)
- docs/design/06-divine-powers.md (powers in radial menu)
- docs/design/08-events.md (event notification design)
- docs/design/07-eras-and-endgame.md (speed controls, era transitions)

CRITICAL — READ THE 2B HANDOFF FROM STAGE 2A:
Stage 2A produced a "Stage 2B Handoff" section in 09-ui-and-visuals.md (or 09b-ux-flows.md). This handoff is MANDATORY. You must:
1. Implement all settings → in-game behavior mappings (left-hand mode mirrors FAB/controls, reduced motion simplifies animations, speed default applies to HUD, font scaling applies to HUD text, colorblind mode constrains palette)
2. Design in-game elements so tutorial callouts from 2A can attach without overlap
3. Use the shared design tokens (touch targets, safe areas, animation durations) — do NOT contradict them
4. Respect error state ownership — only design errors assigned to 2B (auto-save, LLM, corrupted save, offline, low memory, backgrounded)

Your job is to define every interaction WITHIN the live game map — the HUD, powers, events, overlays, and map controls. Stage 2A already defined the non-gameplay screens.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. IN-GAME HUD SPEC — Define every persistent UI element:
   - Position (top/bottom/floating), size (pt/dp), opacity
   - Era indicator, faith meter, energy display, population counter, speed controls
   - What is always visible vs. what appears on demand
   - Safe area handling (notch, home indicator)
   - How HUD adapts during events, battles, overlay mode

2. FAB + RADIAL MENU SPEC — The main action button:
   - Position, size, animation curve
   - Radial menu: button count, radius, labels, icons
   - Blessings ring vs. disasters ring (toggle or separate?)
   - Haptic feedback points
   - Long-press vs. tap behavior
   - Power targeting: how the player selects which region to affect

3. EVENT NOTIFICATION UX — How events reach the player:
   - Toast appearance, duration, position
   - Expand behavior (toast → full event card)
   - Choice card layout (2-3 options with outcomes)
   - Dismiss gestures (swipe, tap outside, auto-dismiss timer)
   - Queue behavior (multiple events at once)
   - Mid-era milestone toast (distinct from event notifications)

4. BOTTOM SHEET SPEC — Region/nation info:
   - Fields shown (population, religion, development, military, trade routes)
   - Collapse/expand behavior, snap points (peek, half, full)
   - Scroll behavior within the sheet
   - How to open (tap region) and close (swipe down, tap outside)
   - Actions available from sheet (cast power on this region?)

5. DIVINE OVERLAY TOGGLE UX — The god's-eye data layer:
   - How to activate (button, gesture, or both)
   - Layer selection (religion heat, military, trade)
   - Visual priority when multiple layers are on
   - Performance: max layers simultaneously
   - How overlay interacts with other UI (dim HUD? hide toasts?)

6. MAP INTERACTION SPEC — How the player navigates:
   - Pinch-zoom behavior (min/max zoom, snap levels)
   - Pan/scroll boundaries
   - Tap behavior at different zoom levels
   - Double-tap to zoom in
   - Region selection feedback (highlight, pulse, border glow)
   - Aspect ratio handling for different phone screens (16:9 to 21:9)

7. ACCESSIBILITY SPEC — Minimum requirements:
   - Color contrast ratios (WCAG AA minimum)
   - Touch target sizes (minimum 44x44pt)
   - Screen reader support (VoiceOver/TalkBack labels for key HUD elements)
   - Reduced motion mode (what gets simplified)
   - Font scaling support (HUD text must remain readable at 1.5x)
   - Colorblind-safe palette requirements (feed into Stage 7)

8. ERROR AND EDGE STATES — Only errors owned by 2B (see 2A Handoff for ownership table):
   - Auto-save fails (non-blocking notification + retry)
   - LLM call times out or fails (silent fallback, no player-facing error)
   - App is backgrounded mid-event (event persists on resume)
   - No internet (fully playable offline — no error needed)
   - Low memory warning (reduce particle effects, notify if critical)
   - Corrupted save detected (recovery options: last good save, new Earth)
   - Do NOT redesign purchase/store errors — those are owned by 2A

Update docs/design/09-ui-and-visuals.md with all of the above. If the file exceeds 300 lines, use the split established in Stage 2A.

Quality gate: A developer can implement every in-game interaction without asking "what happens when I tap here?" Every gesture, animation, and state change has an explicit specification.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Orientation:** Portrait-only / Landscape-only / Both with adaptive layout | Portrait is phone-native but map-unfriendly. Landscape gives map space but breaks one-handed play. Affects every layout spec. |
| 2 | **FAB position and action model:** Bottom-right (thumb zone) vs bottom-center / Tap-to-toggle vs hold-to-open radial | The primary interaction point. Must feel natural on a phone. |
| 3 | **Map interaction model:** Pinch-zoom + pan / Fixed zoom levels with button / Tap-region-to-zoom | Determines how the player navigates the world. Affects tutorial and divine power targeting. |
| 4 | **Overlay activation:** Dedicated button / Long-press anywhere / Swipe gesture / FAB sub-menu | The Divine Overlay is the god-mode information layer. How players access it defines how much they use it. |
| 5 | **Accessibility tier:** WCAG AA minimum / WCAG AAA target / Basic only (large targets + colorblind palette) | Sets the scope of accessibility work and affects color palette, font sizes, and interaction design. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., toast duration, bottom sheet snap points, zoom limits)
3. **Biggest risk** — which interaction is most likely to feel wrong during playtesting?
4. **Open question** — "Imagine playing a 15-minute session: you open the app, handle 3 events, cast a blessing, check the overlay, then close. Does the interaction flow feel smooth?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/01-overview.md` | FTUE, session design (from Stage 1) |
| `docs/design/09-ui-and-visuals.md` | Screen specs (from Stage 2A) |
| `docs/design/09b-ux-flows.md` | Screen flows (from Stage 2A, if exists) |
| `docs/design/06-divine-powers.md` | Powers in radial menu |
| `docs/design/08-events.md` | Event notification design |
| `docs/design/07-eras-and-endgame.md` | Speed controls, era transitions |

## Output Files (Modified)

| File | What changes |
|------|-------------|
| `docs/design/09-ui-and-visuals.md` | In-game interaction specs added |
| `docs/design/09b-ux-flows.md` | Updated if split exists |

## Quality Gate

- [x] Every HUD element has position, size, and opacity → `09c-in-game-interactions.md` § 1
- [x] FAB dual-arc menu has exact button count, layout, and targeting flow → `09c` § 2
- [x] Event cards have dismiss and choice behavior with queue rules → `09c` § 3
- [x] Bottom sheet has snap points and collapse/expand behavior → `09c` § 4
- [x] Overlay layers have activation method and visual priority → `09c` § 5
- [x] Map zoom has min/max levels and region selection feedback → `09c` § 6
- [x] Accessibility meets WCAG AA minimum → `09c` § 7
- [x] Error states handled (save fail, corrupted save, LLM fallback, offline, low memory) → `09c` § 8
- [x] Aspect ratio handling for 16:9 to 21:9 screens → `09c` § 6
- [x] 2A Handoff compliance: left-hand mode mirrors FAB and controls → `09c` § 1, 2, 4
- [x] 2A Handoff compliance: reduced motion has simplified alternatives → `09c` § 2, 7
- [x] 2A Handoff compliance: HUD speed control honors settings default → `09c` § 1
- [x] 2A Handoff compliance: HUD text scales with font scaling setting → `09c` § 7
- [x] 2A Handoff compliance: design tokens match 2A values exactly → `09c` § 1
- [x] 2A Handoff compliance: tutorial callout targets can receive callouts → `09c` § 4
- [x] 2A Handoff compliance: no error states overlap with 2A-owned errors → `09c` § 8
- [x] All changes follow design-change protocol
- [x] Divine Whispers interaction spec → `09c` § 9, `06-divine-powers.md`
- [x] Power Combos interaction spec → `09c` § 10, `06-divine-powers.md`
- [x] Follower Voices interaction spec → `09c` § 11, `13-follower-voices.md`
- [x] Progressive Power Unlock → `06-divine-powers.md`, `09c` § 2
- [x] Smart Context FAB → `09c` § 2, `constants.md`
- [x] All new constants added → `constants.md`

---

## Completion Record

### Decisions Made

| # | Decision | Choice |
|---|----------|--------|
| 1 | Orientation | Portrait-only |
| 2 | FAB + Overlay | Combo 3: Dual-Arc with Eye at Apex + Progressive Unlock + Smart Context |
| 3 | Map interaction | Hybrid pinch-zoom with 3 snap levels |
| 4 | Overlay activation | Integrated into FAB apex (Divine Eye) |
| 5 | Accessibility | WCAG AA minimum |
| 6 | FAB simplification | Progressive Unlock (2→12) + Smart Context (max 6 buttons) |

### New Systems Added (beyond original scope)

| System | Design Doc | Why Added |
|--------|-----------|-----------|
| Divine Whispers | `06-divine-powers.md` | Fill passive gaps between events. Free micro-agency. |
| Power Combos | `06-divine-powers.md` | Create dramatic chain reactions. Reward experimentation. |
| Follower Voices | `13-follower-voices.md` (new) | Add emotional weight. Named characters petition for divine aid. |
| Progressive Power Unlock | `06-divine-powers.md` | Manage early-game complexity. 2 powers → 12 across 6 eras. |
| Smart Context FAB | `09c-in-game-interactions.md` | FAB never shows more than 6 buttons. Curates by world state. |

### Output Files

| File | Status |
|------|--------|
| `docs/design/09-ui-and-visuals.md` | Updated (FAB, overlay, SFX, accessibility) |
| `docs/design/09b-ux-flows.md` | Updated (tutorial callouts: disaster toggle → dual-arc, FAB hold → Eye tap) |
| `docs/design/09c-in-game-interactions.md` | **NEW** — All 11 interaction specs |
| `docs/design/13-follower-voices.md` | **NEW** — Full Follower Voices system |
| `docs/design/06-divine-powers.md` | Updated (Whispers, Combos, Progressive Unlock) |
| `docs/design/01-overview.md` | Updated (core loop, FTUE, session, glossary) |
| `docs/design/12-scope-and-risks.md` | Updated (MVP scope, risks) |
| `docs/design/constants.md` | Updated (Whisper, Combo, Voice, Petition, Unlock, FAB constants) |
| `docs/INDEX.md` | Updated (glossary, routing tables, project structure, code table) |

### Assumptions Made

- Whisper compound stacking caps at 3 (AI nudge max 0.30) — testable in Stage 6
- 9 power combos for MVP (8 standard + Divine Purge anti-Harbinger) — expandable post-launch
- Max 5 Follower Voices alive — prevents narrative overload
- Petition timeout at 90 real-seconds — reduced loyalty penalty for auto-deny vs. explicit deny
- Progressive unlock follows era boundaries (not game-year thresholds)
- Smart Context FAB picks the 2 cheapest powers as "always" slots, then fills 2 context slots by world state

### Biggest Risk

**Follower Voice petition pacing.** If petitions arrive too frequently, they become annoying noise. If too infrequently, voices feel irrelevant. The 60-second petition cooldown and max-2-pending limit need careful tuning in Stage 6.
