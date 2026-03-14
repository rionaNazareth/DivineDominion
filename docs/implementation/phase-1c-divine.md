# Phase 1c — Divine & Progression

> Prerequisites: Phase 1b complete.
> Cross-references: [phase-1.md](phase-1.md) (tasks 1.9–1.11, 1.13–1.14) · [OVERVIEW](OVERVIEW.md)
> Session: 4 of 13

---

**Core principle:** Pure TypeScript. No Phaser. No browser APIs. Use `produce()` from Immer for all state mutations.

---

## Reading List

Read these sections before writing any code:

- **Types:** `src/types/game.ts` — all type definitions (especially `DivinePower`, `PowerCombo`, `WhisperType`, `DivineWhisper`, `WhisperState`, `ComboWindowState`, `NationAIWeights`)
- **Constants:** `src/config/constants.ts` — divine energy, whisper, combo constants
- **Design:** `docs/design/06-divine-powers.md` — energy, blessings, disasters, hypocrisy, whispers, combos, progressive unlock
- **Design:** `docs/design/07-eras-and-endgame.md` — science progression, eras
- **Design:** `docs/design/08-events.md` — event system, categories, choices
- **Formulas:** `docs/design/formulas.md` — read these deliverables:
  - Deliverable 1: Simulation Tick Order (tick steps 2, 12, 16)
  - Deliverable 9: Divine Power Effects
  - Deliverable 10: Hypocrisy System
  - Deliverable 11: Science Progression
  - Deliverable 12: Auto-Save Trigger Spec
  - Deliverable 14: Divine Whisper Mechanics
  - Deliverable 15: Power Combo Formulas
- **Test spec:** `docs/design/test-spec.md` — read these sections:
  - §5 Module File Map (events, science, divine, whispers, combos entries)
  - §6 API Contracts (contracts for tasks 1.9–1.11, 1.13–1.14)
  - §7 Test Specifications: events (16 tests), science (15 tests), divine (20 tests), whispers (16 tests), combos (23 tests)
  - §8 Simulation Invariant List (divine-related invariants)

---

## Tasks

### 1.9 Event Engine

**File:** `src/simulation/events.ts`
**Test:** `src/simulation/__tests__/events.test.ts`

- Weighted random selection, template filling, auto-pause triggers
- **Export:** `rollEvents(state: GameState, deltaYears: number): GameState`

**Note on event templates:** Real event template data (80 events) is created in Phase 5. For Phase 1c, create 2–3 stub event templates directly in the test file or a test fixture. These stubs must have valid structure (id, category, weight, choices) but can have placeholder text. The event engine must work with any array of valid templates.

### 1.10 Science Progression

**File:** `src/simulation/science.ts`
**Test:** `src/simulation/__tests__/science.test.ts`

- Check global development against milestones
- **Export:** `tickScience(world: WorldState): ScienceProgress`

### 1.11 Divine Power Execution

**File:** `src/simulation/divine.ts`
**Test:** `src/simulation/__tests__/divine.test.ts`

- Apply blessing/disaster to target region
- Check hypocrisy (commandment vs action mismatch)
- **Export:** `castPower(state: GameState, powerId: PowerId, regionId: RegionId): GameState`

### 1.13 Whisper Simulation

**File:** `src/simulation/whispers.ts`
**Test:** `src/simulation/__tests__/whispers.test.ts`

- Apply AI nudge, cooldowns, compound stacking.
- **Export:** `tickWhispers(state: GameState, deltaRealSeconds: number): GameState`

### 1.14 Combo Simulation

**File:** `src/simulation/combos.ts`
**Test:** `src/simulation/__tests__/combos.test.ts`

- Check combo conditions on power cast, apply modifiers.
- **Export:** `checkAndApplyCombos(state: GameState, powerId: PowerId, regionId: RegionId): GameState`

---

## Cross-Dependency Notes

- **Whispers write to `nation.aiWeights`:** The `tickWhispers` function modifies `nation.aiWeights` (type: `NationAIWeights`). The `nation-ai.ts` module (Phase 1a) reads this field. Ensure you use the same type shape defined in Phase 0.6.

- **`tickWhispers` takes `deltaRealSeconds`, NOT `deltaGameYears`:** This is intentional — whisper cooldowns tick at real-time rate regardless of speed multiplier. See test-spec §6 contract #11 for the function signature.

- **Divine Purge combo checks harbinger state:** The `checkAndApplyCombos` function checks `harbinger.corruptedRegionIds` when evaluating the Divine Purge combo (Shield + Miracle on corrupted region). Read the `HarbingerState` type from `game.ts` but do NOT implement harbinger logic — that is Phase 1d's responsibility. For combos tests, mock the harbinger state.

- **Event stubs:** The event engine (`rollEvents`) accepts an event template array. Real templates come in Phase 5. Use 2–3 hardcoded test fixtures for Phase 1c testing.

---

## Expected Test Counts

| Module | Tests |
|--------|-------|
| events | 16 |
| science | 15 |
| divine | 20 |
| whispers | 16 |
| combos | 23 |
| **Total** | **90** |
