# Phase 4 — Integration

> Prerequisites: Phase 3 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [10-llm-integration](../design/10-llm-integration.md)

---

## Reading List

Read these before writing any code:

- **Types:** `src/types/game.ts` — `GameState`, `WorldState`, `DivineState`, `GodProfile`
- **Design:** `docs/design/10-llm-integration.md` — LLM role, prompts, call budget, fallbacks
- **Design:** `docs/design/02b-era-narratives.md` — era transition narrative templates (fallbacks)
- **Design:** `docs/design/11-tech.md` — tech stack, project structure
- **Design:** `docs/design/sound-spec.md` — music, SFX, haptics specs
- **Test spec:** `docs/design/test-spec.md` — §3 State Serialization Spec, §13 Corrupted Save Recovery

---

## 4.1 LLM Client

- Gemini Flash integration
- Retry logic, timeout
- Fallback templates when LLM unavailable or slow
- Never block game flow

---

## 4.2 Era Narrative Generation

- Send world state to LLM
- Receive narrative summary (max 100 words)
- Display in era transition screen

---

## 4.3 Rival Religion LLM Generation

- Generate religion names, commandments, hidden rules at game start
- Fallback to pre-made templates if LLM fails

---

## 4.4 Save/Load System

- localStorage + IndexedDB
- Save game state (serialize WorldState, GameState, DivineState)
- Auto-save every N minutes
- Cross-Earth persistence: GodProfile (total wins, losses, interventions, etc.)

---

## 4.5 Audio System

- Ambient music per era
- SFX: divine powers, events, battles
- Mute/settings integration

---

## 4.6 Mobile Touch Controls

- Pan (one-finger drag)
- Pinch (two-finger zoom)
- Tap (select region, confirm)
- Long-press (context menu)
- Swipe edges (optional: quick actions)
- Two-finger tap (optional: divine overlay toggle)
