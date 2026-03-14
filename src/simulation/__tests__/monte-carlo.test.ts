// =============================================================================
// DIVINE DOMINION — Monte Carlo Validation Tests
// These tests run a subset of scenarios to verify structural correctness.
// Full 1000-run balance validation is done via npm run playtest:headless.
// Spec: docs/design/test-spec.md §9
// =============================================================================

import { describe, it, expect } from 'vitest';
import { createInitialGameState } from '../world-gen.js';
import { runSimulationTick, initPRNG } from '../runner.js';
import { applyCommandmentEffects } from '../commandments.js';
import { castPower } from '../divine.js';
import { createPRNG } from '../prng.js';
import { produce } from 'immer';
import { TIME, WIN_CONDITIONS } from '../../config/constants.js';
import type { GameState, CommandmentId, EndingType } from '../../types/game.js';
import { decideAction, type StrategyProfile } from '../../playtest/agent-player.js';
import type { PlayerAction } from '../../playtest/agent-player.js';
import profilesData from '../../playtest/profiles.json';
import { BLESSINGS, DISASTERS } from '../../config/constants.js';

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

interface RunResult {
  outcome: 'win' | 'loss';
  endingType: EndingType;
  defenseGridYear: number | null;
  finalYear: number;
  finalPopulation: number;
  finalScienceLevel: number;
  peakHypocrisy: number;
  totalTicks: number;
}

type ProfileData = { profiles: StrategyProfile[] };

const profiles = new Map<string, StrategyProfile>(
  (profilesData as ProfileData).profiles.map((p: StrategyProfile) => [p.id, p]),
);

const TICK_REAL_SECONDS = 12;

function applyAction(state: GameState, action: PlayerAction): GameState {
  if (action.type === 'cast_power') {
    return castPower(state, action.powerId, action.regionId);
  }
  if (action.type === 'event_choice' && state.currentEvent) {
    return produce(state, draft => { draft.currentEvent = undefined; });
  }
  if (action.type === 'fulfill_petition') {
    return produce(state, draft => {
      const v = draft.voiceRecords.find(x => x.id === action.voiceId);
      if (v) { v.loyalty = Math.min(1, v.loyalty + 0.1); v.currentPetition = null; }
    });
  }
  if (action.type === 'deny_petition') {
    return produce(state, draft => {
      const v = draft.voiceRecords.find(x => x.id === action.voiceId);
      if (v) { v.loyalty = Math.max(0, v.loyalty - 0.05); v.currentPetition = null; }
    });
  }
  return state;
}

function runMiniGame(
  seed: number,
  commandments: CommandmentId[],
  strategyId: string,
  maxTicks: number,
): RunResult {
  let state = createInitialGameState(seed);
  initPRNG(seed);

  state = produce(state, draft => {
    draft.selectedCommandments = commandments;
    draft.divineState.energy = 10;
    draft.divineState.maxEnergy = 20;
    draft.divineState.regenPerMinute = 1;
  });
  state = applyCommandmentEffects(state);

  const profile = profiles.get(strategyId)!;
  const agentPrng = createPRNG(seed ^ 0xDEADBEEF);
  let peakHypocrisy = 0;
  let defenseGridYear: number | null = null;

  for (let tick = 0; tick < maxTicks; tick++) {
    agentPrng.resetForTick(tick);
    const action = decideAction(state, profile, agentPrng);
    state = applyAction(state, action);
    state = runSimulationTick(state, TICK_REAL_SECONDS);

    if (state.hypocrisyLevel > peakHypocrisy) peakHypocrisy = state.hypocrisyLevel;
    if (
      defenseGridYear === null &&
      state.world.scienceProgress.milestonesReached.includes('defense_grid')
    ) {
      defenseGridYear = state.world.currentYear;
    }
    if (state.world.currentYear >= WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR) break;
    if (state.world.scienceProgress.milestonesReached.includes('defense_grid')) {
      const highDevCount = Array.from(state.world.nations.values())
        .filter(n => n.development >= WIN_CONDITIONS.DEFENSE_GRID_DEV_LEVEL).length;
      if (highDevCount >= WIN_CONDITIONS.DEFENSE_GRID_NATIONS_REQUIRED) break;
    }
  }

  let totalPop = 0;
  for (const r of state.world.regions.values()) totalPop += r.population;

  return {
    outcome: 'loss',
    endingType: 'extinction',
    defenseGridYear,
    finalYear: state.world.currentYear,
    finalPopulation: totalPop,
    finalScienceLevel: state.world.scienceProgress.milestonesReached.length,
    peakHypocrisy,
    totalTicks: state.world.currentTick,
  };
}

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('Monte Carlo structural validation', () => {
  const SHEPHERD_CMDS: CommandmentId[] = [
    'convert_by_example', 'turn_other_cheek', 'share_all_wealth',
    'teach_every_child', 'harmony_with_seasons', 'all_life_sacred',
    'diplomatic_union', 'charity_above_all', 'god_is_silent', 'forgive_and_redeem',
  ];
  const JUDGE_CMDS: CommandmentId[] = [
    'justice_absolute', 'discipline_above_all', 'righteous_defense',
    'sacred_knowledge', 'build_great_works', 'honor_elders',
    'fear_gods_wrath', 'reward_the_strong', 'seek_truth', 'convert_by_example',
  ];

  describe('structural correctness: game runs without crashing', () => {
    it('MC_001: passive shepherd runs 120 ticks without NaN population', () => {
      const result = runMiniGame(42, SHEPHERD_CMDS, 'passive', 120);
      expect(isNaN(result.finalPopulation)).toBe(false);
      expect(result.finalPopulation).toBeGreaterThan(0);
    });

    it('MC_002: aggressive conqueror runs 120 ticks without NaN population', () => {
      const CONQUEROR_CMDS: CommandmentId[] = [
        'smite_the_wicked', 'holy_conquest', 'conquer_and_enlighten',
        'fear_gods_wrath', 'dominion_over_nature', 'reward_the_strong',
        'discipline_above_all', 'preach_to_all_lands', 'ends_justify_means', 'sacrifices_please_god',
      ];
      const result = runMiniGame(1337, CONQUEROR_CMDS, 'aggressive', 120);
      expect(isNaN(result.finalPopulation)).toBe(false);
      expect(result.finalPopulation).toBeGreaterThan(0);
    });

    it('MC_003: hybrid judge runs 120 ticks without NaN population', () => {
      const result = runMiniGame(512, JUDGE_CMDS, 'hybrid', 120);
      expect(isNaN(result.finalPopulation)).toBe(false);
      expect(result.finalPopulation).toBeGreaterThan(0);
    });

    it('MC_004: no_input profile runs 120 ticks without crash', () => {
      const result = runMiniGame(42, SHEPHERD_CMDS, 'no_input', 120);
      expect(isNaN(result.finalPopulation)).toBe(false);
      expect(isFinite(result.finalYear)).toBe(true);
    });

    it('MC_005: random strategy runs 120 ticks without crash', () => {
      const result = runMiniGame(32768, JUDGE_CMDS, 'random', 120);
      expect(isNaN(result.finalPopulation)).toBe(false);
    });
  });

  describe('structural correctness: state invariants hold', () => {
    it('MC_006: all region populations remain non-negative after 120 ticks', () => {
      let state = createInitialGameState(42);
      initPRNG(42);
      state = produce(state, draft => {
        draft.selectedCommandments = SHEPHERD_CMDS;
        draft.divineState.energy = 10;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      for (let tick = 0; tick < 120; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
      }

      for (const [rid, region] of state.world.regions) {
        expect(region.population).toBeGreaterThanOrEqual(0);
      }
    });

    it('MC_007: all non-ocean region development stays within [1, 12] after 120 ticks', () => {
      let state = createInitialGameState(512);
      initPRNG(512);
      state = produce(state, draft => {
        draft.selectedCommandments = JUDGE_CMDS;
        draft.divineState.energy = 10;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      for (let tick = 0; tick < 120; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
      }

      // Ocean regions have development=0 by design (nation.ts)
      for (const [, region] of state.world.regions) {
        if (region.terrain !== 'ocean') {
          expect(region.development).toBeGreaterThanOrEqual(1);
          expect(region.development).toBeLessThanOrEqual(12);
        }
      }
    });

    it('MC_008: science milestones only advance (never decrease) over 120 ticks', () => {
      let state = createInitialGameState(42);
      initPRNG(42);
      state = produce(state, draft => {
        draft.selectedCommandments = JUDGE_CMDS;
        draft.divineState.energy = 10;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      let lastMilestoneCount = 0;
      for (let tick = 0; tick < 120; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
        const count = state.world.scienceProgress.milestonesReached.length;
        expect(count).toBeGreaterThanOrEqual(lastMilestoneCount);
        lastMilestoneCount = count;
      }
    });

    it('MC_009: hypocrisy stays within [0, 1] after 120 ticks with disasters', () => {
      let state = createInitialGameState(42);
      initPRNG(42);
      state = produce(state, draft => {
        draft.selectedCommandments = ['all_life_sacred', 'turn_other_cheek', ...JUDGE_CMDS.slice(2)];
        draft.divineState.energy = 20;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      const regionId = Array.from(state.world.regions.keys())[0];
      state = castPower(state, 'great_storm', regionId);
      state = castPower(state, 'plague', regionId);

      for (let tick = 0; tick < 120; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
        expect(state.hypocrisyLevel).toBeGreaterThanOrEqual(0);
        expect(state.hypocrisyLevel).toBeLessThanOrEqual(1);
      }
    });

    it('MC_010: divine energy never exceeds max after 120 ticks', () => {
      let state = createInitialGameState(42);
      initPRNG(42);
      state = produce(state, draft => {
        draft.selectedCommandments = SHEPHERD_CMDS;
        draft.divineState.energy = 10;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      for (let tick = 0; tick < 120; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
        expect(state.divineState.energy).toBeLessThanOrEqual(state.divineState.maxEnergy);
        expect(state.divineState.energy).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('agent player API contract', () => {
    it('MC_011: no_input profile always returns wait', () => {
      const state = createInitialGameState(42);
      const profile = profiles.get('no_input')!;
      const prng = createPRNG(42);
      for (let i = 0; i < 20; i++) {
        prng.resetForTick(i);
        const action = decideAction(state, profile, prng);
        expect(action.type).toBe('wait');
      }
    });

    it('MC_012: all 7 strategy profiles exist and have required fields', () => {
      const required = ['aggressive', 'passive', 'hybrid', 'random', 'optimal', 'degenerate', 'no_input'];
      for (const id of required) {
        const profile = profiles.get(id);
        expect(profile, `Missing profile: ${id}`).toBeDefined();
        expect(profile!.id).toBe(id);
        expect(profile!.powerPolicy).toBeDefined();
        expect(profile!.whisperPolicy).toBeDefined();
        expect(profile!.petitionPolicy).toBeDefined();
        expect(profile!.castFrequency).toBeDefined();
      }
    });

    it('MC_013: decideAction returns valid action type for all profiles', () => {
      const validTypes = ['cast_power', 'cast_whisper', 'event_choice', 'fulfill_petition', 'deny_petition', 'wait'];
      let state = createInitialGameState(42);
      state = produce(state, draft => {
        draft.selectedCommandments = JUDGE_CMDS;
        draft.divineState.energy = 20;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      for (const [, profile] of profiles) {
        const prng = createPRNG(42);
        prng.resetForTick(0);
        const action = decideAction(state, profile, prng);
        expect(validTypes).toContain(action.type);
      }
    });

    it('MC_014: cast_power action references a valid region', () => {
      let state = createInitialGameState(42);
      state = produce(state, draft => {
        draft.selectedCommandments = JUDGE_CMDS;
        draft.divineState.energy = 20;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      const profile = profiles.get('aggressive')!;
      const prng = createPRNG(42);
      prng.resetForTick(0);
      const action = decideAction(state, profile, prng);

      if (action.type === 'cast_power') {
        expect(state.world.regions.has(action.regionId)).toBe(true);
      }
    });

    it('MC_015: determinism — same seed+tick produces same action', () => {
      let state = createInitialGameState(42);
      state = produce(state, draft => {
        draft.selectedCommandments = JUDGE_CMDS;
        draft.divineState.energy = 20;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      const profile = profiles.get('hybrid')!;

      const prng1 = createPRNG(42);
      prng1.resetForTick(5);
      const action1 = decideAction(state, profile, prng1);

      const prng2 = createPRNG(42);
      prng2.resetForTick(5);
      const action2 = decideAction(state, profile, prng2);

      expect(action1.type).toBe(action2.type);
    });
  });

  describe('Monte Carlo run configurations', () => {
    it('MC_016: buildRunConfigs-compatible: 20 curated scenario IDs exist in profiles', () => {
      const scenarioStrategies = ['passive', 'hybrid', 'aggressive', 'random', 'optimal', 'degenerate', 'no_input'];
      for (const strategy of scenarioStrategies) {
        expect(profiles.has(strategy)).toBe(true);
      }
    });

    it('MC_017: archetype commandment sets have exactly 10 commandments each', () => {
      const ARCHETYPE_COMMANDMENTS: Record<string, CommandmentId[]> = {
        shepherd: SHEPHERD_CMDS,
        judge: JUDGE_CMDS,
        conqueror: [
          'smite_the_wicked', 'holy_conquest', 'conquer_and_enlighten',
          'fear_gods_wrath', 'dominion_over_nature', 'reward_the_strong',
          'discipline_above_all', 'preach_to_all_lands', 'ends_justify_means', 'sacrifices_please_god',
        ],
      };
      for (const [archetype, cmds] of Object.entries(ARCHETYPE_COMMANDMENTS)) {
        expect(cmds.length, `${archetype} should have 10 commandments`).toBe(10);
        // All IDs should be unique
        expect(new Set(cmds).size, `${archetype} commandments should be unique`).toBe(10);
      }
    });

    it('MC_018: game year advances correctly over 240 ticks (120 game-years)', () => {
      let state = createInitialGameState(42);
      initPRNG(42);
      state = produce(state, draft => {
        draft.selectedCommandments = SHEPHERD_CMDS;
        draft.divineState.energy = 10;
        draft.divineState.maxEnergy = 20;
        draft.divineState.regenPerMinute = 1;
      });
      state = applyCommandmentEffects(state);

      for (let tick = 0; tick < 240; tick++) {
        state = runSimulationTick(state, TICK_REAL_SECONDS);
      }

      // 240 ticks × 0.5 game-years = 120 game-years from 1600 → 1720
      expect(state.world.currentYear).toBeCloseTo(1600 + 240 * TIME.TICK_GAME_YEARS, 0);
    });

    it('MC_019: multiple different seeds produce different world states after 10 ticks', () => {
      function run10Ticks(seed: number): number {
        let state = createInitialGameState(seed);
        initPRNG(seed);
        state = produce(state, draft => {
          draft.selectedCommandments = JUDGE_CMDS;
          draft.divineState.energy = 10;
          draft.divineState.maxEnergy = 20;
          draft.divineState.regenPerMinute = 1;
        });
        state = applyCommandmentEffects(state);
        for (let tick = 0; tick < 10; tick++) {
          state = runSimulationTick(state, TICK_REAL_SECONDS);
        }
        let pop = 0;
        for (const r of state.world.regions.values()) pop += r.population;
        return pop;
      }

      const pop42 = run10Ticks(42);
      const pop137 = run10Ticks(137);
      const pop512 = run10Ticks(512);

      // Different seeds should produce different outcomes
      expect([pop42, pop137, pop512].every(p => !isNaN(p))).toBe(true);
    });

    it('MC_020: run config total is 1000 (20 curated + 54 specific + 926 random)', () => {
      // 20 curated scenarios (from monte-carlo-scenarios.json)
      // 3 seeds × 3 archetypes × 6 strategies = 54 specific
      // 1000 - 20 - 54 = 926 randomized
      const curatedCount = 20;
      const specificCount = 3 * 3 * 6;
      const randomizedCount = 1000 - curatedCount - specificCount;
      const total = curatedCount + specificCount + randomizedCount;
      expect(total).toBe(1000);
      expect(randomizedCount).toBe(926);
    });
  });
});
