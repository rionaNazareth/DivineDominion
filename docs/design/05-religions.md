# DIVINE DOMINION — Rival Religions System

> Cross-references: [Overview](01-overview.md) · [Commandments](03-commandments.md) · [Pre-Made Religions](05b-religions-premade.md) · [World](04-world.md) · [Nation AI](04b-nation-ai.md) · [Divine Powers](06-divine-powers.md) · [Harbinger](14-harbinger.md) · [Formulas](formulas.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## Design Note — Archetype Disclaimer

All rival religions are fictional archetypes (militant, peaceful, scholarly, etc.), not representations of any real-world religion, ideology, or belief system. Similarities to historical movements are intentional as genre convention but are not commentary on specific faiths.

---

## Rival Religion Structure

Each rival religion is pre-generated at world creation. They are full religions with commandments, identity, and personality — but their Gods never act.

### Visible Properties

| Property | Description |
|----------|-------------|
| **10 commandments** | Same system as player. Defines expansion, conflict, knowledge, society, divine, nature, morality. |
| **Name** | Unique per religion (LLM-generated or template fallback). |
| **Visual identity** | Color + symbol. Distinct on map and UI. |
| **Personality archetype** | One of 8 types. Shapes nation AI behavior. |

---

## Rival Religion Behavior (Stage 4 — Deliverable 3)

### Personality Archetypes (8 types)

Each archetype applies weighted modifiers to the owning nation's AI decision tree (see `04b-nation-ai.md`):

| Archetype | War Bias | Trade Bias | Dev Bias | Faith Spread Bias | Description |
|-----------|---------|-----------|---------|-------------------|-------------|
| **peaceful** | -0.3 | +0.2 | +0.1 | 0.0 | Avoids conflict, builds trade |
| **militant** | +0.3 | -0.1 | 0.0 | +0.1 | Crusades, holy wars |
| **expansionist** | +0.2 | +0.1 | 0.0 | +0.2 | Spread faith aggressively |
| **isolationist** | -0.2 | -0.2 | +0.3 | -0.1 | Internal focus, fortress mentality |
| **scholarly** | -0.1 | +0.1 | +0.3 | 0.0 | Knowledge over conquest |
| **apocalyptic** | +0.2 | -0.2 | -0.1 | +0.2 | Reckless, seeks world's end |
| **syncretic** | -0.1 | +0.2 | +0.1 | -0.2 | Absorbs other faiths, reduces tensions |
| **mercantile** | 0.0 | +0.3 | +0.2 | -0.1 | Money over God |

These biases are **added** to the raw action scores before personality weight multiplication. A militant religion in a defensive nation creates tension between AI personality and religious doctrine.

### Religion-to-Nation AI interaction

1. Compute religion bias for the action (from table above)
2. Add to raw action score: `modified_score = raw_score + religion_bias`
3. Multiply by personality weight: `final_score = personality_weight × modified_score`

This means a militant religion makes even a defensive nation slightly more likely to declare war — the religion pushes, but the national character pushes back.

### Rivalry mechanics

Religions interact based on commandment compatibility:

| Relationship | Condition | Effect |
|-------------|-----------|--------|
| **Tolerant** | 5+ shared commandments | Opinion +0.2 between nations, peaceful conversion only |
| **Competitive** | 3–4 shared commandments | Neutral — standard conversion/spread rules |
| **Hostile** | 0–2 shared commandments | Opinion -0.2, holy war eligible, forced conversion enabled |

---

## Hidden Divine Rule Schema (Stage 4 — Deliverable 4)

Each rival religion has exactly 3 hidden rules. They use a simple **1 condition → 1 effect** model: deterministic, discoverable, and debuggable.

### Condition Types (enum)

| Type | Threshold Meaning | Scope | Example |
|------|------------------|-------|---------|
| `population_above` | Nation total pop | nation | Pop > 200,000 |
| `population_below` | Nation total pop | nation | Pop < 50,000 |
| `region_count_above` | Controlled regions | nation | Regions > 6 |
| `region_count_below` | Controlled regions | nation | Regions < 3 |
| `era_reached` | Game era index (1–12) | global | Era ≥ 5 |
| `at_war` | Currently at war | nation | Any active war |
| `at_peace_ticks` | Consecutive peace ticks | nation | Peace ≥ 50 ticks |
| `faith_above` | Dominant faith influence | nation avg | Faith > 0.7 |
| `development_above` | Nation avg dev | nation | Dev > 5 |
| `trade_routes_above` | Active trade routes | nation | Routes > 2 |
| `army_strength_above` | Total military | nation | Strength > 15,000 |

### Effect Types (enum)

| Type | Magnitude Meaning | Duration |
|------|------------------|----------|
| `faith_boost` | Faith influence gain per tick | `EFFECT_DURATION_TICKS` (20) |
| `faith_penalty` | Faith influence loss per tick | 20 ticks |
| `military_boost` | Military strength multiplier | 20 ticks |
| `economy_boost` | Economy output multiplier | 20 ticks |
| `development_boost` | Dev growth multiplier | 20 ticks |
| `population_boost` | Pop growth multiplier | 20 ticks |
| `happiness_boost` | Happiness bonus | 20 ticks |
| `disaster_on_enemy` | Per-tick chance of natural disaster on enemy nation | 20 ticks |
| `natural_disaster_shield` | Immunity to natural disasters | 20 ticks |

### Trigger Logic

Every tick, during religion spread (step 8):
1. For each rival religion with nations following it:
2. For each hidden rule on that religion:
3. Check if `cooldownTicks` since `lastTriggeredTick` have elapsed
4. Evaluate condition against the **primary nation** following this religion (defined as the nation with the largest total population among those with this religion as dominant)
5. If condition met → apply effect, set `lastTriggeredTick = currentTick`

### Discovery Mechanics

The player discovers hidden rules by observing patterns:

| Method | How it works |
|--------|-------------|
| **Pattern observation** | After `DISCOVERY_OBSERVATIONS_REQUIRED` (3) visible triggers, rule description appears in the religion's info panel as "Suspected rule: [description]" |
| **Scholar Voice** | A Scholar Follower Voice in a region adjacent to a religion with active hidden rules can detect them faster (2 observations instead of 3) |
| **Era narratives** | LLM-generated era narratives may hint at patterns (flavor, not mechanical) |

### 5 Example Hidden Rules

| Religion | Condition | Effect | Observable Pattern |
|----------|-----------|--------|--------------------|
| Order of the Flame | `at_war` (any active war) | `military_boost` × 0.15 for 20 ticks | "They always seem to win after starting a war" |
| Children of the Harvest | `at_peace_ticks` ≥ 50 ticks | `population_boost` × 0.02 for 20 ticks | "Their population surges during long peace" |
| Watchers of the Deep | `development_above` > 5 | `economy_boost` × 0.10 for 20 ticks | "Advanced Watcher cities grow richer than expected" |
| Cult of Endings | `era_reached` ≥ 8 | `disaster_on_enemy` chance 0.10 for 20 ticks | "Natural disasters spike near the Cult's enemies in later eras" |
| Seekers of Unity | `faith_above` > 0.7 | `happiness_boost` × 0.05 for 20 ticks | "Their people seem unusually content when devout" |

---

## Religion Lifecycle (Stage 4 — Deliverable 5)

Religions evolve over the 600-year run through five lifecycle events. All are emergent from the simulation.

### Spread

Religion spreads via heat diffusion (see `formulas.md` §Religion Spread). Three channels:
- **Border diffusion:** Adjacent regions with different religions exchange influence per tick
- **Trade routes:** Trade adds `TRADE_ROUTE_SPREAD_BONUS` per tick
- **Prophet (player):** Active Prophet power adds `MISSIONARY_CONVERSION_RATE` per tick

Theocracy government adds `THEOCRACY_FAITH_SPREAD_BONUS` (+30%) to all outgoing spread from that nation.

### Conversion

A region's dominant religion changes when a competing religion's influence exceeds `CONVERSION_DOMINANT_THRESHOLD` (0.60):

| Conversion Type | Rate | Retention |
|----------------|------|-----------|
| **Peaceful** (diffusion, trade, prophet) | Base rate | `CONVERSION_RETENTION_BASE + PEACEFUL_CONVERSION_RETENTION_BONUS` (0.90) |
| **Forced** (conquest) | `base × FORCED_CONVERSION_RATE_MULTIPLIER` (2×) | `CONVERSION_RETENTION_BASE` (0.80) |
| **Auto-convert** (if commandment `autoConvertOnConquest`) | Instant on conquest | 0.70 (lower — resentment) |

### Schism

A religion splits when accumulated tension exceeds thresholds:

```
FORMULA: Schism Check (per tick, per region with player religion dominant)
  — Authority: formulas.md §3.3
INPUTS:
  tension_modifiers: float[]    — schism risk values from active tension pairs [0.15–0.30 each]
  happiness: float [0, 1]       — region happiness (unhappy people question faith)
  hypocrisy_level: float [0, 1] — player religion only
FORMULA:
  total_tension = sum(tension_modifiers)
  schism_prob = total_tension × SCHISM_BASE_RISK_PER_TICK (0.001) × (1 - happiness)
              × (1 + hypocrisy_level)
  if total_tension >= SCHISM_THRESHOLD (0.50):
    schism_prob *= 2.0
  if seeded_random() < schism_prob → schism fires
```

**When schism fires:**
1. Identify the lowest-faith region cluster (connected regions with faith < 0.5)
2. Create a new religion: inherits 7 commandments from parent, replaces 3 with random alternatives
3. New religion starts with `personality = parent.personality` (may drift on reform)
4. Regions in the cluster switch to the new religion at influence 0.6

### Merge

Two religions can merge when they are too similar and too close:

```
FORMULA: Merge Eligibility
CONDITIONS (all must be true):
  1. Commandment overlap ≥ MERGE_SIMILARITY_THRESHOLD (0.70) — 7+ shared commandments
  2. Geographic proximity ≤ MERGE_PROXIMITY_MAX_DISTANCE (3) — BFS distance between nearest regions
  3. Combined region count ≥ MERGE_MIN_COMBINED_REGIONS (3)
  4. Neither religion is the player's religion
```

Merge check runs once per era (at era boundary, not every tick). When eligible:
- Smaller religion absorbs into larger
- Combined religion keeps the larger religion's name and commandments
- Hidden rules: keeps the larger religion's rules, discards the smaller's

### Reform

A religion can reform (change commandments) under crisis conditions:

```
CONDITIONS (any one triggers reform check):
  1. Nation stability < REFORM_CRISIS_STABILITY (0.30) AND era >= REFORM_ERA_THRESHOLD (4)
  2. Lost 50%+ of regions in the last era
  3. Player casts Miracle on a region with this religion's > 0.5 influence (divine pressure)

EFFECT:
  Replace REFORM_COMMANDMENT_CHANGES (2) commandments with alternatives from the same categories.
  If the religion has personality 'syncretic': reform chance is 2× (they adapt faster).
```

### Extinction

A religion goes extinct when no region has it as dominant and total influence across all regions < 0.01:
1. Remove from `WorldState.religions`
2. All remaining minor influence traces decay at 2× rate
3. Hidden rules become inert (no nation follows the religion)

Player religion **cannot** go extinct — if reduced to 0 regions, it persists as a diaspora (influence traces in former regions) and can be revived via Prophet.

---

## 10 Pre-Made Rival Religions

See **[05b-religions-premade.md](05b-religions-premade.md)** for the full pool of 10 pre-authored rival religions with commandments, hidden rules, and flavor text.

---

### Forceful vs. Peaceful Conversion

| Commandment | Effect on Conversion |
|-------------|---------------------|
| `autoConvertOnConquest` | Instant conversion on conquest, low retention (0.70) |
| `passiveSpread` | +50% border diffusion rate, no forced conversion |
| `holyWarEnabled` | Enables forced conversion during war, +20% faith combat bonus |

Religion commandments are the primary lever for how conversion behaves. Militant religions convert by the sword (fast but fragile). Peaceful religions convert by proximity (slow but durable).
