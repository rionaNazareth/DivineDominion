# Phase 1d — Characters & Runner

> Prerequisites: Phase 1c complete.
> Cross-references: [phase-1.md](phase-1.md) (tasks 1.12, 1.15–1.16) · [OVERVIEW](OVERVIEW.md)
> Session: 5 of 13

---

**Core principle:** Pure TypeScript. No Phaser. No browser APIs. Use `produce()` from Immer for all state mutations. This is the FINAL simulation chunk — it produces the runner that orchestrates ALL prior modules plus boundary and integration tests.

---

## Reading List

Read these sections before writing any code:

- **Types:** `src/types/game.ts` — all type definitions
- **Constants:** `src/config/constants.ts` — all constants
- **Design:** `docs/design/13-follower-voices.md` — voice types, emergence, petitions, loyalty, lifecycle, lineage
- **Design:** `docs/design/14-harbinger.md` — alien saboteur AI, Signal Strength, sabotage actions, counter-play
- **Formulas:** `docs/design/formulas.md` — read these deliverables:
  - Deliverable 1: Simulation Tick Order (ALL 17 steps — the runner must call them in this exact order)
  - Deliverable 13: Speed Control Formula
  - Deliverable 16: Follower Voice Formulas
  - Deliverable 17: Harbinger System Formulas
- **Test spec:** `docs/design/test-spec.md` — read these sections:
  - §1 Simulation Tick Architecture (reads/writes/module map)
  - §5 Module File Map (runner, voices, harbinger entries)
  - §6 API Contracts (contracts for tasks 1.12, 1.15–1.16 — NOTE: `runSimulationTick` returns `GameState`, not `SimulationTick`)
  - §7 Test Specifications: runner (10 tests), voices (20 tests), harbinger (25 tests), boundary (50 tests), integration (12 tests)
  - §8 Simulation Invariant List (ALL 26 invariants — boundary tests validate these)

---

## Tasks

### 1.12 Simulation Runner

**File:** `src/simulation/runner.ts`
**Test:** `src/simulation/__tests__/runner.test.ts`

- Orchestrates ALL tick steps in the exact order from Deliverable 1 (17-step pipeline)
- Manages game time, era transitions
- Calls `tickWhispers(state, deltaRealSeconds)` — note this uses real-time seconds, not game years. The runner receives `deltaRealSeconds` as its second parameter and passes it through to whispers.
- **Export:** `runSimulationTick(state: GameState, deltaRealSeconds: number): GameState`

**INT_012 guidance:** Implement runner tests with mock/spy pattern. Use `vi.spyOn` to verify the call order matches Deliverable 1's 17-step sequence. Do NOT re-test individual module logic — only verify orchestration order and data flow.

### 1.15 Voice Simulation

**File:** `src/simulation/voices.ts`
**Test:** `src/simulation/__tests__/voices.test.ts`

- Emergence triggers, loyalty tracking, petition generation, lifecycle (death, betrayal, lineage)
- **Export:** `tickVoices(state: GameState, deltaYears: number): GameState`

### 1.16 Harbinger Simulation

**File:** `src/simulation/harbinger.ts`
**Test:** `src/simulation/__tests__/harbinger.test.ts`

- Signal Strength growth, action selection, adaptive targeting, rubber banding, sabotage resolution
- Counter-play: Shield blocking, Whisper cancellation, prosperity resistance
- **Export:** `tickHarbinger(state: GameState): GameState`

### Boundary Tests

**File:** `src/simulation/__tests__/boundary.test.ts`

50 tests covering edge cases and invariant enforcement across ALL simulation modules. See test-spec §7 "boundary" section and §8 Invariant List.

### Integration Tests

**File:** `src/simulation/__tests__/integration.test.ts`

12 tests covering cross-module interaction chains. See test-spec §7 "integration" section.

---

## Cross-Dependency Notes

- **Runner imports ALL prior modules:** The runner calls every tick function from Phases 1a, 1b, and 1c in the order specified by Deliverable 1. All prior chunks must compile and export correctly. If any module is missing, the runner cannot be built.

- **Harbinger reads Shield effect:** `tickHarbinger` checks `region.activeEffects` for Shield of Faith (from `divine.ts` in Phase 1c). This is a read-only dependency — do not modify divine logic.

- **Voices read religion state:** `tickVoices` checks `religiousInfluence` and schism conditions (from `religion.ts` in Phase 1a). This is a read-only dependency.

- **Boundary and integration tests validate cross-module chains:** These are the final validation that all modules work together correctly. Run them after all simulation modules compile.

---

## Expected Test Counts

| Module | Tests |
|--------|-------|
| runner | 10 |
| voices | 20 |
| harbinger | 25 |
| boundary | 50 |
| integration | 12 |
| **Total** | **117** |
