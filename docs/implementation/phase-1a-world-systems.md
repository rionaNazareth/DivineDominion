# Phase 1a — World & Natural Systems

> Prerequisites: Phase 0 complete.
> Cross-references: [phase-1.md](phase-1.md) (tasks 1.1–1.4, 1.7–1.8) · [OVERVIEW](OVERVIEW.md)
> Session: 2 of 13

---

**Core principle:** Pure TypeScript. No Phaser. No browser APIs. Every module exports typed functions. Tests are the spec. Use `produce()` from Immer for all state mutations.

---

## Reading List

Read these sections before writing any code:

- **Types:** `src/types/game.ts` — all type definitions
- **Constants:** `src/config/constants.ts` — all numerical values
- **Design:** `docs/design/04-world.md` — world gen, nations, disease, trade
- **Design:** `docs/design/04b-nation-ai.md` — nation AI decision tree, government evolution, whisper integration
- **Design:** `docs/design/05-religions.md` — rival religions, hidden rules, religion lifecycle
- **Design:** `docs/design/03-commandments.md` — commandment system and effects
- **Formulas:** `docs/design/formulas.md` — read these deliverables:
  - Deliverable 1: Simulation Tick Order (tick steps 1–9, 13)
  - Deliverable 3: Religion Spread
  - Deliverable 4: Disease System
  - Deliverable 5: Trade Routes
  - Deliverable 6: Nation Population & Economy
  - Deliverable 8: Commandment-to-Effects Mapping Table
- **Test spec:** `docs/design/test-spec.md` — read these sections:
  - §5 Module File Map (world-gen, nation, religion, commandments, disease, trade entries)
  - §6 API Contracts (contracts for tasks 1.1–1.4, 1.7–1.8)
  - §7 Test Specifications: world-gen (15 tests), nation (25 tests), religion (25 tests), disease (20 tests), trade (15 tests)
  - §8 Simulation Invariant List (invariants relevant to these modules)

---

## Tasks

### 1.1 World Generation

**File:** `src/simulation/world-gen.ts`
**Test:** `src/simulation/__tests__/world-gen.test.ts`

- Voronoi diagram for regions (use library or implement)
- Noise for terrain (plains, forest, mountain, desert, tundra, coast, ocean)
- Nation placement: 8–12 nations, assign regions
- Religion distribution: player religion in 2–3 regions, 8–12 rival religions
- **Export:** `generateWorld(seed: number): WorldState`

### 1.2 Nation Simulation Tick

**File:** `src/simulation/nation.ts`
**Test:** `src/simulation/__tests__/nation.test.ts`

- Population growth, economy, development advancement per tick
- Apply modifiers from dominant religion's commandments
- **Export:** `tickNations(world: WorldState, deltaYears: number): WorldState`

### 1.3 Religion Spread

**File:** `src/simulation/religion.ts`
**Test:** `src/simulation/__tests__/religion.test.ts`

- Heat diffusion model: influence propagates across adjacent regions
- Spread along trade routes
- **Export:** `tickReligionSpread(world: WorldState, deltaYears: number): WorldState`

### 1.4 Commandment Effects

**File:** `src/simulation/commandments.ts`
**Test:** `src/simulation/__tests__/commandments.test.ts`

- Apply commandment modifiers to nations/regions where that religion is dominant
- **Export:** `applyCommandmentEffects(world: WorldState): WorldState`

### 1.7 Disease System

**File:** `src/simulation/disease.ts`
**Test:** `src/simulation/__tests__/disease.test.ts`

- Emergence, spread along trade/armies, severity, recovery, quarantine
- **Export:** `tickDiseases(world: WorldState, deltaYears: number): WorldState`

### 1.8 Trade Routes

**File:** `src/simulation/trade.ts`
**Test:** `src/simulation/__tests__/trade.test.ts`

- Formation, disruption, effects (wealth, tech transfer, religion spread)
- **Export:** `tickTradeRoutes(world: WorldState, deltaYears: number): WorldState`

### Nation AI Decision Logic

**File:** `src/simulation/nation-ai.ts`
**Test:** `src/simulation/__tests__/nation-ai.test.ts`

- Implement nation AI decision tree from `docs/design/04b-nation-ai.md` (tick step 13)
- Decision weights influenced by `nation.aiWeights` (set by whispers in Phase 1c)
- Government evolution logic
- War declaration formula (war score threshold: 0.60)
- **Export:** `tickNationAI(state: GameState, deltaYears: number): GameState`

**Note:** This module reads `nation.aiWeights` but does NOT write to it. Whisper-writing logic is Phase 1c's responsibility. The `NationAIWeights` type and default values were added in Phase 0.6.

---

## Cross-Dependency Notes

None — all interdependent systems (world gen, nation, religion, commandments, disease, trade, nation AI) are within this chunk.

---

## Expected Test Counts

| Module | Tests |
|--------|-------|
| world-gen | 15 |
| nation | 25 |
| nation-ai | 20 |
| religion | 25 |
| commandments | 10 |
| disease | 20 |
| trade | 15 |
| **Total** | **130** |
