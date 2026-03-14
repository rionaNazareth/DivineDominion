# Stage 6: Balance & Economy

> **Goal:** Ensure no commandment combo is broken, divine powers are meaningful but not overpowered, and the game is winnable but not trivial. This stage uses real content from Stage 5 (full-vision scope: 50 commandments, 80 events, 8-12 religions).
>
> **Estimated sessions:** 3-5 (expanded from 2-3 — balancing 50 commandments is combinatorially larger than 25)
>
> **Depends on:** Stage 3 (formulas), Stage 5 (content — events, religions, commandments)

### Stage 2B Additions

Balance must include Stage 2B tuning levers:

- **Whisper nudge strength tuning** — Ensure whispers influence nations meaningfully without overriding AI
- **Combo modifier tuning** — Power Combo effects balanced against single-power use
- **Voice loyalty curve tuning** — Loyalty gain/loss rates so voices feel responsive but not trivial
- **Progressive unlock timing** — Per-era unlock pacing so players have meaningful progression without early-game overload

### Harbinger Deliverables

- Signal Strength budget tuning per era (currently 3→25, may need adjustment)
- All 6 sabotage action cost tuning
- Adaptive pressure curve calibration (how aggressively Harbinger targets player's strengths)
- Rubber banding threshold tuning (at what player performance levels does Harbinger scale back/up)
- Prosperity resistance threshold (currently Dev 8 = 50% resistance — verify in Monte Carlo)
- Divine Purge effectiveness and cost balance
- Overall difficulty impact: Harbinger should make late game harder but not unfair
- Reference: `docs/design/14-harbinger.md`

---

## Agent Prompt

```
You are a Game Economy Designer and Balance Specialist. You've balanced economy and combat systems for 3 shipped strategy games. You think in spreadsheets, probability distributions, and Monte Carlo simulations.

Read these files first:
- docs/design/03-commandments.md
- docs/design/06-divine-powers.md (blessings, disasters, whispers, combos, hypocrisy)
- docs/design/07-eras-and-endgame.md
- docs/design/08-events.md (event system design from Stage 5)
- docs/design/event-index.json (machine-readable data for all 80 events — triggers, weights, choices)
- docs/design/05-religions.md (rival religion mechanics, hidden rules)
- docs/design/14-harbinger.md (alien saboteur — signal strength, sabotage actions, pressure curves)
- docs/design/formulas.md (from Stage 3)
- docs/design/constants.md
- src/types/game.ts
- src/config/constants.ts

Your job is to assign exact numerical values to every game mechanic and validate that the game is balanced. No commandment combo should guarantee victory or guarantee defeat.

IMPORTANT — HUMAN REVIEW PROTOCOL:
This stage has Decision Points — high-stakes choices that the human designer must make. Before writing ANY deliverables, present each Decision Point (listed after this prompt in the stage file) with 2-3 options and tradeoffs. WAIT for the human to answer each one before proceeding. After all deliverables are complete, present the Sign-Off Summary and WAIT for confirmation before marking the stage done.

Produce ALL of the following deliverables:

1. COMMANDMENT BALANCE MATRIX — For ALL 50 commandments (35 base + 15 unlockable):
   - Exact modifier values (not ranges — exact numbers)
   - Synergy pairs (commandments that work well together and why)
   - Anti-synergy pairs (commandments that conflict)
   - Tested constraints:
     - No single combo achieves >60% win rate
     - No combo achieves <15% win rate
     - Peace-only paths are viable (30-40% win rate)
     - War-only paths are viable (30-40% win rate)
     - Hybrid paths are strongest but not dominant (40-50%)
   
   COMPLEXITY NOTE: C(50,10) = ~10.3 billion possible commandment combinations (vs ~3.3 million with 25). Exhaustive testing is impossible. Instead:
   - Balance the 7 categories against each other (category-level balance)
   - Within each category, ensure no commandment is strictly better than another
   - Test 20-30 representative builds (3 per archetype + edge cases like all-peace, all-war, max-tension, random)
   - Flag any commandment that appears in >70% of "winning" test builds as potentially overpowered

2. DIVINE POWER BALANCE PASS — For ALL divine interventions (12 powers + 4 whispers + 9 combos):
   
   a. BLESSINGS & DISASTERS (12 total):
   - Exact numerical effects (e.g., Bountiful Harvest: +15% food for 10 years)
   - Energy cost (exact value)
   - Cooldown (exact game-years)
   - Power ranking (tier list: S/A/B/C with justification)
   - Hypocrisy interaction table (which commandment × which power = penalty?)
   
   b. DIVINE WHISPERS (4 types — War, Peace, Science, Faith):
   - Nudge strength value (currently 0.15 — validate or adjust)
   - Compound bonus per repeat (currently +0.05, caps at 0.30 — verify stack isn't broken)
   - Per-region cooldown (currently 30s) and global cooldown (currently 10s)
   - Targeted whisper effectiveness vs. untargeted
   - Ensure whispers influence nations meaningfully without overriding AI autonomy
   
   c. POWER COMBOS (9 combos):
   - Combo modifier values (currently 1.3×–2.0× — validate each individually)
   - Trigger conditions (are any too hard or too easy to activate?)
   - Divine Purge effectiveness vs. Harbinger corruption (Shield + Miracle on corrupted region)
   - Ensure combos reward discovery but don't become mandatory

3. HYPOCRISY PENALTY VALUES — Exact mechanics:
   - Severity levels (minor: -5% faith, moderate: -15% faith + rebellion, severe: -30% faith + schism risk)
   - Specific commandment/power pairs with severity
   - Decay rate (years to recover from each severity)
   - Strategic depth: calibrate based on Decision Point #3 outcome (never worth it / sometimes worth it / always an option)

4. SCIENCE MILESTONE PACING — Validate the timeline:
   - Expected year for each milestone under normal conditions
   - Expected year under optimal (peaceful, high development) conditions
   - Expected year under worst (constant war, low development) conditions
   - Can humanity reach Defense Grid by 2150 in all scenarios? If not, what breaks?

5. WIN RATE TARGETS — By strategy type:
   - Pure peace: 30-40% win rate target
   - Pure war: 30-40% win rate target
   - Hybrid: 40-50% win rate target
   - Random commandments: 15-25% win rate target
   - "Optimal" play: should not exceed 70%

6. DIFFICULTY SCALING — Across Earths (meta-progression):
   - Does difficulty increase per Earth? (recommended: yes, gradually)
   - How? (more aggressive rival religions, fewer starting resources, faster alien clock)
   - Exact scaling values per Earth number (1, 2, 3, 5, 10, 20)

7. EVENT BALANCE PASS — Review all 80 events from Stage 5:
   - Are choice outcomes balanced? (no "always correct" choice)
   - Do events interact correctly with commandments?
   - Are any events too punishing or too rewarding?
   - Adjust numerical outcomes as needed

8. MONTE CARLO TEST SPECIFICATIONS — 20 test scenarios as EXECUTABLE JSON:
   Produce a file `docs/design/monte-carlo-scenarios.json` with this exact schema:
   ```json
   {
     "scenarios": [
       {
         "id": "peace-shepherd-01",
         "seed": 42,
         "archetype": "shepherd",
         "commandments": ["cmd_peace_01", "cmd_peace_02", "...10 total"],
         "strategy": "passive",
         "strategy_description": "Never use disasters, bless science cities",
         "expected_win_rate_min": 0.25,
         "expected_win_rate_max": 0.45,
         "expected_defense_grid_year_max": 2150,
         "tags": ["archetype", "peace-only"]
       }
     ]
   }
   ```
   Requirements:
   - Commandment IDs MUST reference valid IDs from 03-commandments.md
   - Strategy values MUST match playtest strategy profile IDs (aggressive, passive, hybrid, random, optimal, degenerate)
   - expected_win_rate_min/max MUST be numbers (not ranges like "30-40%")
   - This file is loaded directly by the playtest harness in Phase 7 — it is NOT prose
   
   Scenario distribution:
   - 3 per archetype (Shepherd, Judge, Conqueror) = 9
   - 3 edge cases (all one category, max tension pairs, random picks) = 3
   - 3 with unlockable-heavy builds = 3
   - 5 mixed/hybrid strategies = 5
   
   These feed directly into Stage 8 (Technical Spec & QA).
   Note: these specs are for POST-IMPLEMENTATION validation (after divine powers and events are wired in Phase 4+), not for the prototype checkpoint. The prototype validates basic simulation stability; Monte Carlo validates full-game balance.

9. HARBINGER BALANCE — Tune the alien saboteur's difficulty curve:
   - Signal Strength budget per era (currently 3→25 — validate progression isn't too gentle or too punishing)
   - All 6 sabotage action costs (Whisper of Discord, Corruption, False Miracle, Plague Seed, Sever, Veil)
   - Adaptive pressure curve (how aggressively Harbinger targets the player's strongest strategy)
   - Rubber banding thresholds (at what player performance levels does Harbinger scale back/up)
   - Prosperity resistance threshold (currently Dev 8 = 50% resistance — verify in Monte Carlo)
   - Divine Purge effectiveness and cost balance (is the counter-play accessible but not trivial?)
   - Overall difficulty impact: Harbinger should make late game harder but not unfair
   - Reference: docs/design/14-harbinger.md

10. STAGE 2B TUNING — Validate interaction system values:
    - Voice loyalty curve tuning — loyalty gain/loss rates so voices feel responsive but not trivial
    - Progressive unlock timing — per-era power unlock pacing (currently 2 powers per era for 6 eras). Validate that early eras don't feel barren and late eras don't overwhelm
    - Petition auto-deny penalty (currently -0.08 loyalty vs -0.15 for explicit deny)

Update these files:
- docs/design/03-commandments.md — Final commandment values
- docs/design/06-divine-powers.md — Final power values (blessings, disasters, whispers, combos)
- docs/design/08-events.md — Adjusted event outcomes
- docs/design/14-harbinger.md — Harbinger tuning values (signal strength, sabotage costs, pressure curves)
- docs/design/constants.md — All balance constants
- src/config/constants.ts — Synced with constants.md

Quality gate: You have a spreadsheet-level understanding of every number in the game and how they interact. Given any commandment combination, you can estimate the win rate within 10%.
```

---

## Decision Points (MUST ask before proceeding)

Before writing deliverables, present these decisions to the human with 2-3 options and tradeoffs. Wait for their answer. Do NOT assume.

| # | Decision | Why it matters |
|---|----------|---------------|
| 1 | **Win rate philosophy:** Forgiving (40-60% for any reasonable build) / Challenging (25-45% — most runs fail) / Punishing (15-30% — roguelike hard) | Sets the emotional tone of the entire game. Too easy = no tension. Too hard = frustration on a 4-hour investment. |
| 2 | **Difficulty scaling across Earths:** No scaling (same difficulty every run) / Gradual increase (harder rivals) / Player-chosen difficulty | Scaling rewards mastery but can punish casual players. No scaling makes Earth #20 too easy for veterans. |
| 3 | **Hypocrisy as strategy:** Never worth it (pure penalty) / Sometimes worth it (risk-reward tradeoff) / Always an option (hypocrisy as a valid playstyle) | Determines whether contradicting your commandments is a mistake or a strategic choice. |
| 4 | **Science pacing guarantee:** Humanity can always reach Defense Grid with optimal play / Sometimes impossible (unfair RNG) / Always possible but requires sacrifice | If the win condition is sometimes unreachable, players may feel cheated. If it's always reachable, the threat feels hollow. |
| 5 | **Event outcome balance:** All choices roughly equal in value / Clear best choice exists (rewards system mastery) / Context-dependent (best choice varies by game state) | Affects whether events feel like meaningful decisions or solvable puzzles. |

---

## Sign-Off Summary (MUST present at end)

When all deliverables are complete, present:

1. **Decisions made** — one line per Decision Point above, showing the choice taken
2. **Assumptions made** — things you decided without asking (e.g., exact modifier values, cooldown durations)
3. **Biggest risk** — which balance number is most likely to be wrong and need post-prototype adjustment?
4. **Open question** — "Look at the commandment balance matrix. Does any combo feel obviously broken or obviously useless?" — wait for human response

Do NOT mark this stage complete until the human confirms. After confirmation, launch the Expert Review subagent (see `docs/pipeline/INDEX.md` for the subagent prompt template and expert persona). After the expert review is resolved, commit all changes following the Git Commit Protocol.

---

## Input Files

| File | What to read for |
|------|-----------------|
| `docs/design/03-commandments.md` | Commandment list and current values |
| `docs/design/06-divine-powers.md` | Blessings, disasters, whispers, combos, hypocrisy |
| `docs/design/07-eras-and-endgame.md` | Science pacing, alien clock |
| `docs/design/08-events.md` | Event system design from Stage 5 |
| `docs/design/event-index.json` | Machine-readable data for all 80 events (triggers, weights, choices) |
| `docs/design/05-religions.md` | Rival religion mechanics, hidden rules, difficulty interactions |
| `docs/design/14-harbinger.md` | Harbinger signal strength, sabotage actions, pressure curves |
| `docs/design/formulas.md` | All simulation formulas |
| `docs/design/constants.md` | Current constants |
| `src/types/game.ts` | Types |
| `src/config/constants.ts` | Code constants |

## Output Files (Modified)

| File | What changes |
|------|-------------|
| `docs/design/03-commandments.md` | Final commandment balance values |
| `docs/design/06-divine-powers.md` | Final power values (blessings, disasters, whispers, combos) |
| `docs/design/08-events.md` | Adjusted event outcomes |
| `docs/design/14-harbinger.md` | Harbinger tuning (signal strength, sabotage costs, pressure curves) |
| `docs/design/constants.md` | Balance constants |
| `src/config/constants.ts` | Synced with constants.md |
| `docs/design/monte-carlo-scenarios.json` | **NEW** — 20 executable test scenarios |

## Quality Gate

**Commandment Balance (Deliverable 1):**
- [x] Every commandment has exact modifier values (not ranges — exact numbers only)
- [x] No single commandment combo achieves >60% win rate
- [x] Peace-only and war-only paths are both viable

**Divine Power Balance (Deliverable 2):**
- [x] Every blessing and disaster has exact effects, cost, and cooldown
- [x] Whisper nudge strength, compound bonus, and cooldown values validated
- [x] All 9 combo modifier values are exact numbers (not ranges)

**Hypocrisy (Deliverable 3):**
- [x] Hypocrisy penalties calibrated to match Decision Point #3 outcome

**Science Pacing (Deliverable 4):**
- [x] Science pacing lets humanity reach Defense Grid by 2150 under normal play
- [x] Milestone year projections provided for normal, optimal, and worst-case scenarios

**Difficulty Scaling (Deliverable 6):**
- [x] Difficulty scaling values exist for Earths 1, 2, 3, 5, 10, 20

**Event Balance (Deliverable 7):**
- [x] All 80 events reviewed — no event has an "always correct" choice
- [x] Event outcomes balanced against `event-index.json` data

**Monte Carlo (Deliverable 8):**
- [x] `monte-carlo-scenarios.json` has exactly 20 entries and parses as valid JSON
- [x] All commandment IDs in scenarios reference valid IDs from 03-commandments.md
- [x] All strategy values match playtest profile IDs (aggressive, passive, hybrid, random, optimal, degenerate)
- [x] All win rate targets are numbers, not ranges or prose

**Harbinger Balance (Deliverable 9):**
- [x] Signal Strength budget per era has exact values
- [x] All 6 sabotage action costs tuned
- [x] Rubber banding thresholds defined
- [x] Divine Purge effectiveness balanced against Harbinger corruption rate

**Stage 2B Tuning (Deliverable 10):**
- [x] Voice loyalty gain/loss rates have exact values
- [x] Progressive unlock timing validated across all eras

**Process:**
- [x] Verification subagent passed (see pipeline INDEX — Verification Subagent Protocol)
- [x] Consistency audit passed (`scripts/audit-consistency.sh`)
- [x] All changes follow design-change protocol
