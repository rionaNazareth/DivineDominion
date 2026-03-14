// =============================================================================
// DIVINE DOMINION — Headless Monte Carlo Runner
// Runs 1000 games headlessly and writes per-run JSON to playtest-results/.
// Spec: docs/design/test-spec.md §9, §14g
// =============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createInitialGameState } from '../simulation/world-gen.js';
import { runSimulationTick, initPRNG } from '../simulation/runner.js';
import { applyCommandmentEffects } from '../simulation/commandments.js';
import { castPower } from '../simulation/divine.js';
import { castWhisper } from '../simulation/whispers.js';
import { createPRNG } from '../simulation/prng.js';
import { ALL_COMMANDMENTS } from '../config/commandments.js';
import { TIME, WIN_CONDITIONS, SCIENCE_MILESTONES, ERAS } from '../config/constants.js';
import { produce } from 'immer';
import type { GameState, CommandmentId, EndingType, EraId, RegionId } from '../types/game.js';
import { decideAction, type StrategyProfile } from './agent-player.js';
import type { PlayerAction } from './agent-player.js';
import scenarios from '../../docs/design/monte-carlo-scenarios.json' assert { type: 'json' };
import profilesData from './profiles.json' assert { type: 'json' };

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const TOTAL_TICKS = TIME.TOTAL_TICKS_PER_GAME;           // 1200
const DELTA_REAL_SECONDS = TIME.TICK_GAME_YEARS / (TIME.GAME_YEARS_PER_REAL_MINUTE / 60);
// 1 tick = 0.5 game-years, at 2.5 game-years/real-min → 12 real seconds per tick
const TICK_REAL_SECONDS = 12;
const METRICS_SAMPLE_INTERVAL = 10;

// Archetype commandment presets (10 commandments each)
const ARCHETYPE_COMMANDMENTS: Record<string, CommandmentId[]> = {
  shepherd: [
    'convert_by_example', 'turn_other_cheek', 'share_all_wealth',
    'teach_every_child', 'harmony_with_seasons', 'all_life_sacred',
    'diplomatic_union', 'charity_above_all', 'god_is_silent', 'forgive_and_redeem',
  ],
  judge: [
    'justice_absolute', 'discipline_above_all', 'righteous_defense',
    'sacred_knowledge', 'build_great_works', 'honor_elders',
    'fear_gods_wrath', 'reward_the_strong', 'seek_truth', 'convert_by_example',
  ],
  conqueror: [
    'smite_the_wicked', 'holy_conquest', 'conquer_and_enlighten',
    'fear_gods_wrath', 'dominion_over_nature', 'reward_the_strong',
    'discipline_above_all', 'preach_to_all_lands', 'ends_justify_means', 'sacrifices_please_god',
  ],
};

// Valid commandment IDs (for random selection)
const ALL_COMMANDMENT_IDS = ALL_COMMANDMENTS.map(c => c.id);

// All 3 archetypes
const ARCHETYPES = ['shepherd', 'judge', 'conqueror'] as const;
type Archetype = typeof ARCHETYPES[number];

// All 7 strategy profile IDs
const ALL_STRATEGY_IDS = ['aggressive', 'passive', 'hybrid', 'random', 'optimal', 'degenerate', 'no_input'];
const ACTIVE_STRATEGY_IDS = ALL_STRATEGY_IDS.filter(s => s !== 'no_input');

// Era name to index mapping (1-based)
const ERA_TO_INDEX: Record<string, number> = {
  renaissance: 1, exploration: 2, enlightenment: 3, revolution: 4,
  industry: 5, empire: 6, atomic: 7, digital: 8,
  signal: 9, revelation: 10, preparation: 11, arrival: 12,
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface RunConfig {
  seed: number;
  archetype: string;
  commandments: CommandmentId[];
  strategy: string;
}

interface RunSummary {
  finalPopulation: number;
  finalScienceLevel: number;
  warCount: number;
  totalBattles: number;
  religionsSurvivingYear2000: number;
  eventsPerEra: number[];
  maxGapBetweenPlayerActions: number;
  peakHypocrisyLevel: number;
  harbingerActionsReceived: number;
  totalDivineInterventions: number;
  commandmentSynergyScore: number;
}

interface RunResult {
  seed: number;
  strategy: string;
  archetype: string;
  commandments: CommandmentId[];
  outcome: 'win' | 'loss';
  endingType: EndingType;
  defenseGridYear: number | null;
  finalYear: number;
  totalTicks: number;
  summary: RunSummary;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildProfiles(): Map<string, StrategyProfile> {
  const map = new Map<string, StrategyProfile>();
  for (const p of (profilesData as { profiles: StrategyProfile[] }).profiles) {
    map.set(p.id, p);
  }
  return map;
}

const PROFILES = buildProfiles();

function randInt(prng: ReturnType<typeof createPRNG>, min: number, max: number): number {
  return min + Math.floor(prng.next() * (max - min + 1));
}

function randomCommandments(prng: ReturnType<typeof createPRNG>): CommandmentId[] {
  const shuffled = [...ALL_COMMANDMENT_IDS].sort(() => prng.next() - 0.5);
  return shuffled.slice(0, 10) as CommandmentId[];
}

function randomArchetype(prng: ReturnType<typeof createPRNG>): Archetype {
  return ARCHETYPES[randInt(prng, 0, ARCHETYPES.length - 1)];
}

function randomStrategy(prng: ReturnType<typeof createPRNG>, includeNoInput: boolean): string {
  const pool = includeNoInput ? ALL_STRATEGY_IDS : ACTIVE_STRATEGY_IDS;
  return pool[randInt(prng, 0, pool.length - 1)];
}

function getTotalPopulation(state: GameState): number {
  let total = 0;
  for (const region of state.world.regions.values()) total += region.population;
  return total;
}

function getScienceLevel(state: GameState): number {
  return state.world.scienceProgress.milestonesReached.length;
}

function getReligionsAliveAtYear(state: GameState, year: number, targetYear: number): number {
  if (state.world.currentYear < targetYear) return 0;
  let count = 0;
  for (const religion of state.world.religions.values()) {
    // Count religions with any followers
    let totalInfluence = 0;
    for (const region of state.world.regions.values()) {
      const influence = region.religiousInfluence.find(ri => ri.religionId === religion.id);
      if (influence) totalInfluence += influence.strength;
    }
    if (totalInfluence > 0) count++;
  }
  return count;
}

function getActiveWars(state: GameState): number {
  let count = 0;
  const seen = new Set<string>();
  for (const nation of state.world.nations.values()) {
    for (const [otherId, rel] of nation.relations) {
      if (rel.atWar) {
        const key = [nation.id, otherId].sort().join(':');
        if (!seen.has(key)) { seen.add(key); count++; }
      }
    }
  }
  return count;
}

function getDefenseGridMilestoneIndex(): number {
  return SCIENCE_MILESTONES.findIndex(m => m.id === 'defense_grid');
}
const DEFENSE_GRID_IDX = getDefenseGridMilestoneIndex();

function checkWinCondition(state: GameState): { won: boolean; endingType: EndingType } {
  const science = state.world.scienceProgress;
  const year = state.world.currentYear;
  const allNations = Array.from(state.world.nations.values());

  // Defense grid win (united_front)
  if (science.milestonesReached.includes('defense_grid')) {
    const highDevCount = allNations.filter(n => n.development >= WIN_CONDITIONS.DEFENSE_GRID_DEV_LEVEL).length;
    if (highDevCount >= WIN_CONDITIONS.DEFENSE_GRID_NATIONS_REQUIRED) {
      return { won: true, endingType: 'united_front' };
    }
  }

  // Planetary defense (lone_guardian — single nation dev 12)
  if (allNations.some(n => n.development >= WIN_CONDITIONS.SUPERPOWER_DEV_LEVEL)) {
    if (science.milestonesReached.includes('planetary_defense')) {
      return { won: true, endingType: 'lone_guardian' };
    }
  }

  // Survival — alien arrival year
  if (year >= WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR) {
    return { won: false, endingType: 'extinction' };
  }

  return { won: false, endingType: 'extinction' };
}

/** Apply the player action to the game state. */
function applyAction(state: GameState, action: PlayerAction): GameState {
  switch (action.type) {
    case 'cast_power':
      return castPower(state, action.powerId, action.regionId);
    case 'cast_whisper':
      return castWhisper(state, action.regionId, action.whisperType, state.realTimeElapsed);
    case 'event_choice': {
      if (!state.currentEvent) return state;
      const event = state.currentEvent;
      const choice = event.choices?.[action.choiceIndex] ?? event.choices?.[0];
      if (!choice) {
        return produce(state, draft => { draft.currentEvent = undefined; });
      }
      return produce(state, draft => { draft.currentEvent = undefined; });
    }
    case 'fulfill_petition': {
      const voice = state.voiceRecords.find(v => v.id === action.voiceId);
      if (!voice?.currentPetition) return state;
      return produce(state, draft => {
        const v = draft.voiceRecords.find(v2 => v2.id === action.voiceId);
        if (v) { v.loyalty = Math.min(1.0, v.loyalty + 0.1); v.currentPetition = null; }
      });
    }
    case 'deny_petition': {
      const voice = state.voiceRecords.find(v => v.id === action.voiceId);
      if (!voice?.currentPetition) return state;
      return produce(state, draft => {
        const v = draft.voiceRecords.find(v2 => v2.id === action.voiceId);
        if (v) { v.loyalty = Math.max(0, v.loyalty - 0.05); v.currentPetition = null; }
      });
    }
    default:
      return state;
  }
}

// -----------------------------------------------------------------------------
// Core run function
// -----------------------------------------------------------------------------

function runGame(config: RunConfig): RunResult {
  const { seed, archetype, commandments, strategy } = config;

  // Initialize state
  let state = createInitialGameState(seed);
  initPRNG(seed);

  // Apply commandments
  state = produce(state, draft => {
    draft.selectedCommandments = commandments;
  });
  state = applyCommandmentEffects(state);

  // Initialize divine energy
  state = produce(state, draft => {
    draft.divineState.energy = 10;
    draft.divineState.maxEnergy = 20;
    draft.divineState.regenPerMinute = 1;
  });

  const profile = PROFILES.get(strategy);
  if (!profile) throw new Error(`Unknown strategy: ${strategy}`);

  // Agent PRNG — seeded from run config for determinism
  const agentPrng = createPRNG(seed ^ 0xDEADBEEF);

  // Metrics tracking
  let warCount = 0;
  let totalBattles = 0;
  let peakHypocrisy = 0;
  let defenseGridYear: number | null = null;
  let religionsSurvivingYear2000 = 0;
  const eventsPerEra: number[] = new Array(12).fill(0);
  let lastActionTick = 0;
  let maxGapBetweenActions = 0;
  let totalInterventions = 0;
  let harbingerActionsReceived = 0;
  let lastWarCount = 0;

  const eraForTick = (tick: number): number => {
    const year = TIME.GAME_START_YEAR + tick * TIME.TICK_GAME_YEARS;
    const era = ERAS.slice().reverse().find(e => year >= e.startYear);
    return era ? (ERA_TO_INDEX[era.id] ?? 1) : 1;
  };

  const getEraIndex = (state: GameState): number => ERA_TO_INDEX[state.world.currentEra] ?? 1;

  let finalOutcome: { won: boolean; endingType: EndingType } = { won: false, endingType: 'extinction' };

  for (let tick = 0; tick < TOTAL_TICKS; tick++) {
    // Decide and apply player action before tick
    agentPrng.resetForTick(tick);
    const action = decideAction(state, profile, agentPrng);

    const isActiveAction = action.type !== 'wait';
    if (isActiveAction) {
      const gap = tick - lastActionTick;
      if (gap > maxGapBetweenActions) maxGapBetweenActions = gap;
      lastActionTick = tick;
      totalInterventions++;
    }

    state = applyAction(state, action);

    // Run simulation tick
    state = runSimulationTick(state, TICK_REAL_SECONDS);

    // Track metrics
    const currentWars = getActiveWars(state);
    if (currentWars > lastWarCount) {
      warCount += currentWars - lastWarCount;
    }
    lastWarCount = currentWars;

    totalBattles = state.world.armies.size; // rough proxy (armies in battle states)

    if (state.hypocrisyLevel > peakHypocrisy) peakHypocrisy = state.hypocrisyLevel;

    // Track harbinger actions
    const harbinger = state.world.alienState.harbinger;
    if (harbinger) {
      harbingerActionsReceived = harbinger.actionsLog.length;
    }

    // Defense grid year
    if (
      defenseGridYear === null &&
      state.world.scienceProgress.milestonesReached.includes('defense_grid')
    ) {
      defenseGridYear = state.world.currentYear;
    }

    // Religions at year 2000
    if (Math.abs(state.world.currentYear - 2000) < 0.5) {
      religionsSurvivingYear2000 = getReligionsAliveAtYear(state, state.world.currentYear, 2000);
    }

    // Events per era
    const eraIdx = getEraIndex(state);
    const newEventCount = state.eventHistory.length;
    if (eraIdx >= 1 && eraIdx <= 12) {
      eventsPerEra[eraIdx - 1] = newEventCount;
    }

    // Check win/loss
    const result = checkWinCondition(state);
    if (result.won) {
      finalOutcome = result;
      break;
    }
    if (state.world.currentYear >= WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR) {
      finalOutcome = { won: false, endingType: 'extinction' };
      break;
    }
  }

  // Compute events per era (differential, not cumulative)
  const eventsPerEraDiff: number[] = new Array(12).fill(0);
  let prev = 0;
  for (let i = 0; i < 12; i++) {
    eventsPerEraDiff[i] = Math.max(0, eventsPerEra[i] - prev);
    prev = eventsPerEra[i];
  }

  // Synergy score: ratio of positive effects across commandments
  const effects = state.effectiveCommandmentEffects ?? {};
  const positiveKeys = Object.values(effects).filter(v => typeof v === 'number' && v > 0).length;
  const totalKeys = Object.values(effects).filter(v => typeof v === 'number').length;
  const synergyScore = totalKeys > 0 ? positiveKeys / totalKeys : 0;

  const summary: RunSummary = {
    finalPopulation: getTotalPopulation(state),
    finalScienceLevel: getScienceLevel(state),
    warCount,
    totalBattles,
    religionsSurvivingYear2000,
    eventsPerEra: eventsPerEraDiff,
    maxGapBetweenPlayerActions: maxGapBetweenActions,
    peakHypocrisyLevel: peakHypocrisy,
    harbingerActionsReceived,
    totalDivineInterventions: totalInterventions,
    commandmentSynergyScore: synergyScore,
  };

  return {
    seed,
    strategy,
    archetype,
    commandments,
    outcome: finalOutcome.won ? 'win' : 'loss',
    endingType: finalOutcome.endingType,
    defenseGridYear,
    finalYear: state.world.currentYear,
    totalTicks: state.world.currentTick,
    summary,
  };
}

// -----------------------------------------------------------------------------
// Build run configurations
// -----------------------------------------------------------------------------

function buildRunConfigs(): RunConfig[] {
  const configs: RunConfig[] = [];
  const metaPrng = createPRNG(0xC0FFEE);

  // 1. 20 curated scenarios (from JSON)
  for (const s of scenarios.scenarios) {
    configs.push({
      seed: s.seed,
      archetype: s.archetype,
      commandments: s.commandments as CommandmentId[],
      strategy: s.strategy,
    });
  }

  // 2. 54 specific: 3 seeds × 3 archetypes × 6 strategies (excludes no_input)
  const specificSeeds = [42, 7777, 314159];
  for (const seed of specificSeeds) {
    for (const archetype of ARCHETYPES) {
      for (const strategy of ACTIVE_STRATEGY_IDS) {
        configs.push({
          seed,
          archetype,
          commandments: ARCHETYPE_COMMANDMENTS[archetype] as CommandmentId[],
          strategy,
        });
      }
    }
  }

  // 3. 926 randomized
  while (configs.length < 1000) {
    const seed = metaPrng.nextInt(1, 999999);
    const archetype = randomArchetype(metaPrng);
    const strategy = randomStrategy(metaPrng, true);
    const commandments = randomCommandments(metaPrng);
    configs.push({ seed, archetype, commandments, strategy });
  }

  return configs.slice(0, 1000);
}

// -----------------------------------------------------------------------------
// Validate curated scenario pass (smoke test)
// -----------------------------------------------------------------------------

function validateCuratedScenario(
  result: RunResult,
  scenario: typeof scenarios.scenarios[number],
): { passed: boolean; reason?: string } {
  // We only check 'expected_win_rate' over single runs by checking the outcome.
  // In a single run, we just check the result is within the plausible range.
  // Full win rate validation requires running each curated seed multiple times —
  // here we run each exactly once and check structural validity (no crash, no NaN).
  const pop = result.summary.finalPopulation;
  if (isNaN(pop) || pop < 0) {
    return { passed: false, reason: `Invalid population: ${pop}` };
  }
  if (isNaN(result.summary.finalScienceLevel)) {
    return { passed: false, reason: 'NaN science level' };
  }
  if (!isFinite(result.finalYear)) {
    return { passed: false, reason: 'Non-finite final year' };
  }
  return { passed: true };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outputDir = path.resolve(__dirname, '../../playtest-results');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const configs = buildRunConfigs();
  console.log(`Running ${configs.length} games...`);

  const results: RunResult[] = [];
  let passed = 0;
  let failed = 0;
  let aborted = false;

  for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    let result: RunResult;

    try {
      result = runGame(config);
    } catch (err) {
      console.error(`Run ${i} (seed=${config.seed}, ${config.strategy}) CRASHED:`, err);
      failed++;
      continue;
    }

    // Validate curated scenarios (first 20) — abort on failure
    if (i < 20 && !aborted) {
      const scenario = scenarios.scenarios[i];
      const validation = validateCuratedScenario(result, scenario);
      if (!validation.passed) {
        console.error(`CURATED SCENARIO FAILED [${scenario.id}]: ${validation.reason}`);
        console.error('Aborting full run. Fix the issue and re-run.');
        aborted = true;
        process.exit(1);
      }
    }

    results.push(result);
    passed++;

    // Write per-run JSON
    const filename = `${config.seed}-${config.strategy}-${config.archetype}.json`;
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(result, null, 2));

    if ((i + 1) % 50 === 0) {
      console.log(`  ${i + 1}/${configs.length} complete (${passed} passed, ${failed} failed)`);
    }
  }

  console.log(`\nComplete: ${passed} passed, ${failed} failed`);
  console.log(`Results written to ${outputDir}/`);

  // Write summary
  const summary = {
    totalRuns: configs.length,
    passed,
    failed,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(outputDir, '_summary.json'), JSON.stringify(summary, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
