// =============================================================================
// DIVINE DOMINION — Single game run (used by headless-runner and playtest-worker)
// =============================================================================

import { createInitialGameState } from '../simulation/world-gen.js';
import { runSimulationTick, initPRNG } from '../simulation/runner.js';
import { applyCommandmentEffects } from '../simulation/commandments.js';
import { castPower } from '../simulation/divine.js';
import { castWhisper } from '../simulation/whispers.js';
import { createPRNG } from '../simulation/prng.js';
import { TIME, WIN_CONDITIONS } from '../config/constants.js';
import { produce } from 'immer';
import type {
  GameState,
  CommandmentId,
  EndingType,
  PlayerAction,
  StrategyProfile,
  RunResult,
  RunSummary,
} from '../types/game.js';
import { decideAction } from './agent-player.js';
import { MetricsCollector } from './metrics-collector.js';
import profilesData from './profiles.json' assert { type: 'json' };

// Re-export types so callers that previously imported from this module continue to work.
export type { RunResult, RunSummary } from '../types/game.js';

const TOTAL_TICKS = TIME.TOTAL_TICKS_PER_GAME;
const TICK_REAL_SECONDS = 12;

export interface RunConfig {
  seed: number;
  archetype: string;
  commandments: CommandmentId[];
  strategy: string;
}

function buildProfiles(): Map<string, StrategyProfile> {
  const map = new Map<string, StrategyProfile>();
  for (const p of (profilesData as { profiles: StrategyProfile[] }).profiles) {
    map.set(p.id, p);
  }
  return map;
}

const PROFILES = buildProfiles();

function checkWinCondition(state: GameState): { won: boolean; endingType: EndingType } {
  const science = state.world.scienceProgress;
  const year = state.world.currentYear;
  const allNations = Array.from(state.world.nations.values());

  if (science.milestonesReached.includes('defense_grid')) {
    const highDevCount = allNations.filter(n => n.development >= WIN_CONDITIONS.DEFENSE_GRID_DEV_LEVEL).length;
    if (highDevCount >= WIN_CONDITIONS.DEFENSE_GRID_NATIONS_REQUIRED) {
      return { won: true, endingType: 'united_front' };
    }
  }

  if (allNations.some(n => n.development >= WIN_CONDITIONS.SUPERPOWER_DEV_LEVEL)) {
    if (science.milestonesReached.includes('planetary_defense')) {
      return { won: true, endingType: 'lone_guardian' };
    }
  }

  if (year >= WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR) {
    return { won: false, endingType: 'extinction' };
  }

  return { won: false, endingType: 'extinction' };
}

function applyAction(state: GameState, action: PlayerAction): GameState {
  switch (action.type) {
    case 'cast_power':
      return castPower(state, action.powerId, action.regionId);
    case 'cast_whisper':
      return castWhisper(state, action.regionId, action.whisperType, state.realTimeElapsed);
    case 'event_choice': {
      if (!state.currentEvent) return state;
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

export function runGame(config: RunConfig): RunResult {
  const { seed, archetype, commandments, strategy } = config;

  let state = createInitialGameState(seed);
  initPRNG(seed);

  state = produce(state, draft => {
    draft.selectedCommandments = commandments;
  });
  state = applyCommandmentEffects(state);

  state = produce(state, draft => {
    draft.divineState.energy = 10;
    draft.divineState.maxEnergy = 20;
    draft.divineState.regenPerMinute = 1;
  });

  const profile = PROFILES.get(strategy);
  if (!profile) throw new Error(`Unknown strategy: ${strategy}`);

  const agentPrng = createPRNG(seed ^ 0xDEADBEEF);
  const collector = new MetricsCollector({ seed, strategy, archetype, commandments });

  let finalOutcome: { won: boolean; endingType: EndingType } = { won: false, endingType: 'extinction' };

  for (let tick = 0; tick < TOTAL_TICKS; tick++) {
    agentPrng.resetForTick(tick);
    const action = decideAction(state, profile, agentPrng);

    collector.recordAction(tick, action);
    state = applyAction(state, action);
    state = runSimulationTick(state, TICK_REAL_SECONDS);
    collector.onTick(tick, state);

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

  return collector.buildRunResult({
    outcome: finalOutcome.won ? 'win' : 'loss',
    endingType: finalOutcome.endingType,
    finalYear: state.world.currentYear,
    totalTicks: state.world.currentTick,
    state,
  });
}
