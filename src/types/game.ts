// =============================================================================
// DIVINE DOMINION — Type Definitions (THE CONTRACT)
// =============================================================================
// This file is the single source of truth for all type shapes.
// Design docs reference it, never duplicate it.
// =============================================================================

// -----------------------------------------------------------------------------
// Core Identifiers
// -----------------------------------------------------------------------------

export type RegionId = string;
export type NationId = string;
export type ReligionId = string;
export type ArmyId = string;
export type TradeRouteId = string;
export type CommandmentId = string;
export type EventId = string;
export type PowerId = string;

// -----------------------------------------------------------------------------
// Commandments
// -----------------------------------------------------------------------------

export type CommandmentCategory =
  | 'expansion'
  | 'conflict'
  | 'knowledge'
  | 'society'
  | 'divine'
  | 'nature'
  | 'morality';

export interface Commandment {
  id: CommandmentId;
  category: CommandmentCategory;
  name: string;
  flavorText: string;
  effects: CommandmentEffects;
  tensionsWith: CommandmentId[];
  unlockCondition?: UnlockCondition;
}

export interface CommandmentEffects {
  missionaryEffectiveness?: number;
  conversionRate?: number;
  schismRisk?: number;
  defenseBonus?: number;
  attackBonus?: number;
  diplomacyBonus?: number;
  militaryMorale?: number;
  militaryStrength?: number;
  researchSpeed?: number;
  economicOutput?: number;
  happiness?: number;
  stability?: number;
  populationGrowth?: number;
  productivityBonus?: number;
  constructionSpeed?: number;
  explorationSpeed?: number;
  tradeBonus?: number;
  disasterResistance?: number;
  industrialOutput?: number;
  divineEnergyCostMod?: number;
  divineEnergyRegenMod?: number;
  miracleEffectiveness?: number;
  canDeclareWar?: boolean;
  canUsePlague?: boolean;
  canUseFamine?: boolean;
  passiveSpread?: boolean;
  autoConvertOnConquest?: boolean;
  integrationSpeed?: number;
  conversionRetention?: number;
  holyWarEnabled?: boolean;
  hypocrisyDisabled?: boolean;
  faithDecayPerTick?: number;
}

export type UnlockCondition =
  | { type: 'survive_past_year'; year: number }
  | { type: 'win' }
  | { type: 'lose_count'; count: number }
  | { type: 'win_pure_peace' }
  | { type: 'win_pure_war' }
  | { type: 'visit_earths'; count: number };

// -----------------------------------------------------------------------------
// Religion
// -----------------------------------------------------------------------------

export interface Religion {
  id: ReligionId;
  name: string;
  color: string;
  symbol: string;
  commandments: CommandmentId[];
  isPlayerReligion: boolean;
  personality?: ReligionPersonality;
  hiddenRules?: HiddenDivineRule[];
}

export type ReligionPersonality =
  | 'peaceful'
  | 'expansionist'
  | 'scholarly'
  | 'militant'
  | 'apocalyptic'
  | 'isolationist'
  | 'syncretic'
  | 'mercantile';

export type HiddenRuleConditionType =
  | 'population_above'
  | 'population_below'
  | 'region_count_above'
  | 'region_count_below'
  | 'era_reached'
  | 'at_war'
  | 'at_peace_ticks'
  | 'faith_above'
  | 'development_above'
  | 'trade_routes_above'
  | 'army_strength_above';

export interface HiddenRuleCondition {
  type: HiddenRuleConditionType;
  threshold: number;
}

export type HiddenRuleEffectType =
  | 'faith_boost'
  | 'faith_penalty'
  | 'military_boost'
  | 'economy_boost'
  | 'development_boost'
  | 'population_boost'
  | 'happiness_boost'
  | 'disaster_on_enemy'
  | 'natural_disaster_shield';

export interface HiddenRuleEffect {
  type: HiddenRuleEffectType;
  magnitude: number;
  durationTicks: number; // 0 = instant, >0 = temporary buff/debuff
}

export interface HiddenDivineRule {
  id: string;
  condition: HiddenRuleCondition;
  effect: HiddenRuleEffect;
  cooldownTicks: number;
  lastTriggeredTick: number;
}

export interface ReligionInfluence {
  religionId: ReligionId;
  strength: number; // 0.0 - 1.0
}

// -----------------------------------------------------------------------------
// World & Regions
// -----------------------------------------------------------------------------

export interface WorldState {
  seed: number;
  currentYear: number;
  currentTick: number;
  regions: Map<RegionId, Region>;
  nations: Map<NationId, Nation>;
  religions: Map<ReligionId, Religion>;
  armies: Map<ArmyId, Army>;
  tradeRoutes: Map<TradeRouteId, TradeRoute>;
  diseases: Disease[];
  scienceProgress: ScienceProgress;
  alienState: AlienState;
  currentEra: EraId;
}

export interface Region {
  id: RegionId;
  nationId: NationId;
  position: Vec2;
  vertices: Vec2[];
  terrain: TerrainType;
  population: number;
  development: number; // 1-12
  happiness: number; // 0.0 - 1.0
  economicOutput: number; // computed per tick, stored for next tick's happiness calc
  faithStrength: number; // 0.0 - 1.0
  religiousInfluence: ReligionInfluence[];
  dominantReligion: ReligionId;
  hasCity: boolean;
  cityLevel: number; // 0 = no city, 1-5
  adjacentRegionIds: RegionId[];
  activeEffects: ActiveEffect[];
  isQuarantined: boolean;
  isCapital: boolean;
}

export type TerrainType =
  | 'plains'
  | 'hills'
  | 'forest'
  | 'mountain'
  | 'desert'
  | 'tundra'
  | 'coast'
  | 'ocean';

export interface Vec2 {
  x: number;
  y: number;
}

// -----------------------------------------------------------------------------
// Nations
// -----------------------------------------------------------------------------

export interface Nation {
  id: NationId;
  name: string;
  color: string;
  regionIds: RegionId[];
  government: GovernmentType;
  development: number; // pop-weighted avg of region development (1-12)
  militaryStrength: number;
  economicOutput: number;
  relations: Map<NationId, DiplomaticRelation>;
  dominantReligionId: ReligionId;
  isPlayerNation: boolean;
  aiPersonality: NationAIPersonality;
  aiWeights: NationAIWeights;
  stability: number; // 0.0 - 1.0
  warWeariness: number; // 0.0 - 1.0
}

export type GovernmentType = 'monarchy' | 'republic' | 'democracy' | 'theocracy' | 'military_junta';

export type NationAIPersonality = 'aggressive' | 'defensive' | 'expansionist' | 'isolationist' | 'balanced';

export interface NationAIWeights {
  war: number;
  peace: number;
  science: number;
  faith: number;
}

export interface DiplomaticRelation {
  nationId: NationId;
  opinion: number; // -1.0 (hostile) to 1.0 (allied)
  atWar: boolean;
  tradeAgreement: boolean;
  alliance: boolean;
  warStartTick?: number;
  peaceTicks: number; // consecutive ticks at peace
  lostTerritory?: boolean; // set true during conquest resolution when region lost
}

// -----------------------------------------------------------------------------
// Armies & Warfare
// -----------------------------------------------------------------------------

export interface Army {
  id: ArmyId;
  nationId: NationId;
  strength: number; // 500 - 50,000
  morale: number; // 0.0 - 1.0
  currentRegionId: RegionId;
  targetRegionId?: RegionId;
  path?: RegionId[];
  state: ArmyState;
  commander: Commander | null;
  supplyRange: number;
}

export type ArmyState =
  | 'garrisoned'
  | 'assembling'
  | 'marching'
  | 'engaged'
  | 'sieging'
  | 'retreating'
  | 'disbanded';

export interface Commander {
  name: string;
  trait: CommanderTrait;
}

export type CommanderTrait = 'aggressive' | 'cautious' | 'brilliant' | 'reckless';

export interface BattleResult {
  attackerArmyId: ArmyId;
  defenderArmyId: ArmyId;
  regionId: RegionId;
  attackerLosses: number;
  defenderLosses: number;
  winner: 'attacker' | 'defender';
  divineIntervention: boolean;
  attackerMoraleChange: number;
  defenderMoraleChange: number;
  retreated: boolean;
}

// -----------------------------------------------------------------------------
// Disease
// -----------------------------------------------------------------------------

export interface Disease {
  id: string;
  name: string;
  severity: DiseaseSeverity;
  affectedRegions: RegionId[];
  immuneRegionIds: RegionId[];
  infectionStartTickByRegion: Map<RegionId, number>;
  spreadRate: number;
  mortalityRate: number;
  originYear: number;
  isDivine: boolean;
  isActive: boolean;
}

export type DiseaseSeverity = 'mild' | 'moderate' | 'severe' | 'pandemic';

// -----------------------------------------------------------------------------
// Trade
// -----------------------------------------------------------------------------

export interface TradeRoute {
  id: TradeRouteId;
  regionA: RegionId;
  regionB: RegionId;
  distance: number; // BFS shortest path length between endpoints (1 = adjacent)
  volume: number; // 0.0 - 1.0
  isActive: boolean;
  disruptedUntilYear?: number;
}

// -----------------------------------------------------------------------------
// Divine Powers
// -----------------------------------------------------------------------------

export type WhisperType = 'war' | 'peace' | 'science' | 'faith';

export interface DivineState {
  energy: number;
  maxEnergy: number;
  regenPerMinute: number;
  cooldowns: Map<PowerId, number>; // powerId -> cooldown remaining (real seconds)
  totalInterventions: number;
  blessingsUsed: number;
  disastersUsed: number;
  hypocrisyEvents: number;
  lastDisasterYear: number;
  lastMiracleYear: number;
}

export interface DivinePower {
  id: PowerId;
  name: string;
  type: 'blessing' | 'disaster';
  cost: number;
  cooldownMinutes: number;
  durationGameYears: number | null; // null = instant
  description: string;
}

export type PowerComboId =
  | 'quake_scatter'
  | 'storm_fleet'
  | 'flood_famine'
  | 'plague_trade'
  | 'harvest_golden'
  | 'inspire_prophet'
  | 'shield_miracle'
  | 'wildfire_rebirth'
  | 'divine_purge';

export interface PowerCombo {
  id: PowerComboId;
  name: string;
  triggerPowers: PowerId[];
  condition: string;
  effect: string;
}

export interface DivineWhisper {
  type: WhisperType;
  targetRegionId: RegionId;
  targetNationId: NationId;
  targetedNationId?: NationId; // optional for targeted war/peace mode
  timestamp: number; // real seconds since epoch
}

export interface ActiveEffect {
  powerId: PowerId;
  startYear: number;
  endYear: number;
  sourceReligionId?: ReligionId;
}

// -----------------------------------------------------------------------------
// Science & Alien Endgame
// -----------------------------------------------------------------------------

export type ScienceMilestoneId =
  | 'printing_press'
  | 'scientific_method'
  | 'industrialization'
  | 'electricity'
  | 'flight'
  | 'nuclear_power'
  | 'computing'
  | 'internet'
  | 'space_programs'
  | 'planetary_defense'
  | 'defense_grid';

export interface ScienceProgress {
  currentLevel: number;
  milestonesReached: ScienceMilestoneId[];
  globalResearchOutput: number;
}

export interface AlienState {
  arrivalYear: number;
  signalDetectedYear: number;
  confirmedYear: number;
  revealedToPlayer: boolean;
  fleetStrength: number;
  defenseGridStrength: number; // 0.0 - 1.0
  harbinger: HarbingerState;
}

export type HarbingerActionType = 'discord' | 'corruption' | 'false_miracle' | 'plague_seed' | 'sever' | 'veil';

export type HarbingerStrategyAssessment =
  | 'science_rush'
  | 'faith_expansion'
  | 'peace_cooperation'
  | 'military_dominance'
  | 'balanced';

export interface HarbingerActionLog {
  tick: number;
  action: HarbingerActionType;
  targetRegionId: RegionId;
  cost: number;
}

export interface HarbingerState {
  budgetRemaining: number;
  lastActionTick: number;
  corruptedRegionIds: RegionId[];
  veiledRegionIds: RegionId[];
  immuneRegionIds: RegionId[];
  playerStrategyAssessment: HarbingerStrategyAssessment;
  actionsLog: HarbingerActionLog[];
}

// -----------------------------------------------------------------------------
// Events
// -----------------------------------------------------------------------------

export type EventCategory =
  | 'religious'
  | 'political'
  | 'scientific'
  | 'natural'
  | 'cultural'
  | 'military'
  | 'internal'
  | 'alien';

export interface GameEvent {
  id: EventId;
  category: EventCategory;
  title: string;
  description: string;
  year: number;
  affectedRegions: RegionId[];
  choices?: EventChoice[];
  autoResolve?: EventOutcome;
  alienCaused?: boolean;
}

export interface EventChoice {
  label: string;
  description: string;
  outcome: EventOutcome;
}

export type EffectTarget = 'nation_a' | 'nation_b' | 'region' | 'player_religion' | 'global' | 'self';

export interface EventOutcome {
  effects: Partial<RegionEffects>;
  target?: EffectTarget;
  narrativeText: string;
}

export interface RegionEffects {
  populationChange: number;
  developmentChange: number;
  happinessChange: number;
  faithChange: number;
  militaryChange: number;
  researchChange: number;
  economyChange: number;
}

// -----------------------------------------------------------------------------
// Eras
// -----------------------------------------------------------------------------

export type EraId =
  | 'renaissance'
  | 'exploration'
  | 'enlightenment'
  | 'revolution'
  | 'industry'
  | 'empire'
  | 'atomic'
  | 'digital'
  | 'signal'
  | 'revelation'
  | 'preparation'
  | 'arrival';

export interface Era {
  id: EraId;
  name: string;
  startYear: number;
  endYear: number;
  theme: string;
}

// -----------------------------------------------------------------------------
// Game State (Top Level)
// -----------------------------------------------------------------------------

export type GamePhase =
  | 'commandment_selection'
  | 'playing'
  | 'paused'
  | 'event_choice'
  | 'era_transition'
  | 'alien_reveal'
  | 'endgame'
  | 'result';

export type PivotalMomentType =
  | 'war'
  | 'schism'
  | 'miracle'
  | 'science'
  | 'religion_shift'
  | 'alien'
  | 'disaster'
  | 'outcome';

export interface PivotalMoment {
  year: number;
  type: PivotalMomentType;
  headline: string;
  details?: string;
}

export interface GameState {
  phase: GamePhase;
  world: WorldState;
  divineState: DivineState;
  whisperState: WhisperState;
  comboWindowState: ComboWindowState;
  playerReligionId: ReligionId;
  selectedCommandments: CommandmentId[];
  /** Cached aggregate of selected commandments' effects (computed by applyCommandmentEffects). */
  effectiveCommandmentEffects?: CommandmentEffects;
  eventHistory: GameEvent[];
  currentEvent?: GameEvent;
  eraNarratives: Map<EraId, string>;
  pivotalMoments: PivotalMoment[]; // max 20 per Earth, oldest non-outcome dropped if exceeded
  speedMultiplier: 1 | 2 | 4;
  realTimeElapsed: number; // seconds
  divineOverlayActive: boolean;
  voiceRecords: FollowerVoice[];
  hypocrisyLevel: number;
  prngState: number;
}

export interface WhisperState {
  lastWhisperTime: number;
  lastWhisperRegionId: RegionId | null;
  lastWhisperType: WhisperType | null;
  regionCooldowns: Map<string, number>; // key: `${regionId}:${whisperType}`
  compoundStacksByNation: Map<NationId, number>;
}

export interface ComboWindowState {
  lastShieldCastByRegion: Map<RegionId, number>;
  lastMiracleCastByRegion: Map<RegionId, number>;
}

// -----------------------------------------------------------------------------
// Follower Voices
// -----------------------------------------------------------------------------

export type VoiceId = string;
export type VoiceType = 'prophet' | 'ruler' | 'general' | 'scholar' | 'heretic';

export interface FollowerVoice {
  id: VoiceId;
  type: VoiceType;
  name: string;
  regionId: RegionId;
  loyalty: number;
  birthYear: number;
  lifespanYears: number;
  eraBorn: EraId;
  lineageOf: VoiceId | null;
  currentPetition: Petition | null;
  betrayalImminentTicks?: number;
}

export interface Petition {
  voiceId: VoiceId;
  type: string;
  requestText: string;
  expiryTime: number;
}

// -----------------------------------------------------------------------------
// Meta-Progression (Across Earths)
// -----------------------------------------------------------------------------

export interface GodProfile {
  totalEarths: number;
  earthsWon: number;
  earthsLost: number;
  totalInterventions: number;
  totalBlessings: number;
  totalDisasters: number;
  favoritePower: PowerId | null;
  mostUsedCommandments: CommandmentId[];
  unlockedCommandments: CommandmentId[];
  endingsAchieved: EndingType[];
  titles: string[];
}

export type EndingType =
  | 'united_front'
  | 'lone_guardian'
  | 'survival'
  | 'extinction'
  | 'self_destruction'
  | 'ascension';

// -----------------------------------------------------------------------------
// Sharing
// -----------------------------------------------------------------------------

export interface CommandmentCard {
  earthNumber: number;
  religionName: string;
  commandments: string[];
  ending: EndingType;
  endingNarrative: string;
  stats: {
    worldInfluencePercent: number;
    totalInterventions: number;
    disastersUsed: number;
    scienceLevel: number;
  };
}

export interface EarthHistoryEntry {
  year: number;
  event: string;
  type: 'war' | 'peace' | 'discovery' | 'disaster' | 'divine' | 'alien';
}

// -----------------------------------------------------------------------------
// Simulation Tick
// -----------------------------------------------------------------------------

export interface SimulationTick {
  deltaRealSeconds: number;
  deltaGameYears: number;
  currentYear: number;
  eventsTriggered: GameEvent[];
  battlesResolved: BattleResult[];
  diseasesUpdated: Disease[];
  regionsChanged: RegionId[];
  scienceMilestonesReached: ScienceMilestoneId[];
}
