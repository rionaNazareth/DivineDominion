# Phase 0 — Foundation

> Prerequisites: None. Start here.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [constants.md](../design/constants.md) · [03-commandments](../design/03-commandments.md) · [06-divine-powers](../design/06-divine-powers.md)

---

## Reading List

Before starting, read these files:

- **Types:** `src/types/game.ts` — all type definitions
- **Design:** `docs/design/constants.md` — all numerical values
- **Design:** `docs/design/03-commandments.md` — commandment system
- **Design:** `docs/design/06-divine-powers.md` — divine powers, whispers, combos
- **Design:** `docs/design/14-harbinger.md` — Harbinger types and constants
- **Design:** `docs/design/13-follower-voices.md` — voice types
- **Formulas:** `docs/design/formulas.md` — "Seeded PRNG Specification" section (for task 0.9)

---

## 0.1 Project Setup

Add dependencies to the existing project and configure build tooling.

The project already exists with `package.json`, `tsconfig.json`, and `src/`. Do NOT run `npm create vite` — add to the existing project.

```bash
npm install phaser immer lz-string d3-delaunay simplex-noise
npm install -D vitest @vitest/coverage-v8 @playwright/test tsx @types/node
npm install @capacitor/core @capacitor/cli && npx cap init
```

- Configure `tsconfig.json`: strict mode, path aliases if desired
- Configure `vitest.config.ts`: include `src/**/*.test.ts`, globals if used
- Add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"dev": "vite"`, `"build": "vite build"`
- Add ESLint rule to ban `Math.random` (but NOT other `Math.*` functions) in `src/simulation/`:

```json
{
  "overrides": [{
    "files": ["src/simulation/**/*.ts"],
    "rules": {
      "no-restricted-syntax": ["error", {
        "selector": "MemberExpression[object.name='Math'][property.name='random']",
        "message": "Use src/simulation/prng.ts for all randomness in simulation code. Math.random is non-deterministic."
      }]
    }
  }]
}
```

If ESLint is not yet configured, create a minimal `.eslintrc.json` with this rule. Note: `Math.floor`, `Math.min`, etc. are still allowed — only `Math.random` is banned.

---

## 0.2 Types Verification

Verify `src/types/game.ts` compiles and all types are exported.

- Run `npx tsc --noEmit` — must pass
- No changes to existing type shapes unless design docs require it

---

## 0.3 Constants

Create `src/config/constants.ts` with all numerical values from `docs/design/constants.md`.

Export named constants for: TIME, DIVINE ENERGY, BLESSINGS, DISASTERS, WORLD GENERATION, NATIONS, COMMANDMENTS, HYPOCRISY, SCIENCE MILESTONES, WIN CONDITIONS, LLM. No magic numbers elsewhere.

---

## 0.4 Commandment Definitions

Create `src/config/commandments.ts` — export all 50 commandment definitions (35 base + 15 unlockable) as typed data.

- Import `Commandment`, `CommandmentCategory`, `CommandmentEffects` from `src/types/game.ts`
- Each commandment: `id`, `category`, `name`, `flavorText`, `effects`, `tensionsWith`, optional `unlockCondition`
- The 15 unlockable commandments have `unlockCondition` set (e.g., era requirement, science milestone)
- Source: `docs/design/03-commandments.md` — contains all 50 commandments
- Export `BASE_COMMANDMENTS: Commandment[]` (35 base), `UNLOCKABLE_COMMANDMENTS: Commandment[]` (15 unlockable), `ALL_COMMANDMENTS: Commandment[]` (all 50), and `getCommandmentById(id: CommandmentId): Commandment | undefined`

---

## 0.5 Divine Power Definitions

Create `src/config/powers.ts` — export all 12 divine power definitions (6 blessings + 6 disasters).

- Import `DivinePower`, `PowerId` from `src/types/game.ts`
- Blessings: Bountiful Harvest, Inspiration, Miracle, Prophet, Shield of Faith, Golden Age
- Disasters: Earthquake, Great Flood, Plague, Great Storm, Famine, Wildfire
- Each: `id`, `name`, `type`, `cost`, `cooldownMinutes`, `durationGameYears`, `description`
- Export `ALL_POWERS: DivinePower[]` and `getPowerById(id: PowerId): DivinePower | undefined`

---

## 0.5b Combo Definitions

Create `src/config/combos.ts` — export all 9 power combo definitions (8 standard + Divine Purge).

- Import `PowerCombo`, `PowerComboId`, `PowerId` from `src/types/game.ts`
- Source: `docs/design/formulas.md` Deliverable 15 "Power Combo Formulas" — contains all 9 combos with trigger conditions and effects
- Each combo: `id`, `name`, `triggerPowers` (which powers activate it), `condition` (world state check), `effect` (what happens)
- Combos: inspire_prophet, shield_miracle (Divine Purge), quake_scatter, flood_famine, plague_trade, storm_fleet, wildfire_rebirth, famine_exodus, golden_inspire
- Export `ALL_COMBOS: PowerCombo[]` and `getComboById(id: PowerComboId): PowerCombo | undefined`

---

## 0.6 Stage 2B Types

Add these new types to `src/types/game.ts`:

**Existing plan:** `WhisperType`, `DivineWhisper`, `PowerComboId`, `PowerCombo`, `VoiceType`, `FollowerVoice`, `Petition`.

**Additional types to add:**

- `NationAIWeights` — `{ war: number; peace: number; science: number; faith: number }`. Represents whisper-influenced decision weights per nation.
- Add `aiWeights: NationAIWeights` field to the `Nation` interface. Default value: `{ war: 0.25, peace: 0.25, science: 0.25, faith: 0.25 }`.
- `WhisperState` — tracks per-region per-type cooldowns, global cooldown timestamp, and compound stacking count per nation. See `docs/design/formulas.md` Deliverable 14 for field definitions.
- `ComboWindowState` — tracks power cast timestamps for the shield+miracle 120-second combo window check. See `docs/design/formulas.md` Deliverable 15 for field definitions.
- Add `whisperState: WhisperState` and `comboWindowState: ComboWindowState` fields to `GameState` (or `DivineState`, whichever holds operational state for divine mechanics).

---

## 0.7 Stage 2B Constants

Add new constants to `src/config/constants.ts`: `WHISPER_*`, `COMBO_*`, `VOICE_*`, `PETITION_*`, `UNLOCK_ERA_*`, `FAB_*`.

---

## 0.8 Harbinger Types and Constants

- Add Harbinger types to `src/types/game.ts`: `HarbingerActionType`, `HarbingerActionLog`, `HarbingerState`, `HarbingerStrategyAssessment`, sabotage action types
- Add Harbinger constants to `src/config/constants.ts` (already added — verify sync)

---

## 0.9 PRNG Utility

Create `src/simulation/prng.ts` — the seeded pseudo-random number generator used by ALL simulation modules.

**Implementation:** Follow the exact algorithm from `docs/design/formulas.md` "Seeded PRNG Specification":

- `mulberry32(seed: number)` — returns a function that produces the next random number in [0, 1)
- `createPRNG(seed: number)` — creates a PRNG instance with call counter tracking
- `seededRandom(worldSeed: number, tick: number, callIndex: number)` — deterministic random from seed+tick+callIndex
- Auto-incrementing call counter that resets at each tick start
- Entity processing must use sorted IDs for deterministic iteration order

**Export:** `createPRNG`, `seededRandom`, `mulberry32`

**Test:** `src/simulation/__tests__/prng.test.ts` — determinism smoke test: same seed+tick+callIndex always produces same output, different seeds produce different output, call counter increments correctly.

---

## 0.10 Data Integrity Validation Tests

Create `src/simulation/__tests__/data-integrity.test.ts` — validates all configuration data at compile/test time.

**Tests:**
- Commandment count equals 50 (35 base + 15 unlockable)
- Power count equals 12 (6 blessings + 6 disasters)
- Every tension pair is bidirectional (if A tensions with B, B tensions with A)
- All constant values are within expected ranges (no negatives where positives expected, etc.)
- PRNG determinism: `createPRNG(42)` called 10 times always produces the same sequence
- No duplicate IDs in commandments, powers, or any config array
- All PowerId values referenced in combo definitions exist in `ALL_POWERS`

---

## Phase 0 Completion Checkpoint

- [x] `npm test` passes
- [x] `npx tsc --noEmit` passes
- [x] All types from design docs present in `game.ts` (including NationAIWeights, WhisperState, ComboWindowState)
- [x] All constants from `constants.md` present in `constants.ts`
- [x] 50 commandments defined in `commandments.ts`
- [x] 12 powers defined in `powers.ts`
- [x] PRNG utility with mulberry32 in `prng.ts`
- [x] Data integrity tests pass
- [x] No `Math.random` in `src/simulation/` (ESLint rule enforces this)
- [x] Harbinger types and constants present
