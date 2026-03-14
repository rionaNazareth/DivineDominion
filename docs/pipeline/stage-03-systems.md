# Stage 3: Systems & Formulas

> **Goal:** Define every formula, algorithm, and numerical relationship in the simulation. No "agent must guess" gaps. Every system expressible as `output = f(inputs)`.
>
> **Estimated sessions:** 2-4 (this is the largest stage — mandatory checkpoint splits it into two sessions minimum)
>
> **Depends on:** Stage 2B (UX constraints — tick frequency affects UI responsiveness)

### Stage 2B Additions

Formulas must also cover the new game systems from Stage 2B:

- **Whisper AI nudge mechanics** — Strength, cooldown, and effect formulas for Divine Whispers that influence nation AI
- **Combo trigger conditions + modifiers** — When Power Combos activate; how modifiers stack or scale
- **Voice emergence conditions + loyalty math** — When Follower Voices appear; loyalty gain/loss formulas
- **Progressive power unlock schedule** — Per-era unlock timing and conditions for the Progressive Power Unlock system

### Harbinger Deliverables

- Harbinger tick formula: how Signal Strength budget converts to actions per era-tick
- Signal Strength growth curve formula (3 at Era 7 → 25 at Era 12)
- Sabotage action resolution: how each of the 6 actions (Discord, Corruption, False Miracle, Plague Seed, Sever, Veil) resolves against world state
- Adaptive targeting algorithm: how Harbinger identifies the player's strongest strategy and selects targets
- Rubber banding formula: how budget usage scales based on player performance (0.5× when struggling, 1.0× when ahead)
- Veil mechanics: how "data unreliable" indicator works, what data is obscured, duration
- Shield blocking formula: how Shield of Faith prevents Harbinger actions
- Prosperity resistance formula: Dev 8+ regions have 50% resistance (doubled cost)
- Whisper cancellation: how player Peace whisper cancels Harbinger Discord whisper
- Divine Purge combo resolution (Shield + Miracle on corrupted region)
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are a Systems Designer specializing in simulation games (Crusader Kings, Stellaris, Civilization). You've designed simulation systems for 3 shipped titles and understand the difference between "interesting on paper" and "computable in code."

Read these files first:
- docs/design/03-commandments.md
- docs/design/04-world.md
- docs/design/06-divine-powers.md
- docs/design/07-eras-and-endgame.md
- docs/design/constants.md
- src/types/game.ts
- src/config/constants.ts

Your job is to define every formula in the game. When you're done, an agent should be able to implement every simulation system by reading your formulas and writing code. Zero ambiguity.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. SIMULATION TICK ORDER — Exact order of operations per game tick:
   - List every system that runs, in order
   - Data dependencies (which system's output feeds which system's input)
   - Tick frequency (how many game-years per tick, ticks per real-second)
   - Mermaid diagram of the tick pipeline

2. BATTLE RESOLUTION FORMULA — Exact math:
   - Inputs: attacker strength, defender strength, terrain modifier, morale, commander bonus, supply attrition, fortification
   - Formula: how these combine (multiplicative? additive? weighted?)
   - Output: casualties for each side, morale change, retreat conditions
   - Edge cases: 0 strength, equal forces, sieges

3. RELIGION SPREAD ALGORITHM — Heat diffusion equation:
   - Exact formula with parameters (diffusion rate, resistance by terrain, distance decay)
   - How commandments affect spread rate (specific modifiers)
   - Conversion threshold (when does a region flip religion?)
   - Schism conditions (exact trigger, probability)

4. DISEASE SYSTEM FORMULAS — Full lifecycle:
   - Emergence probability per tick (based on population density, trade routes, era)
   - Spread rate between adjacent regions
   - Mortality rate (affected by development, era, divine intervention)
   - Recovery/immunity mechanics
   - Pandemic vs. local outbreak distinction

5. TRADE ROUTE SYSTEM — Formation and effects:
   - When routes form (conditions: peace, shared border or sea access, demand/supply)
   - Volume calculation (based on population, development, distance)
   - Effect on regions (wealth, development, disease risk)
   - Disruption logic (war, piracy, divine disaster)

6. NATION POPULATION/ECONOMY TICK — Per-region, per-tick:
   - Population growth formula (base rate, food modifier, disease modifier, war modifier)
   - Economy formula (population × development × trade bonus)
   - Development growth formula (based on peace, trade, government, era)
   - Military recruitment formula (population × militarism × economy)
   - Caps and floors for each value

7. ARMY MECHANICS — Movement, supply, combat:
   - Movement speed (terrain-dependent)
   - Supply attrition formula (distance from friendly territory)
   - Siege mechanics (how long to take a fortified region)
   - Army merging and splitting rules
   - Retreat destination logic

8. COMMANDMENT-TO-EFFECTS MAPPING TABLE — For every commandment in the MVP set (~20) plus any others already defined in 03-commandments.md:
   - Commandment name → exact modifier fields → exact values
   - Which simulation systems each commandment affects
   - Interaction rules (do modifiers stack? multiply? cap?)
   - Format: structured table or JSON-like mapping (not prose)
   - Document the mapping format clearly so post-launch commandments can be added consistently

9. DIVINE POWER EFFECTS — For each of the 12 powers:
   - Exact numerical effect on each affected system
   - Duration (game-years)
   - Cooldown (game-years)
   - Energy cost
   - Hypocrisy interaction (which commandments does this violate?)

10. HYPOCRISY SYSTEM — Exact mechanics:
    - What triggers hypocrisy (power use vs. commandment)
    - Penalty formula (faith loss, rebellion chance, schism risk)
    - Decay rate (how fast does hypocrisy fade?)
    - Threshold effects (mild vs. moderate vs. severe)

11. SCIENCE PROGRESSION — How humanity advances:
    - Milestone list with exact trigger conditions
    - How science speed is affected by (development, trade, war, religion)
    - Nuclear weapons unlock conditions and effects
    - Space defense grid requirements

12. AUTO-SAVE TRIGGER SPEC — When the game persists state:
    - Trigger points (every era boundary? every N ticks? on app background? on event resolve?)
    - What is saved vs. what is reconstructable
    - Save duration budget (max ms for save operation — must not cause visible stutter)
    - Interaction with speed controls (does saving at 4× cause frame drops?)

13. SPEED CONTROL FORMULA — How 1×/2×/4× affects simulation:
    - Exact relationship: ticks per real-second at each speed
    - How speed affects event timing (events per real-minute at each speed)
    - Auto-slow trigger conditions and resume behavior
    - Progressive event density mapping: how early-era density (12-15 events) vs late-era (6-8 events) interacts with speed
    - Reference: 01-overview.md Section 10 "Progressive Session Design"

14. DIVINE WHISPER MECHANICS — How whispers affect nation AI:
    - Nudge strength formula (effect on nation AI decision weights)
    - Compound bonus formula (3+ same-type whispers to same nation)
    - Loyalty bonus from whispers (effect on Follower Voice loyalty)
    - Interaction with commandments (which commandments amplify/reduce whisper effects)

15. POWER COMBO FORMULAS — For each of the 9 combos:
    - Trigger condition (exact world state check)
    - Effect formula (numerical outcome)
    - How combo modifiers stack with base power effects
    - Divine Purge special case (Shield + Miracle on Harbinger corruption)

16. FOLLOWER VOICE FORMULAS — Emergence, loyalty, petitions:
    - Voice emergence probability formula (per tick, based on region state)
    - Loyalty gain/loss formula (petition fulfilled/denied/ignored)
    - Petition generation cadence (cooldown, priority, type weights)
    - Death conditions (age, war, betrayal probability)
    - Lineage probability (30% chance, conditions)

17. HARBINGER SYSTEM FORMULAS — The alien saboteur AI:
    - Signal Strength growth curve (3 at Era 7 → 25 at Era 12)
    - Harbinger tick formula: Signal Strength budget → actions per era-tick
    - Sabotage action resolution: each of the 6 actions (Discord, Corruption, False Miracle, Plague Seed, Sever, Veil) vs world state
    - Adaptive targeting algorithm: how Harbinger identifies player's strongest strategy
    - Rubber banding formula: budget usage scales 0.5× (player struggling) to 1.0× (player ahead)
    - Shield blocking: how Shield of Faith prevents Harbinger actions
    - Prosperity resistance: Dev 8+ regions have 50% resistance (doubled cost)
    - Whisper cancellation: player Peace whisper vs Harbinger Discord whisper
    - Veil mechanics: what data is obscured, duration, indicator
    - Reference: docs/design/14-harbinger.md

MANDATORY STRUCTURE — This stage has an interim checkpoint:

SESSION 1 (deliverables 1-6 + battle walkthrough):
  Produce deliverables 1-6 (tick order, battle, religion, disease, trade, nation/economy).
  After deliverable 2 (battle resolution), immediately run ONE Formula Walkthrough for battle 
  (Step 1.1 from the validation protocol). If the walkthrough fails, fix the formula before 
  continuing to deliverable 3. This catches the most complex formula early.
  After deliverable 6, STOP. Present an Interim Summary to the human:
    - Decisions applied so far (all 5 Decision Points were resolved before any formulas)
    - Quick summary of each formula (1 line each)
    - Battle walkthrough result (pass/fail, key numbers)
    - Any concerns or tradeoffs discovered while writing
    - "Review these 6 core formulas before I continue to game systems (7-13)."
  WAIT for human confirmation before proceeding to Session 2.

SESSION 2 (deliverables 7-17 + full validation):
  Produce deliverables 7-17 (army, commandments, divine powers, hypocrisy, science, auto-save, speed, whispers, combos, voices, Harbinger).
  Then run the FULL validation protocol (Steps 1-3) covering ALL 17 deliverables.
  Present the final Sign-Off Summary.

STRUCTURED OUTPUT FORMAT — Every formula must use this template:
  FORMULA: [name]
  INPUTS: [list each input with type and valid range]
  FORMULA: [exact math expression]
  OUTPUT: [list each output with type and valid range]
  EDGE CASES: [what happens at 0, at max, at boundary]
  CONSTANTS USED: [reference to constants.md values]

Update these files:
- docs/design/constants.md — ALL missing constants (battle, trade, nation AI, events, army)
- src/config/constants.ts — Must match constants.md exactly
- src/types/game.ts — Add any missing fields discovered during formula design
- Create a new file: docs/design/formulas.md — All formulas in one place, with references to constants.md for values

Quality gate: Every system can be expressed as output = f(inputs) with no ambiguity. An agent reading the formulas can implement them in one pass without asking a single question.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Tick frequency:** 1 tick = 1 game-year / 1 tick = 0.5 game-years / 1 tick = 0.25 game-years | Higher frequency = smoother simulation but more computation. Affects mobile performance budget and how granular events can be. |
| 2 | **Battle resolution model:** Deterministic (same inputs = same outcome) / Probabilistic (dice rolls with seed) / Hybrid (deterministic base + seeded variance) | Deterministic is testable but can feel flat. Probabilistic adds drama but complicates reproducibility. |
| 3 | **Commandment modifier stacking:** Additive (sum all modifiers) / Multiplicative (multiply all) / Additive with hard caps | Determines whether 10 aligned commandments create broken synergies or predictable outcomes. Core balance lever. |
| 4 | **Religion spread model:** Heat diffusion (continuous, gradual) / Threshold flipping (region converts at X%) / Influence zones (binary, distance-based) | Affects how visible and controllable religion spread feels. Heat diffusion is realistic but harder to understand. |
| 5 | **Disease scope for MVP:** Divine-power-only (Plague spell) / Divine + trade-route hazard / Full natural emergence + divine + trade | More complexity = more emergent gameplay but higher balance risk. Stage 1 deferred full disease — confirm scope here. |

---

## Mandatory Interim Checkpoint (After Deliverable 6)

This stage is too large and too critical for a single pass. The agent MUST stop after deliverable 6 and present an Interim Summary before proceeding.

### Why this exists

Stage 3's formulas are the foundation of the entire simulation. Quality drop-off on later deliverables (7-13) is the top risk. The interim checkpoint:
- Gives the human a review point after the 6 core simulation formulas
- Catches battle/economy/religion formula errors before they propagate to commandment mapping and divine powers
- Ensures the agent hasn't drifted from the Decision Point choices made earlier
- Reduces the consequence of a single bad session (only 7 deliverables to redo, not 13)

### Interim Summary format

After deliverable 6, present:

1. **Decisions applied** — Confirm all 5 Decision Point choices are reflected in the formulas
2. **Formula summary** — One line per formula (1-6): what it computes, key constants used
3. **Battle walkthrough result** — Pass/fail. Show the key numbers (casualties, morale, retreat threshold)
4. **Concerns** — Anything that felt fragile, any constants that seem likely to need tuning
5. **Question** — "Do these 6 core formulas feel right before I build game systems on top of them?"

**WAIT for human confirmation.** If the human flags issues, fix them before proceeding to deliverables 7-13. This is NOT optional — do not continue without sign-off.

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete (7-13 + validation), present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., exact population cap values, morale decay rate)
3. **Biggest risk** — which formula is most likely to produce degenerate behavior in simulation?
4. **Open question** — "Is anything here surprising or wrong?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/03-commandments.md` | Commandment list and intended effects |
| `docs/design/04-world.md` | World systems, nations, disease, trade |
| `docs/design/06-divine-powers.md` | Powers, energy, hypocrisy |
| `docs/design/07-eras-and-endgame.md` | Science, eras, alien endgame |
| `docs/design/constants.md` | Current numerical constants |
| `src/types/game.ts` | Current type definitions |
| `src/config/constants.ts` | Current code constants |

## Output Files (Modified/Created)

| File | What changes |
|------|-------------|
| `docs/design/constants.md` | All missing constants added |
| `src/config/constants.ts` | Synced with constants.md |
| `src/types/game.ts` | Missing fields added |
| `docs/design/formulas.md` | **NEW** — all formulas in one doc |

## Quality Gate

- [x] Interim checkpoint completed: human confirmed deliverables 1-6 before 7-13
- [x] Battle walkthrough passed during Session 1 (before continuing to deliverable 3)
- [x] Tick order is explicit with no circular dependencies
- [x] Battle formula has exact math (not "strength matters")
- [x] Religion spread has a real diffusion equation with parameters
- [x] Every commandment maps to specific modifier fields with values
- [x] Every divine power has exact numerical effects and duration
- [x] Hypocrisy triggers and penalties are computable
- [x] Every formula uses the structured output format (inputs, formula, output, edge cases, constants)
- [x] constants.md and constants.ts are in sync
- [x] game.ts has no missing fields
- [x] All changes follow design-change protocol
- [x] Formula walkthrough test passed (see below)
- [x] Edge case audit passed (see below)
- [x] Cross-formula integration check passed (see below)

---

## Formula Validation Protocol (Do NOT Skip)

Stage 3 is the foundation of the entire simulation. Rushing it breaks every downstream stage. The agent MUST complete these three validation steps after writing deliverables and BEFORE presenting the Sign-Off Summary.

### Step 1: Formula Walkthrough Test

For EACH of these 6 core formulas, manually walk through one concrete example with real numbers:

1. **Battle resolution** — Two armies clash. Show every input value, every intermediate calculation, and the final output (casualties, morale change, retreat Y/N). Use realistic values, not round numbers.
2. **Religion spread** — One tick of religion spreading from Region A to Region B. Show diffusion rate, resistance, threshold check, and resulting faith percentages.
3. **Disease lifecycle** — A disease emerges, spreads for 3 ticks, and recovers. Show probability of emergence, spread rate per tick, mortality, and recovery.
4. **Nation economy tick** — One nation for one tick. Show population growth, economy output, development change, and military recruitment.
5. **Trade route effects** — One active trade route for one tick. Show volume calculation, wealth transfer, development bonus, disease risk, and religion spread via trade.
6. **Science progression** — Show how global science advances over 3 eras with specific nation development values. Verify milestones trigger at the right times.

**Pass criteria:** All 6 walkthroughs produce sensible outputs. No division by zero, no negative populations, no infinite growth, no values outside defined caps/floors.

**If any walkthrough fails:** Fix the formula before proceeding. Do not hand-wave with "this would be tuned later."

### Step 2: Edge Case Audit

For each formula, verify behavior at these boundaries:

| Condition | What to check |
|-----------|--------------|
| All values at minimum (0 or floor) | No crashes, no NaN, no negative output |
| All values at maximum (cap) | No overflow, growth still bounded |
| Single nation remaining | Simulation doesn't degenerate |
| No active religions | Religion spread doesn't error |
| 10 aligned commandments (max synergy) | Modifiers don't produce absurd values |
| 10 conflicting commandments (max tension) | Schism risk doesn't exceed 100% or go negative |
| Speed at 4× | Tick math still produces correct game-year values |
| Zero population region | No division by zero in economy/recruitment |

**Pass criteria:** No formula produces undefined, infinite, NaN, or out-of-range values at any boundary.

### Step 3: Cross-Formula Integration Check

Verify that formulas interact correctly when composed in tick order:

1. **War → Population → Economy chain:** A battle causes casualties → population drops → economy drops next tick → military recruitment drops the tick after. Trace through 3 ticks and confirm the cascade is reasonable (not too extreme, not invisible).
2. **Trade → Disease → Population chain:** Trade route forms → disease spreads along it → mortality reduces population → trade volume drops. Confirm the feedback loop doesn't spiral to extinction in < 5 ticks.
3. **Blessing → Development → Science chain:** Player casts Inspiration → development boost → science progresses faster. Confirm the blessing's impact is meaningful but not game-breaking.
4. **Commandments → Religion → Schism chain:** Player picks 2 tension-pair commandments → religion spreads → schism risk accumulates → schism fires. Confirm the timeline is reasonable (not instant, not impossible).

**Pass criteria:** All 4 chains produce emergent behavior that "makes sense" — effects cascade but don't spiral out of control or fizzle to nothing.

### What happens if validation fails

- If Steps 1-2 fail → fix the formula and re-walk. Do not present Sign-Off Summary with broken math.
- If Step 3 fails → the formula itself may be fine, but interaction constants need adjustment. Flag the specific interaction in the Sign-Off Summary as a known risk for the Prototype Checkpoint to validate.
- Document ALL walkthrough results in `docs/design/formulas.md` under a "Validation" section so the Prototype Checkpoint can compare simulation output against expected values.

---

## Independent Verification Session (After Sign-Off, Before Expert Review)

Stage 3 formulas are the foundation of the entire game. An agent checking its own math is unreliable. After the human confirms the Sign-Off Summary, launch an **Independent Verification Subagent** before the Expert Review.

**Why separate:** The agent that wrote the formulas is biased toward its own work. A fresh agent with no authorship context will catch errors the author cannot see — especially math errors, edge case failures, and constant mismatches.

**Verification subagent receives:**
- `docs/design/formulas.md` (the output)
- `docs/design/constants.md` (source of truth for values)
- `src/config/constants.ts` (must match constants.md)
- `src/types/game.ts` (must match field names)

**Verification subagent does NOT receive:** The stage file, the conversation, or the author's walkthroughs.

**Verification tasks:**

1. **Independent walkthrough** — For each of the 6 formula walkthroughs, the verifier computes the same scenario independently using ONLY the formulas and constants. Inputs are fixed (see below). If the verifier's output differs from the author's output in `formulas.md`, the formula is flagged.

   Fixed verification inputs (use these exact values):
   - Battle: Attacker strength=8500, Defender strength=6200, terrain=hills, attacker morale=0.75, defender morale=0.85, no commanders, no fortification
   - Religion spread: Region A faith=0.7, Region B faith=0.2, shared border, no trade route, no missionary
   - Disease: Population density=50000/region, 2 trade routes, Era 5 (Industry), no divine intervention
   - Nation economy: Population=120000, Dev=5, 1 trade route, monarchy, peacetime, no commandment modifiers
   - Trade: Pop_A=80000, Pop_B=150000, Dev_A=4, Dev_B=6, distance=2 regions, peacetime
   - Science: 3 nations at Dev 5, 2 at Dev 3, 1 at Dev 7. Trace from year 1800 to 1870.

2. **Constant cross-reference** — Every constant value used in a formula exists in constants.md with the same name and value.

3. **Structured format compliance** — Every formula uses the required template (inputs, formula, output, edge cases, constants).

4. **Edge case spot-check** — For battle and nation economy, compute with all inputs at 0 and all at max. Verify no NaN, no negative, no infinity.

**Output:** PASS/FAIL per formula, with specific discrepancies listed. If any FAIL, the main agent fixes the formula and re-runs the verification for that formula only.

**After verification passes:** Proceed to Expert Review, then Git Commit.
