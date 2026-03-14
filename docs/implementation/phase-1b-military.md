# Phase 1b — Military

> Prerequisites: Phase 1a complete.
> Cross-references: [phase-1.md](phase-1.md) (tasks 1.5–1.6) · [OVERVIEW](OVERVIEW.md)
> Session: 3 of 13

---

**Core principle:** Pure TypeScript. No Phaser. No browser APIs. Use `produce()` from Immer for all state mutations.

---

## Reading List

Read these sections before writing any code:

- **Types:** `src/types/game.ts` — all type definitions (especially `Army`, `BattleResult`, `Region`)
- **Constants:** `src/config/constants.ts` — military constants
- **Design:** `docs/design/04-world.md` — armies section
- **Formulas:** `docs/design/formulas.md` — read these deliverables:
  - Deliverable 1: Simulation Tick Order (tick steps 10–11)
  - Deliverable 2: Battle Resolution
  - Deliverable 7: Army Mechanics
- **Test spec:** `docs/design/test-spec.md` — read these sections:
  - §5 Module File Map (army, battle entries)
  - §6 API Contracts (contracts for tasks 1.5–1.6)
  - §7 Test Specifications: army (30 tests)
  - §8 Simulation Invariant List (military-related invariants)

---

## Tasks

### 1.5 Army Management

**File:** `src/simulation/army.ts`
**Test:** `src/simulation/__tests__/army.test.ts`

- Create, move, supply, attrition
- **Export:** `tickArmies(world: WorldState, deltaYears: number): WorldState`

### 1.6 Battle Resolution

**File:** `src/simulation/battle.ts`
**Test:** `src/simulation/__tests__/battle.test.ts`

- When armies meet: resolve based on strength, morale, terrain, commander trait
- **Export:** `resolveBattle(attacker: Army, defender: Army, region: Region): BattleResult`

**Note:** test-spec §5 combines army/battle into one module. You may either split into two files (army.ts + battle.ts) or combine into one. If split, `src/simulation/runner.ts` in Phase 1d must import both. Document your choice in the session handoff.

---

## Cross-Dependency Notes

- **Conquest updates religion:** When a nation conquers a region, update `region.nationId` and write `+0.2` to the winner's `religiousInfluence` — read the `ReligiousInfluence` type in `game.ts`. The religion spread module (from Phase 1a) reads this value.
- **Army reads region data:** Army movement and attrition read `region.terrain` and `region.cityLevel` — these were set by world-gen in Phase 1a.

---

## Expected Test Counts

| Module | Tests |
|--------|-------|
| army (includes battle) | 30 |
| **Total** | **30** |
