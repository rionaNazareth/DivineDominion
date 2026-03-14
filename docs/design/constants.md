# DIVINE DOMINION — Constants

> Cross-references: [Overview](01-overview.md) · [Divine Powers](06-divine-powers.md) · [Follower Voices](13-follower-voices.md) · [Harbinger](14-harbinger.md) · [In-Game Interactions](09c-in-game-interactions.md) · [World](04-world.md) · [Commandments](03-commandments.md) · [Religions](05-religions.md) · [Eras](07-eras-and-endgame.md) · [UI](09-ui-and-visuals.md) · [LLM](10-llm-integration.md) · [Tech](11-tech.md) · [INDEX](../INDEX.md)

---

**Single source of truth for all numerical values.** Code must import from `src/config/constants.ts`; this doc is the design reference.

---

## TIME

| Constant | Value | Notes |
|----------|-------|-------|
| GAME_YEARS_PER_REAL_MINUTE | 2.5 | Simulation speed (default) |
| TOTAL_GAME_YEARS | 600 | 1600–2200 AD |
| TOTAL_REAL_TIME_HOURS | 4 | Full game duration |
| ERA_COUNT | 12 | Eras per game |
| ERA_DURATION_REAL_MINUTES | 20 | Average per era (actual varies: 16–28 min) |
| SPEED_OPTIONS | [1, 2, 4] | 1×, 2×, 4× simulation speed |
| EVENT_INTERVAL_REAL_MINUTES | 2 | How often to roll for events |
| EVENTS_PER_ROLL | [1, 3] | Min, max events per roll |
| TICK_GAME_YEARS | 0.5 | Game-years per simulation tick |
| TICKS_PER_REAL_MINUTE_1X | 5 | Ticks per real minute at 1× speed |
| TOTAL_TICKS_PER_GAME | 1200 | Total ticks in a full game |

---

## DIVINE ENERGY

| Constant | Value | Notes |
|----------|-------|-------|
| STARTING_ENERGY | 10 | At game start |
| MAX_ENERGY | 20 | Cap |
| ENERGY_REGEN_PER_REAL_MINUTE | 1 | Passive regeneration |
| SACRIFICE_BONUS_ENERGY | 0.3 | Per real minute, with D1 commandment |

---

## BLESSINGS

| Name | Cost | Cooldown (min) | Duration (game years) |
|------|------|----------------|----------------------|
| Bountiful Harvest | 2 | 2 | 10 |
| Inspiration | 3 | 4 | 15 |
| Miracle | 4 | 6 | instant |
| Prophet | 5 | 8 | 20 |
| Shield of Faith | 3 | 4 | 10 |
| Golden Age | 6 | 12 | 15 |

---

## DISASTERS

| Name | Cost | Cooldown (min) | Duration (game years) |
|------|------|----------------|----------------------|
| Earthquake | 4 | 6 | instant |
| Great Flood | 3 | 5 | 5 |
| Plague | 5 | 10 | 10 |
| Great Storm | 2 | 3 | 5 |
| Famine | 3 | 5 | 5 |
| Wildfire | 4 | 6 | 5 |

---

## WORLD GENERATION

| Constant | Value | Notes |
|----------|-------|-------|
| REGIONS_MIN | 40 | Minimum Voronoi regions per world |
| REGIONS_MAX | 60 | Maximum Voronoi regions per world |
| NATIONS_MIN | 8 | Minimum nations per world |
| NATIONS_MAX | 12 | Maximum nations per world |
| RIVAL_RELIGIONS_MIN | 8 | Minimum rival religions rolled at world gen (capped at nationCount - 1) |
| RIVAL_RELIGIONS_MAX | 12 | Maximum rival religions rolled at world gen (capped at nationCount - 1) |
| RIVAL_RELIGIONS_PREMADE_POOL | 10 | Pre-made religions for LLM fallback (see `05b-religions-premade.md`). If more needed, reuse with name variations. |
| PLAYER_STARTING_REGIONS | [2, 3] | Min, max regions for player religion at start |
| HIDDEN_RULES_PER_RELIGION | 3 | Hidden divine rules per rival religion |
| CAPITAL_MIN_DISTANCE | 3 | Min regions between nation capitals |
| STARTING_DEV_MIN | 1 | Min starting development per region |
| STARTING_DEV_MAX | 3 | Max starting development per region |
| STARTING_ARMY_STRENGTH_MIN | 1000 | Min starting army strength |
| STARTING_ARMY_STRENGTH_MAX | 5000 | Max starting army strength |
| WATER_RATIO | 0.25 | Fraction of regions that are ocean |
| POISSON_MIN_DISTANCE | 80 | Min pixel distance between Voronoi seeds |
| CANVAS_WIDTH | 1000 | World canvas width (px) |
| CANVAS_HEIGHT | 600 | World canvas height (px) |

---

## TERRAIN GENERATION

| Constant | Value | Notes |
|----------|-------|-------|
| NOISE_SCALE | 0.008 | Simplex noise sampling scale |
| NOISE_OCTAVES | 2 | Noise octaves |
| NOISE_LACUNARITY | 2.0 | Frequency multiplier per octave |
| NOISE_PERSISTENCE | 0.5 | Amplitude multiplier per octave |
| ELEVATION_MOUNTAIN | 0.75 | Elevation threshold for mountain |
| ELEVATION_HILLS | 0.45 | Elevation threshold for hills |
| ELEVATION_TUNDRA | 0.55 | Elevation threshold for tundra (+ low moisture) |
| MOISTURE_DESERT | 0.25 | Moisture below this = desert |
| MOISTURE_FOREST | 0.65 | Moisture above this = forest |
| MOISTURE_TUNDRA | 0.30 | Moisture below this + high elevation = tundra |

**Population/Dev bias by terrain** (multiplier on starting range):

| Terrain | Pop Bias | Dev Bias |
|---------|----------|----------|
| plains | 1.2 | 1.1 |
| hills | 0.9 | 0.9 |
| forest | 0.8 | 0.8 |
| mountain | 0.5 | 0.6 |
| desert | 0.6 | 0.7 |
| tundra | 0.4 | 0.5 |
| coast | 1.1 | 1.2 |
| ocean | 0 | 0 |

---

## NATIONS

| Constant | Value | Notes |
|----------|-------|-------|
| ARMY_STRENGTH_MIN | 500 | Minimum army strength |
| ARMY_STRENGTH_MAX | 50000 | Maximum army strength |
| DEVELOPMENT_LEVELS | 12 | Development scale (1–12) |
| GOVERNMENT_TYPES | ["monarchy", "republic", "democracy", "theocracy", "military_junta"] | Government type options (lowercase in code) |
| REGIONS_PER_NATION_MIN | 3 | Minimum regions per nation at world gen |
| REGIONS_PER_NATION_MAX | 8 | Maximum regions per nation at world gen |
| POPULATION_GROWTH_BASE | 0.005 | Base population growth rate per tick (logistic model, 0.5-year ticks) |
| CARRYING_CAPACITY_PER_DEV | 50000 | Max population per dev level per region (Dev 5 = 250K cap) |
| POPULATION_MIN_PER_REGION | 100 | Floor — regions can't drop below this |
| STARTING_POPULATION_MIN | 5000 | Min region pop at world gen |
| STARTING_POPULATION_MAX | 50000 | Max region pop at world gen |
| SUPPLY_RANGE_BASE | 3 | Base supply range (regions) for armies |

---

## COMMANDMENTS

| Constant | Value | Notes |
|----------|-------|-------|
| TOTAL_BASE | 35 | Base commandments available |
| TOTAL_WITH_UNLOCKS | 50 | Including unlockable |
| CATEGORIES | 7 | Category count |
| PER_CATEGORY | 5 | Commandments per category |
| PLAYER_PICKS | 10 | Player selects 10 |
| STARTING_UNLOCKED | 35 | All base commandments available from start |

---

## COMMANDMENT STACKING

| Constant | Value | Notes |
|----------|-------|-------|
| MODIFIER_CAP_POSITIVE | 0.75 | Max positive modifier per stat from commandments |
| MODIFIER_CAP_NEGATIVE | -0.50 | Max negative modifier per stat from commandments |

---

## DANGEROUS EXPERIMENTS (Commandment)

| Constant | Value | Notes |
|----------|-------|-------|
| DANGEROUS_EXPERIMENTS_ACCIDENT_CHANCE | 0.05 | 5% per era boundary |
| DANGEROUS_EXPERIMENTS_DEV_LOSS | 1 | Dev levels lost in accident |
| DANGEROUS_EXPERIMENTS_POP_LOSS | 0.05 | 5% population loss |
| DANGEROUS_EXPERIMENTS_HAPPINESS_LOSS | 0.10 | Happiness penalty |

---

## "THE ENDS JUSTIFY THE MEANS" (Commandment #34)

| Constant | Value | Notes |
|----------|-------|-------|
| ENDS_JUSTIFY_FAITH_DECAY | 0.001 | Per-tick faith erosion in player-religion regions |
| ENDS_JUSTIFY_FAITH_FLOOR | 0.05 | Faith never drops below this (traces remain) |
| FOOD_STABILITY_THRESHOLD | 0.3 | Economy per capita threshold for "low food" combo check |

---

## COMMANDER TRAITS

| Constant | Value | Notes |
|----------|-------|-------|
| COMMANDER_MERGE_RANK | brilliant:4, aggressive:3, cautious:2, reckless:1 | Who to keep when armies merge |
| COMMANDER_ATTACK_MODS (brilliant) | 1.10 | +10% attack — best all-round |
| COMMANDER_ATTACK_MODS (aggressive) | 1.15 | +15% attack — offense-focused |
| COMMANDER_ATTACK_MODS (cautious) | 0.90 | -10% attack — defense-focused |
| COMMANDER_ATTACK_MODS (reckless) | 1.25 | +25% attack — high risk |
| COMMANDER_DEFEND_MODS (brilliant) | 1.10 | +10% defense |
| COMMANDER_DEFEND_MODS (aggressive) | 0.90 | -10% defense |
| COMMANDER_DEFEND_MODS (cautious) | 1.15 | +15% defense |
| COMMANDER_DEFEND_MODS (reckless) | 0.80 | -20% defense — high risk |

---

## BATTLE

| Constant | Value | Notes |
|----------|-------|-------|
| BATTLE_BASE_CASUALTY_RATE | 0.10 | Base fraction of troops lost per battle |
| BATTLE_VARIANCE_RANGE | 0.15 | ±15% seeded variance on combat ratio |
| BATTLE_WINNER_MORALE_CHANGE | 0.10 | Morale boost for winner |
| BATTLE_LOSER_MORALE_CHANGE | -0.20 | Morale penalty for loser |
| BATTLE_RETREAT_STRENGTH_THRESHOLD | 0.30 | Retreat if remaining < 30% original |
| BATTLE_RETREAT_MORALE_THRESHOLD | 0.20 | Retreat if morale < 20% |
| BATTLE_FORT_BONUS_PER_LEVEL | 0.15 | Defense bonus per city level (0–5) |
| BATTLE_MORALE_WEIGHT | 0.50 | Min effectiveness at morale 0 |
| BATTLE_CASUALTY_CLAMP_MIN | 0.30 | Min casualty rate multiplier |
| BATTLE_CASUALTY_CLAMP_MAX | 3.00 | Max casualty rate multiplier |
| BATTLE_TECH_ADVANTAGE_PER_DEV | 0.15 | Combat bonus per dev level above opponent (+15% each) |
| FAITH_COMBAT_HOLY_WAR_BONUS | 0.20 | Attack bonus for holy war (requires "Smite the Wicked" + different religion) |
| FAITH_COMBAT_STRONGHOLD_THRESHOLD | 0.80 | Religion influence level that triggers defend bonus |
| FAITH_COMBAT_DEFEND_BONUS | 0.15 | Defense bonus when defending a faith stronghold (80%+ influence) |
| FAITH_COMBAT_RIGHTEOUS_BONUS | 0.30 | Defense bonus from "Righteous Defense" commandment |

---

## HYPOCRISY

| Constant | Value | Notes |
|----------|-------|-------|
| FAITH_LOSS_PER_TICK_MILD | 0.001 | ~10% faith loss per era at severe |
| FAITH_LOSS_PER_TICK_MODERATE | 0.0015 | ~15% per era |
| FAITH_LOSS_PER_TICK_SEVERE | 0.002 | ~20% per era |
| HYPOCRISY_VIOLATION_GAIN_MILD | 0.05 | Hypocrisy level increase per mild violation |
| HYPOCRISY_VIOLATION_GAIN_MODERATE | 0.12 | Per moderate violation |
| HYPOCRISY_VIOLATION_GAIN_SEVERE | 0.25 | Per severe violation |
| HYPOCRISY_DECAY_RATE | 0.00125 | Per-tick decay; 0.125/era, one severe (0.25) clears in ~2 eras |
| HYPOCRISY_SCHISM_MODERATE | 0.10 | Extra schism risk multiplier at 0.4–0.7 |
| HYPOCRISY_SCHISM_SEVERE | 0.20 | Extra schism risk multiplier at 0.7+ |
| HYPOCRISY_VOICE_LOYALTY_LOSS | 0.05 | Per-tick voice loyalty loss when severe |
| HYPOCRISY_REVERSED_YEARS | 30 | Years without disasters/Miracle for reversed hypocrisy (Fear God's Wrath, Signs and Wonders) |
| SCHISM_RISK_PER_TENSION_PAIR | [0.15, 0.30] | Range: risk of schism per conflicting commandment pair |
| SCHISM_BASE_RISK_PER_TICK | 0.001 | Base schism probability per tick (multiplied by tension) |
| SCHISM_THRESHOLD | 0.50 | Tension level that doubles schism probability |

---

## SCIENCE MILESTONES

| # | ID | Name | Approx. Year | Dev Required | Nations Required | Trigger Condition |
|---|-----|------|--------------|-------------|-----------------|-------------------|
| 1 | printing_press | Printing Press | 1650 | 3 | 1 | 1+ nation Dev 3 |
| 2 | scientific_method | Scientific Method | 1700 | 4 | 3 | 3+ nations Dev 4 |
| 3 | industrialization | Industrialization | 1800 | 5 | 5 | 5+ nations Dev 5 |
| 4 | electricity | Electricity | 1870 | 6 | 3 | 3+ nations Dev 6 |
| 5 | flight | Flight | 1910 | 7 | 1 | 1+ nation Dev 7 |
| 6 | nuclear_power | Nuclear Power | 1950 | 8 | 1 | 1+ nation Dev 8 |
| 7 | computing | Computing | 1970 | 8 | 2 | 2+ nations Dev 8 |
| 8 | internet | Internet | 1990 | 9 | 3 | 3+ nations Dev 9, at peace |
| 9 | space_programs | Space Programs | 2030 | 10 | 2 | 2+ nations Dev 10, cooperating |
| 10 | planetary_defense | Planetary Defense | 2100 | 10 | 5 | 5+ nations Dev 10 cooperating OR 1 superpower Dev 12 |
| 11 | defense_grid | Defense Grid Online | 2150 | 12 | 1 | Planetary Defense achieved + sufficient investment |

---

## WIN CONDITIONS

| Constant | Value | Notes |
|----------|-------|-------|
| DEFENSE_GRID_NATIONS_REQUIRED | 5 | Nations at dev 10+ for defense grid |
| DEFENSE_GRID_DEV_LEVEL | 10 | Development level required |
| SUPERPOWER_DEV_LEVEL | 12 | Full superpower status (alt win path) |
| ALIEN_ARRIVAL_YEAR | 2200 | Year aliens arrive |
| ASCENSION_SCIENCE_LEVEL | 11 | All milestones reached |
| ASCENSION_PEACE_THRESHOLD | 0.9 | 90%+ of nations at peace |
| ASCENSION_FAITH_THRESHOLD | 0.7 | 70%+ global population follows player religion |

---

## RELIGION SPREAD

| Constant | Value | Notes |
|----------|-------|-------|
| SPREAD_DIFFUSION_RATE | 0.01 | Base diffusion rate per tick (halved for 0.5-year ticks) |
| TRADE_ROUTE_SPREAD_BONUS | 0.005 | Extra spread via trade routes per tick |
| MISSIONARY_BASE_EFFECTIVENESS | 0.05 | Legacy — see MISSIONARY_CONVERSION_RATE |
| MISSIONARY_CONVERSION_RATE | 0.01 | Flat per-tick conversion rate for active Prophet |
| CONVERSION_RETENTION_BASE | 0.8 | How well converted regions stay converted |
| CONVERSION_DOMINANT_THRESHOLD | 0.60 | Influence level to become dominant religion |
| CONVERSION_STRONGHOLD_THRESHOLD | 0.80 | Influence level for high-retention stronghold |
| RELIGION_DOMINANCE_INERTIA | 0.60 | Dominant religion outflow multiplier (40% erosion reduction prevents convergence) |

---

## DISEASE

| Constant | Value | Notes |
|----------|-------|-------|
| NATURAL_EMERGENCE_CHANCE_PER_TICK | 0.0005 | Base chance per tick (halved for 0.5-year ticks) |
| WAR_EMERGENCE_MULTIPLIER | 3.0 | War increases disease emergence |
| FAMINE_EMERGENCE_MULTIPLIER | 2.0 | Famine increases disease emergence |
| TRADE_EMERGENCE_MULTIPLIER | 1.3 | Trade routes carry disease (tuned down from 1.5 to prevent "never trade" strategy) |
| SPREAD_RATE_BASE | 0.015 | Base spread between regions per tick (halved for 0.5-year ticks) |
| RECOVERY_RATE_BASE | 0.010 | Base recovery per tick (tuned: Dev 1 recovers in ~67 ticks not ~100) |
| DIVINE_PLAGUE_SEVERITY_MULTIPLIER | 2.0 | Divine Plague is stronger than natural |
| QUARANTINE_SPREAD_REDUCTION | 0.70 | 70% spread reduction when quarantined |
| DISEASE_DENSITY_THRESHOLD | 50000 | Population for density factor normalization |
| DISEASE_DEV_MORTALITY_REDUCTION | 0.07 | Mortality reduction per dev level |
| DISEASE_DEV_SPREAD_RESISTANCE | 0.02 | Spread resistance per dev level |
| DISEASE_DEV_RECOVERY_BONUS | 0.005 | Recovery bonus per dev level |
| DISEASE_MORTALITY_MILD | 0.001 | Per-tick mortality for mild disease |
| DISEASE_MORTALITY_MODERATE | 0.005 | Per-tick mortality for moderate disease |
| DISEASE_MORTALITY_SEVERE | 0.015 | Per-tick mortality for severe disease |
| DISEASE_MORTALITY_PANDEMIC | 0.030 | Per-tick mortality for pandemic disease |
| DISEASE_TRADE_SPREAD_BONUS | 0.015 | Flat spread bonus when trade route exists (distinct from TRADE_EMERGENCE_MULTIPLIER) |
| DISEASE_MAX_INFECTION_TICKS | 60 | Safety valve: auto-recovery after 60 ticks (30 game-years) regardless of rolls |
| DISEASE_SPREAD_RATE_MILD | 0.010 | Per-tick spread probability for mild disease |
| DISEASE_SPREAD_RATE_MODERATE | 0.015 | Per-tick spread for moderate |
| DISEASE_SPREAD_RATE_SEVERE | 0.025 | Per-tick spread for severe |
| DISEASE_SPREAD_RATE_PANDEMIC | 0.040 | Per-tick spread for pandemic |

---

## TRADE

| Constant | Value | Notes |
|----------|-------|-------|
| FORMATION_THRESHOLD | 0.30 | Minimum formation score to form route |
| WEALTH_PER_VOLUME | 0.05 | Wealth generated per trade volume per tick |
| TECH_TRANSFER_RATE | 0.015 | Technology spread via trade per tick (tuned: 2-dev gap closes in ~267 ticks) |
| DISRUPTION_DURATION_YEARS | 5 | How long war/disaster disrupts a route (tuned: short wars less punishing) |
| TRADE_POP_NORMALIZER | 10000000000 | Gravity model population normalizer (10^10) |
| SEA_TRADE_DISTANCE | 3 | Default distance for sea trade routes (no land path) |

---

## ECONOMY

| Constant | Value | Notes |
|----------|-------|-------|
| ECONOMY_POP_DIVISOR | 1000 | Population divisor for base economy |
| ECONOMY_TRADE_BONUS_PER_ROUTE | 0.10 | Economy bonus per active trade route (+10%) |
| ECONOMY_WAR_PENALTY | 0.70 | Economy multiplier during war (−30%) |
| ECONOMY_GOLDEN_AGE_BONUS | 1.30 | Economy multiplier during Golden Age (+30%) |

---

## DEVELOPMENT

| Constant | Value | Notes |
|----------|-------|-------|
| DEV_GROWTH_BASE_PER_TICK | 0.003 | Base development growth per tick |
| DEV_TRADE_BONUS | 0.03 | Dev growth bonus per trade route |
| DEV_ERA_SCALING | 0.10 | Dev growth bonus per era index (Era 12 = +1.1) |

---

## HAPPINESS

| Constant | Value | Notes |
|----------|-------|-------|
| HAPPINESS_BASE | 0.50 | Neutral baseline |
| HAPPINESS_WEALTH_FACTOR | 0.02 | Per unit of economy-per-capita (economy / (pop/1000)) |
| HAPPINESS_WEALTH_CAP | 0.20 | Max happiness bonus from wealth |
| HAPPINESS_WAR_PENALTY | -0.15 | Happiness reduction during war |
| HAPPINESS_DISEASE_PENALTY | -0.10 | Happiness reduction during active disease |
| HAPPINESS_BLESSING_BONUS | 0.10 | Happiness bonus from any active blessing |
| HAPPINESS_MIN | 0.10 | Floor — even miserable people have some baseline |
| HAPPINESS_MAX | 0.95 | Ceiling — perfection is unattainable |

---

## GOVERNMENT MODIFIERS

| Government | Economy | Dev Growth | Military | Happiness |
|------------|---------|-----------|----------|-----------|
| monarchy | 1.00 | 0.80 | 1.20 | -0.05 |
| republic | 1.15 | 1.00 | 1.00 | 0.00 |
| democracy | 1.25 | 1.20 | 0.80 | +0.10 |
| theocracy | 0.90 | 0.90 | 1.10 | -0.05 |
| military_junta | 0.85 | 0.70 | 1.40 | -0.15 |

**Theocracy special:** +30% religion spread rate bonus (THEOCRACY_FAITH_SPREAD_BONUS).
**Military junta special:** Cannot form alliances (only war or armed neutrality).

---

## MILITARY RECRUITMENT

| Constant | Value | Notes |
|----------|-------|-------|
| RECRUITMENT_RATE | 0.001 | Fraction of population available per tick |
| RECRUITMENT_ECON_THRESHOLD | 500 | Economy value for 1.0× recruitment factor |

---

## ARMY MOVEMENT & SUPPLY

| Constant | Value | Notes |
|----------|-------|-------|
| MOVEMENT_TICKS_PLAINS | 2 | Ticks to cross plains |
| MOVEMENT_TICKS_HILLS | 3 | Ticks to cross hills |
| MOVEMENT_TICKS_FOREST | 4 | Ticks to cross forest |
| MOVEMENT_TICKS_MOUNTAIN | 8 | Ticks to cross mountain |
| MOVEMENT_TICKS_DESERT | 4 | Ticks to cross desert |
| MOVEMENT_TICKS_TUNDRA | 5 | Ticks to cross tundra |
| MOVEMENT_TICKS_COAST | 2 | Ticks to cross coast |
| MOVEMENT_ERA_SPEED_BONUS_PER_ERA | 0.05 | Per-era movement speed bonus (later = faster) |
| SUPPLY_MORALE_DECAY_PER_SHORTFALL | 0.02 | Morale decay per 1.0 supply shortfall per tick |
| SUPPLY_STRENGTH_DECAY_PER_SHORTFALL | 0.005 | Strength decay rate per 1.0 supply shortfall per tick |

---

## SIEGE

| Constant | Value | Notes |
|----------|-------|-------|
| SIEGE_TICKS_PER_FORT_LEVEL | 5 | Base ticks added per fort level |
| SIEGE_DEV_EXTEND_FACTOR | 0.05 | Dev extends siege duration |
| SIEGE_STRENGTH_BASE | 5000 | Strength normalization |
| SIEGE_STRENGTH_FACTOR_MIN | 0.5 | Min strength factor |
| SIEGE_STRENGTH_FACTOR_MAX | 2.0 | Max strength factor |
| SIEGE_EQUIPMENT_MULTIPLIER | 0.6 | Siege equipment (Dev 6+) reduces duration |
| SIEGE_VARIANCE_RANGE | 0.15 | ±15% variance |
| SIEGE_ATTRITION_BASE | 0.005 | Base besieger attrition per tick |
| SIEGE_ATTRITION_FORT_BONUS | 0.20 | Attrition bonus per fort level |

---

## GLOBAL SCIENCE

| Constant | Value | Notes |
|----------|-------|-------|
| GLOBAL_SCIENCE_WAR_PENALTY | 0.30 | War reduces global dev growth |
| GLOBAL_SCIENCE_TRADE_BONUS | 0.15 | Trade boosts global dev growth |
| GLOBAL_SCIENCE_TRADE_NORMALIZER | 20 | Trade routes for max bonus |
| GLOBAL_SCIENCE_MOD_MIN | 0.50 | Min global science modifier |
| GLOBAL_SCIENCE_MOD_MAX | 1.25 | Max global science modifier |
| NUCLEAR_DEV_THRESHOLD | 8 | Dev level for nuclear deterrence |
| NUCLEAR_DETERRENCE_MOD | 0.50 | War declaration chance multiplier (Dev 8+ vs Dev 8+) |
| DEFENSE_GRID_CONSTRUCTION_TICKS | 100 | Ticks (1 era) to build defense grid |

---

## AUTO-SAVE

| Constant | Value | Notes |
|----------|-------|-------|
| AUTO_SAVE_TICK_INTERVAL | 50 | Save every 50 ticks (~10 min at 1×) |
| AUTO_SAVE_MIN_TICKS_BETWEEN | 5 | Min ticks between saves |
| SAVE_VERSION | 1 | Save format version |
| EVENT_HISTORY_SAVE_MAX | 50 | Max event history entries to save |
| PIVOTAL_MOMENTS_SAVE_MAX | 20 | Max pivotal moments to save |
| VOICE_RECORDS_SAVE_MAX | 10 | Max voice records to save |
| AUTO_SAVE_BUDGET_MOBILE_MS | 100 | Max 100ms for save on mobile |
| AUTO_SAVE_BUDGET_FIRST_MS | 200 | Max 200ms for first (cold) save |
| AUTO_SAVE_BUDGET_DESKTOP_MS | 150 | Max 150ms for save on desktop |

---

## SPEED CONTROL

| Constant | Value | Notes |
|----------|-------|-------|
| TICKS_PER_MINUTE_1X | 5 | 1 tick every 12 seconds |
| TICKS_PER_MINUTE_2X | 10 | 1 tick every 6 seconds |
| TICKS_PER_MINUTE_4X | 20 | 1 tick every 3 seconds |
| SECONDS_PER_TICK_1X | 12 | Real seconds per tick at 1× |
| SECONDS_PER_TICK_2X | 6 | Real seconds per tick at 2× |
| SECONDS_PER_TICK_4X | 3 | Real seconds per tick at 4× |
| EVENTS_PER_ERA_EARLY_MAX | 15 | Max events in early eras |
| EVENTS_PER_ERA_LATE_MIN | 6 | Min events in late eras |
| EVENT_TEMPLATE_COUNT | 80 | Total pre-authored event templates |
| EVENT_CATEGORY_COUNT | 8 | Number of event categories |
| EVENTS_PER_CATEGORY | 10 | Templates per category |
| PRE_MADE_RIVAL_RELIGIONS | 10 | Pre-authored rival religions for LLM fallback |
| EVENT_COOLDOWN_SECOND | 0.25 | Weight multiplier after 1st fire this run |
| EVENT_COOLDOWN_THIRD | 0.05 | Weight multiplier after 2nd+ fire this run |
| ABANDONMENT_THRESHOLD | 15 | abandonmentScore threshold for Abandoned Followers ending |
| ALIEN_FALLBACK_ERA | 9 | Force first alien event if none have fired by this era |

---

## ERAS

| # | ID | Name | Start Year | End Year |
|---|-----|------|-----------|----------|
| 1 | renaissance | Renaissance | 1600 | 1650 |
| 2 | exploration | Exploration | 1650 | 1700 |
| 3 | enlightenment | Enlightenment | 1700 | 1750 |
| 4 | revolution | Revolution | 1750 | 1800 |
| 5 | industry | Industry | 1800 | 1870 |
| 6 | empire | Empire | 1870 | 1920 |
| 7 | atomic | Atomic | 1920 | 1960 |
| 8 | digital | Digital | 1960 | 2000 |
| 9 | signal | Signal | 2000 | 2050 |
| 10 | revelation | Revelation | 2050 | 2100 |
| 11 | preparation | Preparation | 2100 | 2150 |
| 12 | arrival | Arrival | 2150 | 2200 |

---

## DIVINE WHISPERS

| Constant | Value | Notes |
|----------|-------|-------|
| WHISPER_ENERGY_COST | 0 | Free — no energy |
| WHISPER_REGION_COOLDOWN_SEC | 30 | Per type per region |
| WHISPER_GLOBAL_COOLDOWN_SEC | 10 | Between any whisper on any region |
| WHISPER_TYPES | ["war", "peace", "science", "faith"] | 4 whisper types |
| WHISPER_AI_NUDGE_STRENGTH | 0.15 | Weight modifier on nation AI |
| WHISPER_COMPOUND_BONUS | 0.05 | Extra per repeat on same nation |
| WHISPER_COMPOUND_MAX_STACKS | 3 | Max compound stacks (caps nudge at 0.30) |
| WHISPER_LOYALTY_BONUS | 0.02 | Loyalty gain for voice in whispered region |
| WHISPER_NUDGE_CAP | 0.30 | Max effective nudge (base + compound) |

---

## POWER COMBOS

| Constant | Value | Notes |
|----------|-------|-------|
| COMBO_COUNT_MVP | 9 | Total combos at MVP (8 standard + Divine Purge) |
| COMBO_MODIFIER_MIN | 1.3 | Minimum combo effect multiplier |
| COMBO_MODIFIER_MAX | 2.0 | Maximum combo effect multiplier |
| COMBO_QUAKE_SCATTER_STRENGTH_LOSS | 0.20 | Army strength lost |
| COMBO_QUAKE_SCATTER_DEFECT_RATE | 0.30 | Soldiers defecting to nearby nations |
| COMBO_STORM_FLEET_DISRUPTION_MULTIPLIER | 2.0 | Trade route severed 2× normal duration |
| COMBO_HARVEST_GOLDEN_DURATION_YEARS | 3 | Mini Golden Age length |
| COMBO_INSPIRE_PROPHET_CONVERSION_MULTIPLIER | 2.0 | Prophet conversion rate boost |
| COMBO_SHIELD_MIRACLE_WINDOW_SEC | 120 | Real-seconds: Shield then Miracle on same region |
| COMBO_SHIELD_MIRACLE_BOOST | 1.5 | Defense + conversion multiplier |
| COMBO_WILDFIRE_REBIRTH_DEV_BONUS | 1 | Dev level gain after fire |
| COMBO_WILDFIRE_REBIRTH_MIN_DEV | 3 | Min Dev to trigger rebirth |
| COMBO_FLOOD_FAMINE_POP_LOSS_BASE | 0.05 | Base Flood pop loss (×2 when combo triggers) |
| COMBO_HARVEST_GOLDEN_MIN_DEV | 6 | Min Dev to trigger Harvest → Golden Age |
| COMBO_PURGE_IMMUNITY_ERAS | 1 | Eras of Harbinger immunity after Divine Purge |

---

## FOLLOWER VOICES

| Constant | Value | Notes |
|----------|-------|-------|
| MAX_VOICES_ALIVE | 5 | Hard cap on simultaneous voices |
| VOICE_TYPES | 5 | Prophet, Ruler, General, Scholar, Heretic |
| VOICE_STARTING_LOYALTY | 0.7 | Initial loyalty on emergence |
| VOICE_LOYALTY_GAIN_FULFILL | 0.10 | Per fulfilled petition |
| VOICE_LOYALTY_LOSS_DENY | 0.15 | Per denied petition |
| VOICE_LOYALTY_LOSS_AUTO_DENY | 0.08 | Per auto-expired petition |
| VOICE_BETRAYAL_THRESHOLD | 0.3 | Below this = betrayal risk |
| VOICE_BETRAYAL_GRACE_TICKS | 2 | Ticks at loyalty 0 before betrayal fires (1 game-year warning) |
| VOICE_LIFESPAN_YEARS_MIN | 100 | Minimum game-years alive |
| VOICE_LIFESPAN_YEARS_MAX | 200 | Maximum game-years alive |
| VOICE_LINEAGE_CHANCE | 0.3 | Chance of descendant |
| VOICE_LINEAGE_DELAY_YEARS_MIN | 50 | Min years before descendant |
| VOICE_LINEAGE_DELAY_YEARS_MAX | 100 | Max years before descendant |
| VOICE_LINEAGE_STARTING_LOYALTY | 0.6 | Descendant starting loyalty |
| VOICE_RULER_FAITH_THRESHOLD | 0.6 | Nation faith % to spawn Ruler |
| VOICE_SCHOLAR_DEV_THRESHOLD | 6 | City Dev level to spawn Scholar |
| VOICE_HERETIC_SCHISM_THRESHOLD | 0.4 | Schism risk % to spawn Heretic |
| VOICE_PROPHET_IGNORE_YEARS | 50 | Game-years ignored before Prophet → Heretic |
| VOICE_BETRAYAL_PROB_PER_TICK | 0.02 | Per-tick betrayal chance when loyalty < threshold |
| VOICE_LOYALTY_DECAY_PER_100_TICKS | 0.01 | Loyalty lost per 100 ticks of no interaction |

---

## PETITIONS

| Constant | Value | Notes |
|----------|-------|-------|
| PETITION_TIMEOUT_SEC | 90 | Real-seconds before auto-deny (60→90 for mobile comfort) |
| PETITION_MAX_PENDING | 2 | Max simultaneous petitions |
| PETITION_COOLDOWN_SEC | 60 | Min gap between petitions from same voice |

---

## PROGRESSIVE POWER UNLOCK

| Constant | Value | Notes |
|----------|-------|-------|
| UNLOCK_ERA_1 | ["bountiful_harvest", "great_storm"] | Era 1 powers |
| UNLOCK_ERA_2 | ["inspiration", "great_flood"] | Era 2 powers |
| UNLOCK_ERA_3 | ["shield_of_faith", "plague"] | Era 3 powers |
| UNLOCK_ERA_4 | ["miracle", "famine"] | Era 4 powers |
| UNLOCK_ERA_5 | ["prophet", "wildfire"] | Era 5 powers |
| UNLOCK_ERA_6 | ["golden_age", "earthquake"] | Era 6 powers |

---

## SMART CONTEXT FAB

| Constant | Value | Notes |
|----------|-------|-------|
| FAB_MAX_CONTEXT_SLOTS | 4 | Max powers shown (excluding Eye and "...") |
| FAB_ALWAYS_SHOW_CHEAPEST_BLESSING | true | Base slot: cheapest available blessing |
| FAB_ALWAYS_SHOW_CHEAPEST_DISASTER | true | Base slot: cheapest available disaster |
| FAB_CONTEXT_WEIGHT_WAR | 0.4 | Selection weight when war nearby |
| FAB_CONTEXT_WEIGHT_SCIENCE | 0.3 | Selection weight for science opportunity |
| FAB_CONTEXT_WEIGHT_FAITH | 0.3 | Selection weight for low faith |
| FAB_CONTEXT_WEIGHT_COMBO | 0.5 | Selection weight for combo-eligible |

---

## UI

| Constant | Value | Notes |
|----------|-------|-------|
| MIN_TOUCH_TARGET_PT | 44 | Minimum touch target (Apple HIG) |
| FAB_SIZE_PT | 52 | Floating Action Button diameter |
| FAB_ARC_BUTTON_SIZE_PT | 42 | Dual-arc power button icon diameter |
| TOAST_MILESTONE_DURATION_MS | 4000 | Milestone toast auto-dismiss |
| TOAST_INFORMATIONAL_DURATION_MS | 5000 | Informational toast auto-dismiss |
| TOAST_CHOICE_EVENT_DURATION_MS | -1 | Never auto-dismiss (must interact) |
| COMBO_TOAST_DURATION_MS | 5000 | Divine Chain toast duration |
| BOTTOM_SHEET_PEEK_PT | 120 | Bottom sheet peek height |
| BOTTOM_SHEET_HALF_SCREEN | 0.5 | Bottom sheet half resting height |
| BOTTOM_SHEET_FULL_SCREEN | 0.85 | Bottom sheet full height |
| TOP_SAFE_AREA_PT | 44 | Top inset (notch/Dynamic Island) |
| BOTTOM_SAFE_AREA_PT | 34 | Bottom inset (home indicator) |
| PRAYER_COUNTER_SIZE_PT | 20 | Prayer badge diameter |
| WHISPER_BUTTON_SIZE_PT | 36 | Whisper icon button diameter |
| VOICE_ICON_SIZE_PT | 24 | Follower Voice map icon diameter |
| EVENT_QUEUE_MAX | 5 | Max queued events |

---

## WIN RATE TARGETS (Stage 6)

| Constant | Value | Notes |
|----------|-------|-------|
| WIN_RATE_PEACE_MIN | 0.30 | Pure peace strategy minimum |
| WIN_RATE_PEACE_MAX | 0.40 | Pure peace strategy maximum |
| WIN_RATE_WAR_MIN | 0.30 | Pure war strategy minimum |
| WIN_RATE_WAR_MAX | 0.40 | Pure war strategy maximum |
| WIN_RATE_HYBRID_MIN | 0.40 | Hybrid strategy minimum |
| WIN_RATE_HYBRID_MAX | 0.50 | Hybrid strategy maximum |
| WIN_RATE_RANDOM_MIN | 0.15 | Random commandments minimum |
| WIN_RATE_RANDOM_MAX | 0.25 | Random commandments maximum |
| WIN_RATE_OPTIMAL_MAX | 0.70 | Optimal play ceiling |
| WIN_RATE_NO_INPUT_MAX | 0.10 | Do nothing / minimal interaction |

---

## DIFFICULTY SCALING (Stage 6)

| Constant | Value | Notes |
|----------|-------|-------|
| SCALING_START_EARTH | 3 | Difficulty begins increasing |
| SCALING_PLATEAU_EARTH | 10 | Difficulty stops increasing |
| SCALING_FACTOR_PER_EARTH | 0.03125 | Per-Earth multiplier increase (Earth 3–10) |
| SCALING_FACTOR_MAX | 1.25 | Maximum difficulty multiplier (plateau) |
| SCALING_AI_COMPETENCE_E1 | 0.85 | AI competence on Earth 1 (makes mistakes) |
| SCALING_AI_COMPETENCE_MAX | 1.00 | AI at full competence (Earth 6+) |
| SCALING_AI_COMPETENCE_PER_EARTH | 0.03 | AI improvement per Earth |
| SCALING_GUARANTEED_REGIONS_E1 | 3 | Earth 1 always gets 3 starting regions |
| SCALING_REDUCED_REGIONS_EARTH | 7 | Earth 7+ always gets 2 starting regions |

Scaling formula: `factor = 1.0 + max(0, min(earth - 2, 8)) × 0.03125`

| Earth | Factor | Rival Aggression | AI Competence | Starting Regions |
|-------|--------|-----------------|---------------|------------------|
| 1 | 1.00 | Base | 0.85 | 3 (guaranteed) |
| 2 | 1.00 | Base | 0.88 | 2–3 |
| 3 | 1.03 | +3% | 0.91 | 2–3 |
| 5 | 1.09 | +9% | 0.97 | 2–3 |
| 7 | 1.16 | +16% | 1.00 | 2 |
| 10+ | 1.25 | +25% (plateau) | 1.00 | 2 |

---

## HARBINGER (Stage 6 — finalized)

| Constant | Value | Notes |
|----------|-------|-------|
| HARBINGER_DORMANT_ERAS | [1, 6] | No activity |
| HARBINGER_ACTIVE_ERA_START | 7 | First sabotage era |
| HARBINGER_SIGNAL_STRENGTH_ERA_7 | 3 | Starting budget |
| HARBINGER_SIGNAL_STRENGTH_ERA_8 | 6 | |
| HARBINGER_SIGNAL_STRENGTH_ERA_9 | 10 | |
| HARBINGER_SIGNAL_STRENGTH_ERA_10 | 15 | |
| HARBINGER_SIGNAL_STRENGTH_ERA_11 | 20 | |
| HARBINGER_SIGNAL_STRENGTH_ERA_12 | 25 | Maximum budget |
| HARBINGER_ACTION_DISCORD_COST | 2 | Whisper of Discord |
| HARBINGER_ACTION_CORRUPTION_COST | 3 | Corruption |
| HARBINGER_ACTION_FALSE_MIRACLE_COST | 4 | False Miracle |
| HARBINGER_ACTION_PLAGUE_SEED_COST | 3 | Plague Seed |
| HARBINGER_ACTION_SEVER_COST | 2 | Sever |
| HARBINGER_ACTION_VEIL_COST | 4 | Veil |
| HARBINGER_PROSPERITY_RESISTANCE_DEV | 8 | Dev level for 50% resistance |
| HARBINGER_PROSPERITY_RESISTANCE_FACTOR | 0.5 | Cost multiplier when resisted |
| HARBINGER_RUBBER_BAND_LOW | 0.5 | Budget fraction when player struggling |
| HARBINGER_RUBBER_BAND_MID | 0.8 | Budget fraction in close race (default) |
| HARBINGER_RUBBER_BAND_HIGH | 1.0 | Budget fraction when player far ahead |
| HARBINGER_VISIBILITY_VOICES_ERA | 8 | Voices sense Harbinger |
| HARBINGER_VISIBILITY_CONFIRMED_ERA | 9 | Player gets confirmation event |
| HARBINGER_VISIBILITY_OVERLAY_ERA | 10 | Anomaly overlay unlocks |
| HARBINGER_CORRUPTION_DEV_LOSS | 1 | Dev loss per Corruption |
| HARBINGER_CORRUPTION_DURATION_YEARS | 10 | Game-years for Corruption |
| HARBINGER_VEIL_DURATION_ERAS | 1 | Veil lasts 1 era |
| HARBINGER_TICK_INTERVAL | 10 | Ticks between Harbinger actions (5 game-years) |
| HARBINGER_CORRUPTION_DEV_LOSS_RATE | 0.05 | Dev loss per tick during Corruption (−1 over 20 ticks) |
| HARBINGER_SEVER_DISRUPTION_YEARS | 10 | Harbinger Sever duration (longer than natural 5-year disruption) |

---

## NATION AI

| Constant | Value | Notes |
|----------|-------|-------|
| WAR_SCORE_MILITARY_WEIGHT | 0.30 | War score: military advantage factor |
| WAR_SCORE_OPINION_WEIGHT | 0.30 | War score: negative opinion factor |
| WAR_SCORE_BORDER_WEIGHT | 0.20 | War score: border dispute factor |
| WAR_SCORE_RELIGION_WEIGHT | 0.15 | War score: religion difference factor |
| WAR_SCORE_OPPORTUNITY_WEIGHT | 0.05 | War score: target already at war factor |
| WAR_DECLARATION_THRESHOLD | 0.60 | Min war score to declare war |
| PEACE_THRESHOLD | 0.50 | Min peace score to sue for peace |
| ALLIANCE_OPINION_THRESHOLD | 0.30 | Min alliance score to form alliance |
| TRADE_PEACE_TICKS_REQUIRED | 10 | Ticks of peace before trade is considered |
| WAR_WEARINESS_GAIN_PER_TICK | 0.01 | War weariness gain per tick while at war |
| WAR_WEARINESS_DECAY_PER_TICK | 0.005 | War weariness decay per tick while at peace |
| STABILITY_BASE | 0.70 | Starting stability for all nations |
| STABILITY_WAR_DECAY | 0.005 | Stability loss per tick during war |
| STABILITY_PEACE_REGEN | 0.002 | Stability gain per tick during peace |
| STABILITY_HAPPINESS_FACTOR | 0.30 | Happiness contribution to stability regen |

**Personality weight modifiers** (multiplier on base action scores):

| Action | Aggressive | Defensive | Expansionist | Isolationist | Balanced |
|--------|-----------|-----------|-------------|-------------|---------|
| declare_war | 1.5 | 0.4 | 1.3 | 0.2 | 1.0 |
| sue_peace | 0.5 | 1.3 | 0.7 | 1.5 | 1.0 |
| form_alliance | 0.7 | 1.3 | 1.1 | 0.4 | 1.0 |
| break_alliance | 1.3 | 0.5 | 1.0 | 0.8 | 1.0 |
| form_trade | 0.6 | 1.0 | 0.9 | 0.3 | 1.0 |
| recruit | 1.4 | 1.2 | 1.1 | 0.5 | 1.0 |
| develop | 0.5 | 1.1 | 0.8 | 1.4 | 1.0 |

---

## GOVERNMENT EVOLUTION

| Constant | Value | Notes |
|----------|-------|-------|
| MONARCHY_TO_REPUBLIC_DEV | 5 | Dev threshold |
| MONARCHY_TO_REPUBLIC_ERA | 4 | Era threshold |
| MONARCHY_TO_THEOCRACY_FAITH | 0.80 | Dominant faith threshold |
| MONARCHY_TO_THEOCRACY_REGION_RATIO | 0.50 | Fraction of regions with 80%+ faith |
| MONARCHY_TO_JUNTA_WAR_WEARINESS | 0.70 | War weariness threshold |
| MONARCHY_TO_JUNTA_STABILITY | 0.30 | Max stability for junta transition |
| REPUBLIC_TO_DEMOCRACY_DEV | 8 | Dev threshold |
| REPUBLIC_TO_DEMOCRACY_ERA | 7 | Era threshold |
| REPUBLIC_TO_DEMOCRACY_STABILITY | 0.60 | Min stability |
| REPUBLIC_TO_JUNTA_STABILITY | 0.30 | Max stability for junta transition |
| REPUBLIC_TO_THEOCRACY_FAITH | 0.80 | Dominant faith threshold |
| REPUBLIC_TO_THEOCRACY_REGION_RATIO | 0.60 | Fraction of regions with 80%+ faith |
| DEMOCRACY_TO_JUNTA_STABILITY | 0.20 | Max stability for junta transition |
| THEOCRACY_TO_REPUBLIC_DEV | 7 | Dev threshold for secularization |
| THEOCRACY_TO_REPUBLIC_FAITH | 0.50 | Max faith for secularization |
| THEOCRACY_TO_REPUBLIC_ERA | 6 | Era threshold |
| THEOCRACY_TO_MONARCHY_STABILITY | 0.30 | Max stability for regression |
| JUNTA_TO_REPUBLIC_PEACE_TICKS | 20 | Consecutive peace ticks required |
| JUNTA_TO_REPUBLIC_STABILITY | 0.50 | Min stability |
| JUNTA_TO_DEMOCRACY_DEV | 9 | Dev threshold |
| JUNTA_TO_DEMOCRACY_STABILITY | 0.70 | Min stability |
| JUNTA_TO_DEMOCRACY_PEACE_TICKS | 30 | Consecutive peace ticks required |
| REVOLUTION_BASE_PROB_PER_TICK | 0.002 | Per-tick revolution chance when conditions met |
| THEOCRACY_FAITH_SPREAD_BONUS | 0.30 | +30% religion spread for theocracies |

---

## RELIGION LIFECYCLE

| Constant | Value | Notes |
|----------|-------|-------|
| MERGE_SIMILARITY_THRESHOLD | 0.70 | Min commandment overlap for merge eligibility |
| MERGE_PROXIMITY_MAX_DISTANCE | 3 | Max region distance for merge check |
| MERGE_MIN_COMBINED_REGIONS | 3 | Min combined regions to trigger merge |
| REFORM_CRISIS_STABILITY | 0.30 | Max stability for reform trigger |
| REFORM_ERA_THRESHOLD | 4 | Min era for reform eligibility |
| REFORM_COMMANDMENT_CHANGES | 2 | Commandments swapped per reform |
| EXTINCTION_POP_THRESHOLD | 100 | Pop below this = religion extinct in region |
| FORCED_CONVERSION_RATE_MULTIPLIER | 2.0 | Conversion speed via conquest |
| PEACEFUL_CONVERSION_RETENTION_BONUS | 0.10 | Extra retention for peaceful conversion |

---

## HIDDEN DIVINE RULES

| Constant | Value | Notes |
|----------|-------|-------|
| COOLDOWN_TICKS | 50 | Min ticks between rule triggers (25 game-years) |
| EFFECT_DURATION_TICKS | 20 | Default buff/debuff duration (10 game-years) |
| FAITH_BOOST_MAGNITUDE | 0.05 | Faith boost per tick while active |
| MILITARY_BOOST_MAGNITUDE | 0.15 | Military multiplier while active |
| ECONOMY_BOOST_MAGNITUDE | 0.10 | Economy multiplier while active |
| DEVELOPMENT_BOOST_MAGNITUDE | 0.10 | Dev growth multiplier while active |
| POPULATION_BOOST_MAGNITUDE | 0.02 | Pop growth multiplier while active |
| HAPPINESS_BOOST_MAGNITUDE | 0.05 | Happiness bonus while active |
| DISASTER_ON_ENEMY_CHANCE | 0.10 | Per-tick chance of natural disaster on enemy |
| DISCOVERY_OBSERVATIONS_REQUIRED | 3 | Times player must observe to deduce a rule |

---

## LLM

| Constant | Value | Notes |
|----------|-------|-------|
| CALLS_PER_GAME | 17 | Total LLM calls per 4-hour game |
| ERA_NARRATIVE_MAX_WORDS | 150 | Max words per enhanced era narrative |
| COMMANDMENT_SCRIPTURE_MAX_WORDS | 40 | Max words for commandment scripture |
| VOICE_PETITION_MAX_WORDS | 50 | Max words for LLM-generated petition |
| EARTH_EULOGY_MAX_WORDS | 100 | Max words for shareable Earth story |
| LLM_PROVIDER | "gemini-flash" | Provider identifier |
| TIMEOUT_MS | 5000 | LLM call timeout |
| MAX_RETRIES | 1 | Retry once then fallback |
