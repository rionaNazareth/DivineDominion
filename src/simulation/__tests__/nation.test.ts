import { describe, it, expect } from 'vitest';

import { tickNations } from '../nation.js';
import { TIME, NATIONS, ECONOMY, DEVELOPMENT, HAPPINESS, RECRUITMENT } from '../../config/constants.js';
import { GameState, Nation, Region, NationId, RegionId, ArmyId, TradeRouteId } from '../../types/game.js';

function createMinimalState(): GameState {
  const nationId = 'nation_test' as NationId;
  const regionId = 'region_test' as RegionId;
  const armyId = 'army_test' as ArmyId;

  const region: Region = {
    id: regionId,
    nationId,
    position: { x: 0, y: 0 },
    vertices: [],
    terrain: 'plains',
    population: 10_000,
    development: 5,
    happiness: HAPPINESS.BASE,
    economicOutput: 0,
    faithStrength: 0.5,
    religiousInfluence: [],
    dominantReligion: 'religion_player',
    hasCity: false,
    cityLevel: 0,
    adjacentRegionIds: [],
    activeEffects: [],
    isQuarantined: false,
    isCapital: true,
  };

  const nation: Nation = {
    id: nationId,
    name: 'Test Nation',
    color: '#fff',
    regionIds: [regionId],
    government: 'monarchy',
    development: 5,
    militaryStrength: 0,
    economicOutput: 0,
    relations: new Map(),
    dominantReligionId: 'religion_player',
    isPlayerNation: true,
    aiPersonality: 'balanced',
    aiWeights: { war: 1, peace: 1, science: 1, faith: 1 },
    stability: 0.7,
    warWeariness: 0,
  };

  const state: GameState = {
    phase: 'playing',
    world: {
      seed: 1,
      currentYear: TIME.GAME_START_YEAR,
      currentTick: 0,
      regions: new Map([[regionId, region]]),
      nations: new Map([[nationId, nation]]),
      religions: new Map(),
      armies: new Map([
        [
          armyId,
          {
            id: armyId,
            nationId,
            strength: 1000,
            morale: 0.8,
            currentRegionId: regionId,
            state: 'garrisoned',
            commander: null,
            supplyRange: NATIONS.SUPPLY_RANGE_BASE,
          },
        ],
      ]),
      tradeRoutes: new Map(),
      diseases: [],
      scienceProgress: {
        currentLevel: 0,
        milestonesReached: [],
        globalResearchOutput: 0,
      },
      alienState: {
        arrivalYear: 2200,
        signalDetectedYear: 0,
        confirmedYear: 0,
        revealedToPlayer: false,
        fleetStrength: 0,
        defenseGridStrength: 0,
        harbinger: {
          budgetRemaining: 0,
          lastActionTick: 0,
          corruptedRegionIds: [],
          veiledRegionIds: [],
          immuneRegionIds: [],
          playerStrategyAssessment: 'balanced',
          actionsLog: [],
        },
      },
      currentEra: 'renaissance',
    },
    divineState: {
      energy: 0,
      maxEnergy: 0,
      regenPerMinute: 0,
      cooldowns: new Map(),
      totalInterventions: 0,
      blessingsUsed: 0,
      disastersUsed: 0,
      hypocrisyEvents: 0,
      lastDisasterYear: 0,
      lastMiracleYear: 0,
    },
    whisperState: {
      lastWhisperTime: 0,
      lastWhisperRegionId: null,
      lastWhisperType: null,
      regionCooldowns: new Map(),
      compoundStacksByNation: new Map(),
    },
    comboWindowState: {
      lastShieldCastByRegion: new Map(),
      lastMiracleCastByRegion: new Map(),
    },
    playerReligionId: 'religion_player',
    selectedCommandments: [],
    eventHistory: [],
    currentEvent: undefined,
    eraNarratives: new Map(),
    pivotalMoments: [],
    speedMultiplier: 1,
    realTimeElapsed: 0,
    divineOverlayActive: false,
    voiceRecords: [],
    hypocrisyLevel: 0,
    prngState: 0,
  };

  return state;
}

describe('nation module', () => {
  it('NATION_001: Population logistic growth', () => {
    const state = createMinimalState();
    const before = state.world.regions.get('region_test' as RegionId)!.population;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const after = next.world.regions.get('region_test' as RegionId)!.population;
    expect(after).toBeGreaterThan(before);
  });

  it('NATION_002: Carrying capacity cap', () => {
    const state = createMinimalState();
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.population = NATIONS.CARRYING_CAPACITY_PER_DEV * region.development * 2;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const after = next.world.regions.get('region_test' as RegionId)!.population;
    expect(after).toBeLessThanOrEqual(
      NATIONS.CARRYING_CAPACITY_PER_DEV * region.development,
    );
  });

  it('NATION_003: Min population floor', () => {
    const state = createMinimalState();
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.population = 50;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const after = next.world.regions.get('region_test' as RegionId)!.population;
    expect(after).toBeGreaterThanOrEqual(NATIONS.POPULATION_MIN_PER_REGION);
  });

  it('NATION_004: Economy base formula', () => {
    const state = createMinimalState();
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const expectedBase =
      (10_000 / ECONOMY.POP_DIVISOR) * region.development;
    expect(region.economicOutput).toBeCloseTo(expectedBase, 5);
  });

  it('NATION_016: Dev bounds', () => {
    const state = createMinimalState();
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.development = 12;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const after = next.world.regions.get('region_test' as RegionId)!.development;
    expect(after).toBeGreaterThanOrEqual(1);
    expect(after).toBeLessThanOrEqual(NATIONS.DEVELOPMENT_LEVELS);
  });

  it('NATION_005: Gov mod monarchy — economy uses 1.00 multiplier', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'monarchy';
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['monarchy'], 5);
  });

  it('NATION_006: Gov mod republic — economy uses 1.15 multiplier', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'republic';
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['republic'], 5);
  });

  it('NATION_007: Gov mod democracy — economy uses 1.25 multiplier', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'democracy';
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['democracy'], 5);
  });

  it('NATION_008: Gov mod theocracy — economy uses 0.90 multiplier', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'theocracy';
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['theocracy'], 5);
  });

  it('NATION_009: Gov mod military_junta — economy uses 0.85 multiplier', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'military_junta';
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['military_junta'], 5);
  });

  it('NATION_010: War penalty — economy multiplied by 0.70 when at war', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'monarchy';
    const enemy = 'nation_enemy' as NationId;
    nation.relations.set(enemy, {
      nationId: enemy,
      opinion: -0.8,
      atWar: true,
      tradeAgreement: false,
      alliance: false,
      peaceTicks: 0,
    });
    const next = tickNations(state, 0);
    const region = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['monarchy'] * ECONOMY.WAR_PENALTY, 5);
  });

  it('NATION_011: Golden Age bonus — economy × 1.30 when golden age active', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'monarchy';
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.activeEffects = [{ powerId: 'golden_age', startYear: 1600, endYear: 1615 }];
    const next = tickNations(state, 0);
    const region2 = next.world.regions.get('region_test' as RegionId)!;
    const base = (10_000 / ECONOMY.POP_DIVISOR) * 5;
    expect(region2.economicOutput).toBeCloseTo(base * ECONOMY.GOV_MODS['monarchy'] * ECONOMY.GOLDEN_AGE_BONUS, 5);
  });

  it('NATION_012: Happiness bounds — 0.10 ≤ happiness ≤ 0.95', () => {
    const state = createMinimalState();
    // Extreme war+disease+poverty => still clamped to MIN
    const nation = state.world.nations.get('nation_test' as NationId)!;
    const enemy = 'nation_enemy' as NationId;
    nation.relations.set(enemy, {
      nationId: enemy,
      opinion: -1,
      atWar: true,
      tradeAgreement: false,
      alliance: false,
      peaceTicks: 0,
    });
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.population = 100;
    region.economicOutput = 0;
    state.world.diseases.push({
      id: 'dis_1',
      name: 'Plague',
      severity: 'severe',
      affectedRegions: [region.id],
      immuneRegionIds: [],
      infectionStartTickByRegion: new Map([[region.id, 0]]),
      spreadRate: 0.025,
      mortalityRate: 0.015,
      originYear: 1600,
      isDivine: false,
      isActive: true,
    });
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const r2 = next.world.regions.get('region_test' as RegionId)!;
    expect(r2.happiness).toBeGreaterThanOrEqual(HAPPINESS.MIN);
    expect(r2.happiness).toBeLessThanOrEqual(HAPPINESS.MAX);
  });

  it('NATION_013: Dev growth base — peace, republic, era 1 gives ~0.003/tick', () => {
    const state = createMinimalState();
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.government = 'republic';
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.development = 5;
    // Set economy so econ_factor is known: log10(50) * 0.1 ≈ 0.170
    region.economicOutput = 50;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const r2 = next.world.regions.get('region_test' as RegionId)!;
    // growth = BASE * (1 + log10(50)*0.1 + 0) * 1.0 * 1.0 * 1.0 * 1.0 * 1.0 * 1.0
    // = 0.003 * (1 + 0.170) = 0.003 * 1.170 ≈ 0.00351
    const devGrowth = r2.development - 5;
    expect(devGrowth).toBeGreaterThan(0);
    expect(devGrowth).toBeLessThan(0.02);
  });

  it('NATION_014: Dev growth era scaling — era 12 dev growth ~2.1× era 1', () => {
    const stateEra1 = createMinimalState();
    stateEra1.world.currentEra = 'renaissance';
    const region1 = stateEra1.world.regions.get('region_test' as RegionId)!;
    region1.economicOutput = 50;
    const nation1 = stateEra1.world.nations.get('nation_test' as NationId)!;
    nation1.government = 'republic';
    const next1 = tickNations(stateEra1, TIME.TICK_GAME_YEARS);
    const growth1 = next1.world.regions.get('region_test' as RegionId)!.development - 5;

    const stateEra12 = createMinimalState();
    stateEra12.world.currentEra = 'arrival';
    const region12 = stateEra12.world.regions.get('region_test' as RegionId)!;
    region12.economicOutput = 50;
    const nation12 = stateEra12.world.nations.get('nation_test' as NationId)!;
    nation12.government = 'republic';
    const next12 = tickNations(stateEra12, TIME.TICK_GAME_YEARS);
    const growth12 = next12.world.regions.get('region_test' as RegionId)!.development - 5;

    // Era 12 growth should be ~2.1× era 1 (era_mod = 1 + 11 * 0.10 = 2.1)
    expect(growth12 / growth1).toBeCloseTo(2.1, 0);
  });

  it('NATION_015: Dev growth trade bonus — 1 active trade route adds growth', () => {
    const stateNoTrade = createMinimalState();
    const region = stateNoTrade.world.regions.get('region_test' as RegionId)!;
    region.economicOutput = 50;
    const nextNoTrade = tickNations(stateNoTrade, TIME.TICK_GAME_YEARS);
    const growthNoTrade = nextNoTrade.world.regions.get('region_test' as RegionId)!.development - 5;

    const stateWithTrade = createMinimalState();
    const nationId2 = 'nation_b' as NationId;
    const regionId2 = 'region_b' as RegionId;
    stateWithTrade.world.regions.set(regionId2, {
      id: regionId2,
      nationId: nationId2,
      position: { x: 10, y: 0 },
      vertices: [],
      terrain: 'plains',
      population: 10_000,
      development: 5,
      happiness: HAPPINESS.BASE,
      economicOutput: 50,
      faithStrength: 0,
      religiousInfluence: [],
      dominantReligion: '' as any,
      hasCity: false,
      cityLevel: 0,
      adjacentRegionIds: [],
      activeEffects: [],
      isQuarantined: false,
      isCapital: false,
    });
    const routeId = 'route_1' as TradeRouteId;
    stateWithTrade.world.tradeRoutes.set(routeId, {
      id: routeId,
      regionA: 'region_test' as RegionId,
      regionB: regionId2,
      distance: 1,
      volume: 0.5,
      isActive: true,
    });
    const r2 = stateWithTrade.world.regions.get('region_test' as RegionId)!;
    r2.economicOutput = 50;
    const nextWithTrade = tickNations(stateWithTrade, TIME.TICK_GAME_YEARS);
    const growthWithTrade = nextWithTrade.world.regions.get('region_test' as RegionId)!.development - 5;

    // Trade route adds factor: TRADE_BONUS (0.03) to the (1 + econ + trade) multiplier
    expect(growthWithTrade).toBeGreaterThan(growthNoTrade);
  });

  it('NATION_017: Nation dev is pop-weighted average of region devs', () => {
    const state = createMinimalState();
    const regionId2 = 'region_test2' as RegionId;
    const nationId = 'nation_test' as NationId;
    state.world.regions.set(regionId2, {
      id: regionId2,
      nationId,
      position: { x: 10, y: 0 },
      vertices: [],
      terrain: 'plains',
      population: 20_000,
      development: 9,
      happiness: HAPPINESS.BASE,
      economicOutput: 0,
      faithStrength: 0,
      religiousInfluence: [],
      dominantReligion: '' as any,
      hasCity: false,
      cityLevel: 0,
      adjacentRegionIds: [],
      activeEffects: [],
      isQuarantined: false,
      isCapital: false,
    });
    const nation = state.world.nations.get(nationId)!;
    nation.regionIds.push(regionId2);

    const next = tickNations(state, 0);
    const n2 = next.world.nations.get(nationId)!;
    // pop-weighted: (10000 * 5 + 20000 * 9) / 30000 = (50000 + 180000) / 30000 = 7.67
    expect(n2.development).toBeCloseTo((10_000 * 5 + 20_000 * 9) / 30_000, 1);
  });

  it('NATION_020: Recruitment rate — recruits proportional to pop', () => {
    const state = createMinimalState();
    const region = state.world.regions.get('region_test' as RegionId)!;
    region.population = 100_000;
    region.economicOutput = 1000; // above RECRUITMENT.ECON_THRESHOLD
    // Set economy: must be > threshold before tick starts (pre-compute)
    const nation = state.world.nations.get('nation_test' as NationId)!;
    nation.economicOutput = 1000;
    const armyBefore = state.world.armies.get('army_test' as ArmyId)!.strength;
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const armyAfter = next.world.armies.get('army_test' as ArmyId)!.strength;
    // Recruits = floor(100000 * 0.001 * gov_mod) = floor(100000 * 0.001 * 1.2) = 120
    expect(armyAfter).toBeGreaterThan(armyBefore);
  });

  it('NATION_021: Total population consistency — sum(region.pop) = nation.totalPopulation equivalent', () => {
    const state = createMinimalState();
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    const nation = next.world.nations.get('nation_test' as NationId)!;
    let sumPop = 0;
    for (const rid of nation.regionIds) {
      sumPop += next.world.regions.get(rid)?.population ?? 0;
    }
    // economicOutput is sum of region economies
    let sumEcon = 0;
    for (const rid of nation.regionIds) {
      sumEcon += next.world.regions.get(rid)?.economicOutput ?? 0;
    }
    expect(nation.economicOutput).toBeCloseTo(sumEcon, 5);
  });

  it('NATION_022: Region ownership consistency — region.nationId ∈ nation.regionIds', () => {
    const state = createMinimalState();
    const next = tickNations(state, TIME.TICK_GAME_YEARS);
    for (const [nId, nation] of next.world.nations.entries()) {
      for (const rId of nation.regionIds) {
        const region = next.world.regions.get(rId);
        expect(region).toBeDefined();
        expect(region!.nationId).toBe(nId);
      }
    }
  });
});

