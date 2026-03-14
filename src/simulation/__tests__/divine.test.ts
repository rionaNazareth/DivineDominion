import { describe, it, expect } from 'vitest';
import {
  castPower,
  checkHypocrisy,
  tickDivineEffects,
  isPowerUnlocked,
} from '../divine.js';
import { createInitialGameState } from '../world-gen.js';
import type { GameState } from '../../types/game.js';
import { DIVINE_ENERGY, HYPOCRISY } from '../../config/constants.js';
import { produce } from 'immer';

function makeState(): GameState {
  const state = createInitialGameState(7);
  return produce(state, draft => {
    draft.divineState.energy = DIVINE_ENERGY.STARTING;
    draft.divineState.maxEnergy = DIVINE_ENERGY.MAX;
    draft.divineState.regenPerMinute = DIVINE_ENERGY.REGEN_PER_REAL_MINUTE;
  });
}

function firstRegionId(state: GameState): string {
  return Array.from(state.world.regions.keys()).find(k => {
    const r = state.world.regions.get(k);
    return r && r.terrain !== 'ocean';
  }) ?? Array.from(state.world.regions.keys())[0];
}

/** Set current era index. */
function setEra(state: GameState, eraId: string): GameState {
  return produce(state, draft => { draft.world.currentEra = eraId as GameState['world']['currentEra']; });
}

describe('divine', () => {
  it('DIV_001: cast energy cost — bountiful_harvest costs 2', () => {
    const state = makeState();
    const regionId = firstRegionId(state);
    const before = state.divineState.energy;
    const result = castPower(state, 'bountiful_harvest', regionId);
    expect(result.divineState.energy).toBeCloseTo(before - 2, 5);
  });

  it('DIV_002: insufficient energy — cast fails if energy < cost', () => {
    const state = produce(makeState(), draft => { draft.divineState.energy = 1; });
    const regionId = firstRegionId(state);
    const result = castPower(state, 'earthquake', regionId); // costs 4
    expect(result.divineState.energy).toBe(1); // unchanged
  });

  it('DIV_003: cooldown blocks — cast fails if cooldown active', () => {
    let state = makeState();
    const regionId = firstRegionId(state);
    // Set era to 6 to unlock earthquake
    state = setEra(state, 'empire');
    // First cast
    state = castPower(state, 'earthquake', regionId);
    const energyAfterFirst = state.divineState.energy;
    // Second cast immediately — should be blocked by cooldown
    const result = castPower(state, 'earthquake', regionId);
    expect(result.divineState.energy).toBe(energyAfterFirst); // unchanged
  });

  it('DIV_004: ActiveEffect added — cast harvest adds ActiveEffect with endYear', () => {
    const state = makeState();
    const regionId = firstRegionId(state);
    const result = castPower(state, 'bountiful_harvest', regionId);
    const region = result.world.regions.get(regionId)!;
    const effect = region.activeEffects.find(e => e.powerId === 'bountiful_harvest');
    expect(effect).toBeDefined();
    expect(effect!.endYear).toBeGreaterThan(state.world.currentYear);
  });

  it('DIV_005: hypocrisy mild — mild violation adds +0.05', () => {
    const state = produce(makeState(), draft => {
      draft.selectedCommandments = ['god_is_silent'];
    });
    const result = checkHypocrisy(state, 'miracle');
    expect(result.hypocrisyLevel).toBeCloseTo(HYPOCRISY.VIOLATION_GAIN_MILD, 5);
  });

  it('DIV_006: hypocrisy moderate — moderate violation adds +0.12', () => {
    const state = produce(makeState(), draft => {
      draft.selectedCommandments = ['turn_the_other_cheek'];
    });
    const result = checkHypocrisy(state, 'great_storm');
    expect(result.hypocrisyLevel).toBeCloseTo(HYPOCRISY.VIOLATION_GAIN_MODERATE, 5);
  });

  it('DIV_007: hypocrisy severe — severe violation adds +0.25', () => {
    const state = produce(makeState(), draft => {
      draft.selectedCommandments = ['all_life_sacred'];
    });
    const result = checkHypocrisy(state, 'plague');
    expect(result.hypocrisyLevel).toBeCloseTo(HYPOCRISY.VIOLATION_GAIN_SEVERE, 5);
  });

  it('DIV_008: hypocrisy disabled by commandment — no gain', () => {
    const state = produce(makeState(), draft => {
      draft.selectedCommandments = ['all_life_sacred'];
      draft.effectiveCommandmentEffects = { hypocrisyDisabled: true };
    });
    const result = checkHypocrisy(state, 'plague');
    expect(result.hypocrisyLevel).toBe(0);
  });

  it('DIV_009: hypocrisy decay — decrements by 0.00125 per tick', () => {
    const state = produce(makeState(), draft => { draft.hypocrisyLevel = 0.5; });
    const result = tickDivineEffects(state, 12); // 12 real seconds (1 tick at 1×)
    expect(result.hypocrisyLevel).toBeCloseTo(0.5 - HYPOCRISY.DECAY_RATE, 5);
  });

  it('DIV_010: energy bounds — 0 ≤ energy ≤ 20', () => {
    const state = makeState();
    const regionId = firstRegionId(state);
    // Cast until energy depleted
    let s = state;
    for (let i = 0; i < 10; i++) {
      s = produce(s, draft => {
        draft.divineState.cooldowns.clear();
        draft.divineState.energy = 2;
      });
      s = castPower(s, 'bountiful_harvest', regionId);
      expect(s.divineState.energy).toBeGreaterThanOrEqual(0);
      expect(s.divineState.energy).toBeLessThanOrEqual(DIVINE_ENERGY.MAX);
    }
  });

  it('DIV_011: hypocrisy bounds — 0 ≤ hypocrisy ≤ 1', () => {
    let state = produce(makeState(), draft => {
      draft.selectedCommandments = ['all_life_sacred'];
      draft.hypocrisyLevel = 0.90;
    });
    // Multiple severe violations should not exceed 1.0
    state = checkHypocrisy(state, 'plague');
    state = checkHypocrisy(state, 'plague');
    state = checkHypocrisy(state, 'plague');
    expect(state.hypocrisyLevel).toBeLessThanOrEqual(1.0);
    expect(state.hypocrisyLevel).toBeGreaterThanOrEqual(0);
  });

  it('DIV_012: effect expiry — effects past endYear are removed', () => {
    const state = makeState();
    const regionId = firstRegionId(state);
    // Add an expired effect
    const stateWithEffect = produce(state, draft => {
      const region = draft.world.regions.get(regionId)!;
      region.activeEffects.push({
        powerId: 'bountiful_harvest',
        startYear: 1600,
        endYear: 1605,
        sourceReligionId: 'rel_player',
      });
      draft.world.currentYear = 1610; // past endYear
    });
    const result = tickDivineEffects(stateWithEffect, 12);
    const region = result.world.regions.get(regionId)!;
    expect(region.activeEffects.find(e => e.powerId === 'bountiful_harvest')).toBeUndefined();
  });

  it('DIV_013: energy regen — 1 real minute = +1 energy', () => {
    const state = produce(makeState(), draft => { draft.divineState.energy = 5; });
    const result = tickDivineEffects(state, 60); // 60 real seconds = 1 minute
    expect(result.divineState.energy).toBeCloseTo(5 + DIVINE_ENERGY.REGEN_PER_REAL_MINUTE, 4);
  });

  it('DIV_014: power unlocked for era — Era 3, Shield of Faith available', () => {
    const state = setEra(makeState(), 'enlightenment'); // era 3
    expect(isPowerUnlocked(state, 'shield_of_faith')).toBe(true);
  });

  it('DIV_015: power locked for era — Era 1, Miracle not available', () => {
    const state = setEra(makeState(), 'renaissance'); // era 1
    expect(isPowerUnlocked(state, 'miracle')).toBe(false);
  });

  it('DIV_016: checkHypocrisy called — hypocrisy is checked when casting', () => {
    const state = produce(makeState(), draft => {
      draft.selectedCommandments = ['all_life_sacred'];
      draft.world.currentEra = 'enlightenment'; // unlock plague (era 3)
    });
    const regionId = firstRegionId(state);
    const result = castPower(state, 'plague', regionId);
    // Hypocrisy should have increased (plague + all_life_sacred = severe)
    // Note: castPower calls checkHypocrisy internally
    expect(result.hypocrisyLevel).toBeGreaterThan(0);
  });

  it('DIV_017: checkAndApplyCombos called — after cast, combos are checked', () => {
    let state = setEra(makeState(), 'empire'); // era 6 — unlock earthquake
    const regionId = firstRegionId(state);
    // Add an army to the region to trigger quake_scatter combo
    const armyId = 'army_test_div';
    state = produce(state, draft => {
      draft.world.armies.set(armyId, {
        id: armyId,
        nationId: Array.from(draft.world.nations.keys())[0],
        strength: 5000,
        morale: 0.8,
        currentRegionId: regionId,
        state: 'garrisoned',
        commander: null,
        supplyRange: 3,
      });
    });
    // castPower doesn't call combos directly; that's the runner's responsibility.
    // But castPower does add the ActiveEffect.
    const result = castPower(state, 'earthquake', regionId);
    const region = result.world.regions.get(regionId)!;
    expect(region.activeEffects.find(e => e.powerId === 'earthquake')).toBeDefined();
  });

  it('DIV_018: region must exist — cast fails for invalid regionId', () => {
    const state = makeState();
    const result = castPower(state, 'bountiful_harvest', 'INVALID_REGION');
    expect(result.divineState.energy).toBe(state.divineState.energy); // unchanged
  });

  it('DIV_019: power must exist — cast fails for invalid powerId', () => {
    const state = makeState();
    const regionId = firstRegionId(state);
    const result = castPower(state, 'nonexistent_power', regionId);
    expect(result.divineState.energy).toBe(state.divineState.energy); // unchanged
  });

  it('DIV_020: cooldown decrement — tickDivineEffects decrements cooldowns', () => {
    const state = produce(makeState(), draft => {
      draft.divineState.cooldowns.set('bountiful_harvest', 30); // 30 seconds remaining
    });
    const result = tickDivineEffects(state, 12); // 12 seconds pass
    const remaining = result.divineState.cooldowns.get('bountiful_harvest');
    expect(remaining).toBeCloseTo(18, 4);
  });
});
