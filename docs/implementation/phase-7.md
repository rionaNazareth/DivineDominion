# Phase 7 — Playtest Harness

> Prerequisites: Phase 6 complete.
> Cross-references: [OVERVIEW](OVERVIEW.md) · [test-spec §14](../design/test-spec.md#§14-playtest-framework-spec) · [monte-carlo-scenarios.json](../design/monte-carlo-scenarios.json)

---

**Core principle:** Automated playtesting with zero creative decisions. Agent player is a pure function. Strategy profiles are JSON data. Analyzer uses exact thresholds from §14d.

---

## Reading List

Read these before writing any code:

- **Types:** `src/types/game.ts` — `GameState`, `PlayerAction`, `StrategyProfile`
- **Test spec:** `docs/design/test-spec.md` — read these sections:
  - §14 Playtest Framework Spec (all subsections: §14a Agent Player, §14b Profiles, §14c Metrics, §14d Criteria, §14e Fix Playbook, §14f Visual Tests, §14g Runner)
  - §9 Monte Carlo Validation Spec
- **Design:** `docs/design/monte-carlo-scenarios.json` — 20 curated scenarios

**Session 12 (tasks 7.1–7.4):** Focus on §14a, §14b, §14c, §14g. First step: add `TickMetrics`, `RunResult`, `RunSummary` types to `game.ts`.
**Session 13 (tasks 7.5–7.8):** Focus on §14d, §14e, §14f. Import shared types from `game.ts`.

---

## 7.1 Agent Player

**File:** `src/playtest/agent-player.ts`  
**Spec:** test-spec.md §14a

Implement `decideAction(state: GameState, profile: StrategyProfile): PlayerAction`.

- Pure function — NO LLM, NO creative judgment
- Decision logic: lookup table based on profile weights
- Action types: `cast_power`, `cast_whisper`, `event_choice`, `fulfill_petition`, `deny_petition`, `wait`
- Import types from `src/types/game.ts`

**Test gate:** Unit tests for each strategy profile — given state, returns valid action.

---

## 7.2 Strategy Profiles

**File:** `src/playtest/profiles.json`  
**Spec:** test-spec.md §14b

Create JSON file with 7 profiles: aggressive, passive, hybrid, random, optimal, degenerate, no_input. The `no_input` profile always returns `{ type: 'wait' }` — used for `WIN_RATE_NO_INPUT` validation.

```json
[
  {
    "id": "aggressive",
    "eventBias": { "war": 0.9, "peace": 0.1, "science": 0.3, "faith": 0.5, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "military",
      "disasterTarget": "rival_strongest",
      "energyThreshold": 3,
      "preferDisasters": true
    },
    "whisperPolicy": { "primary": "war", "secondary": "faith", "frequency": 0.8 },
    "petitionPolicy": { "fulfill_military": true, "fulfill_faith": true, "deny_peace": true },
    "castFrequency": "whenever_available"
  },
  {
    "id": "passive",
    "eventBias": { "war": 0.1, "peace": 0.9, "science": 0.7, "faith": 0.7, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "highest_faith",
      "disasterTarget": "never",
      "energyThreshold": 5,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "peace", "secondary": "science", "frequency": 0.5 },
    "petitionPolicy": { "fulfill_military": false, "fulfill_faith": true, "deny_peace": false },
    "castFrequency": "energy_above_threshold"
  },
  {
    "id": "hybrid",
    "eventBias": { "war": 0.5, "peace": 0.5, "science": 0.6, "faith": 0.5, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "weakest_player_region",
      "disasterTarget": "rival_at_war",
      "energyThreshold": 4,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "science", "secondary": "faith", "frequency": 0.6 },
    "petitionPolicy": { "fulfill_military": true, "fulfill_faith": true, "deny_peace": false },
    "castFrequency": "energy_above_threshold"
  },
  {
    "id": "random",
    "eventBias": { "war": 0.5, "peace": 0.5, "science": 0.5, "faith": 0.5, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "random",
      "disasterTarget": "random",
      "energyThreshold": 2,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "random", "secondary": "random", "frequency": 0.5 },
    "petitionPolicy": { "fulfill_military": true, "fulfill_faith": true, "deny_peace": true },
    "castFrequency": "random"
  },
  {
    "id": "optimal",
    "eventBias": { "war": 0.4, "peace": 0.6, "science": 0.8, "faith": 0.6, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "lowest_dev_player",
      "disasterTarget": "highest_dev_rival",
      "energyThreshold": 4,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "science", "secondary": "peace", "frequency": 0.7 },
    "petitionPolicy": { "fulfill_military": true, "fulfill_faith": true, "deny_peace": false },
    "castFrequency": "energy_above_threshold"
  },
  {
    "id": "degenerate",
    "eventBias": { "war": 0.1, "peace": 0.1, "science": 1.0, "faith": 0.1, "neutral": 0.5 },
    "powerPolicy": {
      "blessingTarget": "highest_dev_player",
      "disasterTarget": "never",
      "energyThreshold": 6,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "science", "secondary": "science", "frequency": 1.0 },
    "petitionPolicy": { "fulfill_military": false, "fulfill_faith": false, "deny_peace": false },
    "castFrequency": "energy_above_threshold"
  },
  {
    "id": "no_input",
    "eventBias": "n/a",
    "powerPolicy": {
      "blessingTarget": "none",
      "disasterTarget": "none",
      "energyThreshold": 999,
      "preferDisasters": false
    },
    "whisperPolicy": { "primary": "none", "secondary": "none", "frequency": 0 },
    "petitionPolicy": { "fulfill_military": false, "fulfill_faith": false, "deny_peace": false },
    "castFrequency": "never"
  }
]
```

**Test gate:** JSON parses and all 7 profiles exist.

---

## 7.3 Metrics Collector

**File:** `src/playtest/metrics-collector.ts`  
**Spec:** test-spec.md §14c

Implement `TickMetrics` and `RunResult` / `RunSummary` interfaces. Collect per-tick metrics, sample every 10 ticks. Write one JSON file per run to `playtest-results/{seed}-{strategy}-{archetype}.json`.

**Shared schema note:** The `TickMetrics`, `RunResult`, and `RunSummary` types are defined in test-spec §14c but not yet in `game.ts`. Tasks 7.1–7.4 (Session 12) must add these types to `src/types/game.ts` as a first step. Tasks 7.5–7.8 (Session 13) import them from `game.ts`. The metrics collector must validate data against the schema before writing JSON. The analyzer (7.5) must validate before reading.

**Test gate:** Run collector on one game, verify output JSON matches schema.

---

## 7.4 Headless Runner

**File:** `src/playtest/runner.ts`  
**Spec:** test-spec.md §9, §14g

- Run 1000 games: 20 curated (from `monte-carlo-scenarios.json`, fast-fail) + 54 specific + 926 randomized
- Use `runSimulationTick()` in loop (1200 ticks per game)
- No Phaser, no browser — pure Node.js
- Input: scenario config (seed, archetype, commandments, strategy profile)
- Output: per-run JSON via metrics collector

**Test gate:** Run 10 games (reduced), verify 10 JSON files in `playtest-results/`.

---

## 7.5 Analyzer

**File:** `src/playtest/analyzer.ts`  
**Spec:** test-spec.md §14d

Read all JSON files from `playtest-results/`. Compute pass/fail per criterion from §14d thresholds table. Output `playtest-report.md` with pass/fail summary.

**Test gate:** Run analyzer on 100 pre-generated results, verify output format.

---

## 7.6 Fix Playbook

**File:** `src/playtest/fix-playbook.ts` (or logic in analyzer)  
**Spec:** test-spec.md §14e

Implement automated fix logic: for each criterion failure, apply the constant adjustment from §14e. Max 1 constant change per iteration. Re-run all criteria after each fix.

**Test gate:** Given a failing criterion, verify fix logic suggests correct constant.

---

## 7.7 Visual Tests

**File:** `src/playtest/__tests__/visual.spec.ts` (Playwright)  
**Spec:** test-spec.md §14f

Implement 10 Playwright tests covering FTUE, all screens, map render, FPS, safe area, power cast, event display, overlay toggle, era transition, whisper cast.

**Test gate:** `npm run playtest:visual` — all 10 pass.

---

## 7.8 npm Scripts

**File:** `package.json`  
**Spec:** test-spec.md §14g

Add scripts:

```json
{
  "playtest:headless": "tsx src/playtest/runner.ts",
  "playtest:visual": "playwright test src/playtest/__tests__/visual.spec.ts",
  "playtest:all": "npm run playtest:headless && npm run playtest:visual"
}
```

**Test gate:** `npm run playtest:headless` — runs 1000 games; `npm run playtest:visual` — runs 10 Playwright tests.

---

## Phase 7 Completion Checkpoint

- [ ] Agent player: `decideAction()` implemented, unit tests pass
- [ ] Strategy profiles: `profiles.json` with 7 profiles (including `no_input`)
- [ ] Metrics collector: `RunResult` and `RunSummary` written per run
- [ ] Headless runner: 1000 games, output to `playtest-results/`
- [ ] Analyzer: reads all runs, outputs `playtest-report.md` with §14d criteria
- [ ] Fix playbook: automated fix logic per §14e
- [ ] Visual tests: 10 Playwright assertions per §14f
- [ ] npm scripts: `playtest:headless`, `playtest:visual`, `playtest:all`

All §14d criteria pass → Phase 7 complete. Proceed to Stage 9: Ship Readiness.
