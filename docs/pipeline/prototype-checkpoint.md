# Prototype Checkpoint

> **Goal:** Build a text-only simulation and validate that the core systems work before investing in content, balance, art, and audio design.
>
> **Estimated sessions:** 1-2
>
> **Depends on:** Stages 3 (formulas) and 4 (world gen, nation AI)
>
> **This is NOT optional.** Both expert reviewers flagged "design docs that don't translate to code" as the #1 pipeline risk. This checkpoint catches that early.

### Stage 2B Additions

Prototype must validate Stage 2B systems (when implemented):

- **Whisper effects on nation AI** — Verify whisper nudges measurably influence nation decisions
- **Combo chain reactions** — Power Combos trigger correctly and apply modifiers in sequence
- **Voice emergence + petition lifecycle** — Voices emerge under correct conditions; petition flow completes without deadlocks

---

## What to Build

A **text-only simulation** — no rendering, no UI, no Phaser/PixiJS. Pure TypeScript simulation that runs in the terminal and outputs results.

### Scope

- World generation (create a seeded world with regions, nations, religions)
- Simulation tick loop (run all systems in tick order from Stage 3)
- Nation AI decisions (declare war, trade, develop — using the decision tree from Stage 4)
- Religion spread (heat diffusion from Stage 3)
- Battle resolution (from Stage 3 formulas)
- Science progression (milestone triggers)
- Run for 600 game-years (1600-2200) and output results

### NOT in Scope

- No UI, no rendering, no map display
- No divine powers (player interaction) — just the autonomous simulation
- No events (content from Stage 5)
- No art, no sound, no LLM calls

---

## How to Run

Ask a coding agent to:

```
Read these files:
- docs/design/formulas.md
- docs/design/04-world.md (world gen algorithm)
- docs/design/05-religions.md (religion behavior)
- src/types/game.ts
- src/config/constants.ts

Build a text-only simulation prototype:
1. Implement world generation (seeded, deterministic)
2. Implement the simulation tick loop (exact order from formulas.md)
3. Implement nation AI decision tree (from 04-world.md)
4. Implement religion spread (from formulas.md)
5. Implement battle resolution (from formulas.md)
6. Run a single Earth for 600 game-years with seed 12345
7. Output: final nation states, religion distribution, war count, population totals, science level

Put the prototype in src/prototype/ — this is throwaway validation code, not production.
```

---

## Validation Criteria

Run the prototype with at least 3 different seeds and check:

| Criteria | Pass | Fail |
|----------|------|------|
| Simulation completes 600 years without crashing | Runs to year 2200 | Crashes, infinite loop, or NaN |
| Population stays in reasonable range | Total pop grows over time, no region goes negative | Negative population, exponential blowup |
| Nations go to war and resolve battles | At least 2 wars occur per run | Zero wars, or wars never resolve |
| Religion spreads | Player religion and rivals both gain/lose regions | All regions same religion by year 1700 |
| Trade routes form | At least 3 trade routes form by mid-game | Zero trade routes, or routes to nowhere |
| Science progresses | At least 3 milestones hit by 2200 | Zero milestones, or all milestones by 1800 |
| No single nation dominates too early | No nation controls >60% of regions before year 1900 | World conquest by 1700 |
| Disease spreads and resolves | At least 1 outbreak occurs and resolves; no infinite disease loops | Disease causes crash, population goes negative from disease, or disease never ends |
| Results are deterministic | Same seed → same output | Different results with same seed |

---

## What to Do With Results

### If validation passes
Proceed to Stage 5. The formulas and world gen work.

### If validation fails
Return to Stage 3 or 4 and fix the broken formulas. Common issues:
- **Population blowup:** Growth rate too high, missing caps
- **No wars:** AI aggression thresholds too conservative
- **Religion monoculture:** Spread rate too high, no resistance
- **Science too fast/slow:** Milestone thresholds wrong
- **Nation domination:** Military balance broken, no alliances forming
- **Disease blowup:** Mortality too high, missing immunity mechanic, or spread rate unbounded

Run the prototype again after fixes. Repeat until all criteria pass.

---

## Decision Points (MUST ask before proceeding)

Before acting on results, present these decisions to the human. Wait for their answer.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Pass/fail judgment:** Present each validation criterion with actual results. Human confirms pass or fail. | The agent shouldn't silently declare "close enough." A population that grows 10,000× might be a bug or a feature — the human decides. |
| 2 | **Fix approach for failures:** Adjust formulas in Stage 3 docs / Adjust constants only / Accept as emergent behavior | Some "failures" are interesting emergent gameplay. Others are broken math. The human decides which. |
| 3 | **Proceed or iterate:** Move to Stage 5 / Run another iteration with fixes / Rethink a core system | After fixes, the human decides if confidence is high enough to move on. |

---

## Sign-Off Summary (MUST present at end)

When prototype runs are complete, present:

1. **Results table** — each criterion with pass/fail and actual values from 3 seed runs
2. **Fixes applied** — any formula or constant changes made, with before/after values
3. **Remaining concerns** — anything that passed but felt borderline
4. **Open question** — "Are you confident enough to proceed to Stage 5?" — wait for human response

Do NOT mark this checkpoint complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Deliverables

- [ ] `src/prototype/` — Working text-only simulation
- [ ] Console output from 3 seed runs showing pass criteria
- [ ] List of formula adjustments made (if any) — update formulas.md, constants.md, constants.ts
