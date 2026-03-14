# DIVINE DOMINION — Procedural Event System

> Cross-references: [Overview](01-overview.md) · [World](04-world.md) · [Eras](07-eras-and-endgame.md) · [Religions](05-religions.md) · [Commandments](03-commandments.md) · [Harbinger](14-harbinger.md) · [Event Index](event-index.json) · [INDEX](../INDEX.md)

---

## Event Cadence

Every **~2 real-time minutes** (~5 game-years), the system rolls **1–3 events** from weighted tables. Events **auto-pause** the game and present a notification. Player must acknowledge or choose before resuming.

---

## Event Template Schema

Event templates define the structure for all 80 events. See `src/types/game.ts` for runtime types (`GameEvent`, `EventChoice`, `EventOutcome`, `RegionEffects`). Templates add trigger conditions and weight formulas on top of the runtime shape.

### Template Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID: `EVT_001`–`EVT_080` |
| `category` | `EventCategory` | One of 8 from `game.ts` |
| `title` | `string` | Short display name |
| `description` | `string` | Narrative text with `{variable}` slots |
| `eraRange` | `[number, number]` | Earliest and latest era (1–12) |
| `triggerConditions` | `TriggerCondition[]` | All must be true for event to be eligible |
| `baseWeight` | `number` | Base probability weight (0.1–2.0) |
| `weightModifiers` | `WeightModifier[]` | Conditional multipliers |
| `choices` | `EventTemplateChoice[]` | 2–3 player choices with outcomes |
| `autoResolve` | `EventTemplateOutcome` | Outcome when player doesn't choose (auto-dismiss) |
| `alienCaused` | `boolean?` | If true, secretly Harbinger-caused (Eras 7+) |

### Trigger Condition Types

Each condition has a `type`, `threshold`, `scope`, and `operator` (default: `gte` for "greater than or equal to"). String conditions use `value` instead of `threshold`.

| Condition | Scope | Operator | Threshold/Value | Description |
|-----------|-------|----------|----------------|-------------|
| `military_imbalance` | 2 nations | `gte` | ratio (float) | Attacker/defender strength ratio |
| `border_tension` | 2 nations | `lte` | opinion (float) | Adjacent nations opinion below threshold |
| `faith_diversity` | region | `gte` | count (int) | Number of religions with influence > 0.2 |
| `schism_risk` | region | `gte` | probability (float) | Schism probability |
| `development_level` | nation | `gte`/`lte` | level (int, 1-10) | Average Dev score |
| `war_active` | nation | `eq` | boolean | Currently at war |
| `peace_duration` | nation | `gte` | ticks (int) | Consecutive peace ticks (resolves to min of `DiplomaticRelation.peaceTicks` across all relations) |
| `population_threshold` | nation | `gte`/`lte` | count (int) | Total population |
| `trade_active` | region | `eq` | boolean | Active trade route in region |
| `era_reached` | global | `gte` | era index (int, 1-12) | Current era |
| `happiness_low` | nation | `lte` | value (float, 0-1) | Average happiness |
| `stability_low` | nation | `lte` | value (float, 0-1) | Stability |
| `government_type` | nation | `eq` | value: string | Matches specific government (e.g., `"theocracy"`, `"democracy"`) |
| `religion_majority` | nation | `eq` | boolean | Player religion is majority |
| `science_milestone` | global | `gte` | milestone index (int, 0-based) | Milestone reached (0=printing, 1=scientific_method, ...) |
| `capital_threatened` | nation | `eq` | boolean | Enemy army within 1 region of capital |
| `war_weariness` | nation | `gte` | ticks (int) | Consecutive war ticks |
| `economy_strong` | nation | `gte` | gdp (float) | Economy metric above threshold |
| `economy_weak` | nation | `lte` | gdp (float) | Economy metric below threshold |
| `battle_won` | nation | `eq` | boolean | Won a battle this era |
| `battle_lost` | nation | `eq` | boolean | Lost a battle this era |
| `plague_active` | region | `eq` | boolean | Active plague in region |
| `famine_active` | region | `eq` | boolean | Active famine in region |
| `corruption_high` | nation | `gte` | value (float, 0-1) | Corruption above threshold |
| `region_count` | nation | `gte`/`lte` | count (int) | Regions controlled |
| `alliance_active` | 2 nations | `eq` | boolean | Active alliance between nations |
| `harbinger_signal` | global | `gte` | strength (float) | Harbinger signal strength |
| `defense_grid_progress` | global | `gte` | percentage (float, 0-1) | Defense Grid completion |
| `commander_trait` | nation | `eq` | value: string | Nation has commander with specific trait (e.g., `"aggressive"`) |
| `morale_low` | nation | `lte` | value (float, 0-1) | Army morale below threshold |
| `faith_low` | nation | `lte` | value (float, 0-1) | Faith influence below threshold |
| `faith_high` | nation | `gte` | value (float, 0-1) | Faith influence above threshold |
| `happiness_high` | nation | `gte` | value (float, 0-1) | Happiness above threshold |
| `research_high` | nation | `gte` | value (float, 0-1) | Research output above threshold |
| `university_present` | region | `eq` | boolean | Region has university building |
| `industry_present` | region | `eq` | boolean | Region has industrial infrastructure |

### Outcome Target Scope

Every effect in an `EventOutcome` specifies a `target` to resolve ambiguity:

| Target | Meaning | Example |
|--------|---------|---------|
| `nation_a` | First nation in event (attacker/initiator) | militaryChange: -300, target: `nation_a` |
| `nation_b` | Second nation in event (defender/responder) | faithChange: +0.10, target: `nation_b` |
| `region` | Specific region where event occurs | happinessChange: -0.05, target: `region` |
| `player_religion` | All nations with player religion majority | faithChange: +0.05, target: `player_religion` |
| `global` | All nations | researchChange: +0.10, target: `global` |
| `self` | Nation that triggered the condition | economyChange: +0.10, target: `self` |

If `target` is omitted, default is `region` for local events and `nation_a` for inter-nation events.

### Variable Slots

| Variable | Source | Available in |
|----------|--------|-------------|
| `{nation_a}`, `{nation_b}` | Nation names | War, alliance, trade events |
| `{region}` | Region name | Local events |
| `{religion}` | Religion name | Religious events |
| `{commandment}` | Commandment name | Schism, reformation events |
| `{leader}` | Commander/ruler name | Political, military events |
| `{year}` | Current game year | All events |
| `{milestone}` | Science milestone name | Scientific events |
| `{population}` | Formatted pop count | Population events |
| `{defense_status}` | Defense Grid state | Era 11-12 events: `"not started"` / `"under construction"` / `"partially built"` / `"online"` |
| `{grid_status}` | Defense Grid percentage | Era 12 events: formatted as `"60% operational"` or `"online"` / `"offline"` |
| `{casualties}` | War casualties | War resolution events |
| `{trade_partner}` | Trade partner nation | Trade events |

---

## Event Categories (8 × 10 = 80 events)

| Category | Count | Era Range | Themes |
|----------|-------|-----------|--------|
| `military` | 10 | 1–12 | Wars, skirmishes, arms races, sieges, naval battles, ceasefire |
| `religious` | 10 | 1–12 | Schisms, reformation, prophets, heresy, pilgrimage, miracles |
| `scientific` | 10 | 1–12 | Breakthroughs, universities, inventors, printing, space |
| `natural` | 10 | 1–12 | Earthquakes, droughts, plagues, harvests, storms, wildlife |
| `cultural` | 10 | 2–12 | Renaissance, art, philosophy, festivals, languages |
| `political` | 10 | 1–12 | Revolutions, alliances, assassinations, trade disputes, treaties |
| `internal` | 10 | 1–12 | Corruption, revolts, famine, migration, infrastructure |
| `alien` | 10 | 7–12 | Signals, decoded messages, fleet sighting, panic, mobilization |

See `event-index.json` for all 80 event definitions.

---

## Choice Philosophy

**Mix approach** (Decision Point 3): early-era events (1–4) have a recognizably "better" choice that rewards learning. Late-era events (7+) present genuine tradeoffs where your commandments determine what "right" means. Mid-era events (5–6) transition between the two.

---

## 3 Fully-Worked Example Events

### Example 1 — Military: Border Skirmish (EVT_001)

**Era range:** 1–12 | **Category:** `military` | **Base weight:** 1.2

**Trigger:** `military_imbalance` (ratio > 1.5 between neighbors) AND `border_tension` (opinion < -0.3)

**Description:** *"Soldiers of {nation_a} have crossed into {region}, a contested territory claimed by {nation_b}. Shots have been fired. Both sides look to you."*

| Choice | Effects | Target | Narrative |
|--------|---------|--------|-----------|
| **Bless the Defenders** | faithChange: +0.10, militaryChange: +500 | `nation_b` | *"Your light shines on the defenders. Their resolve stiffens."* |
| **Curse the Aggressors** | militaryChange: -300, happinessChange: -0.05 | `nation_a` | *"A divine wind scatters the advance. The aggressors retreat, shaken."* |
| **Stay Silent** | faithChange: -0.05 | `nation_a` + `nation_b` | *"Your silence speaks louder than any miracle. Both sides wonder if you care."* |

**Auto-resolve:** faithChange: -0.03, target: `player_religion` | *"The skirmish resolves on its own. Your followers notice your absence."*

### Example 2 — Religious: The Great Schism (EVT_015)

**Era range:** 3–12 | **Category:** `religious` | **Base weight:** 0.8

**Trigger:** `schism_risk` (> 0.40) AND `faith_diversity` (2+ religions in region)

**Description:** *"Followers of {religion} in {region} have split over the meaning of '{commandment}.' A charismatic preacher says your words mean something different. Your faithful are choosing sides."*

| Choice | Effects | Target | Narrative |
|--------|---------|--------|-----------|
| **Support the Orthodox** | faithChange: +0.15, happinessChange: -0.10, researchChange: -0.05 | `region` | *"You make your will known. The orthodox rejoice. The reformers burn with resentment."* |
| **Support the Reformers** | faithChange: -0.10, happinessChange: +0.05, researchChange: +0.10 | `region` | *"Change is divine too. The reformers carry your blessing into new interpretations."* |
| **Stay Silent** | faithChange: -0.05, happinessChange: -0.05 | `region` | *"Your silence is interpreted by both sides as agreement. The schism deepens."* |

**Auto-resolve:** faithChange: -0.08, schism fires at 60% probability, target: `region` | *"Without divine guidance, the split widens."*

### Example 3 — Alien: Decoded Transmission (EVT_072)

**Era range:** 9–10 | **Category:** `alien` | **Base weight:** 1.5

**Trigger:** `era_reached` (9) AND `science_milestone` (computing)

**Description:** *"Scholars at {region}'s academy have decoded the alien transmission. The message is simple: coordinates. Arrival estimates. And something that might be a countdown. The world holds its breath."*

| Choice | Effects | Target | Narrative |
|--------|---------|--------|-----------|
| **Share with All Nations** | researchChange: +0.15, happinessChange: -0.10 | `global` | *"The truth spreads. Panic follows. But so does cooperation — grudgingly, desperately."* |
| **Classify the Data** | researchChange: +0.20, faithChange: +0.05 | `self` | *"Knowledge is power. Your nation alone knows the timeline. Your faithful trust your secrecy."* |
| **Destroy the Evidence** | happinessChange: +0.05, researchChange: -0.10 | `self` | *"Some truths are too heavy. You let them burn. For now, the world sleeps."* |

**Auto-resolve:** researchChange: +0.05, target: `global` | *"The data leaks slowly. Rumors spread. No one quite believes it yet."*

---

## Per-Run Cooldown System

Events that fire get a **cooldown multiplier** to prevent repeats:

| Fires | Weight Multiplier | Reset |
|-------|-------------------|-------|
| 1st | 1.0 (full weight) | — |
| 2nd | 0.25 | — |
| 3rd+ | 0.05 (near-zero) | — |

Cooldowns persist for the entire run. With 120-360 event rolls per run and 80 templates, this ensures variety. If all eligible events have fired 2+, the system resets the least-recently-fired half of the pool.

See `constants.md`: `EVENT_COOLDOWN_SECOND = 0.25`, `EVENT_COOLDOWN_THIRD = 0.05`.

---

## Weight Modifier Schema

Each event's `weightModifiers` array contains conditional multipliers:

| Field | Type | Description |
|-------|------|-------------|
| `condition` | `string` | Trigger condition type (from Trigger Condition Types table) |
| `multiplier` | `number` | Weight multiplier when condition is true (0.1–3.0) |

---

## Alien Event Fallback Trigger

Alien events (EVT_071–080) require `era_reached >= 7` and often `science_milestone`. In low-science runs where milestones are delayed, alien events use a **fallback trigger**: if no alien event has fired by Era 9, the system forces EVT_071 ("Strange Signals") regardless of science state. The alien threat is a narrative certainty, not a science-gated option.

---

## Weight Calculation

```
final_weight = base_weight × era_modifier × situational_modifier × cooldown_modifier
```

- **Base weight:** Per event type (0.1–2.0)
- **Era modifier:** Some events only possible in certain eras; alien events scale from 0.1 (Era 7) to 1.5 (Era 12)
- **Situational modifier:** Product of all matching `weightModifiers` for the current world state
- **Cooldown modifier:** Based on how many times this event has fired this run (see above)

---

## Event Priority

- **Conflict events** (war, schism, disaster) can interrupt normal cadence
- **Alien events** (late game) have higher priority when triggered
- **Player choice events** auto-pause; informational events can auto-dismiss after 5 seconds
- **Max queue:** 5 events. Excess events auto-resolve with "Stay Silent" outcome.

---

## Harbinger-Caused Events (Era 7+)

Starting Era 7, the Harbinger (see [Harbinger](14-harbinger.md)) sabotages humanity. Some events in Eras 7+ carry a hidden `alienCaused: true` flag. They look identical to natural events during play. The player cannot distinguish them until the Anomaly overlay unlocks at Era 10. After the game ends, Earth History reveals which events were Harbinger-caused. See [Narrative](02-narrative.md) for reveal text templates.

Events marked `alienCaused` in `event-index.json`: EVT_071 through EVT_080 (alien category) are explicitly alien. Additionally, ~5 events in other categories have `alienCaused` variants that activate when the Harbinger targets them (EVT_003, EVT_024, EVT_035, EVT_044, EVT_055).

---

## Known Gaps (Future Stages)

Identified during expert review. These are not Stage 5 deliverables but should be addressed in later stages:

| Gap | Affects | Recommended Stage |
|-----|---------|-------------------|
| No skip option for first-run intro | UX | Stage 6 (UI polish) |
| Event queue overflow invisible to player (capped at 5, excess auto-resolves) | UX | Stage 6 |
| No localization planning for narrative text | i18n | Post-launch |
| No accessibility considerations (screen readers, colorblind) for narrative | a11y | Stage 6 |
| Same event description every run (needs 2-3 description variants per event) | Replayability | Content expansion |
| Era 11-12 character names may feel too on-the-nose for modern setting | Polish | Stage 6 |
| ~~`consecutivePeaceTicks`~~ Resolved — maps to existing `DiplomaticRelation.peaceTicks` (min across all relations); Stage 8 defines the nation-level resolver | Types | Resolved |
| Event effect stacking/order unspecified when multiple events resolve same tick | Simulation | Stage 6 (impl) |
| `terrain_type` trigger semantics undefined (region property not yet in types) | Types | Stage 6 (impl) |
| No event frequency distribution analysis (statistical validation of 80 events) | QA | Playtest Checkpoint |
| Potential deadlock when no events can trigger (all cooldowns + no conditions met) | Simulation | Stage 6 (impl) |

---

## Stage 6: Event Balance Pass

### Balance Philosophy (Decision 5: Context-Dependent)

- **Eras 1-4:** Events have a recognizably "better" choice that rewards learning. New players can identify the beneficial option.
- **Eras 5-6:** Transition. Choices are more nuanced; best option depends on game state.
- **Eras 7-12:** Genuine tradeoffs where the "right" answer depends on commandments, strategy, and immediate needs.

### Category-Level Adjustments

| Category | Adjustment | Reason |
|----------|-----------|--------|
| Military (10) | Reduce "Bless the Defenders" faith bonus from +0.10 to +0.08 in early events | Prevent easy faith farming from frequent border conflicts |
| Scientific (10) | Increase "share knowledge" research bonus by +0.05 | Encourage cooperation path toward Defense Grid |
| Political (10) | Increase "ignore revolution" stability penalty from −0.05 to −0.10 | Make political inaction risky |
| Alien (10) | Increase "Share with All" research to +0.20 (from +0.15) in Era 11-12 | Late-game cooperation must feel impactful for Defense Grid |
| All others | No changes needed | Outcomes already balanced within design constraints |

### Event Outcome Bounds

All event outcomes must stay within these ranges to prevent single events from being game-deciding:

| Effect | Max Positive | Max Negative |
|--------|-------------|-------------|
| faithChange | +0.25 | −0.15 |
| happinessChange | +0.15 | −0.15 |
| researchChange | +0.20 | −0.15 |
| economyChange | +0.15 | −0.20 |
| militaryChange | +500 | −500 |
| populationChange | +5% | −5% |
