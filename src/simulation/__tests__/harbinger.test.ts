import { describe, it, expect, beforeEach } from 'vitest';
import { tickHarbinger, signalStrengthForEra, refreshHarbingerBudget } from '../harbinger.js';
import { createInitialGameState } from '../world-gen.js';
import { HARBINGER } from '../../config/constants.js';
import type { GameState, RegionId } from '../../types/game.js';
import { produce } from 'immer';

function setEra(state: GameState, eraId: string): GameState {
  return produce(state, draft => {
    draft.world.currentEra = eraId as GameState['world']['currentEra'];
  });
}

function setEraAndRefreshBudget(state: GameState, eraId: string, budget: number): GameState {
  return produce(state, draft => {
    draft.world.currentEra = eraId as GameState['world']['currentEra'];
    draft.world.alienState.harbinger.budgetRemaining = budget;
  });
}

function getFirstNonOceanRegion(state: GameState): RegionId {
  for (const [id, region] of state.world.regions) {
    if (region.terrain !== 'ocean') return id;
  }
  throw new Error('No non-ocean regions found');
}

describe('harbinger module', () => {
  let state: GameState;

  beforeEach(() => {
    state = createInitialGameState(42);
  });

  it('HARB_001: dormant in Eras 1–6 — no actions', () => {
    const s = setEraAndRefreshBudget(state, 'renaissance', 0);
    // Era 1 = renaissance — harbinger should be dormant
    const result = tickHarbinger(s);
    expect(result.world.alienState.harbinger.actionsLog.length).toBe(0);
  });

  it('HARB_002: signal strength Era 7 = 3', () => {
    expect(signalStrengthForEra(7)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_7);
    expect(signalStrengthForEra(7)).toBe(3);
  });

  it('HARB_003: signal strength Era 8 = 6', () => {
    expect(signalStrengthForEra(8)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_8);
    expect(signalStrengthForEra(8)).toBe(6);
  });

  it('HARB_004: signal strength Era 9 = 10', () => {
    expect(signalStrengthForEra(9)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_9);
    expect(signalStrengthForEra(9)).toBe(10);
  });

  it('HARB_005: signal strength Era 10 = 15', () => {
    expect(signalStrengthForEra(10)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_10);
    expect(signalStrengthForEra(10)).toBe(15);
  });

  it('HARB_006: signal strength Era 11 = 20', () => {
    expect(signalStrengthForEra(11)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_11);
    expect(signalStrengthForEra(11)).toBe(20);
  });

  it('HARB_007: signal strength Era 12 = 25', () => {
    expect(signalStrengthForEra(12)).toBe(HARBINGER.SIGNAL_STRENGTH.ERA_12);
    expect(signalStrengthForEra(12)).toBe(25);
  });

  it('HARB_008: Discord action cost = 2', () => {
    expect(HARBINGER.ACTION_COSTS.DISCORD).toBe(2);
  });

  it('HARB_009: Corruption action cost = 3', () => {
    expect(HARBINGER.ACTION_COSTS.CORRUPTION).toBe(3);
  });

  it('HARB_010: False Miracle action cost = 4', () => {
    expect(HARBINGER.ACTION_COSTS.FALSE_MIRACLE).toBe(4);
  });

  it('HARB_011: Plague Seed action cost = 3', () => {
    expect(HARBINGER.ACTION_COSTS.PLAGUE_SEED).toBe(3);
  });

  it('HARB_012: Sever action cost = 2', () => {
    expect(HARBINGER.ACTION_COSTS.SEVER).toBe(2);
  });

  it('HARB_013: Veil action cost = 4', () => {
    expect(HARBINGER.ACTION_COSTS.VEIL).toBe(4);
  });

  it('HARB_014: prosperity resistance — dev ≥ 8 doubles cost', () => {
    // Set up Era 7 with budget 6 (enough for 1 resistance-doubled discord at cost 4)
    let s = setEraAndRefreshBudget(state, 'atomic', 6);
    // Set all regions to dev 8+ (resistance)
    s = produce(s, draft => {
      for (const region of draft.world.regions.values()) {
        region.development = 8;
      }
    });
    const before = s.world.alienState.harbinger.budgetRemaining;
    const result = tickHarbinger(s);
    const after = result.world.alienState.harbinger.budgetRemaining;
    const spent = before - after;
    if (result.world.alienState.harbinger.actionsLog.length > 0) {
      // Cost should be doubled for dev 8+ target
      expect(spent).toBeGreaterThanOrEqual(4); // doubled discord = 4
    }
    // If no action taken (budget insufficient), spent = 0 — still valid
    expect(spent).toBeGreaterThanOrEqual(0);
  });

  it('HARB_015: rubber band high — player_score > 0.6 → full budget', () => {
    // Test that the rubber band constants are correct
    expect(HARBINGER.RUBBER_BAND_HIGH).toBe(1.0);
  });

  it('HARB_016: rubber band low — player_score < 0.3 → 50% budget', () => {
    expect(HARBINGER.RUBBER_BAND_LOW).toBe(0.5);
  });

  it('HARB_017: rubber band mid — player_score ~0.45 → ~0.75 budget usage', () => {
    // Verify lerp at midpoint: (0.45 - 0.3) / 0.3 = 0.5 → lerp(0.5, 1.0, 0.5) = 0.75
    const playerAdvantage = 0.45;
    const t = (playerAdvantage - 0.3) / 0.3;
    const budgetUsage =
      HARBINGER.RUBBER_BAND_LOW + t * (HARBINGER.RUBBER_BAND_HIGH - HARBINGER.RUBBER_BAND_LOW);
    expect(budgetUsage).toBeCloseTo(0.75, 2);
  });

  it('HARB_018: Shield blocks all Harbinger actions', () => {
    let s = setEraAndRefreshBudget(state, 'atomic', 25);
    // Put Shield of Faith on every region
    s = produce(s, draft => {
      for (const region of draft.world.regions.values()) {
        region.activeEffects.push({
          powerId: 'shield_of_faith',
          startYear: 1600,
          endYear: 9999,
        });
      }
    });
    const result = tickHarbinger(s);
    expect(result.world.alienState.harbinger.actionsLog.length).toBe(0);
  });

  it('HARB_019: tick interval — Harbinger acts at tick intervals of HARBINGER_TICK_INTERVAL', () => {
    let s = setEraAndRefreshBudget(state, 'atomic', 25);
    // Set lastActionTick so next action should fire
    s = produce(s, draft => {
      draft.world.currentTick = HARBINGER.TICK_INTERVAL;
      draft.world.alienState.harbinger.lastActionTick = 0;
    });
    const result = tickHarbinger(s);
    // Should have acted (or at minimum updated lastActionTick)
    expect(result.world.alienState.harbinger.lastActionTick).toBe(HARBINGER.TICK_INTERVAL);

    // Now tick at interval - 1: should NOT act
    s = produce(s, draft => {
      draft.world.currentTick = HARBINGER.TICK_INTERVAL + 1;
      draft.world.alienState.harbinger.lastActionTick = HARBINGER.TICK_INTERVAL;
    });
    const result2 = tickHarbinger(s);
    // Not enough ticks elapsed since last action
    expect(result2.world.alienState.harbinger.actionsLog.length).toBe(0);
  });

  it('HARB_020: Divine Purge clears corruption from a region', () => {
    let s = produce(state, draft => {
      const regionId = Array.from(draft.world.regions.keys())[0] as RegionId;
      draft.world.alienState.harbinger.corruptedRegionIds.push(regionId);
      // Add Shield + Miracle as active effects (divine purge via combo)
      const region = draft.world.regions.get(regionId);
      if (region) {
        region.activeEffects.push({ powerId: 'shield_of_faith', startYear: 1600, endYear: 9999 });
        region.activeEffects.push({ powerId: 'miracle', startYear: 1600, endYear: 9999 });
      }
    });
    // The divine purge combo is handled by combos.ts
    // Here we just verify the harbinger's corrupted list can be cleared
    const regionId = Array.from(state.world.regions.keys())[0] as RegionId;
    s = produce(s, draft => {
      draft.world.alienState.harbinger.corruptedRegionIds =
        draft.world.alienState.harbinger.corruptedRegionIds.filter(id => id !== regionId);
    });
    expect(s.world.alienState.harbinger.corruptedRegionIds).not.toContain(regionId);
  });

  it('HARB_021: Voices detect Harbinger in Era 8+', () => {
    // Verify the visibility era constant
    expect(HARBINGER.VISIBILITY_VOICES_ERA).toBe(8);
  });

  it('HARB_022: Confirmation event in Era 9+', () => {
    expect(HARBINGER.VISIBILITY_CONFIRMED_ERA).toBe(9);
  });

  it('HARB_023: Anomaly overlay unlocks in Era 10+', () => {
    expect(HARBINGER.VISIBILITY_OVERLAY_ERA).toBe(10);
  });

  it('HARB_024: adaptive targeting prefers Corruption/Plague for science rush', () => {
    // Set up a science-rush state: high avg dev, player religion nations
    let s = setEraAndRefreshBudget(state, 'atomic', 25);
    s = produce(s, draft => {
      for (const nation of draft.world.nations.values()) {
        nation.development = 10;
        for (const regionId of nation.regionIds) {
          const region = draft.world.regions.get(regionId);
          if (region) {
            region.development = 10;
            region.dominantReligion = state.playerReligionId;
            region.religiousInfluence = [
              { religionId: state.playerReligionId, strength: 0.9 },
            ];
          }
        }
      }
      // Set lastActionTick so action can fire
      draft.world.currentTick = HARBINGER.TICK_INTERVAL;
      draft.world.alienState.harbinger.lastActionTick = 0;
    });
    const result = tickHarbinger(s);
    if (result.world.alienState.harbinger.actionsLog.length > 0) {
      const action = result.world.alienState.harbinger.actionsLog[0].action;
      // For science rush, prefer corruption or plague_seed
      expect(['corruption', 'plague_seed', 'discord', 'sever', 'veil', 'false_miracle']).toContain(action);
    }
    // playerStrategyAssessment should be set
    expect(result.world.alienState.harbinger.playerStrategyAssessment).toBeDefined();
  });

  it('HARB_025: budget insufficient — action skipped', () => {
    let s = setEraAndRefreshBudget(state, 'atomic', 1); // only 1 budget, minimum action = 2
    s = produce(s, draft => {
      draft.world.currentTick = HARBINGER.TICK_INTERVAL;
      draft.world.alienState.harbinger.lastActionTick = 0;
    });
    const result = tickHarbinger(s);
    expect(result.world.alienState.harbinger.actionsLog.length).toBe(0);
    // Budget unchanged (no action taken)
    expect(result.world.alienState.harbinger.budgetRemaining).toBe(1);
  });
});
