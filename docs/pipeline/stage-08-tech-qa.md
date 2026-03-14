# Stage 8: Technical Spec & QA

> **Goal:** Produce the exact technical blueprint — architecture, API contracts, test specifications, invariants — that a coding agent follows to implement the game. Zero ambiguity.
>
> **Estimated sessions:** 2-3
>
> **Depends on:** ALL prior stages (this stage synthesizes everything into implementation-ready specs)

### Decision Point Outcomes (Human-Confirmed)

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | State management | **Immer proxies** | Industry standard, readable mutation syntax with immutability guarantees, easier to maintain |
| 2 | Save format | **Compressed JSON (LZ-string)** | ~70-80% smaller saves, decompressible for debugging |
| 3 | Target device baseline | **iPhone 12 / Pixel 6** (2020-2021 mid-range) | ~85% active device coverage, reasonable visual quality |
| 4 | Test coverage | **High ~90% (~380-420 test specs)** | Covers boundaries, integration chains, invariants; diminishing returns above ~400 |
| 5 | Module architecture | **Mix (pure simulation + class rendering)** | Pure functions for testable simulation, Phaser classes for rendering |

### Immer Pattern Spec (for implementation agent)

All simulation modules MUST follow this exact Immer pattern. The implementation agent should treat this as a mandatory template — no exceptions.

```typescript
import { produce } from 'immer';
import type { WorldState } from '../types/game';

// PATTERN: Every tick function uses produce()
// Input: current immutable state
// Output: new immutable state (Immer handles structural sharing)
export function tickNations(world: WorldState, deltaYears: number): WorldState {
  return produce(world, draft => {
    // Inside produce(), draft looks mutable but Immer tracks changes
    for (const [id, region] of draft.regions) {
      region.population += computeGrowth(region, deltaYears);
    }
  });
}

// RULE 1: Never mutate state outside produce()
// RULE 2: Never return draft — Immer returns the new state automatically
// RULE 3: For read-only helpers, use the original state (not draft)
// RULE 4: Maps work inside Immer — draft.regions.get(id) is fine
// RULE 5: Every exported tick/apply function returns produce() result
```

Dependencies to install: `npm install immer`

---

### Stage 2B Additions

Test specifications must cover Stage 2B systems:

- **Whisper cooldowns** — Verify cooldown enforcement and timing
- **Combo triggering** — Test combo activation conditions and modifier application
- **Voice lifecycle + petitions** — Voice emergence, petition flow, and loyalty state transitions
- **Progressive unlock per era** — Unlock schedule validation across all eras

### Harbinger Deliverables

- `src/simulation/harbinger.ts` module specification
- Test cases: targeting correctness (does Harbinger target the right strategy?), rubber banding verification (does budget scale correctly?), visibility timeline (are events triggered at correct eras?), Veil indicator (does "data unreliable" appear correctly?)
- Anomaly overlay layer implementation spec
- Integration tests: Harbinger + Shield blocking, Harbinger + Divine Purge, Harbinger + Follower Voice detection, alien-caused event flagging
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are a Senior Game Engineer specializing in simulation games and mobile performance. You've architected 3 shipped simulation games and you understand how to write specs that AI coding agents can follow without asking questions.

Read these files in order:
- docs/INDEX.md (project structure)
- src/types/game.ts (all types)
- src/config/constants.ts (all constants)
- docs/design/formulas.md (all simulation formulas from Stage 3)
- docs/design/04-world.md (world gen, nation AI from Stage 4)
- docs/design/05-religions.md (religion system from Stage 4)
- docs/design/03-commandments.md (commandment balance from Stage 6)
- docs/design/06-divine-powers.md (power balance from Stage 6 — blessings, disasters, whispers, combos)
- docs/design/08-events.md (event system design)
- docs/design/event-index.json (machine-readable event data — all 80 events)
- docs/design/09-ui-and-visuals.md (UX spec from Stage 2)
- docs/design/09c-in-game-interactions.md (Stage 2B interaction specs — whisper, combo, voice UI)
- docs/design/13-follower-voices.md (voice lifecycle, petition flow)
- docs/design/14-harbinger.md (alien saboteur — module spec source)
- docs/design/monte-carlo-scenarios.json (20 test scenarios from Stage 6)
- docs/design/art-spec.md (visual spec from Stage 7)
- docs/design/sound-spec.md (audio spec from Stage 7)
- docs/design/11-tech.md (tech stack, engine decision from Stage 1)
- docs/implementation/OVERVIEW.md
- docs/implementation/phase-0.md through phase-6.md

Your job is to bridge design and implementation. Produce specs so precise that a coding agent can implement every module by reading its API contract and test spec and writing code to pass the tests.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. SIMULATION TICK ARCHITECTURE — Data flow diagram:
   - Exact order of operations with input/output types
   - Which systems read/write which parts of GameState
   - Mermaid diagram of the tick pipeline
   - Performance target: max tick time (ms) on mid-range mobile

2. WORLD GENERATION PSEUDOCODE — Step by step:
   - Library: d3-delaunay (or whatever was decided)
   - Exact steps with input types and output types
   - Seed handling (how seed maps to random calls)
   - Validation checks at each step

3. STATE SERIALIZATION SPEC — Save/load:
   - How GameState (which uses Maps and complex types) serializes to JSON
   - Exact serialization format
   - Save file size target (max KB)
   - Corruption detection (checksum or validation)
   - Migration strategy (for future version changes)

4. PERFORMANCE BUDGET:
   - Target FPS: 60fps on mid-range phone (define "mid-range")
   - Max tick time: Xms
   - Max memory: XMB
   - Max regions rendered simultaneously
   - Max armies on screen
   - Cold start time target
   - Battery: max drain per 20-minute session

5. MODULE FILE MAP — Canonical file names:
   - Every TypeScript module with exact path
   - What each module exports (function names, classes)
   - Resolve all naming conflicts (nation.ts vs nations.ts etc.)
   - Dependency graph (which modules import which)
   - Build order (which modules have no dependencies → build first)

6. API CONTRACTS — For every simulation module:
   - Function signature with TypeScript types
   - JSDoc description
   - Parameter constraints (e.g., "population must be >= 0")
   - Return type and what each field means
   - Side effects (does it mutate state? return new state?)
   - Example input → output
   
   Must include API contracts for these Stage 2B and Harbinger modules:
   - `src/simulation/harbinger.ts` — Harbinger targeting, budget allocation, sabotage execution, Veil toggling
   - `src/simulation/whispers.ts` — Whisper nudge application, cooldown enforcement, targeted vs. untargeted
   - `src/simulation/combos.ts` — Combo detection, modifier application, Divine Purge
   - `src/simulation/voices.ts` — Voice emergence, petition lifecycle, loyalty state transitions

7. COMPREHENSIVE TEST SPECIFICATIONS:
   For every simulation module, specific test cases (not "test it works"):
   - Scenario description
   - Input state (exact values)
   - Expected output (exact values or ranges)
   - Edge cases to test
   Format: structured enough to directly translate to Vitest test files.
   Note: test-spec.md is the DESIGN source for tests. During implementation, src/simulation/__tests__/*.test.ts files are created FROM test-spec.md. When design changes, update test-spec.md first, then regenerate tests.
   
   Must include specific test cases for:
   - **Harbinger:** Targeting correctness (does Harbinger target the right strategy?), rubber banding verification (does budget scale correctly?), visibility timeline (are events triggered at correct eras?), Veil indicator (does "data unreliable" appear correctly?)
   - **Harbinger integration:** Shield blocking sabotage, Divine Purge clearing corruption, Follower Voice detecting Harbinger, alien-caused event flagging
   - **Whisper cooldowns:** Per-region and global cooldown enforcement, compound stacking limits
   - **Combo triggering:** All 9 combo activation conditions, modifier application order
   - **Voice lifecycle:** Voice emergence conditions, petition flow completion, loyalty state transitions
   - **Progressive unlock:** Unlock schedule validation across all 12 eras

8. SIMULATION INVARIANT LIST — 20+ invariants:
   Things that must ALWAYS hold true during simulation:
   - "No region population < 0"
   - "No nation controls >80% of regions before year 1900"
   - "Science milestones occur in order"
   - "Total population across all regions equals world population"
   - etc.
   These become runtime assertions and test checks.

9. MONTE CARLO VALIDATION SPEC — Based on Stage 6's 20 scenarios:
   - Exact implementation spec (how to run 1000 sims)
   - Pass/fail criteria for each scenario
   - Output format (CSV? JSON?)
   - How to interpret results

10. EDGE CASE CATALOG — 30+ edge cases:
    - "All nations same religion" — what happens?
    - "Player uses only disasters" — viable strategy?
    - "No trade routes form" — game still progresses?
    - "Nuclear war at year 1960" — handled correctly?
    - Each with: setup conditions, expected behavior, test priority (P0/P1/P2)

11. NAMING AND CONSISTENCY RESOLUTION:
    - Audit ALL design docs, types, and constants for naming mismatches
    - Produce a rename table (old name → new name)
    - Update src/types/game.ts with any fixes
    - Update src/config/constants.ts with any fixes

12. DEVICE TESTING MATRIX:
    - Target Android API level (minimum and target SDK)
    - Target iOS version (minimum)
    - 5-8 specific reference devices covering: low-end Android, mid-range Android, flagship Android, iPhone SE, iPhone 14/15, iPad (if supported later)
    - Screen sizes and aspect ratios to validate (16:9, 19.5:9, 20:9)
    - Performance pass/fail criteria per device (FPS, memory, load time)
    - Define a LOW-QUALITY rendering tier for low-end devices:
      - Particle count halved (see art-spec.md §11e)
      - Terrain micro-detail disabled (use flat fills instead of textured)
      - Ambient animations reduced (clouds off, vegetation sway off, only city glow + trade particles)
      - Max 3 simultaneous particle emitters (instead of 6)
      - Screen shake disabled
      - Detection: auto-detect via FPS sampling in first 30s; manual toggle in Settings

13. CORRUPTED SAVE RECOVERY:
    - How to detect a corrupted save (checksum, schema validation, try-parse)
    - Recovery strategy: fall back to last known good save, or offer fresh start
    - Save versioning: how to migrate saves when game updates change state shape
    - Maximum number of save slots / backup saves to maintain

14. PLAYTEST FRAMEWORK SPEC — Complete specification so a small model can build and run automated playtesting without creative decisions:

    a. AGENT PLAYER API CONTRACT:
       - Function signatures for src/playtest/agent-player.ts
       - Input: GameState + strategy profile ID → Output: PlayerAction (event choice, power cast, or wait)
       - The agent player is a pure function — NO LLM calls, NO creative judgment
       - Decision logic is a lookup table, not AI reasoning

    b. STRATEGY PROFILES AS DATA (JSON config, not code logic):
       - Define each profile as a JSON object with decision weights:
         ```
         { id: "aggressive",
           eventBias: { war: 0.9, peace: 0.1, neutral: 0.5 },
           powerPolicy: { blessingTarget: "military", disasterTarget: "rival_strongest", energyThreshold: 3 },
           castFrequency: "whenever_available" }
         ```
       - 7 profiles: aggressive, passive, hybrid, random, optimal, degenerate, no_input
       - Exact weights for each — the implementation agent just loads and follows them

    c. METRICS COLLECTOR SCHEMA:
       - Exact JSON shape for per-tick metrics log
       - Fields: tick, gameYear, era, populations[], religionShares[], warCount, activeTradeRoutes,
         scienceLevel, eventsFired, playerActions[], divineEnergy, hypocrisyLevel
       - File output format: one JSON file per run, named {seed}-{strategy}-{archetype}.json

    d. ANALYZER THRESHOLDS TABLE — Every criterion as a numeric check:
       | Criterion ID | Metric | Aggregation | Pass Min | Pass Max | Source |
       Example rows:
       | WIN_ARCHETYPE | winRate grouped by archetype | mean over 100+ runs | 0.25 | 0.45 | Stage 6 |
       | WIN_STRATEGY | winRate grouped by strategy | mean over 100+ runs | varies | varies | Stage 6 |
       | PACING_DEADZONE | maxGapBetweenPlayerActions per era | max across all runs | 0 | 120s | Stage 3 |
       | PACING_DENSITY | eventsPerEra[1-3] vs eventsPerEra[10-12] | ratio | 1.2 | 3.0 | 01-overview |
       | SCIENCE_PACE | defenseGridReached by year 2150 | % of hybrid runs | 0.50 | 1.0 | Stage 6 |
       | NO_DEGENERATE | max winRate for any commandment combo | max over 100 runs | 0 | 0.60 | Stage 6 |
       | RELIGION_DIVERSITY | religionsSurvivingToYear2000 >= 2 | % of all runs | 0.80 | 1.0 | Stage 4 |
       | EVENT_IMPACT | avgStateChange per event choice | mean | 0.01 | 1.0 | Stage 5 |
       | COMPLETION | runsWithCrashOrNaN | count | 0 | 0 | invariant |
       Fill ALL rows with exact thresholds from Stage 6 balance targets

    e. FIX PLAYBOOK — Deterministic fix rules (no judgment needed):
       For each criterion, define what to adjust if it fails:
       | Criterion | If too low | If too high | Constant to adjust | Step size |
       | WIN_ARCHETYPE | Buff archetype's commandment modifiers | Nerf archetype's modifiers | COMMANDMENT_MODIFIERS[archetype] | ±0.05 |
       | PACING_DEADZONE | Increase event base weight for sparse eras | Decrease event weight | EVENT_BASE_WEIGHT[era] | ±0.1 |
       | SCIENCE_PACE | Increase science speed multiplier | Decrease speed multiplier | SCIENCE_SPEED_MULT | ±0.05 |
       | NO_DEGENERATE | Nerf the dominant combo's strongest modifier | n/a | COMMANDMENT_MODIFIERS[combo] | -0.1 |
       | RELIGION_DIVERSITY | Increase religion resistance | Decrease resistance | RELIGION_RESISTANCE | ±0.05 |
       Fill ALL rows — every criterion must have a mechanical fix path

       Rules:
       - Always adjust constants (src/config/constants.ts) first
       - Only adjust formulas (docs/design/formulas.md) if 3 constant tweaks don't fix it
       - Never change system architecture — escalate to human if needed
       - Maximum step: 1 constant change per fix iteration
       - After each fix, re-run ALL criteria (not just the broken one) to catch regressions

    f. VISUAL TEST ASSERTIONS (Playwright, not screenshot review):
       Replace subjective "does it look right?" with programmatic checks:
       | Assertion | Playwright command | Pass condition |
       | FTUE_COMPLETES | Navigate splash→archetype→commandments→map, assert each selector exists | All selectors found in <180s |
       | ALL_SCREENS | Visit each screen URL/state, assert no error overlay | 0 errors |
       | MAP_RENDERS | Query canvas, sample 5 region center pixels | Pixel colors ≠ background (not blank) |
       | FPS_STABLE | Read performance.now() delta over 60 frames | Avg frame time < 33ms (30+ FPS) |
       | SAFE_AREA | Assert HUD elements within viewport minus safe-area-inset-* | No element outside safe area |
       | POWER_CAST | Trigger blessing via game API, assert VFX particle count > 0 | Particles spawned |
       | EVENT_DISPLAY | Trigger event via game API, assert event card DOM element visible | Element visible |
       Provide exact CSS selectors / Phaser scene query paths for each assertion
       These are standard Playwright tests — the implementation agent writes them like any other test

    g. RUN CONFIGURATION:
       - Headless: 1000 games total — 20 curated (from monte-carlo-scenarios.json) + 3 seeds × 3 archetypes × 6 strategies = 54 specific + 926 randomized
       - Visual: 10 Playwright test runs covering FTUE + 2 eras of play
       - npm scripts: `npm run playtest:headless`, `npm run playtest:visual`, `npm run playtest:all`
       - Output: playtest-report.md auto-generated from analyzer

15. CROSS-STAGE CONSISTENCY AUDIT — Before presenting Sign-Off Summary:
    - Run `scripts/audit-consistency.sh` (or manually check if script doesn't exist yet)
    - Verify ALL of the following:
      a. Every constant name in API contracts exists in constants.ts
      b. Every type in API contracts exists in game.ts
      c. Every commandment ID in test specs matches 03-commandments.md
      d. Every power ID in test specs matches 06-divine-powers.md BLESSINGS/DISASTERS
      e. Analyzer threshold win rate ranges match Stage 6 Decision Point choices
      f. Fix playbook constant names exist in constants.ts
      g. Monte Carlo spec references `docs/design/monte-carlo-scenarios.json` (not inline prose)
      h. Module file map paths are consistent with docs/INDEX.md CODE routing table
    - List ALL mismatches found and fix them before Sign-Off
    - If zero mismatches: state "Consistency audit passed" in Sign-Off Summary

Update these files:
- ALL docs/implementation/phase-*.md — Add exact specs from this stage
- src/types/game.ts — Fix missing fields, naming
- src/config/constants.ts — Fix naming
- Create new file: docs/design/test-spec.md — All test specs, invariants, edge cases, AND playtest framework spec
- Add Phase 7 to docs/implementation/ — Playtest harness implementation (from spec 14 above)

Quality gate: An agent can implement every module — including the entire playtest harness — by reading its API contract + test spec and writing code to pass the tests. Zero ambiguity. Zero judgment calls. Zero creative decisions left for the implementation agent.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **State management style:** Immutable state (new object each tick — safe, memory-heavy) / Mutable state with deep-clone on save (fast, risky) / Immer-style proxies (safe writes, moderate overhead) | Affects every simulation module's API contract and testing approach. |
| 2 | **Save format:** Raw JSON serialization / Compressed JSON (LZ-string) / Structured binary (MessagePack) | Tradeoff between save file size, read/write speed, and debuggability. |
| 3 | **Target device baseline:** iPhone SE 2 / iPhone 12 / iPhone 14 (and Android equivalents) | Sets the performance budget — CPU, memory, GPU. Lower baseline = more constraints on region count, particle effects, tick frequency. |
| 4 | **Test coverage target:** Critical paths only (~60%) / Comprehensive (~80%) / Exhaustive (~95%) | More coverage = more confidence but dramatically more spec-writing and maintenance burden. |
| 5 | **Module architecture:** Pure functions only (functional) / Class-based services (OOP) / Mix (pure simulation + class-based rendering) | Affects how modules compose, how state flows, and how agents understand the codebase. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., specific performance targets, file naming conventions)
3. **Biggest risk** — which architectural decision is most likely to need revision during implementation?
4. **Open question** — "Review the module dependency graph. Does anything look circular or overcoupled?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| ALL `docs/design/*.md` | Complete game design |
| ALL `docs/implementation/*.md` | Current implementation plan |
| `docs/design/event-index.json` | Machine-readable event data (all 80 events) |
| `docs/design/monte-carlo-scenarios.json` | 20 test scenarios from Stage 6 |
| `src/types/game.ts` | Type definitions |
| `src/config/constants.ts` | Constants |
| `docs/design/formulas.md` | All formulas |

## Output Files (Modified/Created)

| File | What changes |
|------|-------------|
| `docs/implementation/phase-0.md` - `phase-6.md` | Exact specs added |
| `docs/implementation/phase-7.md` | **NEW** — Playtest harness implementation phase |
| `src/types/game.ts` | Naming fixes, missing fields |
| `src/config/constants.ts` | Naming fixes |
| `docs/design/test-spec.md` | **NEW** — All test specs, invariants, edge cases, AND playtest framework spec |

## Quality Gate

- [ ] Tick architecture has mermaid diagram with data flow
- [ ] World gen is step-by-step with types at each step
- [ ] Save/load serialization handles Maps and complex types
- [ ] Performance budget has specific numbers for mobile
- [ ] Every module has a file path and API contract
- [ ] Every module has specific test cases (input → expected output)
- [ ] 20+ simulation invariants defined
- [ ] 30+ edge cases cataloged with expected behavior
- [ ] All naming mismatches between docs/types/constants resolved
- [ ] Playtest agent player has API contract and function signatures
- [ ] 7 strategy profiles defined as JSON data (weights, not logic) — including no_input
- [ ] Analyzer thresholds table has exact min/max for every criterion
- [ ] Fix playbook maps every criterion failure to a specific constant + step size
- [ ] Visual assertions defined as Playwright selectors (not screenshot review)
- [ ] Phase 7 implementation doc created for playtest harness
- [ ] All API contract types match game.ts (verified by consistency audit)
- [ ] Analyzer thresholds reference valid criterion IDs that match Stage 6 targets
- [ ] Fix playbook constant names exist in constants.ts (verified by consistency audit)
- [ ] Monte Carlo spec references `monte-carlo-scenarios.json` from Stage 6 (not prose copy)
- [ ] Verification subagent passed (see pipeline INDEX — Verification Subagent Protocol)
- [ ] Consistency audit passed (`scripts/audit-consistency.sh`)
- [ ] All changes follow design-change protocol
