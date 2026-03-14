import './immer-config.js';
import { produce } from 'immer';

import {
  COMMANDMENT_STACKING,
  DEVELOPMENT,
  ECONOMY,
  ERAS,
  HAPPINESS,
  NATIONS,
  RECRUITMENT,
  TIME,
  TRADE,
} from '../config/constants.js';
import {
  CommandmentEffects,
  GameState,
  Nation,
  NationId,
  Region,
  RegionId,
  WorldState,
} from '../types/game.js';

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
    if (!route.isActive) continue;
    const a = world.regions.get(route.regionA);
    const b = world.regions.get(route.regionB);
    if (!a || !b) continue;
    if (a.nationId === nationId || b.nationId === nationId) {
      count += 1;
    }
  }
  return count;
}

/** Sum of trade_wealth (volume × WEALTH_PER_VOLUME) from all active routes touching this region. */
function getRegionTradeWealth(world: WorldState, regionId: RegionId): number {
  let wealth = 0;
  for (const route of world.tradeRoutes.values()) {
    if (!route.isActive) continue;
    if (route.regionA === regionId || route.regionB === regionId) {
      wealth += route.volume * TRADE.WEALTH_PER_VOLUME;
    }
  }
  return wealth;
}

/**
 * Economy formula (D6.4):
 * base × gov_mod × war_mod × trade_mod × golden_mod × cmd_mod + trade_wealth
 */
function computeRegionEconomy(
  region: Region,
  nation: Nation,
  world: WorldState,
  cmdEffects: CommandmentEffects | null,
): number {
  if (region.population <= 0) {
    return getRegionTradeWealth(world, region.id);
  }

  const base = (region.population / ECONOMY.POP_DIVISOR) * region.development;
  const govMod = getNationEconomyModifier(nation.government);

  const atWar = isNationAtWar(nation);
  const warMod = atWar ? ECONOMY.WAR_PENALTY : 1.0;

  const tradeRoutes = getNationTradeRouteCount(world, nation.id);
  const tradeMod = 1.0 + tradeRoutes * ECONOMY.TRADE_BONUS_PER_ROUTE;

  const hasGoldenAge = region.activeEffects.some(
    (e) => e.powerId === 'golden_age',
  );
  const goldenMod = hasGoldenAge ? ECONOMY.GOLDEN_AGE_BONUS : 1.0;

  const rawCmdMod = cmdEffects?.economicOutput ?? 0;
  const cmdMod = 1.0 + clamp(rawCmdMod, COMMANDMENT_STACKING.MODIFIER_CAP_NEGATIVE, COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE);

  const tradeWealth = getRegionTradeWealth(world, region.id);

  return base * govMod * warMod * tradeMod * goldenMod * cmdMod + tradeWealth;
}

/**
 * Happiness formula (D6.2) — uses LAST tick's economicOutput to avoid circular dep.
 * happiness = BASE + wealth_factor + war + disease + blessing + gov + cmd_happiness
 */
function tickRegionHappiness(
  region: Region,
  nation: Nation,
  world: WorldState,
  cmdEffects: CommandmentEffects | null,
): void {
  const econPerCapita = region.economicOutput / Math.max(1, region.population / 1000);
  const wealthFactor = Math.min(HAPPINESS.WEALTH_CAP, econPerCapita * HAPPINESS.WEALTH_FACTOR);

  let happiness = HAPPINESS.BASE + wealthFactor;

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

  const cmdHappinessMod = cmdEffects?.happiness ?? 0;
  happiness += clamp(cmdHappinessMod, -0.20, 0.20);

  region.happiness = clamp(happiness, HAPPINESS.MIN, HAPPINESS.MAX);
}

/**
 * Population growth formula (D6.3):
 * growth_rate = (base + happiness_bonus + war_penalty + disease_penalty
 *              + famine_penalty + harvest_bonus + cmd_bonus) × logistic_factor
 */
function tickRegionPopulation(
  region: Region,
  nation: Nation,
  world: WorldState,
  deltaYears: number,
  cmdEffects: CommandmentEffects | null,
): void {
  if (region.terrain === 'ocean') {
    region.population = 0;
    return;
  }

  if (region.population <= 0) {
    region.population = 0;
    return;
  }

  const carryingCapacity = NATIONS.CARRYING_CAPACITY_PER_DEV * region.development;
  const current = region.population;
  const K = carryingCapacity;
  if (K <= 0) {
    region.population = Math.max(NATIONS.POPULATION_MIN_PER_REGION, current);
    return;
  }

  const logisticFactor = 1.0 - current / K;

  const baseRate = NATIONS.POPULATION_GROWTH_BASE;
  const happinessBonus = (region.happiness - 0.5) * 0.01;
  const atWar = isNationAtWar(nation);
  const warPenalty = atWar ? -0.003 : 0;
  const hasDisease = world.diseases.some((d) => d.affectedRegions.includes(region.id));
  const diseasePenalty = hasDisease ? -0.004 : 0;
  const hasFamine = region.activeEffects.some(
    (e) => e.powerId === 'famine' || e.powerId === 'great_famine',
  );
  const faminePenalty = hasFamine ? -0.008 : 0;
  const hasHarvest = region.activeEffects.some((e) => e.powerId === 'bountiful_harvest');
  const harvestBonus = hasHarvest ? 0.005 : 0;
  const rawCmdPop = cmdEffects?.populationGrowth ?? 0;
  const cmdBonus = rawCmdPop * 0.005;

  let growthRate = (baseRate + happinessBonus + warPenalty + diseasePenalty + faminePenalty + harvestBonus + cmdBonus)
    * logisticFactor;
  growthRate = clamp(growthRate, -0.02, 0.02);

  const delta = Math.floor(current * growthRate * deltaYears);
  let next = current + delta;

  if (next < 0) next = 0;
  if (next > K) next = K;
  if (next > 0 && next < NATIONS.POPULATION_MIN_PER_REGION) {
    next = NATIONS.POPULATION_MIN_PER_REGION;
  }

  region.population = Math.floor(next);
}

/**
 * Development growth formula (D6.5):
 * dev_growth = BASE × (1 + log10(econ)×0.1 + routes×0.03)
 *            × war_mod × gov_mod × era_mod × inspire_mod × cmd_mod
 *            + trade_tech_transfer
 */
function tickRegionDevelopment(
  region: Region,
  nation: Nation,
  world: WorldState,
  deltaYears: number,
  cmdEffects: CommandmentEffects | null,
): void {
  if (region.terrain === 'ocean') {
    region.development = 0;
    return;
  }

  const eraIndex = ERAS_INDEX_LOOKUP[world.currentEra] ?? 1;

  const econFactor = Math.log10(Math.max(region.economicOutput, 1)) * 0.1;
  const tradeRoutes = getNationTradeRouteCount(world, nation.id);
  const tradeFactor = tradeRoutes * DEVELOPMENT.TRADE_BONUS;

  const atWar = isNationAtWar(nation);
  const warMod = atWar ? 0.5 : 1.0;
  const govMod = getNationDevModifier(nation.government);
  const eraMod = 1.0 + (eraIndex - 1) * DEVELOPMENT.ERA_SCALING;

  const hasInspiration = region.activeEffects.some((e) => e.powerId === 'inspiration');
  const inspireMod = hasInspiration ? 1.5 : 1.0;

  const rawCmdResearch = cmdEffects?.researchSpeed ?? 0;
  const cmdMod = 1.0 + clamp(rawCmdResearch, COMMANDMENT_STACKING.MODIFIER_CAP_NEGATIVE, COMMANDMENT_STACKING.MODIFIER_CAP_POSITIVE);

  // Trade tech transfer: dev_gap × TECH_TRANSFER_RATE × volume (from D5.3)
  let tradeTechTransfer = 0;
  for (const route of world.tradeRoutes.values()) {
    if (!route.isActive) continue;
    const isEndpoint = route.regionA === region.id || route.regionB === region.id;
    if (!isEndpoint) continue;
    const otherRegionId = route.regionA === region.id ? route.regionB : route.regionA;
    const otherRegion = world.regions.get(otherRegionId);
    if (!otherRegion) continue;
    const devGap = Math.abs(region.development - otherRegion.development);
    tradeTechTransfer += devGap * TRADE.TECH_TRANSFER_RATE * route.volume;
  }

  const devGrowth = DEVELOPMENT.GROWTH_BASE_PER_TICK
    * (1 + econFactor + tradeFactor)
    * warMod * govMod * eraMod * inspireMod * cmdMod
    * (deltaYears / TIME.TICK_GAME_YEARS);

  region.development = clamp(
    region.development + devGrowth + tradeTechTransfer,
    1,
    NATIONS.DEVELOPMENT_LEVELS,
  );
}

const ERAS_INDEX_LOOKUP: Record<string, number> = {};
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

/**
 * Tick order matches D1:
 *  4. Happiness (uses LAST tick's economicOutput)
 *  5. Population (uses fresh happiness)
 *  7. Economy (writes new economicOutput)
 *  9. Development (uses fresh economy)
 */
export function tickNations(
  state: GameState,
  deltaYears: number,
): GameState {
  return produce(state, (draft) => {
    const world = draft.world;
    const cmdEffects = draft.effectiveCommandmentEffects ?? null;

    // Step 4: Happiness — uses stale economicOutput from last tick
    for (const nation of world.nations.values()) {
      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        tickRegionHappiness(region, nation, world, cmdEffects);
      }
    }

    // Step 5: Population — uses fresh happiness
    for (const nation of world.nations.values()) {
      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        tickRegionPopulation(region, nation, world, deltaYears, cmdEffects);
      }
    }

    // Step 7: Economy — writes new economicOutput
    for (const nation of world.nations.values()) {
      let totalPop = 0;
      let weightedDev = 0;
      let totalEconomy = 0;

      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        const econ = computeRegionEconomy(region, nation, world, cmdEffects);
        region.economicOutput = econ;

        totalEconomy += econ;
        totalPop += region.population;
        weightedDev += region.population * region.development;
      }

      nation.economicOutput = totalEconomy;
      nation.development = totalPop > 0 ? weightedDev / totalPop : 0;
    }

    // Step 9: Development — uses fresh economy
    for (const nation of world.nations.values()) {
      for (const regionId of nation.regionIds) {
        const region = world.regions.get(regionId);
        if (!region) continue;
        tickRegionDevelopment(region, nation, world, deltaYears, cmdEffects);
      }
    }

    // Recruitment (after development, not part of D1 core order)
    for (const nation of world.nations.values()) {
      tickNationRecruitment(nation, world, deltaYears);
    }
  });
}
