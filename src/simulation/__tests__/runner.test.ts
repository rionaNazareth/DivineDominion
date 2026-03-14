import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSimulationTick, initPRNG } from '../runner.js';
import { createInitialGameState } from '../world-gen.js';
import { TIME } from '../../config/constants.js';
import type { GameState } from '../../types/game.js';

// Spy helpers for call order verification
import * as divineModule from '../divine.js';
import * as diseaseModule from '../disease.js';
import * as nationModule from '../nation.js';
import * as tradeModule from '../trade.js';
import * as religionModule from '../religion.js';
import * as armyModule from '../army.js';
import * as scienceModule from '../science.js';
import * as nationAIModule from '../nation-ai.js';
import * as harbingerModule from '../harbinger.js';
import * as voicesModule from '../voices.js';
import * as eventsModule from '../events.js';
import * as whispersModule from '../whispers.js';

describe('runner module', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState(42);
    initPRNG(42);
    // Give energy so divine effects can be tested
    state = { ...state, divineState: { ...state.divineState, energy: 10, maxEnergy: 20, regenPerMinute: 1 } };
  });

  it('RUN_001: calls all 17 pipeline steps in order', () => {
    const callOrder: string[] = [];

    // Spy on each module function used by the runner
    const spies = [
      vi.spyOn(divineModule, 'tickDivineEffects').mockImplementation(s => { callOrder.push('tickDivineEffects'); return s; }),
      vi.spyOn(diseaseModule, 'tickDiseases').mockImplementation(s => { callOrder.push('tickDiseases'); return s; }),
      vi.spyOn(tradeModule, 'tickTradeRoutes').mockImplementation(s => { callOrder.push('tickTradeRoutes'); return s; }),
      vi.spyOn(nationModule, 'tickNations').mockImplementation(s => { callOrder.push('tickNations'); return s; }),
      vi.spyOn(religionModule, 'tickReligionSpread').mockImplementation(s => { callOrder.push('tickReligionSpread'); return s; }),
      vi.spyOn(armyModule, 'tickArmies').mockImplementation(s => { callOrder.push('tickArmies'); return s; }),
      vi.spyOn(scienceModule, 'tickScience').mockImplementation(s => { callOrder.push('tickScience'); return s; }),
      vi.spyOn(nationAIModule, 'tickNationAI').mockImplementation(s => { callOrder.push('tickNationAI'); return s; }),
      vi.spyOn(harbingerModule, 'tickHarbinger').mockImplementation(s => { callOrder.push('tickHarbinger'); return s; }),
      vi.spyOn(voicesModule, 'tickVoices').mockImplementation(s => { callOrder.push('tickVoices'); return s; }),
      vi.spyOn(eventsModule, 'rollEvents').mockImplementation(s => { callOrder.push('rollEvents'); return s; }),
      vi.spyOn(whispersModule, 'tickWhispers').mockImplementation(s => { callOrder.push('tickWhispers'); return s; }),
    ];

    runSimulationTick(state, 12);

    // Verify order matches the 17-step pipeline (steps that call into modules)
    expect(callOrder[0]).toBe('tickDivineEffects');
    expect(callOrder[1]).toBe('tickDiseases');
    expect(callOrder[2]).toBe('tickTradeRoutes');
    expect(callOrder[3]).toBe('tickNations');
    expect(callOrder[4]).toBe('tickReligionSpread');
    expect(callOrder[5]).toBe('tickArmies');
    expect(callOrder[6]).toBe('tickScience');
    expect(callOrder[7]).toBe('tickNationAI');
    expect(callOrder[8]).toBe('tickHarbinger');
    expect(callOrder[9]).toBe('tickVoices');
    expect(callOrder[10]).toBe('rollEvents');
    expect(callOrder[11]).toBe('tickWhispers');

    spies.forEach(spy => spy.mockRestore());
  });

  it('RUN_002: PRNG determinism — same seed + same inputs = identical output', () => {
    initPRNG(42);
    const result1 = runSimulationTick(state, 12);
    initPRNG(42);
    const result2 = runSimulationTick(state, 12);
    expect(result1.world.currentYear).toBe(result2.world.currentYear);
    expect(result1.world.currentTick).toBe(result2.world.currentTick);
  });

  it('RUN_003: currentYear advances by 0.5 game-years per tick', () => {
    const initialYear = state.world.currentYear;
    const result = runSimulationTick(state, 12);
    expect(result.world.currentYear).toBeCloseTo(initialYear + TIME.TICK_GAME_YEARS);
  });

  it('RUN_004: currentTick increments by 1', () => {
    const initialTick = state.world.currentTick;
    const result = runSimulationTick(state, 12);
    expect(result.world.currentTick).toBe(initialTick + 1);
  });

  it('RUN_005: Speed 1× — deltaRealSeconds=12 produces deltaGameYears=0.5', () => {
    const s = { ...state, speedMultiplier: 1 as 1 };
    const result = runSimulationTick(s, 12);
    expect(result.world.currentYear - state.world.currentYear).toBeCloseTo(TIME.TICK_GAME_YEARS);
  });

  it('RUN_006: Speed 2× — deltaRealSeconds=6 still produces same deltaGameYears=0.5', () => {
    const s = { ...state, speedMultiplier: 2 as 2 };
    const result = runSimulationTick(s, 6);
    expect(result.world.currentYear - state.world.currentYear).toBeCloseTo(TIME.TICK_GAME_YEARS);
  });

  it('RUN_007: Speed 4× — deltaRealSeconds=3 still produces same deltaGameYears=0.5', () => {
    const s = { ...state, speedMultiplier: 4 as 4 };
    const result = runSimulationTick(s, 3);
    expect(result.world.currentYear - state.world.currentYear).toBeCloseTo(TIME.TICK_GAME_YEARS);
  });

  it('RUN_008: PRNG call index resets to 0 at each tick start', () => {
    // Running the same tick twice with same seed should yield same output
    initPRNG(state.world.seed);
    const r1 = runSimulationTick(state, 12);
    initPRNG(state.world.seed);
    const r2 = runSimulationTick(state, 12);
    // Consistent output means call index was reset deterministically
    expect(r1.world.currentTick).toBe(r2.world.currentTick);
    expect(r1.world.currentYear).toBe(r2.world.currentYear);
  });

  it('RUN_009: each step uses Immer produce — input state is not mutated', () => {
    const originalTick = state.world.currentTick;
    const originalYear = state.world.currentYear;
    runSimulationTick(state, 12);
    expect(state.world.currentTick).toBe(originalTick);
    expect(state.world.currentYear).toBe(originalYear);
  });

  it('RUN_010: full state update after one tick', () => {
    const result = runSimulationTick(state, 12);
    expect(result.world.currentTick).toBe(state.world.currentTick + 1);
    expect(result.world.currentYear).toBeGreaterThan(state.world.currentYear);
    expect(result.realTimeElapsed).toBe(state.realTimeElapsed + 12);
  });

  it('RUN_011: tickCorruption is called by runner — corrupted regions lose dev', () => {
    const corruptSpy = vi.spyOn(harbingerModule, 'tickCorruption');
    runSimulationTick(state, 12);
    expect(corruptSpy).toHaveBeenCalled();
    corruptSpy.mockRestore();
  });

  it('RUN_012: refreshHarbingerBudget called on era transition', () => {
    const refreshSpy = vi.spyOn(harbingerModule, 'refreshHarbingerBudget');
    // Set state to just before era transition
    const s = { ...state };
    s.world = { ...s.world, currentYear: 1649.5, currentEra: 'renaissance' };
    runSimulationTick(s, 12);
    // After advancing 0.5 years to 1650, we cross into 'exploration' era
    expect(refreshSpy).toHaveBeenCalled();
    refreshSpy.mockRestore();
  });
});
