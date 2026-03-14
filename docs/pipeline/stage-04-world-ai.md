# Stage 4: World & AI Architecture

> **Goal:** Define exactly how worlds are generated, how nations make autonomous decisions, and how rival religions behave. After this stage, you can build and test the simulation.
>
> **Estimated sessions:** 2-3
>
> **Depends on:** Stage 3 (all formulas, tick order)

### Stage 2B Additions

Nation AI and world systems must account for Stage 2B features:

- **Divine Whispers** — Nation AI must respond to whisper nudges (e.g., bias toward peace, war, trade) in its decision tree
- **Voice emergence tied to nation state** — Follower Voice emergence conditions must integrate with nation state (stability, faith, region count, etc.)

### Harbinger Deliverables

- How Harbinger reads world state to choose targets (what data it evaluates)
- Target selection decision tree: priority ordering for nations, cities, regions, trade routes
- Integration with nation AI: how Harbinger sabotage affects nation behavior (wars it provokes, alliances it breaks)
- How sabotage integrates into the event system (alien-caused events with hidden `alienCaused` flag)
- Harbinger response to player counter-play (Shield, Purge, Whisper cancellation)
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are a Procedural Generation Specialist and World Simulation Designer. You've built world generators for 2 shipped strategy games and designed autonomous nation AI for simulation titles.

Read these files first:
- docs/design/04-world.md
- docs/design/05-religions.md
- docs/design/formulas.md (from Stage 3)
- docs/design/constants.md (updated in Stage 3)
- src/types/game.ts
- src/config/constants.ts

Your job is to define the exact algorithms for world generation, nation behavior, and religion dynamics. When you're done, an agent can implement the world simulation by following your specs step by step.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. WORLD GENERATION ALGORITHM — Step by step:
   - Library choice for Voronoi tessellation (d3-delaunay, or alternative)
   - Region count range (min/max) and size variation
   - Terrain assignment algorithm (noise function, parameters, terrain type thresholds)
   - Water/land ratio and distribution rules
   - Nation placement rules (starting regions, minimum distance between capitals, initial territory)
   - Resource distribution (if applicable)
   - Religion initial distribution (player religion + 2-4 rival religions)
   - Starting conditions per nation (population, development, military, government type)
   - Seed-based determinism (every generation is reproducible from a seed)
   - Output: exact data structure that world gen produces (reference game.ts types)

2. NATION AI DECISION TREE — Flowchart for every decision:
   - When to declare war (military balance, grievances, opportunity, commandment influence)
   - When to form alliances (shared religion, shared enemy, relative strength)
   - When to break alliances (religion change, power shift, betrayal)
   - When to trade (peace, shared border/sea, economic benefit threshold)
   - When to develop (peace, economy threshold, population threshold)
   - When to recruit military (threat level, economy, militarism)
   - When to change government (development level, era, religion influence)
   - Priority ordering (which decision takes precedence when multiple are valid)
   - Use a weighted-priority decision table with columns: [Condition, Weight, Priority, Action]
   - Include at least one fully worked example (e.g., "When to declare war") showing the complete decision evaluation with sample values

3. RIVAL RELIGION BEHAVIOR — How passive rival gods operate:
   - Personality archetypes (peaceful, militant, expansionist, isolationist, syncretic)
   - How personality affects nation decisions (weighted modifiers on each AI decision)
   - Rivalry mechanics (how religions interact — tolerance, hostility, conversion attempts)
   - Religion "aggressiveness" based on commandments (specific commandment → aggression mapping)

4. HIDDEN DIVINE RULE SCHEMA — The secret rules rival gods follow:
   - Condition types (enum: populationAbove, populationBelow, regionCount, eraReached, warDeclared, etc.)
   - Effect types (enum: faithBoost, faithPenalty, blessingTriggered, disasterTriggered, etc.)
   - Trigger logic: when conditions are evaluated, how effects apply
   - How the player can deduce rules (observable effects, patterns)
   - 5 example hidden rules with conditions and effects

5. RELIGION LIFECYCLE — Exact trigger conditions for:
   - Schism: threshold values, probability formula, what happens (new religion splits off)
   - Merge: conditions (proximity, similarity score), process, what the merged religion looks like
   - Reform: what triggers it (crisis, era change, player action), what changes
   - Extinction: when population reaches 0, cleanup logic
   - Conversion: forceful vs. peaceful, how commandments affect this

6. GOVERNMENT EVOLUTION — How governments change:
   - Government types (enum) and their effects on nation behavior
   - Transition triggers (development level, era, religion type, revolution)
   - Revolution probability formula
   - How religion commandments influence government type

7. DIVINE WHISPER AI INTEGRATION — How whispers affect nation decisions:
   - How each whisper type (War, Peace, Science, Faith) modifies the nation AI decision tree weights from deliverable 2
   - Compound whisper effects (3+ same type to same nation)
   - How nations "resist" whispers based on personality and current state

8. FOLLOWER VOICE EMERGENCE — Integration with world state:
   - Exact nation/region state conditions that trigger Voice emergence (stability thresholds, faith levels, war state, development)
   - How Voice type is selected (Prophet from high faith, General from war, Scholar from high dev, etc.)
   - Voice cap enforcement (max 5 alive) — which candidate is suppressed when at cap

9. HARBINGER AI ARCHITECTURE — Target selection and sabotage:
   - How Harbinger reads world state to choose targets (data inputs, evaluation criteria)
   - Target selection decision tree: priority ordering for nations, cities, regions, trade routes
   - Integration with nation AI: how sabotage affects nation behavior (wars provoked, alliances broken, faith eroded)
   - How sabotage integrates into the event system (alien-caused events with `alienCaused: true` flag)
   - Harbinger response to player counter-play (Shield blocking, Divine Purge, Whisper cancellation)
   - Reference: docs/design/14-harbinger.md

Update these files:
- docs/design/04-world.md — World gen algorithm, nation AI
- docs/design/05-religions.md — Religion behavior, lifecycle, hidden rules
- src/types/game.ts — Add missing fields to Nation, Religion, WorldState
- src/config/constants.ts — Add world gen and nation AI constants

Quality gate: You can trace any nation's behavior for 100 game-years on paper using only the documented rules. No ambiguity in any decision.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Region count:** 20-30 regions / 40-60 regions / 80-100 regions | Fewer = clearer map, faster simulation, easier balance. More = richer geopolitics but harder to track on a phone screen. |
| 2 | **Starting nation count:** 4-6 nations / 8-12 nations / 15-20 nations | Affects war frequency, alliance complexity, and how crowded the early map feels. |
| 3 | **Nation AI personality diversity:** 3 archetypes (aggressive/passive/balanced) / 5 archetypes (+ expansionist, isolationist) / Continuous traits (aggression 0-1, trade-focus 0-1, etc.) | Archetypes are simpler but more predictable. Continuous traits create more variety but are harder to balance. |
| 4 | **Government types count:** 3 (autocracy/democracy/theocracy) / 5 (+ republic, military junta) / 7+ (full spectrum) | More types = richer simulation but more transitions to balance and more edge cases in AI behavior. |
| 5 | **Hidden divine rule complexity:** Simple (1 condition → 1 effect) / Medium (AND/OR conditions, 2 effects) / Complex (chains, cooldowns, escalation) | Simpler rules are easier to deduce (player fun) but less surprising. Complex rules create mystery but may feel unfair. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., Voronoi library choice, exact starting population values)
3. **Biggest risk** — which world-gen or AI parameter is most likely to need retuning after prototype?
4. **Open question** — "Is anything here surprising or wrong?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/04-world.md` | Current world design |
| `docs/design/05-religions.md` | Religion system |
| `docs/design/formulas.md` | All formulas from Stage 3 |
| `docs/design/constants.md` | All constants |
| `src/types/game.ts` | Type definitions |
| `src/config/constants.ts` | Code constants |

## Output Files (Modified)

| File | What changes |
|------|-------------|
| `docs/design/04-world.md` | World gen algorithm, nation AI tree |
| `docs/design/05-religions.md` | Religion behavior, lifecycle, hidden rules |
| `src/types/game.ts` | Missing Nation/Religion fields |
| `src/config/constants.ts` | World gen + nation AI constants |

## Quality Gate

- [x] World gen algorithm is step-by-step reproducible from a seed
- [x] Nation AI has a decision tree with exact conditions and weights
- [x] Every religion lifecycle event has exact trigger conditions
- [x] Hidden divine rules have a formal schema (condition → effect)
- [x] Government evolution has trigger thresholds
- [x] All changes follow design-change protocol
