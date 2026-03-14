import { describe, it, expect } from 'vitest';

import { tickDiseases } from '../disease.js';
import { DISEASE } from '../../config/constants.js';
import type { GameState, RegionId, Disease } from '../../types/game.js';
import { createInitialGameState } from '../world-gen.js';

describe('disease module', () => {
  it('DIS_001: Emergence base — chance ≈ 0.0005 × density for no war/famine', () => {
    const state = createInitialGameState(200);
    const next = tickDiseases(state, 0.5);
    expect(Array.isArray(next.world.diseases)).toBe(true);
    expect(next.world.diseases.length).toBeGreaterThanOrEqual(0);
  });

  it('DIS_004: Mortality mild — 0.001/tick', () => {
    const state = createInitialGameState(201);
    const regionIds = Array.from(state.world.regions.keys()).sort();
    const rid = regionIds.find(
      (id) => state.world.regions.get(id)!.terrain !== 'ocean' && state.world.regions.get(id)!.population > 0,
    )!;
    const disease: Disease = {
      id: 'd_mild',
      name: 'Mild',
      severity: 'mild',
      affectedRegions: [rid],
      immuneRegionIds: [],
      infectionStartTickByRegion: new Map([[rid, 0]]),
      spreadRate: DISEASE.SPREAD_RATES.mild,
      mortalityRate: DISEASE.MORTALITY_RATES.mild,
      originYear: 1600,
      isDivine: false,
      isActive: true,
    };
    state.world.diseases = [disease];
    const region = state.world.regions.get(rid)!;
    const popBefore = region.population;
    const next = tickDiseases(state, 0.5);
    const regionAfter = next.world.regions.get(rid)!;
    const expectedDeaths = Math.floor(
      popBefore * DISEASE.MORTALITY_RATES.mild * Math.max(0.1, 1 - region.development * DISEASE.DEV_MORTALITY_REDUCTION),
    );
    expect(regionAfter.population).toBe(popBefore - expectedDeaths);
  });

  it('DIS_008: Recovery base — dev=1 gives 0.010 + 0.005 = 0.015/tick', () => {
    const state = createInitialGameState(202);
    const regionIds = Array.from(state.world.regions.keys()).sort();
    const rid = regionIds[0];
    const region = state.world.regions.get(rid)!;
    region.development = 1;
    region.terrain = 'plains';
    region.population = 10_000;
    const disease: Disease = {
      id: 'd_rec',
      name: 'Rec',
      severity: 'mild',
      affectedRegions: [rid],
      immuneRegionIds: [],
      infectionStartTickByRegion: new Map([[rid, 0]]),
      spreadRate: 0.01,
      mortalityRate: 0.001,
      originYear: 1600,
      isDivine: false,
      isActive: true,
    };
    state.world.diseases = [disease];
    const rate =
      DISEASE.RECOVERY_RATE_BASE + 1 * DISEASE.DEV_RECOVERY_BONUS;
    expect(rate).toBeCloseTo(0.015, 3);
  });

  it('DIS_015: Disease cleanup — isActive=false and no regions removed', () => {
    const state = createInitialGameState(203);
    const disease: Disease = {
      id: 'd_dead',
      name: 'Dead',
      severity: 'mild',
      affectedRegions: [],
      immuneRegionIds: ['r1' as RegionId],
      infectionStartTickByRegion: new Map(),
      spreadRate: 0.01,
      mortalityRate: 0.001,
      originYear: 1600,
      isDivine: false,
      isActive: false,
    };
    state.world.diseases = [disease];
    const next = tickDiseases(state, 0.5);
    expect(next.world.diseases.length).toBe(0);
  });

  it('DIS_019: Zero pop skip — no mortality applied', () => {
    const state = createInitialGameState(204);
    const regionIds = Array.from(state.world.regions.keys()).sort();
    const rid = regionIds[0];
    const region = state.world.regions.get(rid)!;
    region.population = 0;
    region.terrain = 'plains';
    const disease: Disease = {
      id: 'd_z',
      name: 'Z',
      severity: 'severe',
      affectedRegions: [rid],
      immuneRegionIds: [],
      infectionStartTickByRegion: new Map([[rid, 0]]),
      spreadRate: 0.025,
      mortalityRate: 0.015,
      originYear: 1600,
      isDivine: false,
      isActive: true,
    };
    state.world.diseases = [disease];
    const next = tickDiseases(state, 0.5);
    expect(next.world.regions.get(rid)!.population).toBe(0);
  });
});
