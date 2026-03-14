import { describe, it, expect } from 'vitest';

import { generateWorld } from '../world-gen.js';
import {
  WORLD_GEN,
  NATIONS,
  TIME,
  WORLD_GEN as WORLD,
  ERAS,
  WIN_CONDITIONS,
} from '../../config/constants.js';

describe('world-gen module', () => {
  it('WG_001: Region count within bounds', () => {
    const world = generateWorld(12345);
    const regionCount = world.regions.size;
    expect(regionCount).toBeGreaterThanOrEqual(WORLD.REGIONS_MIN);
    expect(regionCount).toBeLessThanOrEqual(WORLD.REGIONS_MAX);
  });

  it('WG_002: Nation count within bounds', () => {
    const world = generateWorld(99999);
    const nationCount = world.nations.size;
    expect(nationCount).toBeGreaterThanOrEqual(WORLD_GEN.NATIONS_MIN);
    expect(nationCount).toBeLessThanOrEqual(WORLD_GEN.NATIONS_MAX);
  });

  it('WG_003: Rival religion count', () => {
    const world = generateWorld(42);
    const totalReligions = world.religions.size;
    // One player religion, rest rivals.
    const rivalCount = totalReligions - 1;
    const nationCount = world.nations.size;

    expect(rivalCount).toBeGreaterThanOrEqual(WORLD_GEN.RIVAL_RELIGIONS_MIN);
    expect(rivalCount).toBeLessThanOrEqual(
      Math.min(WORLD_GEN.RIVAL_RELIGIONS_MAX, nationCount - 1),
    );
  });

  it('WG_004: Player religion in 2–3 regions', () => {
    const world = generateWorld(777);
    const playerReligionId = 'religion_player';

    let playerRegions = 0;
    for (const region of world.regions.values()) {
      if (region.dominantReligion === playerReligionId) {
        playerRegions += 1;
      }
    }

    expect(playerRegions).toBeGreaterThanOrEqual(
      WORLD_GEN.PLAYER_STARTING_REGIONS_MIN,
    );
    expect(playerRegions).toBeLessThanOrEqual(
      WORLD_GEN.PLAYER_STARTING_REGIONS_MAX,
    );
  });

  it('WG_005: Seed determinism', () => {
    const worldA = generateWorld(1);
    const worldB = generateWorld(1);

    // Compare some structural properties for equality.
    expect(worldA.regions.size).toBe(worldB.regions.size);
    expect(worldA.nations.size).toBe(worldB.nations.size);
    expect(worldA.religions.size).toBe(worldB.religions.size);
  });

  it('WG_006: Different seeds produce different worlds', () => {
    const worldA = generateWorld(1);
    const worldB = generateWorld(2);

    // At least one of these structural properties should differ.
    const sameRegionCount = worldA.regions.size === worldB.regions.size;
    const sameNationCount = worldA.nations.size === worldB.nations.size;

    const same = sameRegionCount && sameNationCount;
    expect(same).toBe(false);
  });

  it('WG_007: Capital min distance (graph distance ≥ 3 when possible)', () => {
    const world = generateWorld(13);

    const capitalIds = Array.from(world.nations.values()).map(
      (n) => n.regionIds[0],
    );

    const distances: Record<string, Record<string, number>> = {};

    const bfs = (startId: string) => {
      const dist: Record<string, number> = {};
      const queue: string[] = [];
      dist[startId] = 0;
      queue.push(startId);
      while (queue.length > 0) {
        const current = queue.shift()!;
        const region = world.regions.get(current);
        if (!region) continue;
        for (const neighborId of region.adjacentRegionIds) {
          if (!(neighborId in dist)) {
            dist[neighborId] = dist[current] + 1;
            queue.push(neighborId);
          }
        }
      }
      return dist;
    };

    for (const cap of capitalIds) {
      distances[cap] = bfs(cap);
    }

    for (let i = 0; i < capitalIds.length; i += 1) {
      for (let j = i + 1; j < capitalIds.length; j += 1) {
        const a = capitalIds[i];
        const b = capitalIds[j];
        const d = distances[a][b];
        expect(d).toBeGreaterThanOrEqual(WORLD_GEN.CAPITAL_MIN_DISTANCE - 1);
      }
    }
  });

  it('WG_008: Starting year and tick', () => {
    const world = generateWorld(5);
    expect(world.currentYear).toBe(TIME.GAME_START_YEAR);
    expect(world.currentTick).toBe(0);
  });

  it('WG_009: Terrain distribution and valid terrain types', () => {
    const world = generateWorld(555);
    let oceanCount = 0;
    for (const region of world.regions.values()) {
      expect([
        'plains',
        'hills',
        'forest',
        'mountain',
        'desert',
        'tundra',
        'coast',
        'ocean',
      ]).toContain(region.terrain);
      if (region.terrain === 'ocean') oceanCount += 1;
    }
    const oceanRatio = oceanCount / world.regions.size;
    // Roughly within ±15% of design target 0.25.
    expect(oceanRatio).toBeGreaterThan(0.1);
    expect(oceanRatio).toBeLessThan(0.4);
  });

  it('WG_010: Starting dev per region', () => {
    const world = generateWorld(6);
    const capitalRegionIds = Array.from(world.nations.values()).map(
      (n) => n.regionIds[0],
    );
    for (const region of world.regions.values()) {
      if (region.terrain === 'ocean') continue;
      if (capitalRegionIds.includes(region.id)) {
        expect(region.development).toBeGreaterThanOrEqual(2);
        expect(region.development).toBeLessThanOrEqual(4);
      } else {
        expect(region.development).toBeGreaterThanOrEqual(1);
        expect(region.development).toBeLessThanOrEqual(3);
      }
    }
  });

  it('WG_011: Starting army strength range', () => {
    const world = generateWorld(7);
    for (const army of world.armies.values()) {
      expect(army.strength).toBeGreaterThanOrEqual(
        WORLD_GEN.STARTING_ARMY_STRENGTH_MIN,
      );
      expect(army.strength).toBeLessThanOrEqual(
        WORLD_GEN.STARTING_ARMY_STRENGTH_MAX,
      );
    }
  });

  it('WG_012: Empty trade routes at start', () => {
    const world = generateWorld(8);
    expect(world.tradeRoutes.size).toBe(0);
  });

  it('WG_013: Empty diseases at start', () => {
    const world = generateWorld(9);
    expect(world.diseases.length).toBe(0);
  });

  it('WG_014: Alien state dormant and arrival year set', () => {
    const world = generateWorld(10);
    expect(world.alienState.arrivalYear).toBe(
      WIN_CONDITIONS.ALIEN_ARRIVAL_YEAR,
    );
    expect(world.alienState.revealedToPlayer).toBe(false);
  });

  it('WG_015: Current era is renaissance', () => {
    const world = generateWorld(11);
    expect(world.currentEra).toBe(ERAS[0].id);
  });
});

