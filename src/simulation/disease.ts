import './immer-config.js';
import { produce } from 'immer';

import { DISEASE, TIME } from '../config/constants.js';
import type {
  GameState,
  WorldState,
  RegionId,
  Disease,
  DiseaseSeverity,
  Region,
  Nation,
} from '../types/game.js';
import { seededRandom } from './prng.js';

function getWorld(state: GameState): WorldState {
  return state.world;
}

function isNationAtWar(nation: Nation): boolean {
  for (const rel of nation.relations.values()) {
    if (rel.atWar) return true;
  }
  return false;
}

function getTradeRouteCount(world: WorldState, regionId: RegionId): number {
  let count = 0;
  for (const route of world.tradeRoutes.values()) {
    if (!route.isActive) continue;
    if (route.regionA === regionId || route.regionB === regionId) count++;
  }
  return count;
}

function hasFamineInRegion(region: Region): boolean {
  return region.activeEffects?.some(
    (e) => e.powerId === 'famine' || e.powerId === 'great_famine',
  ) ?? false;
}

function hasHarvestBlessingInRegion(region: Region): boolean {
  return region.activeEffects?.some(
    (e) => e.powerId === 'bountiful_harvest',
  ) ?? false;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function determineSeverity(
  modifier: number,
  isDivine: boolean,
  rng: () => number,
): DiseaseSeverity {
  if (isDivine) return 'severe';
  const roll = rng();
  if (modifier >= 5.0) return roll < 0.3 ? 'pandemic' : 'severe';
  if (modifier >= 3.0) return roll < 0.3 ? 'severe' : 'moderate';
  if (modifier >= 1.5) return roll < 0.4 ? 'moderate' : 'mild';
  return 'mild';
}

function nextDiseaseId(world: WorldState): string {
  return `disease_${world.diseases.length}_${world.currentTick}`;
}

/**
 * Disease tick: emergence, spread, mortality, recovery, cleanup.
 * Uses state.prngState as call index for deterministic RNG.
 */
export function tickDiseases(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const seed = world.seed;
    const tick = world.currentTick;
    let callIndex = draft.prngState ?? 0;

    const rng = () => {
      const v = seededRandom(seed, tick, callIndex);
      callIndex++;
      return v;
    };

    const regionIds = Array.from(world.regions.keys()).sort();

    // 1. Emergence (per region)
    for (const regionId of regionIds) {
      const region = world.regions.get(regionId);
      if (!region || region.population <= 0 || region.terrain === 'ocean') continue;

      const nation = world.nations.get(region.nationId);
      const isAtWar = nation ? isNationAtWar(nation) : false;
      const hasFamine = hasFamineInRegion(region);
      const tradeCount = getTradeRouteCount(world, regionId);
      const tradeMod =
        1.0 +
        tradeCount * (DISEASE.TRADE_EMERGENCE_MULTIPLIER - 1.0) * 0.2;
      let modifier = 1.0;
      if (isAtWar) modifier *= DISEASE.WAR_EMERGENCE_MULTIPLIER;
      if (hasFamine) modifier *= DISEASE.FAMINE_EMERGENCE_MULTIPLIER;
      modifier *= tradeMod;
      const densityFactor = clamp(
        region.population / DISEASE.DENSITY_THRESHOLD,
        0.5,
        2.0,
      );
      const emergenceChance =
        DISEASE.NATURAL_EMERGENCE_CHANCE_PER_TICK * modifier * densityFactor;

      if (rng() >= emergenceChance) continue;

      const severity = determineSeverity(modifier, false, rng);
      const mortalityRate = DISEASE.MORTALITY_RATES[severity];
      const spreadRate = DISEASE.SPREAD_RATES[severity];
      const newDisease: Disease = {
        id: nextDiseaseId(world),
        name: `Disease ${world.diseases.length + 1}`,
        severity,
        affectedRegions: [regionId],
        immuneRegionIds: [],
        infectionStartTickByRegion: new Map([[regionId, tick]]),
        spreadRate,
        mortalityRate,
        originYear: world.currentYear,
        isDivine: false,
        isActive: true,
      };
      world.diseases.push(newDisease);
    }

    // 2. Spread (per disease, per affected region -> neighbors)
    for (const disease of world.diseases) {
      if (!disease.isActive) continue;
      const toSpread: { target: RegionId }[] = [];
      for (const regionId of disease.affectedRegions) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        for (const adjId of region.adjacentRegionIds) {
          if (
            disease.affectedRegions.includes(adjId) ||
            disease.immuneRegionIds.includes(adjId)
          )
            continue;
          const targetRegion = world.regions.get(adjId);
          if (!targetRegion || targetRegion.terrain === 'ocean') continue;

          let spreadChance = disease.spreadRate;
          const hasTrade =
            world.tradeRoutes.size > 0 &&
            Array.from(world.tradeRoutes.values()).some(
              (r) =>
                r.isActive &&
                (r.regionA === regionId || r.regionB === regionId) &&
                (r.regionA === adjId || r.regionB === adjId),
            );
          if (hasTrade) spreadChance += DISEASE.TRADE_SPREAD_BONUS;
          if (targetRegion.isQuarantined)
            spreadChance *= 1 - DISEASE.QUARANTINE_SPREAD_REDUCTION;
          const devResist =
            targetRegion.development * DISEASE.DEV_SPREAD_RESISTANCE;
          spreadChance *= Math.max(0, 1 - devResist);
          if (rng() < spreadChance) toSpread.push({ target: adjId });
        }
      }
      for (const { target } of toSpread) {
        if (
          disease.affectedRegions.includes(target) ||
          disease.immuneRegionIds.includes(target)
        )
          continue;
        disease.affectedRegions.push(target);
        disease.infectionStartTickByRegion.set(target, tick);
      }
    }

    // 3. Mortality (per disease, per affected region)
    for (const disease of world.diseases) {
      if (!disease.isActive) continue;
      for (const regionId of disease.affectedRegions) {
        const region = world.regions.get(regionId);
        if (!region || region.population <= 0) continue;
        let rate = disease.mortalityRate;
        if (disease.isDivine) rate *= DISEASE.DIVINE_PLAGUE_SEVERITY_MULTIPLIER;
        const devReduction =
          region.development * DISEASE.DEV_MORTALITY_REDUCTION;
        rate *= Math.max(0.1, 1.0 - devReduction);
        if (hasHarvestBlessingInRegion(region)) rate *= 0.5;
        const deaths = Math.max(
          0,
          Math.floor(region.population * rate),
        );
        region.population = Math.max(0, region.population - deaths);
      }
    }

    // 4. Recovery (per disease, per affected region)
    for (const disease of world.diseases) {
      if (!disease.isActive) continue;
      const toRecover: RegionId[] = [];
      for (const regionId of disease.affectedRegions) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        const startTick = disease.infectionStartTickByRegion.get(regionId) ?? tick;
        const ticksInfected = tick - startTick;
        if (ticksInfected >= DISEASE.MAX_INFECTION_TICKS) {
          toRecover.push(regionId);
          continue;
        }
        let recoveryRate =
          DISEASE.RECOVERY_RATE_BASE +
          region.development * DISEASE.DEV_RECOVERY_BONUS;
        if (hasHarvestBlessingInRegion(region)) recoveryRate *= 2.0;
        if (rng() < recoveryRate) toRecover.push(regionId);
      }
      for (const rid of toRecover) {
        disease.affectedRegions = disease.affectedRegions.filter((r) => r !== rid);
        disease.infectionStartTickByRegion.delete(rid);
        disease.immuneRegionIds.push(rid);
      }
      if (disease.affectedRegions.length === 0) disease.isActive = false;
    }

    // 5. Cleanup: remove inactive diseases with no affected regions
    draft.world.diseases = world.diseases.filter(
      (d) => d.isActive || d.affectedRegions.length > 0,
    );
    draft.prngState = callIndex;
  });
}
