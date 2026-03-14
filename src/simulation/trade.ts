import './immer-config.js';
import { produce } from 'immer';

import { TRADE } from '../config/constants.js';
import type {
  GameState,
  WorldState,
  RegionId,
  NationId,
  TradeRoute,
  Region,
  Nation,
} from '../types/game.js';

function getWorld(state: GameState): WorldState {
  return state.world;
}

function isNationAtWar(nation: Nation): boolean {
  for (const rel of nation.relations.values()) {
    if (rel.atWar) return true;
  }
  return false;
}

function getNationRegionIds(world: WorldState, nationId: NationId): RegionId[] {
  const nation = world.nations.get(nationId);
  return nation?.regionIds ?? [];
}

function areNationsAdjacent(
  world: WorldState,
  nationA: NationId,
  nationB: NationId,
): boolean {
  const regionsA = getNationRegionIds(world, nationA);
  const regionsBSet = new Set(getNationRegionIds(world, nationB));
  for (const rid of regionsA) {
    const region = world.regions.get(rid);
    if (!region) continue;
    for (const adjId of region.adjacentRegionIds) {
      if (regionsBSet.has(adjId)) return true;
    }
  }
  return false;
}

function hasCoastalRegion(world: WorldState, nationId: NationId): boolean {
  for (const rid of getNationRegionIds(world, nationId)) {
    const r = world.regions.get(rid);
    if (r?.terrain === 'coast') return true;
  }
  return false;
}

function bfsDistance(
  world: WorldState,
  from: RegionId,
  to: RegionId,
): number | null {
  if (from === to) return 0;
  const visited = new Set<RegionId>([from]);
  const queue: { id: RegionId; dist: number }[] = [{ id: from, dist: 0 }];
  while (queue.length > 0) {
    const { id, dist } = queue.shift()!;
    const region = world.regions.get(id);
    if (!region) continue;
    for (const adjId of region.adjacentRegionIds) {
      if (adjId === to) return dist + 1;
      if (visited.has(adjId)) continue;
      visited.add(adjId);
      const adj = world.regions.get(adjId);
      if (adj?.terrain === 'ocean') continue;
      queue.push({ id: adjId, dist: dist + 1 });
    }
  }
  return null;
}

function hasDisasterInRegion(region: Region): boolean {
  return region.activeEffects?.some(
    (e) =>
      e.powerId === 'earthquake' ||
      e.powerId === 'great_storm' ||
      e.powerId === 'great_flood',
  ) ?? false;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function routeKey(a: RegionId, b: RegionId): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

/**
 * Trade tick: form new routes (score >= threshold, not at war), update volume,
 * apply disruption (war/disaster), auto-resume when disruption ends.
 */
export function tickTradeRoutes(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const nationIds = Array.from(world.nations.keys()).sort();
    const existingKeys = new Set(
      Array.from(world.tradeRoutes.values()).map((r) =>
        routeKey(r.regionA, r.regionB),
      ),
    );

    // Formation: eligible nation pairs
    for (let i = 0; i < nationIds.length; i++) {
      for (let j = i + 1; j < nationIds.length; j++) {
        const na = nationIds[i];
        const nb = nationIds[j];
        const nationA = world.nations.get(na)!;
        const nationB = world.nations.get(nb)!;
        if (isNationAtWar(nationA) || isNationAtWar(nationB)) continue;

        const relA = nationA.relations.get(nb);
        const relB = nationB.relations.get(na);
        const atWar =
          (relA?.atWar ?? false) || (relB?.atWar ?? false);
        if (atWar) continue;

        const adjacent = areNationsAdjacent(world, na, nb);
        const seaAccess =
          hasCoastalRegion(world, na) && hasCoastalRegion(world, nb);
        const opinion = Math.max(relA?.opinion ?? 0, relB?.opinion ?? 0);
        const devA = nationA.development;
        const devB = nationB.development;
        const minDev = Math.min(devA, devB);
        const devFactor = minDev / 12.0;

        let score = 0;
        if (adjacent) score += 0.3;
        if (seaAccess) score += 0.2;
        score += Math.max(0, opinion) * 0.2;
        score += devFactor * 0.3;

        if (score < TRADE.FORMATION_THRESHOLD) continue;

        // Pick endpoints: highest-pop region of A adjacent to B (or coastal)
        const regionsA = getNationRegionIds(world, na)
          .map((id) => world.regions.get(id))
          .filter((r): r is Region => r != null && r.terrain !== 'ocean');
        const regionsB = getNationRegionIds(world, nb)
          .map((id) => world.regions.get(id))
          .filter((r): r is Region => r != null && r.terrain !== 'ocean');
        const bSet = new Set(regionsB.map((r) => r.id));
        let bestA: RegionId | null = null;
        let bestB: RegionId | null = null;
        let bestPop = 0;
        for (const ra of regionsA) {
          for (const rb of regionsB) {
            const adj =
              ra.adjacentRegionIds.includes(rb.id) ||
              (seaAccess && ra.terrain === 'coast' && rb.terrain === 'coast');
            if (!adj) continue;
            const pop = ra.population * rb.population;
            if (pop > bestPop) {
              bestPop = pop;
              bestA = ra.id;
              bestB = rb.id;
            }
          }
        }
        if (!bestA || !bestB) continue;
        const key = routeKey(bestA, bestB);
        if (existingKeys.has(key)) continue;

        let distance: number;
        const landDist = bfsDistance(world, bestA, bestB);
        if (landDist != null) distance = landDist;
        else if (seaAccess) distance = TRADE.SEA_DISTANCE;
        else continue;

        const id = `trade_${world.tradeRoutes.size}_${world.currentTick}`;
        const route: TradeRoute = {
          id: id as TradeRoute['id'],
          regionA: bestA,
          regionB: bestB,
          distance,
          volume: 0,
          isActive: true,
        };
        world.tradeRoutes.set(route.id, route);
        existingKeys.add(key);
      }
    }

    // Volume and disruption
    for (const route of world.tradeRoutes.values()) {
      const regA = world.regions.get(route.regionA);
      const regB = world.regions.get(route.regionB);
      const nationA = regA ? world.nations.get(regA.nationId) : null;
      const nationB = regB ? world.nations.get(regB.nationId) : null;
      const atWar =
        (nationA && isNationAtWar(nationA)) ||
        (nationB && isNationAtWar(nationB));
      const disaster =
        (regA && hasDisasterInRegion(regA)) ||
        (regB && hasDisasterInRegion(regB));

      if (atWar || disaster) {
        route.isActive = false;
        route.disruptedUntilYear = world.currentYear + TRADE.DISRUPTION_DURATION_YEARS;
      } else if (
        route.disruptedUntilYear != null &&
        world.currentYear >= route.disruptedUntilYear
      ) {
        route.isActive = true;
        route.disruptedUntilYear = undefined;
      }

      if (!route.isActive) {
        route.volume = 0;
        continue;
      }

      if (!regA || !regB) {
        route.volume = 0;
        continue;
      }
      const popProduct = regA.population * regB.population;
      const devFactor =
        Math.sqrt(regA.development * regB.development) / 6.0;
      const distancePenalty = 1 / (route.distance * route.distance);
      const rawVolume =
        (popProduct / TRADE.POP_NORMALIZER) * devFactor * distancePenalty;
      route.volume = clamp(rawVolume, 0, 1);
    }
  });
}
