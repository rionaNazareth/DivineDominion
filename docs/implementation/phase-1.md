# Phase 1 — Simulation Engine

> Prerequisites: Phase 0 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [04-world](../design/04-world.md) · [05-religions](../design/05-religions.md) · [06-divine-powers](../design/06-divine-powers.md) · [08-events](../design/08-events.md)

---

**Core principle:** Pure TypeScript. No Phaser. No browser APIs. Every module has clear exports, inputs, outputs. Tests are the spec.

---

## 1.1 World Generation

**File:** `src/simulation/world-gen.ts`  
**Test:** `src/simulation/__tests__/world-gen.test.ts`

- Voronoi diagram for regions (use library or implement)
- Noise for terrain (plains, forest, mountain, desert, tundra, coast, ocean)
- Nation placement: 8–12 nations, assign regions
- Religion distribution: player religion in 2–3 regions, 8–12 rival religions
- **Export:** `generateWorld(seed: number): WorldState`

---

## 1.2 Nation Simulation Tick

**File:** `src/simulation/nation.ts`  
**Test:** `src/simulation/__tests__/nation.test.ts`

- Population growth, economy, development advancement per tick
- Apply modifiers from dominant religion's commandments
- **Export:** `tickNations(world: WorldState, deltaYears: number): WorldState`

---

## 1.3 Religion Spread

**File:** `src/simulation/religion.ts`  
**Test:** `src/simulation/__tests__/religion.test.ts`

- Heat diffusion model: influence propagates across adjacent regions
- Spread along trade routes
- **Export:** `tickReligionSpread(world: WorldState, deltaYears: number): WorldState`

---

## 1.4 Commandment Effects

**File:** `src/simulation/commandments.ts`  
**Test:** `src/simulation/__tests__/commandments.test.ts`

- Apply commandment modifiers to nations/regions where that religion is dominant
- **Export:** `applyCommandmentEffects(world: WorldState): WorldState`

---

## 1.5 Army Management

**File:** `src/simulation/army.ts`  
**Test:** `src/simulation/__tests__/army.test.ts`

- Create, move, supply, attrition
- **Export:** `tickArmies(world: WorldState, deltaYears: number): WorldState`

---

## 1.6 Battle Resolution

**File:** `src/simulation/battle.ts`  
**Test:** `src/simulation/__tests__/battle.test.ts`

- When armies meet: resolve based on strength, morale, terrain, commander trait
- **Export:** `resolveBattle(attacker: Army, defender: Army, region: Region): BattleResult`

---

## 1.7 Disease System

**File:** `src/simulation/disease.ts`  
**Test:** `src/simulation/__tests__/disease.test.ts`

- Emergence, spread along trade/armies, severity, recovery, quarantine
- **Export:** `tickDiseases(world: WorldState, deltaYears: number): WorldState`

---

## 1.8 Trade Routes

**File:** `src/simulation/trade.ts`  
**Test:** `src/simulation/__tests__/trade.test.ts`

- Formation, disruption, effects (wealth, tech transfer, religion spread)
- **Export:** `tickTradeRoutes(world: WorldState, deltaYears: number): WorldState`

---

## 1.9 Event Engine

**File:** `src/simulation/events.ts`  
**Test:** `src/simulation/__tests__/events.test.ts`

- Weighted random selection, template filling, auto-pause triggers
- **Export:** `rollEvents(state: GameState, deltaYears: number): GameState`

---

## 1.10 Science Progression

**File:** `src/simulation/science.ts`  
**Test:** `src/simulation/__tests__/science.test.ts`

- Check global development against milestones
- **Export:** `tickScience(world: WorldState): ScienceProgress`

---

## 1.11 Divine Power Execution

**File:** `src/simulation/divine.ts`  
**Test:** `src/simulation/__tests__/divine.test.ts`

- Apply blessing/disaster to target region
- Check hypocrisy (commandment vs action mismatch)
- **Export:** `castPower(state: GameState, powerId: PowerId, regionId: RegionId): GameState`

---

## 1.12 Simulation Runner

**File:** `src/simulation/runner.ts`  
**Test:** `src/simulation/__tests__/runner.test.ts`

- Orchestrates all ticks in correct order
- Manages game time, era transitions
- **Export:** `runSimulationTick(state: GameState, deltaRealSeconds: number): GameState`

---

### Stage 2B System Tasks

## 1.13 Whisper Simulation

**File:** `src/simulation/whispers.ts`  
**Test:** `src/simulation/__tests__/whispers.test.ts`

- Apply AI nudge, cooldowns, compound stacking.
- **Export:** `tickWhispers(state: GameState, deltaRealSeconds: number): GameState`

---

## 1.14 Combo Simulation

**File:** `src/simulation/combos.ts`  
**Test:** `src/simulation/__tests__/combos.test.ts`

- Check combo conditions on power cast, apply modifiers.
- **Export:** `checkAndApplyCombos(state: GameState, powerId: PowerId, regionId: RegionId): GameState`

---

## 1.15 Voice Simulation

**File:** `src/simulation/voices.ts`  
**Test:** `src/simulation/__tests__/voices.test.ts`

- Emergence triggers, loyalty tracking, petition generation, lifecycle (death, betrayal, lineage).
- **Export:** `tickVoices(state: GameState, deltaYears: number): GameState`

---

## 1.16 Harbinger Simulation

**File:** `src/simulation/harbinger.ts`  
**Test:** `src/simulation/__tests__/harbinger.test.ts`

- Signal Strength growth, action selection, adaptive targeting, rubber banding, sabotage resolution, counter-play (Shield blocking, Whisper cancellation, prosperity resistance).
- **Export:** `tickHarbinger(state: GameState): GameState`

---

## 1.17 Nation AI Decision Logic

**File:** `src/simulation/nation-ai.ts`  
**Test:** `src/simulation/__tests__/nation-ai.test.ts`

- Nation AI decision tree from `docs/design/04b-nation-ai.md` (tick step 13)
- Decision weights influenced by `nation.aiWeights` (set by whispers in 1.13)
- Government evolution, war declaration (war score threshold: 0.60)
- **Export:** `tickNationAI(state: GameState, deltaYears: number): GameState`
