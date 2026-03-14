import './immer-config.js';
import { produce } from 'immer';

import {
  ECONOMY,
  DEVELOPMENT,
  HAPPINESS,
  NATIONS,
  RECRUITMENT,
  TIME,
} from '../config/constants.js';
import {
  GameState,
  Nation,
  NationId,
  Region,
  RegionId,
  WorldState,
} from '../types/game.js';

function getWorld(state: GameState): WorldState {
  return state.world;
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getNationDevModifier(government: Nation['government']): number {
  return DEVELOPMENT.GOV_MODS[government] ?? 1;
}

function getNationEconomyModifier(government: Nation['government']): number {
  return ECONOMY.GOV_MODS[government] ?? 1;
}

function getRecruitmentGovModifier(government: Nation['government']): number {
  return RECRUITMENT.GOV_MODS[government] ?? 1;
}

function isNationAtWar(nation: Nation): boolean {
  for (const rel of nation.relations.values()) {
    if (rel.atWar) return true;
  }
  return false;
}

function getNationTradeRouteCount(
  world: WorldState,
  nationId: NationId,
): number {
  let count = 0;
  for (const route of world.tradeRoutes.values()) {
    const a = world.regions.get(route.regionA);
    const b = world.regions.get(route.regionB);
    if (!a || !b) continue;
    if (a.nationId === nationId || b.nationId === nationId) {
      count += 1;
    }
  }
  return count;
}

function computeRegionEconomy(
  region: Region,
  nation: Nation,
  world: WorldState,
): number {
  const base =
    (region.population / ECONOMY.POP_DIVISOR) * region.development;

  const govMod = getNationEconomyModifier(nation.government);

  const atWar = isNationAtWar(nation);
  const warMod = atWar ? ECONOMY.WAR_PENALTY : 1;

  return base * govMod * warMod;
}

function tickRegionPopulation(region: Region, deltaYears: number): void {
  if (region.terrain === 'ocean') {
    region.population = 0;
    return;
  }

  if (region.population <= 0) {
    region.population = 0;
    return;
  }

  const baseGrowth = NATIONS.POPULATION_GROWTH_BASE;
  const carryingCapacity =
    NATIONS.CARRYING_CAPACITY_PER_DEV * region.development;

  const current = region.population;
  const K = carryingCapacity;
  if (K <= 0) {
    region.population = Math.max(
      NATIONS.POPULATION_MIN_PER_REGION,
      region.population,
    );
    return;
  }

  const r = baseGrowth * deltaYears;
  const logistic = r * current * (1 - current / K);

  let next = current + logistic;

  if (next < 0) next = 0;
  if (next > K) next = K;

  if (next > 0 && next < NATIONS.POPULATION_MIN_PER_REGION) {
    next = NATIONS.POPULATION_MIN_PER_REGION;
  }

  region.population = Math.floor(next);
}

function tickRegionHappiness(
  region: Region,
  nation: Nation,
  world: WorldState,
): void {
  let happiness = HAPPINESS.BASE;

  const wealthTerm =
    clamp(region.economicOutput * HAPPINESS.WEALTH_FACTOR, 0, HAPPINESS.WEALTH_CAP);
  happiness += wealthTerm;

  const atWar = isNationAtWar(nation);
  if (atWar) happiness += HAPPINESS.WAR_PENALTY;

  const hasDisease = world.diseases.some((d) =>
    d.affectedRegions.includes(region.id),
  );
  if (hasDisease) happiness += HAPPINESS.DISEASE_PENALTY;

  const hasBlessing = region.activeEffects.some(
    (e) => e.powerId === 'bountiful_harvest',
  );
  if (hasBlessing) happiness += HAPPINESS.BLESSING_BONUS;

  const govMod = HAPPINESS.GOV_MODS[nation.government] ?? 0;
  happiness += govMod;

  region.happiness = clamp(happiness, HAPPINESS.MIN, HAPPINESS.MAX);
}

function tickRegionDevelopment(
  region: Region,
  nation: Nation,
  world: WorldState,
  deltaYears: number,
): void {
  if (region.terrain === 'ocean') {
    region.development = 0;
    return;
  }

  let growth = DEVELOPMENT.GROWTH_BASE_PER_TICK * (deltaYears / TIME.TICK_GAME_YEARS);

  const eraIndex = ERAS_INDEX_LOOKUP[world.currentEra] ?? 1;
  const eraFactor = 1 + (eraIndex - 1) * DEVELOPMENT.ERA_SCALING;
  growth *= eraFactor;

  const tradeRoutes = getNationTradeRouteCount(world, nation.id);
  if (tradeRoutes > 0) {
    growth += DEVELOPMENT.TRADE_BONUS;
  }

  growth *= getNationDevModifier(nation.government);

  region.development = clamp(
    region.development + growth,
    1,
    NATIONS.DEVELOPMENT_LEVELS,
  );
}

const ERAS_INDEX_LOOKUP: Record<string, number> = {};
import { ERAS } from '../config/constants.js';
ERAS.forEach((era, index) => {
  ERAS_INDEX_LOOKUP[era.id] = index + 1;
});

function tickNationRecruitment(
  nation: Nation,
  world: WorldState,
  deltaYears: number,
): void {
  const regions = nation.regionIds
    .map((id) => world.regions.get(id))
    .filter((r): r is Region => !!r);

  let totalPopulation = 0;
  let avgEconomy = 0;

  for (const region of regions) {
    totalPopulation += region.population;
    avgEconomy += region.economicOutput;
  }

  if (regions.length > 0) {
    avgEconomy /= regions.length;
  }

  if (avgEconomy < RECRUITMENT.ECON_THRESHOLD) {
    return;
  }

  const baseRate =
    RECRUITMENT.RATE *
    getRecruitmentGovModifier(nation.government) *
    (deltaYears / TIME.TICK_GAME_YEARS);

  const recruits = Math.floor(totalPopulation * baseRate);
  if (recruits <= 0) return;

  const existingArmies = Array.from(world.armies.values()).filter(
    (a) => a.nationId === nation.id,
  );
  if (existingArmies.length === 0) return;

  const perArmy = Math.floor(recruits / existingArmies.length) || 0;
  if (perArmy <= 0) return;

  for (const army of existingArmies) {
    army.strength += perArmy;
  }
}

export function tickNations(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = getWorld(draft);

    for (const region of world.regions.values()) {
      tickRegionPopulation(region, deltaYears);
    }

    for (const nation of world.nations.values()) {
      let totalPop = 0;
      let weightedDev = 0;
      let totalEconomy = 0;

      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        const econ = computeRegionEconomy(region, nation, world);
        region.economicOutput = econ;

        totalEconomy += econ;
        totalPop += region.population;
        weightedDev += region.population * region.development;
      }

      nation.economicOutput = totalEconomy;
      nation.development = totalPop > 0 ? weightedDev / totalPop : 0;
    }

    for (const worldNation of world.nations.values()) {
      for (const regionId of worldNation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        tickRegionHappiness(region, worldNation, world);
      }
    }

    for (const nation of world.nations.values()) {
      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        tickRegionDevelopment(region, nation, world, deltaYears);
      }
    }

    for (const nation of world.nations.values()) {
      tickNationRecruitment(nation, world, deltaYears);
    }
  });
}

