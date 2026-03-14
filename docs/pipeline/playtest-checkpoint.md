# Playtest Checkpoint — Automated Validation

> **Goal:** Implement the playtest framework (designed in Stage 8) and run it until all criteria pass. This is a mechanical process — the framework spec, thresholds, fix playbook, and visual assertions were all defined during Stage 8. No creative decisions remain. A small model executes this.
>
> **Estimated duration:** Part of implementation (Phase 7). Runs after Phase 6 (Polish).
>
> **Depends on:** Stage 8 (playtest framework spec in `docs/design/test-spec.md`) + Phases 0-6 complete (game must be playable)
>
> **This is NOT optional.** The Prototype Checkpoint validated raw simulation math. This checkpoint validates the full player experience — with rendering, UI, events, powers, and the complete game loop.

---

## Why This Doesn't Need a Capable Model

Everything creative was decided in the design pipeline:

| What | Decided in | Small model does |
|------|-----------|-----------------|
| Strategy profiles (aggressive, passive, etc.) | Stage 8 — JSON config with exact weights | Load JSON, follow weights |
| Pass/fail thresholds (win rate 25-45%, etc.) | Stage 8 — exact min/max per criterion | Compare number to range |
| Fix playbook (if win rate too high → nerf modifier by 0.05) | Stage 8 — deterministic table | Look up fix, apply it |
| Visual assertions (FTUE completes, FPS > 30, etc.) | Stage 8 — Playwright selectors + conditions | Run Playwright test |
| Event choice logic | Stage 8 — strategy weight tables | Weighted random from table |
| Power cast logic | Stage 8 — target policy per strategy | Follow policy |
| Max fix iterations | Stage 8 — hardcoded to 5 | Count iterations |

The implementation agent just builds code from the API contracts in `docs/design/test-spec.md` (deliverable 14) and runs it — exactly the same as implementing any other module.

---

## Implementation: Phase 7

This is implemented as Phase 7 in the implementation plan. The agent reads Stage 8's playtest framework spec and builds:

### Files to Create

| File | Implements spec from | Purpose |
|------|---------------------|---------|
| `src/playtest/agent-player.ts` | Stage 8 §14a | Pure function: GameState + strategyId → PlayerAction |
| `src/playtest/profiles.ts` | Stage 8 §14b | Loads strategy profile JSON (7 profiles with decision weights, including no_input) |
| `src/playtest/metrics-collector.ts` | Stage 8 §14c | Collects per-tick metrics to JSON log |
| `src/playtest/analyzer.ts` | Stage 8 §14d | Reads logs, checks each criterion against threshold table |
| `src/playtest/fix-runner.ts` | Stage 8 §14e | Reads fix playbook, applies constant adjustments |
| `src/playtest/runner.ts` | Stage 8 §14g | Orchestrates batch runs (1000 headless + 10 visual) |
| `src/playtest/report.ts` | — | Generates playtest-report.md from analyzer output |
| `src/playtest/__tests__/` | — | Tests for the playtest harness itself |
| `e2e/playtest-visual.spec.ts` | Stage 8 §14f | Playwright assertions (FTUE, FPS, rendering, safe area) |
| `src/playtest/profiles.json` | Stage 8 §14b | Strategy profile data (7 profiles, loaded at runtime) |

### npm Scripts

```json
{
  "playtest:headless": "Run 1000 headless games, output playtest-report.md",
  "playtest:visual": "Run Playwright visual assertions",
  "playtest:all": "Run headless + visual, combined report",
  "playtest:fix": "Run headless, apply fix playbook if criteria fail, re-run (max 5 iterations)"
}
```

---

## The Fix Loop (Fully Mechanical)

```
         ┌───── Apply fix from playbook table ◄────┐
         │      (look up criterion → constant →     │
         │       direction → step size)              │
         ▼                                           │
   npm run playtest:headless                         │
         │                                           │
         ▼                                           │
   Analyzer checks each criterion                    │
   against threshold table                           │
         │                                           │
         ├── ALL PASS ──► Generate report ──► Done    │
         │                                           │
         └── ANY FAIL ──► Iteration < 5? ────────────┘
                              │
                              NO (iteration = 5)
                              │
                              ▼
                     Generate report with
                     UNRESOLVED failures
                     (human reviews later)
```

**No judgment calls in the loop.** The fix playbook from Stage 8 §14e tells the agent exactly:
- Which constant to change
- Which direction (increase or decrease)
- By how much (step size)
- After how many failed attempts to stop (5)

The agent applies the fix, re-runs `npm test` to check for regressions, then re-runs the playtest. Repeat.

---

## Validation Criteria

These are copied directly from Stage 8 §14d (the analyzer thresholds table). The implementation agent codes them as numeric comparisons — no interpretation needed.

### Headless (1000 runs)

| Criterion ID | What it checks | Pass range |
|-------------|----------------|------------|
| WIN_ARCHETYPE | Win rate per archetype | 25-45% each |
| WIN_STRATEGY | Win rate per strategy profile | Aggressive 30-40%, Passive 30-40%, Hybrid 40-50%, Random 15-25% |
| PACING_DEADZONE | Longest gap between player actions per era | < 120 seconds |
| PACING_DENSITY | Event density ratio (early eras vs late eras) | 1.2x to 3.0x |
| SCIENCE_PACE | % of hybrid runs reaching Defense Grid by 2150 | > 50% |
| NO_DEGENERATE | Max win rate for any single commandment combo | < 60% |
| RELIGION_DIVERSITY | % of runs with 2+ religions surviving to year 2000 | > 80% |
| EVENT_IMPACT | Average state change per event choice | > 1% |
| COMPLETION | Runs with crash, NaN, or infinite loop | 0 |

### Visual (Playwright)

| Assertion ID | What it checks | Pass condition |
|-------------|----------------|---------------|
| FTUE_COMPLETES | Navigate full onboarding flow | All selectors found in < 180s |
| ALL_SCREENS | Visit every screen state | No error overlays, no blank screens |
| MAP_RENDERS | Sample region center pixels on canvas | Colors ≠ background |
| FPS_STABLE | Frame time over 60 frames | Average < 33ms (30+ FPS) |
| SAFE_AREA | HUD element positions | Within viewport minus safe-area-inset |
| POWER_CAST | Trigger blessing, check VFX | Particle count > 0 |
| EVENT_DISPLAY | Trigger event, check card | Event card DOM element visible |

---

## Output

| Deliverable | Description |
|-------------|-------------|
| `src/playtest/` | Complete playtest harness (all files above) |
| `src/playtest/profiles.json` | 7 strategy profiles as data (including no_input) |
| `e2e/playtest-visual.spec.ts` | Playwright visual assertions |
| `playtest-report.md` | Auto-generated: pass/fail per criterion + data tables |
| `playtest-changelog.md` | Fix loop iterations (if any fixes were applied) |
| Updated `src/config/constants.ts` | If fix playbook adjusted any constants |
| Updated `docs/design/constants.md` | Kept in sync with constants.ts |

---

## When Human Review IS Needed

The small model escalates to human only if:

1. **5 fix iterations exhausted** — the fix playbook couldn't resolve a criterion. The report shows which criterion is stuck and what was tried.
2. **Regression loop** — fixing criterion A breaks criterion B, and fixing B breaks A. The report flags the conflict.
3. **Visual assertion can't be written** — a rendering issue that Playwright selectors can't detect (rare with the assertions defined in Stage 8).

These are edge cases, not the normal flow. In the normal case, the small model runs the harness, checks numbers, applies fixes, and produces a passing report — no human in the loop.
