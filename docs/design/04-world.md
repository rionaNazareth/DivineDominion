# DIVINE DOMINION — World Generation, Nations & Warfare

> Cross-references: [Overview](01-overview.md) · [Commandments](03-commandments.md) · [Religions](05-religions.md) · [Divine Powers](06-divine-powers.md) · [Harbinger](14-harbinger.md) · [Nation AI](04b-nation-ai.md) · [Formulas](formulas.md) · [Constants](constants.md) · [INDEX](../INDEX.md)

---

## World Generation Algorithm (Stage 4 — Deliverable 1)

Each Earth is procedurally generated from a single seed. The algorithm is deterministic: same seed = same world. Library: **d3-delaunay** for Voronoi tessellation.

### Step 1: Initialize PRNG

Input: `WorldState.seed`. Initialize mulberry32 (see `formulas.md` §Seeded PRNG). All `seeded_random()` calls in Steps 2–15 use this PRNG in a fixed call order.

### Step 2: Determine world parameters

```
regionCount = floor(seeded_random() × (REGIONS_MAX - REGIONS_MIN + 1)) + REGIONS_MIN
nationCount = floor(seeded_random() × (NATIONS_MAX - NATIONS_MIN + 1)) + NATIONS_MIN
religionCount = floor(seeded_random() × (RIVAL_RELIGIONS_MAX - RIVAL_RELIGIONS_MIN + 1)) + RIVAL_RELIGIONS_MIN
```

### Step 3: Generate region centers (Poisson disk sampling)

Canvas: `CANVAS_WIDTH × CANVAS_HEIGHT` (1000×600 px). Generate `regionCount` points with min spacing `POISSON_MIN_DISTANCE` (80 px) using Bridson's algorithm seeded from the PRNG. Points near canvas edges get slight inward bias to avoid thin border cells.

### Step 4: Voronoi tessellation

Feed point set into `d3-delaunay`. Extract per-region: centroid (`position`), polygon boundary (`vertices`), and neighbor list (`adjacentRegionIds`) from shared Voronoi edges.

### Step 5: Assign ocean regions

Generate elevation noise (Simplex, scale `NOISE_SCALE`, octaves `NOISE_OCTAVES`). Add distance-from-center bias: `adjusted = elevation - 0.3 × (distance_from_center / max_distance)`. Regions with `adjusted < WATER_RATIO` threshold → terrain = `ocean`. Flood-fill check: ensure all land regions form at least one connected mass. If not, flip isolated land→ocean or vice versa.

### Step 6: Assign terrain to land regions

Generate two noise layers at each land region's centroid:
- **Elevation layer** (Simplex noise, seed offset 0)
- **Moisture layer** (Simplex noise, seed offset 31337)

Terrain assignment (evaluated top-to-bottom, first match wins):

| Condition | Terrain |
|-----------|---------|
| `elevation > ELEVATION_MOUNTAIN` (0.75) | mountain |
| `elevation > ELEVATION_TUNDRA` (0.55) AND `moisture < MOISTURE_TUNDRA` (0.30) | tundra |
| `elevation > ELEVATION_HILLS` (0.45) | hills |
| `moisture < MOISTURE_DESERT` (0.25) | desert |
| `moisture > MOISTURE_FOREST` (0.65) | forest |
| Adjacent to at least one ocean region | coast |
| else | plains |

### Step 7: Build adjacency graph

From Voronoi edges: regions sharing an edge are adjacent. Store in `region.adjacentRegionIds[]`. Ocean↔land adjacency exists (for coast detection, naval trade) but armies cannot traverse ocean.

### Step 8: Place nations

1. Select `nationCount` land regions as capitals. Use greedy farthest-first: pick first capital randomly from plains/coast regions, then each subsequent capital is the land region maximizing minimum distance to all existing capitals. Enforce `CAPITAL_MIN_DISTANCE` (3 regions apart via BFS).
2. Mark capitals: `isCapital = true`, `hasCity = true`, `cityLevel = 2 + floor(seeded_random() × 2)` (2 or 3).
3. Flood-fill territories: BFS from each capital simultaneously, one region per round-robin pass. Each nation gets `REGIONS_PER_NATION_MIN` to `REGIONS_PER_NATION_MAX` regions. Remaining land assigned to nearest capital by BFS distance.

### Step 9: Assign starting conditions per region

```
population = floor(seeded_random() × (STARTING_POPULATION_MAX - STARTING_POPULATION_MIN) × POP_BIAS[terrain]) + STARTING_POPULATION_MIN
development = clamp(floor(seeded_random() × (STARTING_DEV_MAX - STARTING_DEV_MIN + 1) × DEV_BIAS[terrain]) + STARTING_DEV_MIN, 1, 3)
happiness = HAPPINESS_BASE (0.50)
faithStrength = 0.5
```

### Step 10: Place cities

Capital cities placed in Step 8. Additionally, for each nation with >4 regions, place 1 city (`cityLevel = 1`) in the highest-population non-capital region.

### Step 11: Distribute religions

1. **Player religion:** Assigned to player's starting nation. 2–3 regions (capital + 1–2 adjacent) get player religion as dominant at influence 0.7.
2. **Cap rival religions:** `religionCount = min(religionCount, nationCount - 1)` — ensures every rival religion has at least one home nation. With 8 nations and 12 rolled religions → capped at 7.
3. **Assign rival religions:** Distribute `religionCount` religions across non-player nations. Each nation gets exactly 1 religion (first pass). If religions < non-player nations, remaining nations share the religion of their nearest neighbor. All regions within a nation start with that religion as dominant (influence 0.6). Personality randomly assigned from the 8 archetypes (see `05-religions.md`). 3 hidden divine rules generated per religion.
4. All regions get initial `religiousInfluence[]` entries: dominant religion at assigned influence, others at 0.

### Step 12: Create initial armies

Each nation starts with 1 army garrisoned at its capital:
```
strength = floor(seeded_random() × (STARTING_ARMY_STRENGTH_MAX - STARTING_ARMY_STRENGTH_MIN)) + STARTING_ARMY_STRENGTH_MIN
morale = 0.80
state = 'garrisoned'
commander = (seeded_random() < 0.5) ? random_commander : null
```
Commander trait: uniform random from `['aggressive', 'cautious', 'brilliant', 'reckless']`.

### Step 13: Set initial relations

For every nation pair (A, B):
- Same dominant religion → `opinion += 0.3`
- Share a border (adjacent regions) → `opinion -= 0.1`
- Otherwise → `opinion = 0.0`
- `atWar = false`, `tradeAgreement = false`, `alliance = false`, `peaceTicks = 0`

### Step 14: Initialize nation AI personality

Each nation's personality is biased by its dominant religion's personality:

| Religion Personality | Aggressive | Defensive | Expansionist | Isolationist | Balanced |
|---------------------|-----------|-----------|-------------|-------------|---------|
| militant/apocalyptic | 50% | 10% | 20% | 0% | 20% |
| peaceful/syncretic | 0% | 40% | 10% | 30% | 20% |
| expansionist/mercantile | 10% | 10% | 50% | 10% | 20% |
| scholarly/isolationist | 5% | 25% | 10% | 40% | 20% |

All nations start: `stability = STABILITY_BASE (0.70)`, `warWeariness = 0.0`, `government = 'monarchy'`.

### Step 15: Compute derived values

```
nation.development = sum(r.population × r.development for r in regions) / sum(r.population for r in regions)
nation.economicOutput = sum(region_economy for r in regions)
nation.militaryStrength = sum(army.strength for a in armies)
```

**Output:** Fully populated `WorldState`. Determinism guarantee: all `seeded_random()` calls in Steps 1–15 happen in fixed order (within each step, entities processed by sorted ID).

---

## Nations

Nations are dynamic entities that act autonomously. They are not player-controlled; the player influences them through religion, divine intervention, and emergent behavior. See [04b-nation-ai.md](04b-nation-ai.md) for the full AI decision tree.

### Nation Properties

| Property | Description |
|----------|-------------|
| **Territory** | Set of regions. Borders change via conquest, diplomacy, or collapse. |
| **Population** | Grows or shrinks. Affected by food, happiness, war, disease. |
| **Religion(s)** | One or more faiths present. One dominant. Affects behavior. |
| **Development** | Pop-weighted avg of region dev (1–12). Advances over time. |
| **Military** | Army strength, composition, doctrine. |
| **Government** | 5 types: monarchy, republic, democracy, theocracy, military_junta. See [04b](04b-nation-ai.md). |
| **Relations** | Diplomatic ties: opinion, alliances, trade, war state. |
| **AI Personality** | One of 5 archetypes. Shapes decision weights. See [04b](04b-nation-ai.md). |
| **Stability** | 0.0–1.0. Decays during war, recovers in peace. Drives revolution risk. |
| **War Weariness** | 0.0–1.0. Grows during war, decays in peace. Pushes toward peace. |

---

## Armies & Warfare

Armies are visible map entities that move, assemble, and fight on the world map. See `formulas.md` for battle resolution math.

| Property | Range | Notes |
|----------|-------|-------|
| **Strength** | 500–50,000 | Troop count/equipment quality |
| **Morale** | 0–100% | Religion, victories, supply, divine blessings |
| **Movement** | Variable | Terrain-dependent ticks (plains=2, mountain=8) |
| **Supply range** | 3 regions | Beyond = attrition (morale + strength decay) |
| **Commander** | Named leader | Trait: aggressive/cautious/brilliant/reckless |

### War Flow

1. **Nation decides to attack** — AI evaluates targets (see [04b](04b-nation-ai.md) war score formula).
2. **Player sees attack plan** — Divine Overlay shows dashed arrows.
3. **Armies assemble** — 2–5 game-years at staging areas.
4. **March along routes** — Armies move across map.
5. **Battle resolves** — See `formulas.md` §Battle Resolution.
6. **Retreat or advance** — Winner gains territory; loser may collapse or sue for peace.

---

## Disease & Plague

Disease emerges from war, famine, trade, and overcrowding. Full lifecycle formulas in `formulas.md` §Disease System.

| Trigger | Effect |
|---------|--------|
| War | Camps, sieges, refugees spread disease |
| Famine | Malnutrition weakens populations |
| Trade | Trade routes carry pathogens |
| Overcrowding | Dense cities breed outbreaks |

Severity: mild → moderate → severe → pandemic. Recovery: development accelerates recovery, quarantine slows spread, divine powers amplify or heal.

---

## Trade Routes

Trade routes form between nations with compatible conditions. Full formulas in `formulas.md` §Trade Route System.

| Condition | Required |
|-----------|----------|
| Geography | Shared border or sea lane |
| Peace | Not at war, `peaceTicks >= TRADE_PEACE_TICKS_REQUIRED` |
| Formation score | Above `FORMATION_THRESHOLD` |

Effects: wealth generation, tech transfer, religion spread, disease vector, diplomatic ties (reduced war likelihood).

Golden lines on map; thicker = higher volume.
