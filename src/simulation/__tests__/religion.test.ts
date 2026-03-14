import { describe, it, expect } from 'vitest';

import { tickReligionSpread } from '../religion.js';
import type { GameState, ReligionId } from '../../types/game.js';
import { createInitialGameState } from '../world-gen.js';

describe('religion module', () => {
  it('REL_001: Diffusion rate — flow ≈ 0.01 × gradient × (1-resistance) for plains', () => {
    const state = createInitialGameState(101);
    const world = state.world;
    const ids = Array.from(world.regions.keys()).sort();
    const aId = ids[0];
    const bId = ids[1];
    const ra = world.regions.get(aId)!;
    const rb = world.regions.get(bId)!;
    ra.terrain = 'plains';
    rb.terrain = 'plains';
    ra.adjacentRegionIds = [bId];
    rb.adjacentRegionIds = [aId];
    ra.religiousInfluence = [{ religionId: 'religion_player' as ReligionId, strength: 0.7 }, { religionId: 'religion_rival_0' as ReligionId, strength: 0.3 }];
    rb.religiousInfluence = [{ religionId: 'religion_player' as ReligionId, strength: 0.2 }, { religionId: 'religion_rival_0' as ReligionId, strength: 0.6 }];
    ra.dominantReligion = 'religion_player';
    rb.dominantReligion = 'religion_rival_0';

    const next = tickReligionSpread(state, 0.5);
    const rb2 = next.world.regions.get(bId)!;
    const playerInB = rb2.religiousInfluence.find((x) => x.religionId === 'religion_player');
    expect(playerInB).toBeDefined();
    expect(playerInB!.strength).toBeGreaterThan(0.2);
    expect(playerInB!.strength).toBeLessThanOrEqual(1);
  });

  it('REL_005: Influence normalization — sum(influence) ≤ 1.0 per region', () => {
    const state = createInitialGameState(102);
    const next = tickReligionSpread(state, 0.5);
    for (const region of next.world.regions.values()) {
      const sum = region.religiousInfluence.reduce((s, x) => s + x.strength, 0);
      expect(sum).toBeLessThanOrEqual(1.01);
      expect(sum).toBeGreaterThanOrEqual(0);
    }
  });

  it('REL_006: Dominant religion update when influence ≥ 0.60', () => {
    const state = createInitialGameState(103);
    const world = state.world;
    const ids = Array.from(world.regions.keys()).sort();
    const r = world.regions.get(ids[0])!;
    r.terrain = 'plains';
    r.adjacentRegionIds = [];
    r.religiousInfluence = [{ religionId: 'religion_player' as ReligionId, strength: 0.65 }];
    r.dominantReligion = '' as ReligionId;
    const next = tickReligionSpread(state, 0.5);
    const r2 = next.world.regions.get(ids[0])!;
    expect(r2.dominantReligion).toBe('religion_player');
  });

  it('REL_011: Ocean blocks diffusion — flow = 0', () => {
    const state = createInitialGameState(104);
    const world = state.world;
    const ids = Array.from(world.regions.keys()).sort();
    const aId = ids[0];
    const bId = ids[1];
    const ra = world.regions.get(aId)!;
    const rb = world.regions.get(bId)!;
    ra.terrain = 'plains';
    rb.terrain = 'ocean';
    ra.religiousInfluence = [{ religionId: 'religion_player' as ReligionId, strength: 0.8 }];
    rb.religiousInfluence = [];
    if (!ra.adjacentRegionIds.includes(bId)) ra.adjacentRegionIds.push(bId);
    if (!rb.adjacentRegionIds.includes(aId)) rb.adjacentRegionIds.push(aId);
    const next = tickReligionSpread(state, 0.5);
    const rb2 = next.world.regions.get(bId)!;
    const playerInOcean = rb2.religiousInfluence.find((x) => x.religionId === 'religion_player');
    expect(playerInOcean?.strength ?? 0).toBe(0);
  });

  it('REL_018: No negative influence after apply', () => {
    const state = createInitialGameState(105);
    const next = tickReligionSpread(state, 0.5);
    for (const region of next.world.regions.values()) {
      for (const inf of region.religiousInfluence) {
        expect(inf.strength).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
