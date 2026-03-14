# Session 4 Summary — Phase 1c Divine & Progression

## Test Results
- `npx vitest run` (full suite): **PASS** — 247 passing, 0 failing across 15 test files.
- Session 4 files specifically: **92 tests** across 5 new test files (16 events + 15 science + 20 divine + 16 whispers + 25 combos).

## Files Created

### `src/simulation/events.ts`
- `rollEvents(state, rng)`: Weighted random event selection from `EventTemplate[]`, era-range eligibility, cooldown discounts (2nd fire 0.25×, 3rd+ 0.05×), queue-based ordering, and auto-resolution when queue overflows `SPEED.EVENT_QUEUE_MAX`.
- `resolveEvent(state, eventId)`: Marks event as resolved (removes from active queue, sets resolved timestamp, applies placeholder effect).

### `src/simulation/__tests__/events.test.ts`
16 tests covering: weighted selection, era eligibility, cooldown discounts, roll intervals, queue overflow auto-resolution, and resolveEvent behavior.

### `src/simulation/science.ts`
- `tickScience(state)`: Iterates SCIENCE_MILESTONES in order, checks dev/nations requirements and special conditions, unlocks milestones sequentially. Handles defense grid construction timing (100 ticks after `planetary_defense`). `planetary_defense` bypasses the `nationsRequired` check when Condition B (1 superpower Dev 12) is met via `checkSpecialCondition`.
- `computeGlobalScienceMod(state)`: Returns a modifier in `[MOD_MIN, MOD_MAX]` based on active wars and trade routes.
- `checkNuclearDeterrence(state, idA, idB)`: Returns `0.50×` war modifier when both nations have `nuclear_power` milestone and Dev ≥ 8.
- `resetGridTracker(seed)`: Clears the module-level defense grid construction timer (used in tests).

### `src/simulation/__tests__/science.test.ts`
15 tests covering: all 10 milestone unlock conditions (including `internet` peace check, `space_programs` cooperation, `planetary_defense` Condition B superpower), global science modifier formula, nuclear deterrence, and defense grid 100-tick construction.

### `src/simulation/divine.ts`
- `castPower(state, powerId, regionId)`: Validates power unlock, cooldown, and energy; deducts cost; pushes `ActiveEffect` onto region; applies instant effects (Miracle +0.40 conversion, Earthquake 0.60 devastation); calls `checkHypocrisy` before returning.
- `checkHypocrisy(state, powerId)`: Compares cast power against active commandments via `getCommandmentById`; accumulates `hypocrisyLevel` by severity (`mild` +0.05, `moderate` +0.10, `severe` +0.20).
- `tickDivineEffects(state, deltaYears)`: Expires `ActiveEffect`s whose `endYear ≤ currentYear`, decays `hypocrisyLevel` by `HYPOCRISY.DECAY_PER_YEAR × deltaYears`.
- `isPowerUnlocked(state, powerId)`: Checks `POWER_UNLOCK` thresholds (Earthquake requires `blessingsUsed ≥ 3`, Plague requires Dev ≥ 5 on 2+ nations).

### `src/simulation/__tests__/divine.test.ts`
20 tests covering: energy deduction, insufficient energy rejection, cooldown setting, `ActiveEffect` lifetime, instant effects (Miracle conversion, Earthquake devastation), hypocrisy accumulation by severity, decay, multiple violations, `isPowerUnlocked` thresholds, and the `castPower → checkHypocrisy` chain.

### `src/simulation/whispers.ts`
- `castWhisper(state, regionId, whisperType, currentTimeSec?)`: Checks global (10s) and per-region-per-type (30s) cooldowns; applies `AI_NUDGE_STRENGTH (0.15)` plus compound stacking bonus (up to 3 stacks × 0.05); caps at `NUDGE_CAP (0.30)`; grants `LOYALTY_BONUS (0.02)` to voices in the region; cancels `discord` effects for peace whispers.
- `tickWhispers(state, deltaRealSeconds)`: Advances `realTimeElapsed`, resets compound stacks (stacks expire each tick as AI reads weights at decision time).

### `src/simulation/__tests__/whispers.test.ts`
16 tests covering: global and regional cooldowns, nudge base strength, compound stacking (up to 3 stacks), loyalty bonus, Discord cancellation via peace whisper, and observable AI weight increase (test sets `science = 0.5` to avoid hitting the 1.0 cap).

### `src/simulation/combos.ts`
- `checkAndApplyCombos(state, powerId, regionId)`: Checks all 9 MVP combos after each power cast; triggers window-based combos (Shield+Miracle, Quake+Plague), stat-crossing combos (Growth Surge, Peace Wave, Faith+Science), and logs `PivotalMoment` entries.
- `applyExpiredComboEffects(state)`: Placeholder for combo duration expiry (extension point for Phase 1d runner).
- Full implementations for: Shield Wall Fortify, Divine Plague, Growth Surge, Faith Surge, Science Surge, Peace Wave, Quake Scatter, Holy Crusade, Dual Blessing.

### `src/simulation/__tests__/combos.test.ts`
25 tests (2 more than the 23 specified, covering additional edge cases): all 9 combo trigger conditions and their direct effects, no-trigger conditions, and `applyExpiredComboEffects` smoke test.

## Bugs Fixed During Session

1. **Immer MapSet plugin** — Added `import './immer-config.js'` to all 5 new modules. Immer's Map/Set support requires `enableMapSet()` to be called before using Maps/Sets in `produce()`.
2. **`castPower` missing `checkHypocrisy` call** (`DIV_016`) — `castPower` captured the `produce` result into `result` and called `return checkHypocrisy(result, powerId)`. Originally had a dangling `return` after `produce(...)`.
3. **`planetary_defense` `nationsRequired` bypass** (`SCI_006`) — The `nationsRequired = 5` check in `tickScience` blocked Condition B (1 superpower). Fixed by moving the special condition check before the nationsRequired check and skipping nationsRequired for `planetary_defense` when `specialMet` is true.
4. **`COMBO_010` army presence assumption** — The initial state from `createInitialGameState` may place a starting army in the first land region. Fixed by searching for a region without an army before setting up the "no army" scenario.
5. **`WHIS_015` aiWeights cap** (`WHIS_015`) — Nations start with `aiWeights.science = 1.0` (max). The test now sets `science = 0.5` before casting so the nudge increment is observable.

## Known Gaps
- `applyExpiredComboEffects` is a placeholder; combo duration handling is expected to be fleshed out in Phase 1d (runner integration).
- `resolveEvent` applies a placeholder effect; event-specific effect application (popGrowth, faith modifiers, etc.) is deferred to Phase 1d when the runner wires up the event resolution loop.
- Defense grid construction uses a module-level `Map<seed, tick>` side-channel. This is intentional for simulation purity but means `resetGridTracker` must be called between test cases.

## Decision Points for Human
- The `checkSpecialCondition` special-case logic for `planetary_defense` deviates from a strictly table-driven approach. If more milestones need bypass logic in future content, consider a `bypassNationsRequired?: boolean` flag in the milestone config.
- Combo `COMBO_005` (Growth Surge) triggers on `miracle` cast; its test checks global `economicOutput` sum increase. If `economicOutput` is recomputed each tick from region pops (rather than stored directly), the combo effect may need to store a temporary modifier instead.
