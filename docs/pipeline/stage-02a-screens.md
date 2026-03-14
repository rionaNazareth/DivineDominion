# Stage 2A: Screens & Flows

> **Goal:** Define every screen outside the live game map — menus, selection, store, history, results, loading, tutorial. A developer should never ask "what screen comes next?" or "what's on the settings page?"
>
> **Estimated sessions:** 1
>
> **Depends on:** Stage 1 (vision, FTUE, session design, business model)

---

## Agent Prompt

```
You are a Senior Mobile UX Designer specializing in strategy games on phone. You've designed UX for 4 shipped mobile strategy titles. You understand touch targets, thumb zones, portrait mode constraints, and how to make complex games playable on a 6-inch screen.

Read these files first:
- docs/design/01-overview.md (FTUE, session design, business model, retention from Stage 1)
- docs/design/09-ui-and-visuals.md
- docs/design/03-commandments.md
- docs/design/12-scope-and-risks.md (MVP scope, kill list, free/paid split)

Your job is to define every screen OUTSIDE the live game map — the menus, flows, and non-gameplay interfaces that frame the experience. Stage 2B will handle in-game interactions.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. COMPLETE SCREEN FLOW DIAGRAM — Every screen/state with transitions. Use mermaid syntax. Include:
   - App launch → main menu → Earth creation → commandment selection → game → pause → results → Earth History
   - Store entry points (from menu — reserved for future expansion packs)
   - Settings access points
   - Tutorial overlay states
   - Error states (save failed, purchase failed, LLM timeout)
   - Restore purchases flow

2. MAIN MENU DESIGN — The first screen after splash:
   - Layout, buttons, visual hierarchy
   - Items: New Earth, Continue (if save exists), Earth History, Store, Settings
   - State variations (first launch vs. returning, free vs. paid)
   - Earth counter / God Profile preview
   - Safe area handling (notch, home indicator)

3. SETTINGS SCREEN — All player-configurable options:
   - Sound toggle (SFX on/off, volume if applicable)
   - Haptics toggle (on/off)
   - Left-hand mode toggle (mirrors FAB and controls)
   - Reduced motion toggle
   - Speed default (1×/2×/4×)
   - Font scaling
   - Colorblind mode selector
   - Support / feedback link
   - Privacy policy link
   - Version number
   - Restore purchases button
   - Layout and grouping

4. COMMANDMENT SELECTION UX — The game's most important screen:
   - First Earth: archetype selection (Shepherd/Judge) → review 10 → swap
   - Subsequent Earths: full browser with categories, filters
   - Layout for 25+ commandments on a phone (categories, grid, scroll)
   - Tension warnings (conflicting commandments)
   - Info popovers (mechanical effect + scripture line)
   - Achievement-locked commandment indicators (lock icon + unlock condition tooltip)
   - Exact measurements (card size, spacing, scroll behavior)

5. STORE UX — Reserved for future expansion packs:
   - Store screen placeholder (accessible from menu, shows "All content included")
   - Infrastructure for future expansion pack purchases (purchase/restore flows)
   - Not active at launch — no purchasable items

6. EARTH HISTORY INTERFACE — MVP-essential:
   - List of past Earths (outcome, commandments, key stats)
   - Detail view for each Earth: commandments chosen, pivotal moments, final outcome, time played
   - Pivotal moments: wars that changed the map, schisms, miracles, scientific breakthroughs
   - How moments are captured during gameplay (auto-logged events)
   - Visual style (timeline? list? cards?)

7. RESULTS / END-OF-EARTH SCREEN — The emotional payoff:
   - Win vs. lose vs. special ending layouts
   - Stats summary (followers, interventions, wars, eras survived, science level)
   - Commandments used (with "would you change any?" prompt)
   - "Start New Earth" CTA
   - "View Earth History" link
   - Share prompt (deferred feature, but leave space)
   - If player has unearned unlockable commandments: achievement unlock prompt

8. TUTORIAL / ONBOARDING FLOW — Based on FTUE from Stage 1:
   - Which screens have tutorial callouts
   - Order of feature introduction across first session
   - Progressive disclosure (don't show everything at once)
   - Skip option for returning players
   - Tutorial state persistence (don't re-show on continue)

9. LOADING STATES — What players see during:
   - App launch (splash → main menu transition)
   - Save loading (continue from main menu)
   - World generation (new Earth)
   - What is shown: progress indicator, tip text, or just a brief animation
   - Maximum acceptable load time targets

10. 2B HANDOFF — Explicit contract for Stage 2B (in-game interactions). Add a "Stage 2B Handoff" section to the output file with:
   a. SETTINGS → IN-GAME BEHAVIOR MAP:
      - Left-hand mode → which in-game elements must mirror (FAB, controls, bottom sheet anchor)
      - Reduced motion → which animations must have simplified alternatives
      - Speed default → how the HUD speed control reads/honors the setting
      - Font scaling → which HUD text elements must scale (and to what max)
      - Colorblind mode → palette constraints that Stage 7 must respect
   b. TUTORIAL CALLOUT TARGETS:
      - List every in-game element that receives a tutorial callout (FAB, first event, overlay, region panel)
      - For each: callout text from deliverable 8, expected position, trigger condition
      - 2B must design these elements so callouts can attach without overlap
   c. DESIGN TOKENS (shared with 2B):
      - Minimum touch target: 44pt (Apple HIG / Material)
      - Safe area insets: top (notch), bottom (home indicator)
      - Primary CTA height
      - Toast position constraints (top vs bottom, max height)
      - Modal/sheet border radius
      - Standard animation duration (entry, exit)
      - These values are binding for both 2A and 2B — neither may contradict them
   d. ERROR STATE OWNERSHIP:
      - 2A owns: purchase failed, restore failed, store flow errors, navigation errors
      - 2B owns: auto-save fail, LLM timeout/fallback, corrupted save recovery, offline state, low memory, app backgrounded mid-event
      - No error state should be designed by both stages — each has one owner

Update docs/design/09-ui-and-visuals.md or create docs/design/09b-ux-flows.md if 09 exceeds 300 lines.

Quality gate: A developer can build every non-gameplay screen without asking "what's on this page?" or "where does this button lead?" The 2B Handoff is complete and unambiguous.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Commandment selection layout:** Category tabs + grid / Swipeable card deck / Scrolling list with filters | The most important screen in the game. Wrong UX = player bounces before playing. |
| 2 | **Store screen:** All content ships free. Store reserved for future expansion packs. | IAP deferred — no paid content at launch. |
| 3 | **Earth History style:** Simple list (outcome + commandments) / Timeline with pivotal moments / Interactive replay cards | Affects how much data to capture during gameplay and how much UI to build. |
| 4 | **Tutorial depth:** Minimal (3 callouts, then release) / Guided (walk through first era step-by-step) / Contextual (tooltips appear when relevant) | Overlong tutorials kill retention. Too brief = confusion. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., button sizes, menu ordering)
3. **Biggest risk** — which screen is most likely to need redesign after playtesting?
4. **Open question** — "Walk through the flow: app launch → first commandment selection → first game → first results screen. Does it feel right?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/01-overview.md` | FTUE, session design, business model (from Stage 1) |
| `docs/design/09-ui-and-visuals.md` | Current UI spec |
| `docs/design/03-commandments.md` | Commandment options for selection UX |
| `docs/design/12-scope-and-risks.md` | Free/paid split, MVP scope |

## Output Files (Modified/Created)

| File | What changes |
|------|-------------|
| `docs/design/09-ui-and-visuals.md` | Screen specs added |
| `docs/design/09b-ux-flows.md` | Created if 09 exceeds 300 lines |

## Quality Gate

- [x] Screen flow diagram covers every reachable state (mermaid) → `09b-ux-flows.md` § 1
- [x] Main menu has all items (New Earth, Continue, History, Store, Settings) → `09b` § 2
- [x] Settings screen has all toggles (sound, haptics, left-hand, reduced motion) → `09b` § 3
- [x] Commandment selection handles base vs. achievement-locked commandments → `09b` § 4
- [x] Store reserved for future expansion packs → `09b` § 5
- [x] Earth History shows commandments + pivotal moments per Earth → `09b` § 6
- [x] Results screen has stats, CTA, and achievement unlock prompt → `09b` § 7
- [x] Tutorial flow has skip option for returning players → `09b` § 8
- [x] Loading states have maximum time targets → `09b` § 9
- [x] Restore purchases flow is fully specified → `09b` § 5
- [x] 2B Handoff: settings → in-game behavior map is complete (all 5 settings mapped) → `09b` § 10a
- [x] 2B Handoff: tutorial callout targets list every in-game element with callout text → `09b` § 10b
- [x] 2B Handoff: design tokens are defined (touch targets, safe areas, animation durations) → `09b` § 10c
- [x] 2B Handoff: error state ownership is explicit (no overlapping ownership) → `09b` § 10d
- [x] All changes follow design-change protocol
