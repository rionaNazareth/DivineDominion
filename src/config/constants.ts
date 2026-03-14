// =============================================================================
// DIVINE DOMINION — Constants (Single Source of Truth for Numbers)
// =============================================================================
// Must stay in sync with docs/design/constants.md
// No magic numbers elsewhere in the codebase.
// =============================================================================

// -----------------------------------------------------------------------------
// Time
// -----------------------------------------------------------------------------

export const TIME = {
  GAME_YEARS_PER_REAL_MINUTE: 2.5,
  TOTAL_GAME_YEARS: 600,
  GAME_START_YEAR: 1600,
  GAME_END_YEAR: 2200,
  TOTAL_REAL_TIME_HOURS: 4,
  ERA_COUNT: 12,
  ERA_DURATION_REAL_MINUTES: 20,
  SPEED_OPTIONS: [1, 2, 4] as const,
  EVENT_INTERVAL_REAL_MINUTES: 2,
  EVENTS_PER_ROLL_MIN: 1,
  EVENTS_PER_ROLL_MAX: 3,
  TICK_GAME_YEARS: 0.5,
  TICKS_PER_REAL_MINUTE_1X: 5,
  TOTAL_TICKS_PER_GAME: 1200,
} as const;

// -----------------------------------------------------------------------------
// Divine Energy
// -----------------------------------------------------------------------------

export const DIVINE_ENERGY = {
  STARTING: 10,
  MAX: 20,
  REGEN_PER_REAL_MINUTE: 1,
  SACRIFICE_BONUS_ENERGY: 0.3,
} as const;

// -----------------------------------------------------------------------------
// Blessings (cost, cooldown in real minutes, duration in game years)
// -----------------------------------------------------------------------------

export const BLESSINGS = {
  BOUNTIFUL_HARVEST: { cost: 2, cooldownMinutes: 2, durationYears: 10 },
  INSPIRATION: { cost: 3, cooldownMinutes: 4, durationYears: 15 },
  MIRACLE: { cost: 4, cooldownMinutes: 6, durationYears: null },
  PROPHET: { cost: 5, cooldownMinutes: 8, durationYears: 20 },
  SHIELD_OF_FAITH: { cost: 3, cooldownMinutes: 4, durationYears: 10 },
  GOLDEN_AGE: { cost: 6, cooldownMinutes: 12, durationYears: 15 },
} as const;

// -----------------------------------------------------------------------------
// Disasters (cost, cooldown in real minutes, duration in game years)
// -----------------------------------------------------------------------------

export const DISASTERS = {
  EARTHQUAKE: { cost: 4, cooldownMinutes: 6, durationYears: null },
  GREAT_FLOOD: { cost: 3, cooldownMinutes: 5, durationYears: 5 },
  PLAGUE: { cost: 5, cooldownMinutes: 10, durationYears: 10 },
  GREAT_STORM: { cost: 2, cooldownMinutes: 3, durationYears: 5 },
  FAMINE: { cost: 3, cooldownMinutes: 5, durationYears: 5 },
  WILDFIRE: { cost: 4, cooldownMinutes: 6, durationYears: 5 },
} as const;

// -----------------------------------------------------------------------------
// World Generation
// -----------------------------------------------------------------------------

export const WORLD_GEN = {
  REGIONS_MIN: 40,
  REGIONS_MAX: 60,
  NATIONS_MIN: 8,
  NATIONS_MAX: 12,
  RIVAL_RELIGIONS_MIN: 8,
  RIVAL_RELIGIONS_MAX: 12,
  RIVAL_RELIGIONS_PREMADE_POOL: 10,
  PLAYER_STARTING_REGIONS_MIN: 2,
  PLAYER_STARTING_REGIONS_MAX: 3,
  HIDDEN_RULES_PER_RELIGION: 3,
  REGIONS_PER_NATION_MIN: 3,
  REGIONS_PER_NATION_MAX: 8,
  CAPITAL_MIN_DISTANCE: 3,
  STARTING_DEV_MIN: 1,
  STARTING_DEV_MAX: 3,
  STARTING_ARMY_STRENGTH_MIN: 1000,
  STARTING_ARMY_STRENGTH_MAX: 5000,
  WATER_RATIO: 0.25,
  POISSON_MIN_DISTANCE: 80,
  CANVAS_WIDTH: 1000,
  CANVAS_HEIGHT: 600,
} as const;

// -----------------------------------------------------------------------------
// Terrain Generation (Simplex noise parameters)
// -----------------------------------------------------------------------------

export const TERRAIN_GEN = {
  NOISE_SCALE: 0.008,
  NOISE_OCTAVES: 2,
  NOISE_LACUNARITY: 2.0,
  NOISE_PERSISTENCE: 0.5,
  ELEVATION_MOUNTAIN: 0.75,
  ELEVATION_HILLS: 0.45,
  ELEVATION_TUNDRA: 0.55,
  MOISTURE_DESERT: 0.25,
  MOISTURE_FOREST: 0.65,
  MOISTURE_TUNDRA: 0.30,
  POP_BIAS: {
    plains: 1.2, hills: 0.9, forest: 0.8, mountain: 0.5,
    desert: 0.6, tundra: 0.4, coast: 1.1, ocean: 0,
  } as Record<string, number>,
  DEV_BIAS: {
    plains: 1.1, hills: 0.9, forest: 0.8, mountain: 0.6,
    desert: 0.7, tundra: 0.5, coast: 1.2, ocean: 0,
  } as Record<string, number>,
} as const;

// -----------------------------------------------------------------------------
// Nations
// -----------------------------------------------------------------------------

export const NATIONS = {
  ARMY_STRENGTH_MIN: 500,
  ARMY_STRENGTH_MAX: 50_000,
  DEVELOPMENT_LEVELS: 12,
  GOVERNMENT_TYPES: ['monarchy', 'republic', 'democracy', 'theocracy', 'military_junta'] as const,
  POPULATION_GROWTH_BASE: 0.005,
  CARRYING_CAPACITY_PER_DEV: 50_000,
  POPULATION_MIN_PER_REGION: 100,
  STARTING_POPULATION_MIN: 5_000,
  STARTING_POPULATION_MAX: 50_000,
  SUPPLY_RANGE_BASE: 3,
} as const;

// -----------------------------------------------------------------------------
// Commandments
// -----------------------------------------------------------------------------

export const COMMANDMENTS = {
  TOTAL_BASE: 35,
  TOTAL_WITH_UNLOCKS: 50,
  CATEGORIES: 7,
  PER_CATEGORY: 5,
  PLAYER_PICKS: 10,
  STARTING_UNLOCKED: 35,
} as const;

// -----------------------------------------------------------------------------
// Commandment Stacking
// -----------------------------------------------------------------------------

export const COMMANDMENT_STACKING = {
  MODIFIER_CAP_POSITIVE: 0.75,
  MODIFIER_CAP_NEGATIVE: -0.50,
} as const;

export const DANGEROUS_EXPERIMENTS = {
  ACCIDENT_CHANCE: 0.05,
  DEV_LOSS: 1,
  POP_LOSS: 0.05,
  HAPPINESS_LOSS: 0.10,
} as const;

export const ENDS_JUSTIFY = {
  FAITH_DECAY_PER_TICK: 0.001,
  FAITH_FLOOR: 0.05,
} as const;

export const FOOD_STABILITY = {
  THRESHOLD: 0.3,
} as const;

// -----------------------------------------------------------------------------
// Battle
// -----------------------------------------------------------------------------

export const BATTLE = {
  BASE_CASUALTY_RATE: 0.10,
  VARIANCE_RANGE: 0.15,
  WINNER_MORALE_CHANGE: 0.10,
  LOSER_MORALE_CHANGE: -0.20,
  RETREAT_STRENGTH_THRESHOLD: 0.30,
  RETREAT_MORALE_THRESHOLD: 0.20,
  FORT_BONUS_PER_LEVEL: 0.15,
  MORALE_WEIGHT: 0.50,
  CASUALTY_CLAMP_MIN: 0.30,
  CASUALTY_CLAMP_MAX: 3.00,
  TECH_ADVANTAGE_PER_DEV: 0.15,
  FAITH_HOLY_WAR_BONUS: 0.20,
  FAITH_STRONGHOLD_THRESHOLD: 0.80,
  FAITH_DEFEND_BONUS: 0.15,
  FAITH_RIGHTEOUS_BONUS: 0.30,
  TERRAIN_ATTACK_MODS: {
    plains: 1.00, hills: 0.90, forest: 0.85, mountain: 0.70,
    desert: 0.90, tundra: 0.80, coast: 1.00, ocean: 1.00,
  },
  TERRAIN_DEFEND_MODS: {
    plains: 1.00, hills: 1.10, forest: 1.15, mountain: 1.30,
    desert: 1.10, tundra: 1.20, coast: 1.00, ocean: 1.00,
  },
  COMMANDER_ATTACK_MODS: {
    aggressive: 1.15, cautious: 0.90, brilliant: 1.10, reckless: 1.25,
  },
  COMMANDER_DEFEND_MODS: {
    aggressive: 0.90, cautious: 1.15, brilliant: 1.10, reckless: 0.80,
  },
} as const;

// -----------------------------------------------------------------------------
// Hypocrisy
// -----------------------------------------------------------------------------

export const HYPOCRISY = {
  FAITH_LOSS_PER_TICK_MILD: 0.001,
  FAITH_LOSS_PER_TICK_MODERATE: 0.0015,
  FAITH_LOSS_PER_TICK_SEVERE: 0.002,
  VIOLATION_GAIN_MILD: 0.05,
  VIOLATION_GAIN_MODERATE: 0.12,
  VIOLATION_GAIN_SEVERE: 0.25,
  DECAY_RATE: 0.00125,
  SCHISM_MODERATE: 0.10,
  SCHISM_SEVERE: 0.20,
  VOICE_LOYALTY_LOSS: 0.05,
  REVERSED_YEARS: 30,
  SCHISM_RISK_PER_TENSION_PAIR_MIN: 0.15,
  SCHISM_RISK_PER_TENSION_PAIR_MAX: 0.30,
  SCHISM_BASE_RISK_PER_TICK: 0.001,
  SCHISM_THRESHOLD: 0.50,
} as const;

// -----------------------------------------------------------------------------
// Religion Spread
// -----------------------------------------------------------------------------

export const RELIGION = {
  SPREAD_DIFFUSION_RATE: 0.01,
  TRADE_ROUTE_SPREAD_BONUS: 0.005,
  MISSIONARY_BASE_EFFECTIVENESS: 0.05,
  MISSIONARY_CONVERSION_RATE: 0.01,
  CONVERSION_RETENTION_BASE: 0.8,
  CONVERSION_DOMINANT_THRESHOLD: 0.60,
  CONVERSION_STRONGHOLD_THRESHOLD: 0.80,
  DOMINANCE_INERTIA: 0.60,
  TERRAIN_RESISTANCE: {
    plains: 0.00, hills: 0.10, forest: 0.15, coast: 0.05,
    desert: 0.25, mountain: 0.35, tundra: 0.30, ocean: 1.00,
  },
} as const;

// -----------------------------------------------------------------------------
// Disease
// -----------------------------------------------------------------------------

export const DISEASE = {
  NATURAL_EMERGENCE_CHANCE_PER_TICK: 0.0005,
  WAR_EMERGENCE_MULTIPLIER: 3.0,
  FAMINE_EMERGENCE_MULTIPLIER: 2.0,
  TRADE_EMERGENCE_MULTIPLIER: 1.3,
  SPREAD_RATE_BASE: 0.015,
  RECOVERY_RATE_BASE: 0.010,
  DIVINE_PLAGUE_SEVERITY_MULTIPLIER: 2.0,
  QUARANTINE_SPREAD_REDUCTION: 0.70,
  DENSITY_THRESHOLD: 50_000,
  DEV_MORTALITY_REDUCTION: 0.07,
  DEV_SPREAD_RESISTANCE: 0.02,
  DEV_RECOVERY_BONUS: 0.005,
  MORTALITY_RATES: {
    mild: 0.001, moderate: 0.005, severe: 0.015, pandemic: 0.030,
  },
  SPREAD_RATES: {
    mild: 0.010, moderate: 0.015, severe: 0.025, pandemic: 0.040,
  },
  TRADE_SPREAD_BONUS: 0.015,
  MAX_INFECTION_TICKS: 60,
} as const;

// -----------------------------------------------------------------------------
// Trade
// -----------------------------------------------------------------------------

export const TRADE = {
  FORMATION_THRESHOLD: 0.30,
  WEALTH_PER_VOLUME: 0.05,
  TECH_TRANSFER_RATE: 0.015,
  DISRUPTION_DURATION_YEARS: 5,
  POP_NORMALIZER: 10_000_000_000,
  SEA_DISTANCE: 3,
} as const;

// -----------------------------------------------------------------------------
// Happiness
// -----------------------------------------------------------------------------

export const HAPPINESS = {
  BASE: 0.50,
  WEALTH_FACTOR: 0.02,
  WEALTH_CAP: 0.20,
  WAR_PENALTY: -0.15,
  DISEASE_PENALTY: -0.10,
  BLESSING_BONUS: 0.10,
  MIN: 0.10,
  MAX: 0.95,
  GOV_MODS: { monarchy: -0.05, republic: 0.00, democracy: 0.10, theocracy: -0.05, military_junta: -0.15 } as Record<string, number>,
} as const;

// -----------------------------------------------------------------------------
// Economy
// -----------------------------------------------------------------------------

export const ECONOMY = {
  POP_DIVISOR: 1000,
  TRADE_BONUS_PER_ROUTE: 0.10,
  WAR_PENALTY: 0.70,
  GOLDEN_AGE_BONUS: 1.30,
  GOV_MODS: { monarchy: 1.00, republic: 1.15, democracy: 1.25, theocracy: 0.90, military_junta: 0.85 } as Record<string, number>,
} as const;

// -----------------------------------------------------------------------------
// Development
// -----------------------------------------------------------------------------

export const DEVELOPMENT = {
  GROWTH_BASE_PER_TICK: 0.003,
  TRADE_BONUS: 0.03,
  ERA_SCALING: 0.10,
  GOV_MODS: { monarchy: 0.80, republic: 1.00, democracy: 1.20, theocracy: 0.90, military_junta: 0.70 } as Record<string, number>,
} as const;

// -----------------------------------------------------------------------------
// Military Recruitment
// -----------------------------------------------------------------------------

export const RECRUITMENT = {
  RATE: 0.001,
  ECON_THRESHOLD: 500,
  GOV_MODS: { monarchy: 1.20, republic: 1.00, democracy: 0.80, theocracy: 1.10, military_junta: 1.40 } as Record<string, number>,
} as const;

// -----------------------------------------------------------------------------
// Army Movement & Supply
// -----------------------------------------------------------------------------

export const ARMY_MOVEMENT = {
  TICKS_BY_TERRAIN: {
    plains: 2,
    hills: 3,
    forest: 4,
    mountain: 8,
    desert: 4,
    tundra: 5,
    coast: 2,
    ocean: Infinity, // impassable
  } as Record<string, number>,
  ERA_SPEED_BONUS_PER_ERA: 0.05,
} as const;

export const SUPPLY = {
  MORALE_DECAY_PER_SHORTFALL: 0.02,
  STRENGTH_DECAY_PER_SHORTFALL: 0.005,
} as const;

// -----------------------------------------------------------------------------
// Siege
// -----------------------------------------------------------------------------

export const SIEGE = {
  TICKS_PER_FORT_LEVEL: 5,
  DEV_EXTEND_FACTOR: 0.05,
  STRENGTH_BASE: 5000,
  STRENGTH_FACTOR_MIN: 0.5,
  STRENGTH_FACTOR_MAX: 2.0,
  EQUIPMENT_MULTIPLIER: 0.6,
  VARIANCE_RANGE: 0.15,
  ATTRITION_BASE: 0.005,
  ATTRITION_FORT_BONUS: 0.2,
} as const;

// -----------------------------------------------------------------------------
// Global Science
// -----------------------------------------------------------------------------

export const GLOBAL_SCIENCE = {
  WAR_PENALTY: 0.3,
  TRADE_BONUS: 0.15,
  TRADE_NORMALIZER: 20,
  MOD_MIN: 0.5,
  MOD_MAX: 1.25,
} as const;

export const NUCLEAR = {
  DEV_THRESHOLD: 8,
  DETERRENCE_MOD: 0.5,
} as const;

export const DEFENSE_GRID = {
  CONSTRUCTION_TICKS: 100,
} as const;

// -----------------------------------------------------------------------------
// Auto-Save
// -----------------------------------------------------------------------------

export const AUTO_SAVE = {
  TICK_INTERVAL: 50,
  MIN_TICKS_BETWEEN: 5,
  VERSION: 1,
  EVENT_HISTORY_MAX: 50,
  PIVOTAL_MOMENTS_MAX: 20,
  VOICE_RECORDS_MAX: 10,
  BUDGET_MOBILE_MS: 100,
  BUDGET_FIRST_MS: 200,
  BUDGET_DESKTOP_MS: 150,
} as const;

// -----------------------------------------------------------------------------
// Speed Control
// -----------------------------------------------------------------------------

export const SPEED = {
  TICKS_PER_MINUTE: { 1: 5, 2: 10, 4: 20 } as Record<1 | 2 | 4, number>,
  SECONDS_PER_TICK: { 1: 12, 2: 6, 4: 3 } as Record<1 | 2 | 4, number>,
  EVENTS_PER_ERA_EARLY_MAX: 15,
  EVENTS_PER_ERA_LATE_MIN: 6,
  EVENT_TEMPLATE_COUNT: 80,
  EVENT_CATEGORY_COUNT: 8,
  EVENTS_PER_CATEGORY: 10,
  PRE_MADE_RIVAL_RELIGIONS: 10,
  EVENT_COOLDOWN_SECOND: 0.25,
  EVENT_COOLDOWN_THIRD: 0.05,
  ABANDONMENT_THRESHOLD: 15,
  ALIEN_FALLBACK_ERA: 9,
} as const;

// -----------------------------------------------------------------------------
// Commander Trait Rank (for army merge — higher wins)
// -----------------------------------------------------------------------------

export const COMMANDER_MERGE_RANK: Record<string, number> = {
  brilliant: 4,
  aggressive: 3,
  cautious: 2,
  reckless: 1,
  null: 0,
};

// Commander battle bonuses are in BATTLE.COMMANDER_ATTACK_MODS / COMMANDER_DEFEND_MODS (multipliers)

// -----------------------------------------------------------------------------
// Science Milestones
// -----------------------------------------------------------------------------

export const SCIENCE_MILESTONES = [
  { id: 'printing_press', name: 'Printing Press', year: 1650, devRequired: 3, nationsRequired: 1 },
  { id: 'scientific_method', name: 'Scientific Method', year: 1700, devRequired: 4, nationsRequired: 3 },
  { id: 'industrialization', name: 'Industrialization', year: 1800, devRequired: 5, nationsRequired: 5 },
  { id: 'electricity', name: 'Electricity', year: 1870, devRequired: 6, nationsRequired: 3 },
  { id: 'flight', name: 'Flight', year: 1910, devRequired: 7, nationsRequired: 1 },
  { id: 'nuclear_power', name: 'Nuclear Power', year: 1950, devRequired: 8, nationsRequired: 1 },
  { id: 'computing', name: 'Computing', year: 1970, devRequired: 8, nationsRequired: 2 },
  { id: 'internet', name: 'Internet', year: 1990, devRequired: 9, nationsRequired: 3 },
  { id: 'space_programs', name: 'Space Programs', year: 2030, devRequired: 10, nationsRequired: 2 },
  { id: 'planetary_defense', name: 'Planetary Defense', year: 2100, devRequired: 10, nationsRequired: 5 },
  { id: 'defense_grid', name: 'Defense Grid Online', year: 2150, devRequired: 12, nationsRequired: 1 },
] as const;

// -----------------------------------------------------------------------------
// Win Conditions
// -----------------------------------------------------------------------------

export const WIN_CONDITIONS = {
  DEFENSE_GRID_NATIONS_REQUIRED: 5,
  DEFENSE_GRID_DEV_LEVEL: 10,
  SUPERPOWER_DEV_LEVEL: 12,
  ALIEN_ARRIVAL_YEAR: 2200,
  ASCENSION_SCIENCE_LEVEL: 11,
  ASCENSION_PEACE_THRESHOLD: 0.9,
  ASCENSION_FAITH_THRESHOLD: 0.7,
} as const;

// -----------------------------------------------------------------------------
// LLM
// -----------------------------------------------------------------------------

export const LLM = {
  CALLS_PER_GAME: 17,
  ERA_NARRATIVE_MAX_WORDS: 150,
  COMMANDMENT_SCRIPTURE_MAX_WORDS: 40,
  VOICE_PETITION_MAX_WORDS: 50,
  EARTH_EULOGY_MAX_WORDS: 100,
  PROVIDER: 'gemini-flash',
  TIMEOUT_MS: 5000,
  MAX_RETRIES: 1,
} as const;

// -----------------------------------------------------------------------------
// Eras
// -----------------------------------------------------------------------------

export const ERAS = [
  { id: 'renaissance', name: 'Renaissance', startYear: 1600, endYear: 1650 },
  { id: 'exploration', name: 'Exploration', startYear: 1650, endYear: 1700 },
  { id: 'enlightenment', name: 'Enlightenment', startYear: 1700, endYear: 1750 },
  { id: 'revolution', name: 'Revolution', startYear: 1750, endYear: 1800 },
  { id: 'industry', name: 'Industry', startYear: 1800, endYear: 1870 },
  { id: 'empire', name: 'Empire', startYear: 1870, endYear: 1920 },
  { id: 'atomic', name: 'Atomic', startYear: 1920, endYear: 1960 },
  { id: 'digital', name: 'Digital', startYear: 1960, endYear: 2000 },
  { id: 'signal', name: 'Signal', startYear: 2000, endYear: 2050 },
  { id: 'revelation', name: 'Revelation', startYear: 2050, endYear: 2100 },
  { id: 'preparation', name: 'Preparation', startYear: 2100, endYear: 2150 },
  { id: 'arrival', name: 'Arrival', startYear: 2150, endYear: 2200 },
] as const;

// -----------------------------------------------------------------------------
// Divine Whispers
// -----------------------------------------------------------------------------

export const WHISPERS = {
  ENERGY_COST: 0,
  REGION_COOLDOWN_SEC: 30,
  GLOBAL_COOLDOWN_SEC: 10,
  TYPES: ['war', 'peace', 'science', 'faith'] as const,
  AI_NUDGE_STRENGTH: 0.15,
  COMPOUND_BONUS: 0.05,
  COMPOUND_MAX_STACKS: 3,
  LOYALTY_BONUS: 0.02,
  NUDGE_CAP: 0.30,
} as const;

// -----------------------------------------------------------------------------
// Power Combos
// -----------------------------------------------------------------------------

export const COMBOS = {
  COUNT_MVP: 9,
  MODIFIER_MIN: 1.3,
  MODIFIER_MAX: 2.0,
  QUAKE_SCATTER_STRENGTH_LOSS: 0.20,
  QUAKE_SCATTER_DEFECT_RATE: 0.30,
  STORM_FLEET_DISRUPTION_MULTIPLIER: 2.0,
  HARVEST_GOLDEN_DURATION_YEARS: 3,
  INSPIRE_PROPHET_CONVERSION_MULTIPLIER: 2.0,
  SHIELD_MIRACLE_WINDOW_SEC: 120,
  SHIELD_MIRACLE_BOOST: 1.5,
  WILDFIRE_REBIRTH_DEV_BONUS: 1,
  WILDFIRE_REBIRTH_MIN_DEV: 3,
  FLOOD_FAMINE_POP_LOSS_BASE: 0.05,
  HARVEST_GOLDEN_MIN_DEV: 6,
  PURGE_IMMUNITY_ERAS: 1,
} as const;

// -----------------------------------------------------------------------------
// Follower Voices
// -----------------------------------------------------------------------------

export const VOICES = {
  MAX_ALIVE: 5,
  TYPES_COUNT: 5,
  STARTING_LOYALTY: 0.7,
  LOYALTY_GAIN_FULFILL: 0.10,
  LOYALTY_LOSS_DENY: 0.15,
  LOYALTY_LOSS_AUTO_DENY: 0.08,
  BETRAYAL_THRESHOLD: 0.3,
  LIFESPAN_YEARS_MIN: 100,
  LIFESPAN_YEARS_MAX: 200,
  LINEAGE_CHANCE: 0.3,
  LINEAGE_DELAY_YEARS_MIN: 50,
  LINEAGE_DELAY_YEARS_MAX: 100,
  LINEAGE_STARTING_LOYALTY: 0.6,
  RULER_FAITH_THRESHOLD: 0.6,
  SCHOLAR_DEV_THRESHOLD: 6,
  HERETIC_SCHISM_THRESHOLD: 0.4,
  PROPHET_IGNORE_YEARS: 50,
  BETRAYAL_PROB_PER_TICK: 0.02,
  BETRAYAL_GRACE_TICKS: 2,
  LOYALTY_DECAY_PER_100_TICKS: 0.01,
} as const;

// -----------------------------------------------------------------------------
// Petitions
// -----------------------------------------------------------------------------

export const PETITIONS = {
  TIMEOUT_SEC: 90,
  MAX_PENDING: 2,
  COOLDOWN_SEC: 60,
} as const;

// -----------------------------------------------------------------------------
// Progressive Power Unlock
// -----------------------------------------------------------------------------

export const POWER_UNLOCK = {
  ERA_1: ['bountiful_harvest', 'great_storm'] as const,
  ERA_2: ['inspiration', 'great_flood'] as const,
  ERA_3: ['shield_of_faith', 'plague'] as const,
  ERA_4: ['miracle', 'famine'] as const,
  ERA_5: ['prophet', 'wildfire'] as const,
  ERA_6: ['golden_age', 'earthquake'] as const,
} as const;

// -----------------------------------------------------------------------------
// Smart Context FAB
// -----------------------------------------------------------------------------

export const FAB_CONTEXT = {
  MAX_CONTEXT_SLOTS: 4,
  ALWAYS_SHOW_CHEAPEST_BLESSING: true,
  ALWAYS_SHOW_CHEAPEST_DISASTER: true,
  WEIGHT_WAR: 0.4,
  WEIGHT_SCIENCE: 0.3,
  WEIGHT_FAITH: 0.3,
  WEIGHT_COMBO: 0.5,
} as const;

// -----------------------------------------------------------------------------
// Win Rate Targets (Stage 6)
// -----------------------------------------------------------------------------

export const WIN_RATE_TARGETS = {
  PEACE_MIN: 0.30,
  PEACE_MAX: 0.40,
  WAR_MIN: 0.30,
  WAR_MAX: 0.40,
  HYBRID_MIN: 0.40,
  HYBRID_MAX: 0.50,
  RANDOM_MIN: 0.15,
  RANDOM_MAX: 0.25,
  OPTIMAL_MAX: 0.70,
  NO_INPUT_MAX: 0.10,
} as const;

// -----------------------------------------------------------------------------
// Difficulty Scaling (Stage 6)
// -----------------------------------------------------------------------------

export const DIFFICULTY_SCALING = {
  START_EARTH: 3,
  PLATEAU_EARTH: 10,
  FACTOR_PER_EARTH: 0.03125,
  FACTOR_MAX: 1.25,
  AI_COMPETENCE_E1: 0.85,
  AI_COMPETENCE_MAX: 1.00,
  AI_COMPETENCE_PER_EARTH: 0.03,
  GUARANTEED_REGIONS_E1: 3,
  REDUCED_REGIONS_EARTH: 7,
} as const;

// -----------------------------------------------------------------------------
// Harbinger (Stage 6 — finalized)
// -----------------------------------------------------------------------------

export const HARBINGER = {
  DORMANT_ERAS_START: 1,
  DORMANT_ERAS_END: 6,
  ACTIVE_ERA_START: 7,
  SIGNAL_STRENGTH: {
    ERA_7: 3,
    ERA_8: 6,
    ERA_9: 10,
    ERA_10: 15,
    ERA_11: 20,
    ERA_12: 25,
  },
  ACTION_COSTS: {
    DISCORD: 2,
    CORRUPTION: 3,
    FALSE_MIRACLE: 4,
    PLAGUE_SEED: 3,
    SEVER: 2,
    VEIL: 4,
  },
  PROSPERITY_RESISTANCE_DEV: 8,
  PROSPERITY_RESISTANCE_FACTOR: 0.5,
  RUBBER_BAND_LOW: 0.5,
  RUBBER_BAND_MID: 0.8,
  RUBBER_BAND_HIGH: 1.0,
  VISIBILITY_VOICES_ERA: 8,
  VISIBILITY_CONFIRMED_ERA: 9,
  VISIBILITY_OVERLAY_ERA: 10,
  CORRUPTION_DEV_LOSS: 1,
  CORRUPTION_DURATION_YEARS: 10,
  VEIL_DURATION_ERAS: 1,
  TICK_INTERVAL: 10,
  CORRUPTION_DEV_LOSS_RATE: 0.05,
  SEVER_DISRUPTION_YEARS: 10,
} as const;

// -----------------------------------------------------------------------------
// Nation AI
// -----------------------------------------------------------------------------

export const NATION_AI = {
  PERSONALITY_WEIGHTS: {
    aggressive:   { declare_war: 1.5, sue_peace: 0.5, form_alliance: 0.7, break_alliance: 1.3, form_trade: 0.6, recruit: 1.4, develop: 0.5 },
    defensive:    { declare_war: 0.4, sue_peace: 1.3, form_alliance: 1.3, break_alliance: 0.5, form_trade: 1.0, recruit: 1.2, develop: 1.1 },
    expansionist: { declare_war: 1.3, sue_peace: 0.7, form_alliance: 1.1, break_alliance: 1.0, form_trade: 0.9, recruit: 1.1, develop: 0.8 },
    isolationist: { declare_war: 0.2, sue_peace: 1.5, form_alliance: 0.4, break_alliance: 0.8, form_trade: 0.3, recruit: 0.5, develop: 1.4 },
    balanced:     { declare_war: 1.0, sue_peace: 1.0, form_alliance: 1.0, break_alliance: 1.0, form_trade: 1.0, recruit: 1.0, develop: 1.0 },
  },
  WAR_SCORE_MILITARY_WEIGHT: 0.30,
  WAR_SCORE_OPINION_WEIGHT: 0.30,
  WAR_SCORE_BORDER_WEIGHT: 0.20,
  WAR_SCORE_RELIGION_WEIGHT: 0.15,
  WAR_SCORE_OPPORTUNITY_WEIGHT: 0.05,
  WAR_DECLARATION_THRESHOLD: 0.60,
  PEACE_THRESHOLD: 0.50,
  ALLIANCE_OPINION_THRESHOLD: 0.30,
  TRADE_PEACE_TICKS_REQUIRED: 10,
  WAR_WEARINESS_GAIN_PER_TICK: 0.01,
  WAR_WEARINESS_DECAY_PER_TICK: 0.005,
  STABILITY_BASE: 0.70,
  STABILITY_WAR_DECAY: 0.005,
  STABILITY_PEACE_REGEN: 0.002,
  STABILITY_HAPPINESS_FACTOR: 0.30,
} as const;

// -----------------------------------------------------------------------------
// Government Evolution
// -----------------------------------------------------------------------------

export const GOVERNMENT_EVOLUTION = {
  MONARCHY_TO_REPUBLIC_DEV: 5,
  MONARCHY_TO_REPUBLIC_ERA: 4,
  MONARCHY_TO_THEOCRACY_FAITH: 0.80,
  MONARCHY_TO_THEOCRACY_REGION_RATIO: 0.50,
  MONARCHY_TO_JUNTA_WAR_WEARINESS: 0.70,
  MONARCHY_TO_JUNTA_STABILITY: 0.30,
  REPUBLIC_TO_DEMOCRACY_DEV: 8,
  REPUBLIC_TO_DEMOCRACY_ERA: 7,
  REPUBLIC_TO_DEMOCRACY_STABILITY: 0.60,
  REPUBLIC_TO_JUNTA_STABILITY: 0.30,
  REPUBLIC_TO_THEOCRACY_FAITH: 0.80,
  REPUBLIC_TO_THEOCRACY_REGION_RATIO: 0.60,
  DEMOCRACY_TO_JUNTA_STABILITY: 0.20,
  THEOCRACY_TO_REPUBLIC_DEV: 7,
  THEOCRACY_TO_REPUBLIC_FAITH: 0.50,
  THEOCRACY_TO_REPUBLIC_ERA: 6,
  THEOCRACY_TO_MONARCHY_STABILITY: 0.30,
  JUNTA_TO_REPUBLIC_PEACE_TICKS: 20,
  JUNTA_TO_REPUBLIC_STABILITY: 0.50,
  JUNTA_TO_DEMOCRACY_DEV: 9,
  JUNTA_TO_DEMOCRACY_STABILITY: 0.70,
  JUNTA_TO_DEMOCRACY_PEACE_TICKS: 30,
  REVOLUTION_BASE_PROB_PER_TICK: 0.002,
  THEOCRACY_FAITH_SPREAD_BONUS: 0.30,
} as const;

// -----------------------------------------------------------------------------
// Religion Lifecycle
// -----------------------------------------------------------------------------

export const RELIGION_LIFECYCLE = {
  MERGE_SIMILARITY_THRESHOLD: 0.70,
  MERGE_PROXIMITY_MAX_DISTANCE: 3,
  MERGE_MIN_COMBINED_REGIONS: 3,
  REFORM_CRISIS_STABILITY: 0.30,
  REFORM_ERA_THRESHOLD: 4,
  REFORM_COMMANDMENT_CHANGES: 2,
  EXTINCTION_POP_THRESHOLD: 100,
  FORCED_CONVERSION_RATE_MULTIPLIER: 2.0,
  PEACEFUL_CONVERSION_RETENTION_BONUS: 0.10,
} as const;

// -----------------------------------------------------------------------------
// Hidden Divine Rules
// -----------------------------------------------------------------------------

export const HIDDEN_RULES = {
  COOLDOWN_TICKS: 50,
  EFFECT_DURATION_TICKS: 20,
  FAITH_BOOST_MAGNITUDE: 0.05,
  MILITARY_BOOST_MAGNITUDE: 0.15,
  ECONOMY_BOOST_MAGNITUDE: 0.10,
  DEVELOPMENT_BOOST_MAGNITUDE: 0.10,
  POPULATION_BOOST_MAGNITUDE: 0.02,
  HAPPINESS_BOOST_MAGNITUDE: 0.05,
  DISASTER_ON_ENEMY_CHANCE: 0.10,
  DISCOVERY_OBSERVATIONS_REQUIRED: 3,
} as const;

// -----------------------------------------------------------------------------
// UI
// -----------------------------------------------------------------------------

export const UI = {
  MIN_TOUCH_TARGET_PT: 44,
  FAB_SIZE_PT: 52,
  FAB_ARC_BUTTON_SIZE_PT: 42,
  TOAST_MILESTONE_DURATION_MS: 4000,
  TOAST_INFORMATIONAL_DURATION_MS: 5000,
  TOAST_CHOICE_EVENT_DURATION_MS: -1,
  COMBO_TOAST_DURATION_MS: 5000,
  BOTTOM_SHEET_PEEK_PT: 120,
  BOTTOM_SHEET_HALF_SCREEN: 0.5,
  BOTTOM_SHEET_FULL_SCREEN: 0.85,
  TOP_SAFE_AREA_PT: 44,
  BOTTOM_SAFE_AREA_PT: 34,
  PRAYER_COUNTER_SIZE_PT: 20,
  WHISPER_BUTTON_SIZE_PT: 36,
  VOICE_ICON_SIZE_PT: 24,
  EVENT_QUEUE_MAX: 5,
} as const;
