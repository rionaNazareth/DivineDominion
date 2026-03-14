import { describe, it, expect } from 'vitest';

import { tickNations } from '../nation.js';
import { TIME, NATIONS, ECONOMY, DEVELOPMENT, HAPPINESS } from '../../config/constants.js';
import { GameState, Nation, Region, NationId, RegionId, ArmyId } from '../../types/game.js';

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
});

